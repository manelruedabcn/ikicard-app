-- Inscripciones públicas a talleres presenciales.
-- Escritura y lectura exclusivamente desde el servidor (service_role).

CREATE TABLE IF NOT EXISTS taller_registros (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_code TEXT NOT NULL,
  nombre TEXT NOT NULL,
  contacto TEXT NOT NULL,
  contacto_normalizado TEXT NOT NULL,
  tipo_contacto TEXT NOT NULL CHECK (tipo_contacto IN ('email', 'telefono')),
  privacidad_leida BOOLEAN NOT NULL DEFAULT false,
  source TEXT NOT NULL DEFAULT 'landing',
  estado TEXT NOT NULL DEFAULT 'pendiente'
    CHECK (estado IN ('pendiente', 'confirmado', 'asistio', 'cancelado')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (event_code, contacto_normalizado)
);

CREATE INDEX IF NOT EXISTS taller_registros_event_created_idx
  ON taller_registros (event_code, created_at DESC);

ALTER TABLE taller_registros ENABLE ROW LEVEL SECURITY;

-- Sin políticas públicas: anon y authenticated no pueden acceder.
-- La API de Vercel usa service_role solo en servidor.
