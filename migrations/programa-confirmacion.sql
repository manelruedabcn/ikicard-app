-- ============================================================
-- «UN MES CONOCIENDO TU IKIGAI» — doble confirmación.
-- Pedir el programa crea la inscripción «pendiente»; la persona entra al
-- pulsar «Confirmar mi plaza» en el correo de su devolución. Así nadie
-- apunta un correo ajeno ni uno con errata, y queda constancia de que
-- la persona lo pidió.
-- Requiere migrations/programa.sql. Ejecutar en el SQL editor de Supabase.
-- Idempotente: se puede ejecutar más de una vez.
-- ============================================================

-- Cuándo pulsó «Confirmar mi plaza».
ALTER TABLE programa_inscripciones ADD COLUMN IF NOT EXISTS confirmed_at TIMESTAMPTZ;

-- Nuevo estado «pendiente» (antes de confirmar).
ALTER TABLE programa_inscripciones DROP CONSTRAINT IF EXISTS programa_inscripciones_status_check;
ALTER TABLE programa_inscripciones ADD CONSTRAINT programa_inscripciones_status_check
  CHECK (status IN ('pendiente', 'activa', 'completada', 'baja'));
ALTER TABLE programa_inscripciones ALTER COLUMN status SET DEFAULT 'pendiente';

-- Buscar la pendiente de un correo al repetir el test.
CREATE INDEX IF NOT EXISTS programa_inscripciones_email_status_idx
  ON programa_inscripciones (email, status);
