-- Mapa Mega Moda — banco no Supabase.
-- Rode este arquivo inteiro no SQL Editor (uma vez). Depois rode o seed.sql para carregar as lojas.
-- Pode ser rodado de novo sem perder dados.

-- ============ tabelas ============
create table if not exists public.perfis (
  user_id   uuid primary key references auth.users (id) on delete cascade,
  papel     text not null default 'lojista' check (papel in ('admin', 'lojista')),
  criado_em timestamptz not null default now()
);

create table if not exists public.lojas (
  slug          text primary key,
  nome          text not null,
  categorias    text[] not null default '{}',
  localizacao   text not null default '',
  descricao     text not null default '' check (char_length(descricao) <= 600),
  produtos      text not null default '' check (char_length(produtos) <= 400),
  whatsapp      text not null default '' check (char_length(whatsapp) <= 20),
  instagram     text not null default '' check (char_length(instagram) <= 120),
  promo         text not null default '' check (char_length(promo) <= 140),
  destaque      boolean not null default false,
  owner         uuid references auth.users (id) on delete set null,
  atualizado_em timestamptz not null default now()
);
-- box vago = linha em lojas com status 'vaga' (a posição no mapa vem do campo localizacao + planta, igual às demais)
alter table public.lojas add column if not exists status text not null default 'ocupada';
alter table public.lojas drop constraint if exists lojas_status_check;
alter table public.lojas add constraint lojas_status_check check (status in ('ocupada', 'vaga'));
alter table public.lojas add column if not exists locacao_info text not null default '';
alter table public.lojas drop constraint if exists lojas_locacao_info_check;
alter table public.lojas add constraint lojas_locacao_info_check check (char_length(locacao_info) <= 300);
create index if not exists lojas_status_idx on public.lojas (status);

create table if not exists public.layout (
  chave         text primary key,           -- 'shopping|T', 'park|P1'... ou 'predios'
  dados         jsonb not null,
  atualizado_em timestamptz not null default now()
);

create table if not exists public.eventos (
  id        bigint generated always as identity primary key,
  tipo      text not null check (tipo in ('abrir', 'busca', 'loja', 'qr', 'whats', 'cam', 'link', 'locacao')),
  sessao    text check (char_length(sessao) <= 40),
  loja      text check (char_length(loja) <= 120),
  termo     text check (char_length(termo) <= 80),
  n         int,
  ponto     text check (char_length(ponto) <= 120),
  criado_em timestamptz not null default now()
);
-- bancos criados antes do modo câmera: atualiza a lista de tipos aceitos
alter table public.eventos drop constraint if exists eventos_tipo_check;
alter table public.eventos add constraint eventos_tipo_check check (tipo in ('abrir', 'busca', 'loja', 'qr', 'whats', 'cam', 'link', 'locacao'));
create index if not exists eventos_criado_idx on public.eventos (criado_em desc);
create index if not exists lojas_owner_idx on public.lojas (owner);

-- ============ funções ============
create or replace function public.is_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.perfis where user_id = auth.uid() and papel = 'admin');
$$;

-- lojista só altera descrição, produtos, contatos e promoção; o resto é do administrador
create or replace function public.lojas_guard() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is not null and not public.is_admin() then
    new.slug := old.slug; new.nome := old.nome; new.categorias := old.categorias;
    new.localizacao := old.localizacao; new.destaque := old.destaque; new.owner := old.owner;
    new.status := old.status; new.locacao_info := old.locacao_info;
  end if;
  new.atualizado_em := now();
  return new;
end $$;
drop trigger if exists lojas_guard on public.lojas;
create trigger lojas_guard before update on public.lojas for each row execute function public.lojas_guard();

-- admin vincula uma loja ao e-mail de um lojista já cadastrado (e-mail vazio = desvincular)
create or replace function public.vincular_lojista(p_slug text, p_email text) returns text
language plpgsql security definer set search_path = public, auth as $$
declare uid uuid;
begin
  if not public.is_admin() then raise exception 'apenas administradores'; end if;
  if coalesce(trim(p_email), '') = '' then
    update public.lojas set owner = null where slug = p_slug;
    return 'desvinculada';
  end if;
  select id into uid from auth.users where lower(email) = lower(trim(p_email));
  if uid is null then raise exception 'Nenhuma conta com o e-mail %. Peça ao lojista para criar a conta no painel primeiro.', p_email; end if;
  update public.lojas set owner = uid where slug = p_slug;
  if not found then raise exception 'loja % não encontrada', p_slug; end if;
  insert into public.perfis (user_id, papel) values (uid, 'lojista') on conflict (user_id) do nothing;
  return 'vinculada';
end $$;

