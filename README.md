# Mapa Mega Moda — versão completa

App de mapa das lojas do Mega Moda (Shopping Gallo, Goiânia): busca por loja/produto, rota até a loja,
posição por QR Code, GPS por prédio, painel de lojistas, estatísticas e editor de planta.

## Arquivos

| Arquivo | Para quê |
|---|---|
| `index.html` | App do cliente (PWA instalável) |
| `admin.html` | Painel: lojistas, estatísticas, editor de planta, QR Codes |
| `core.js` | Núcleo compartilhado (planta, rotas, QR, dados) |
| `camera.js` | Modo câmera: seta no chão guiada pela bússola, passos e QR |
| `config.js` | **Você edita**: URL e chave pública do Supabase |
| `lojas-data.js` | Lojas embutidas (reserva offline) — gerado por `build.py` |
| `sw.js`, `manifest.webmanifest`, `icon-*.png` | PWA (instalar / abrir sem internet) |
| `supabase.sql` | Tabelas, regras de segurança (RLS) e funções |
| `seed.sql` | Carga das 684 lojas no banco — gerado por `build.py` |
| `atualizar_lojas.py`, `build.py`, `lojas.txt` | Reler o site megamoda.com.br e regenerar os dados |

## Instalação (uns 15 minutos)

1. **Supabase** — crie um projeto grátis em supabase.com.
   - SQL Editor → cole e rode `supabase.sql`; depois cole e rode `seed.sql`.
   - Project Settings → API: copie a *Project URL* e a chave *publishable* (ou *anon*).
2. **config.js** — cole a URL e a chave. Nunca use a chave *secret/service_role* aqui.
3. **GitHub Pages** — suba todos os arquivos desta pasta num repositório e ative o Pages (HTTPS é obrigatório para GPS e instalação).
4. **Administrador** — abra `admin.html`, clique em *Criar conta* e depois rode no SQL Editor:
   ```sql
   insert into public.perfis (user_id, papel)
   select id, 'admin' from auth.users where email = 'SEU_EMAIL'
   on conflict (user_id) do update set papel = 'admin';
   ```
   Saia e entre de novo no painel: aparecem as abas Lojas, Estatísticas, Planta e QR Codes.
5. **Authentication → URL Configuration** no Supabase: ponha o endereço do site em *Site URL* (o link de confirmação de e-mail volta para lá).

Sem preencher o `config.js` o app funciona em modo estático (dados embutidos, sem painel de lojista nem estatísticas).

## Dia a dia

- **Lojista**: cria conta no painel → você vincula a loja ao e-mail dele (aba Lojas → Vincular). Ele edita descrição, produtos/palavras-chave, promoção, WhatsApp e Instagram. Nome, endereço, segmentos e destaque (★) só o administrador altera.
- **Planta real**: aba Planta → envie a foto/planta do piso → arraste cada corredor para o lugar → informe o comprimento real de um corredor (escala) → Salvar. Pisos sem planta desenhada continuam no esquema automático.
- **QR Codes**: aba QR Codes → confira o endereço do app → Imprimir → cole cada etiqueta no ponto indicado (entrada, início/meio/fim de cada corredor). Os quadradinhos pretos no editor de planta mostram onde cada QR fica.
- **Atualizar lojas a partir do site**: `pip install requests && python atualizar_lojas.py && python build.py`, publique o `lojas-data.js` novo e rode o `seed.sql` novo (não apaga o que os lojistas editaram).

## Limites conhecidos

- A parte Supabase foi testada com um servidor simulado (login, leitura, edição, estatísticas, eventos); o `supabase.sql` ainda não rodou num projeto real — confira a primeira execução.
- As coordenadas GPS dos prédios são aproximadas até você gravar a entrada de cada um (aba Planta → GPS do prédio).
- Lojas com endereço "Rua 01–21" foram atribuídas ao Mega Moda Park e "Via Pirulito/Caramelo" ao Mini Moda por dedução; confira no local.
- Estatísticas não guardam dados pessoais: só um identificador aleatório por aparelho, termos buscados e lojas abertas.
- Uso comercial dos dados e da marca depende de autorização do Grupo Mega Moda.


## Novidades
- Mapa em 3D (botão 3D/2D, girar ⟲ ⟳)
- Minha lista: várias lojas, ordem da mais perto à mais longe, rota única e câmera por parada
- Ícones por tipo de loja e nova interface (busca, categorias, barra inferior)

- Busca tolerante a erros de digitação (Fuse.js, `fuse.min.js` local) e link direto por loja: `index.html?loja=slug`
- Boxes vagos: status "vaga" em `lojas` (dourado no mapa, botão "Tenho interesse" via `whatsLocacao` em `config.js`)
- Painel: marcar vago/ocupado, criar box vago e importar CSV. **Rode o `supabase.sql` de novo** (é idempotente) para criar as colunas `status`/`locacao_info`, os tipos de evento `link`/`locacao` e a visão `metricas_busca`.

- Identidade visual do Mega Moda (azul-marinho, rosa e dourado, Roboto), tema claro/escuro (segue o sistema; botão no topo), ícones em SVG e textos sem corte. O ícone da marca é carregado de megamoda.com.br; se estiver fora do ar, aparece o selo "44".
- Marcos de referência (banheiro, escada rolante, elevador, entrada, informações, alimentação, caixa eletrônico): no painel, aba Planta → "Marcos de referência". Salvos na hora e exibidos em 2D e 3D.
- Painel, aba Lojas: botão "Carregar lojas de exemplo da Shopping Gallo" (não altera lojas já existentes).
