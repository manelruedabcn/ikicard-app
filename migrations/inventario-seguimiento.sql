-- ============================================================
-- INVENTARIO HONESTO — seguimiento a los 3 días.
-- «¿Lo que te devolvió el test tenía que ver contigo?», con tres
-- botones de un clic (sí, a medias, no). Un solo seguimiento por
-- contacto, nunca más de uno aunque repita el test.
--
-- Solo se envía a quien marcó la casilla de comunicaciones
-- (inventario_leads.consent), no se ha dado de baja y no está ni ha
-- estado en «Un mes conociendo tu ikigai». Lo envía la tarea
-- programada /api/cron/inventario-seguimiento (GitHub Actions, cada
-- hora). La respuesta llega por /api/inventario/seguimiento.
--
-- Se escribe solo desde el servidor con service_role. Ejecutar en el
-- SQL editor de Supabase ANTES de desplegar el código. Idempotente.
-- ============================================================

CREATE TABLE IF NOT EXISTS inventario_seguimientos (
  -- el id va en los enlaces de los botones: aleatorio, no adivinable
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  lead_id UUID NOT NULL REFERENCES inventario_leads ON DELETE CASCADE,
  -- el test sobre el que se pregunta (su devolución es la que recibió)
  attempt_id UUID REFERENCES inventario_attempts ON DELETE SET NULL,
  locale TEXT,
  sent_at TIMESTAMPTZ DEFAULT now(),
  -- 'si' | 'medias' | 'no'; null = aún sin responder
  respuesta TEXT CHECK (respuesta IN ('si', 'medias', 'no')),
  respondido_at TIMESTAMPTZ
);

-- Uno por contacto: impide duplicados aunque la tarea se ejecute cada hora.
CREATE UNIQUE INDEX IF NOT EXISTS inventario_seguimientos_lead_idx ON inventario_seguimientos (lead_id);

-- Mismo criterio que el resto del Inventario: RLS activada y sin
-- políticas. Solo el service_role lee y escribe, desde el servidor.
ALTER TABLE inventario_seguimientos ENABLE ROW LEVEL SECURITY;
