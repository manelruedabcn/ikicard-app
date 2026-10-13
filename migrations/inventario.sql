-- ============================================================
-- INVENTARIO HONESTO — test de entrada (lead magnet), sin cuenta.
-- 15 preguntas cerradas + 1 abierta opcional sobre el Ikigai Activo
-- y el Consciente. La devolución sale de reglas fijas (cero IA):
-- ver lib/inventario.ts y docs/inventario.md.
--
-- Dos tablas, mismo patrón que PASO (paso_attempts / paso_leads):
--   · inventario_attempts → un registro por test COMPLETADO, con las
--     respuestas cerradas (códigos, sin PII). Pulso del funnel y base
--     para calibrar las reglas. El texto libre NO se guarda aquí salvo
--     que la persona pida su devolución por email (entonces se enlaza
--     al lead y se guarda para poder reenviarla y compararla).
--   · inventario_leads → el email (único), con consentimiento de
--     marketing SEPARADO del envío del resultado (que es transaccional).
--
-- Historial: cada intento enlazado a un lead (lead_id) permite, en el
-- programa de un mes, comparar el primer Inventario con el de la
-- semana 4 sin duplicar datos.
--
-- Se escribe solo desde el servidor con service_role (endpoints
-- /api/inventario/track y /api/inventario/lead), nunca desde el
-- navegador. Ejecutar en el SQL editor de Supabase. Idempotente.
-- ============================================================

CREATE TABLE IF NOT EXISTS inventario_leads (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  -- null = anónimo (sin cuenta). Con valor = usuario logueado.
  user_id UUID REFERENCES auth.users ON DELETE SET NULL,
  locale TEXT,
  -- origen del contacto (blog, libro, taller, linkedin…), si llega en la URL
  source TEXT,
  -- consentimiento explícito del checkbox (base legal del marketing)
  consent BOOLEAN NOT NULL DEFAULT false,
  consent_at TIMESTAMPTZ,
  unsubscribed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Email único: el endpoint lo normaliza a minúsculas antes del upsert.
CREATE UNIQUE INDEX IF NOT EXISTS inventario_leads_email_idx ON inventario_leads (email);

CREATE TABLE IF NOT EXISTS inventario_attempts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  -- null = anónimo (sin cuenta). Con valor = usuario logueado.
  user_id UUID REFERENCES auth.users ON DELETE SET NULL,
  -- se rellena cuando la persona deja su email para recibir la devolución
  lead_id UUID REFERENCES inventario_leads ON DELETE SET NULL,
  -- respuestas cerradas como códigos independientes del idioma
  answers JSONB NOT NULL,
  -- texto libre: solo si la persona pidió la devolución por email
  texto TEXT,
  -- resumen de la lectura (para métricas y para calibrar reglas)
  route TEXT,
  principal TEXT,
  exercise TEXT,
  locale TEXT,
  source TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS inventario_attempts_created_idx ON inventario_attempts (created_at);
CREATE INDEX IF NOT EXISTS inventario_attempts_lead_idx ON inventario_attempts (lead_id);

-- RLS activada y SIN políticas: nadie (anon ni authenticated) puede leer
-- ni escribir con las claves públicas. Solo el service_role (que salta la
-- RLS) inserta y lee, desde el servidor. Así los endpoints controlan el
-- alta y las tablas no son spameables ni legibles desde el cliente.
ALTER TABLE inventario_leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventario_attempts ENABLE ROW LEVEL SECURITY;
