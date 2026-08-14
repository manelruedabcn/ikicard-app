-- ============================================================
-- PASO — Intentos (analítica del lead magnet)
-- Un registro por test COMPLETADO, tenga cuenta o no. Sirve para
-- medir cuánta gente prueba el test (el anónimo es el lead magnet),
-- separando logueados de anónimos.
--
-- NO sustituye a paso_results: esa guarda el resultado rico del
-- usuario logueado para su dashboard. Aquí solo el pulso del funnel,
-- SIN PII ni respuestas. Se escribe server-side con service_role
-- (endpoint /api/paso/track), nunca directo desde el navegador.
-- Ejecutar en el SQL editor de Supabase. Idempotente.
-- ============================================================

CREATE TABLE IF NOT EXISTS paso_attempts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  -- null = anónimo (sin cuenta). Con valor = usuario logueado.
  user_id UUID REFERENCES auth.users ON DELETE SET NULL,
  codigo_patron TEXT NOT NULL,
  locale TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS paso_attempts_created_idx ON paso_attempts (created_at);
CREATE INDEX IF NOT EXISTS paso_attempts_user_idx ON paso_attempts (user_id);

-- RLS activada y SIN políticas: nadie (anon ni authenticated) puede leer
-- ni escribir con las claves públicas. Solo el service_role (que salta la
-- RLS) inserta y cuenta, desde el servidor. Así el endpoint controla el
-- alta y la tabla no es spameable ni legible desde el cliente.
ALTER TABLE paso_attempts ENABLE ROW LEVEL SECURITY;
