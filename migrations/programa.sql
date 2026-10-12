-- ============================================================
-- «UN MES CONOCIENDO TU IKIGAI» — programa gratuito de 4 semanas.
-- Continúa el Inventario honesto: quien lo pide al recibir su devolución
-- entra en el programa. Un correo cada lunes durante cuatro semanas, un
-- cierre la quinta, y encuentros en grupo online opcionales.
-- Definición en docs/programa.md. Requiere migrations/inventario.sql.
--
--   · programa_inscripciones → una por persona y edición. Cada persona
--     empieza el lunes siguiente a apuntarse (start_date). El token
--     (secreto) firma su enlace para repetir el Inventario en la semana 4
--     y comparar con el primero.
--   · programa_envios → registro de cada correo enviado: evita duplicados
--     aunque la tarea programada se ejecute cada hora.
--   · programa_encuentros → los encuentros en grupo. Los da de alta Manel
--     (fecha, enlace y lengua) desde el editor de tablas de Supabase; a
--     cada persona se le invita a los que caen dentro de su mes.
--
-- Todo se escribe y se lee solo desde el servidor (service_role).
-- Ejecutar en el SQL editor de Supabase. Idempotente.
-- ============================================================

CREATE TABLE IF NOT EXISTS programa_inscripciones (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  lead_id UUID REFERENCES inventario_leads ON DELETE SET NULL,
  user_id UUID REFERENCES auth.users ON DELETE SET NULL,
  locale TEXT NOT NULL DEFAULT 'es',
  -- lunes en que empieza su semana 1 (fecha de Madrid)
  start_date DATE NOT NULL,
  -- activa → completada (tras el cierre) · baja (si se da de baja)
  status TEXT NOT NULL DEFAULT 'activa' CHECK (status IN ('activa', 'completada', 'baja')),
  -- enlace personal para repetir el Inventario en la semana 4
  token UUID NOT NULL DEFAULT gen_random_uuid(),
  -- Inventario con el que entró y el que repite al final (para comparar)
  first_attempt_id UUID REFERENCES inventario_attempts ON DELETE SET NULL,
  final_attempt_id UUID REFERENCES inventario_attempts ON DELETE SET NULL,
  -- copia de las respuestas y del ejercicio con los que entró: no dependen
  -- de que el intento llegue a registrarse antes de pedir el email
  first_answers JSONB,
  first_exercise TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS programa_inscripciones_token_idx ON programa_inscripciones (token);
CREATE INDEX IF NOT EXISTS programa_inscripciones_status_idx ON programa_inscripciones (status, start_date);
-- Una sola inscripción activa por email (puede repetir el programa más adelante).
CREATE UNIQUE INDEX IF NOT EXISTS programa_inscripciones_activa_idx
  ON programa_inscripciones (email) WHERE status = 'activa';

CREATE TABLE IF NOT EXISTS programa_envios (
  inscripcion_id UUID NOT NULL REFERENCES programa_inscripciones ON DELETE CASCADE,
  -- bienvenida · semana1..semana4 · cierre · encuentro:<id>
  mensaje TEXT NOT NULL,
  sent_at TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (inscripcion_id, mensaje)
);

CREATE TABLE IF NOT EXISTS programa_encuentros (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  -- fecha y hora del encuentro (se muestra en hora de Madrid)
  starts_at TIMESTAMPTZ NOT NULL,
  -- enlace de la videollamada (Meet, Zoom…)
  url TEXT NOT NULL,
  -- lengua del encuentro: es · ca · en. Vacío = abierto a todas.
  locale TEXT,
  -- nota interna opcional (no se envía)
  nota TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS programa_encuentros_starts_idx ON programa_encuentros (starts_at);

-- RLS activada y SIN políticas: solo el service_role lee y escribe.
ALTER TABLE programa_inscripciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE programa_envios ENABLE ROW LEVEL SECURITY;
ALTER TABLE programa_encuentros ENABLE ROW LEVEL SECURITY;
