-- ============================================================
-- PASO — Leads (email marketing del lead magnet)
-- Correo capturado al terminar el test, con o sin cuenta. Consent
-- explícito (single opt-in con checkbox). La promesa es abierta:
-- recibir las herramientas de IKIGAIER a medida que se abren.
--
-- NO sustituye a paso_attempts (pulso del funnel, sin PII) ni a
-- paso_results (resultado rico del logueado). Aquí solo el email
-- + la forma PASO para segmentar. Se escribe server-side con
-- service_role (endpoint /api/paso/lead), nunca desde el navegador.
-- Ejecutar en el SQL editor de Supabase. Idempotente.
-- ============================================================

CREATE TABLE IF NOT EXISTS paso_leads (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  -- null = anónimo (sin cuenta). Con valor = usuario logueado.
  user_id UUID REFERENCES auth.users ON DELETE SET NULL,
  codigo_patron TEXT,
  locale TEXT,
  source TEXT,
  -- consentimiento explícito del checkbox (base legal del envío)
  consent BOOLEAN NOT NULL DEFAULT false,
  unsubscribed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Email único: el endpoint lo normaliza a minúsculas antes de insertar,
-- así el upsert (onConflict: email) refresca forma/idioma sin duplicar la
-- fila si la persona vuelve a hacer el test.
CREATE UNIQUE INDEX IF NOT EXISTS paso_leads_email_idx ON paso_leads (email);

-- RLS activada y SIN políticas: nadie (anon ni authenticated) puede leer
-- ni escribir con las claves públicas. Solo el service_role (que salta la
-- RLS) inserta y lee, desde el servidor. Así el endpoint controla el alta
-- y la tabla no es spameable ni legible desde el cliente.
ALTER TABLE paso_leads ENABLE ROW LEVEL SECURITY;
