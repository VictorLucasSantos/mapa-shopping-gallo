/* Cole aqui os dados do seu projeto Supabase (Project Settings → API).
   A chave "publishable"/"anon" é pública por natureza: a segurança fica nas regras (RLS) do supabase.sql.
   NUNCA coloque aqui a chave "secret"/"service_role".
   Com os dois campos vazios o app funciona em modo estático (só os dados embutidos). */
window.MM_CONFIG = {
  url: "https://uatktjfqxbvfednxelrp.supabase.co",
  key: "sb_publishable_M_i-3X1VYWyHHGmvrqX0Kg_efE3ybOe",
  /* WhatsApp (DDD + número, só dígitos) que recebe os interessados em locar boxes vagos. Ex.: "5562999999999" */
  whatsLocacao: "556284320643",
  /* horário de funcionamento (0 = domingo … 6 = sábado, "HH:MM-HH:MM"); remova/zere os dias fechados. Alimenta o selo "Aberto agora" */
  horario: { 0: null, 1: null, 2: "08:00-18:00", 3: "08:00-18:00", 4: "08:00-18:00", 5: "08:00-18:00", 6: "08:00-18:00" }
};
