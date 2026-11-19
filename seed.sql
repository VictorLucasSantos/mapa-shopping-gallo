-- Carga das lojas (rode no SQL Editor do Supabase depois do supabase.sql).
-- Pode rodar de novo a qualquer momento: atualiza nome/segmentos/endereço e preserva o que os lojistas editaram.
insert into public.lojas (slug, nome, categorias, localizacao) values
('hering','Hering',array['Outlets','Feminino','Masculino']::text[],'Corredor Outlets – Piso 1 (Loja 101)'),
('malwee','Malwee',array['Outlets','Feminino','Masculino']::text[],'Corredor Outlets – Piso 1 (Loja 102)'),
('havaianas','Havaianas',array['Outlets','Calçados']::text[],'Corredor Outlets – Piso 1 (Loja 103)'),
('buddemeyer','Buddemeyer',array['Outlets']::text[],'Corredor Outlets – Piso 1 (Loja 104)'),
('aurum-cinema','Aurum Cinema',array['Entretenimento']::text[],'Corredor Outlets – Piso 1 (Loja 110)'),
('ninala-restaurante','Ninala Restaurante',array['Alimentação']::text[],'Praça de Alimentação – Piso 1 (Loja 201)'),
('fiorella','Fiorella',array['Alimentação']::text[],'Praça de Alimentação – Piso 1 (Loja 202)'),
('giraffas','Giraffas',array['Alimentação']::text[],'Praça de Alimentação – Piso 1 (Loja 203)'),
('mais-sabor','Mais Sabor',array['Alimentação']::text[],'Praça de Alimentação – Piso 1 (Loja 204)'),
('rancheiro','Rancheiro',array['Alimentação']::text[],'Praça de Alimentação – Piso 1 (Loja 205)'),
('ks','KS',array['Alimentação']::text[],'Praça de Alimentação – Piso 1 (Loja 206)'),
('frutos','Frutos',array['Alimentação']::text[],'Praça de Alimentação – Piso 1 (Loja 207)'),
('empada','Empada',array['Alimentação']::text[],'Praça de Alimentação – Piso 1 (Loja 208)'),
('ncw','NCW',array['Feminino']::text[],'Galeria Moda – Térreo (Loja 1)'),
('loveyou','LoveYou',array['Feminino']::text[],'Galeria Moda – Térreo (Loja 2)'),
('youl','Youl',array['Feminino']::text[],'Galeria Moda – Térreo (Loja 3)'),
('isaaa','Isaaa',array['Feminino']::text[],'Galeria Moda – Térreo (Loja 4)'),
('anagrama-jeans','Anagrama Jeans',array['Jeans','Feminino']::text[],'Galeria Moda – Térreo (Loja 5)'),
('marcia-azevedo','Márcia Azevedo',array['Feminino']::text[],'Galeria Moda – Térreo (Loja 6)'),
('use-menina-fb','Use Menina FB',array['Feminino','Infantil']::text[],'Galeria Moda – Térreo (Loja 7)'),
('loots','Loots',array['Feminino']::text[],'Galeria Moda – Térreo (Loja 8)'),
('anay-joias','Anay Joias',array['Acessórios']::text[],'Galeria Moda – Térreo (Loja 9)')
on conflict (slug) do update set nome = excluded.nome, categorias = excluded.categorias, localizacao = excluded.localizacao;