create or replace function public.estatisticas(p_dias int default 30) returns jsonb
language plpgsql stable security definer set search_path = public as $$
declare d timestamptz := now() - make_interval(days => greatest(1, least(coalesce(p_dias, 30), 365))); r jsonb;
begin
  if not public.is_admin() then raise exception 'apenas administradores'; end if;
  select jsonb_build_object(
    'totais', (select coalesce(jsonb_object_agg(tipo, c), '{}'::jsonb) from (select tipo, count(*) c from eventos where criado_em >= d group by tipo) t),
    'visitantes', (select count(distinct sessao) from eventos where criado_em >= d),
    'por_dia', (select coalesce(jsonb_agg(jsonb_build_object('dia', dia, 'n', c) order by dia), '[]'::jsonb)
                from (select (criado_em at time zone 'America/Sao_Paulo')::date dia, count(distinct sessao) c from eventos where criado_em >= d group by 1) t),
    'top_lojas', (select coalesce(jsonb_agg(jsonb_build_object('k', nome, 'n', c) order by c desc), '[]'::jsonb)
                  from (select coalesce(l.nome, e.loja) nome, count(*) c from eventos e left join lojas l on l.slug = e.loja
                        where e.criado_em >= d and e.tipo = 'loja' and e.loja is not null group by 1 order by c desc limit 20) t),
    'top_buscas', (select coalesce(jsonb_agg(jsonb_build_object('k', termo, 'n', c) order by c desc), '[]'::jsonb)
                   from (select termo, count(*) c from eventos where criado_em >= d and tipo = 'busca' and termo is not null group by 1 order by c desc limit 20) t),
    'sem_resultado', (select coalesce(jsonb_agg(jsonb_build_object('k', termo, 'n', c) order by c desc), '[]'::jsonb)
                      from (select termo, count(*) c from eventos where criado_em >= d and tipo = 'busca' and n = 0 and termo is not null group by 1 order by c desc limit 20) t),
    'qr', (select coalesce(jsonb_agg(jsonb_build_object('k', ponto, 'n', c) order by c desc), '[]'::jsonb)
           from (select ponto, count(*) c from eventos where criado_em >= d and tipo = 'qr' and ponto is not null group by 1 order by c desc limit 20) t),
    'locacao', (select coalesce(jsonb_agg(jsonb_build_object('k', nome, 'n', c) order by c desc), '[]'::jsonb)
                from (select coalesce(l.nome || ' · ' || l.localizacao, e.loja) nome, count(*) c from eventos e left join lojas l on l.slug = e.loja
                      where e.criado_em >= d and e.tipo = 'locacao' and e.loja is not null group by 1 order by c desc limit 20) t),
    'whats', (select coalesce(jsonb_agg(jsonb_build_object('k', nome, 'n', c) order by c desc), '[]'::jsonb)
              from (select coalesce(l.nome, e.loja) nome, count(*) c from eventos e left join lojas l on l.slug = e.loja
                    where e.criado_em >= d and e.tipo = 'whats' and e.loja is not null group by 1 order by c desc limit 20) t)
  ) into r;
  return r;
end $$;

-- visão de métricas de busca (termo, volume, buscas sem resultado). security_invoker: respeita o RLS de eventos (só admin enxerga)
create or replace view public.metricas_busca with (security_invoker = true) as
  select termo, count(*) as buscas, count(*) filter (where n = 0) as sem_resultado, max(criado_em) as ultima
  from public.eventos where tipo = 'busca' and termo is not null group by termo;

-- ============ segurança (RLS) ============
alter table public.perfis  enable row level security;
alter table public.lojas   enable row level security;
alter table public.layout  enable row level security;
alter table public.eventos enable row level security;

drop policy if exists perfis_ler on public.perfis;
create policy perfis_ler on public.perfis for select to authenticated using (user_id = auth.uid() or public.is_admin());

drop policy if exists lojas_ler on public.lojas;
create policy lojas_ler on public.lojas for select to anon, authenticated using (true);
drop policy if exists lojas_editar on public.lojas;
create policy lojas_editar on public.lojas for update to authenticated
  using (owner = auth.uid() or public.is_admin()) with check (owner = auth.uid() or public.is_admin());
drop policy if exists lojas_criar on public.lojas;
create policy lojas_criar on public.lojas for insert to authenticated with check (public.is_admin());
drop policy if exists lojas_apagar on public.lojas;
create policy lojas_apagar on public.lojas for delete to authenticated using (public.is_admin());

drop policy if exists layout_ler on public.layout;
create policy layout_ler on public.layout for select to anon, authenticated using (true);
drop policy if exists layout_admin on public.layout;
create policy layout_admin on public.layout for all to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists eventos_registrar on public.eventos;
create policy eventos_registrar on public.eventos for insert to anon, authenticated with check (true);
drop policy if exists eventos_ler on public.eventos;
create policy eventos_ler on public.eventos for select to authenticated using (public.is_admin());

-- ============ permissões da API ============
grant usage on schema public to anon, authenticated;
grant select on public.lojas, public.layout to anon, authenticated;
grant insert on public.eventos to anon, authenticated;
grant select on public.eventos, public.perfis, public.metricas_busca to authenticated;
grant insert, update, delete on public.lojas, public.layout to authenticated;
revoke all on function public.vincular_lojista(text, text), public.estatisticas(int) from public, anon;
grant execute on function public.vincular_lojista(text, text), public.estatisticas(int), public.is_admin() to authenticated;
grant execute on function public.is_admin() to anon;

-- ============ primeiro administrador ============
-- 1) Crie sua conta em admin.html ("Criar conta").
-- 2) Rode, trocando o e-mail:
--    insert into public.perfis (user_id, papel)
--    select id, 'admin' from auth.users where email = 'SEU_EMAIL_AQUI'
--    on conflict (user_id) do update set papel = 'admin';
