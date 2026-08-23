-- ============================================================
-- IKIBOARD — El tablero vivo del método
-- Vision board con marco de ikigai: primero se DEFINE el propósito
-- hacia dentro (pasos guiados 1-6), luego se MONTA el tablero hacia
-- fuera (pasos 7-9). Digitaliza y une los libros de Manel en una
-- sola obra que crece con la persona.
--
-- Vive como una herramienta más del catálogo, bajo el sistema de
-- permisos (patrón paso/taller). Puede leer el resultado de otras
-- herramientas (máscaras, en el paso 5) pero no las necesita para
-- existir.
--
-- FASE 0 (cimientos): registra la herramienta + la tabla del flujo
-- "definir" (pasos 1-8, texto). El tablero visual (ítems + imágenes
-- en Storage) llega en su propia migración cuando montemos la Fase 2.
--
-- Ejecutar en el editor SQL de Supabase. Idempotente.
-- ============================================================

-- ----
-- Registrar la herramienta en el catálogo. Ruta: /ikiboard
-- Fase "practica": es la herramienta de construir, donde el método
-- se pone en obra. Va después de las de comprender.
-- ----
INSERT INTO tools (code, name, description, route, phase, sort_order)
VALUES
  ('ikiboard', 'IKIBOARD', 'Tu tablero vivo: alinea quién eres con lo que quieres', '/ikiboard', 'practica', 40)
ON CONFLICT (code) DO NOTHING;

-- ----
-- El tablero del usuario. UNA fila por persona: el tablero es único
-- y vivo (crece con cada revisión, no se archivan versiones).
--
--   content          = respuestas de los pasos guiados (1-8), por id
--                      de campo. JSON llano: {"intencion":"...",
--                      "ikigai_amas":"...","proposito":"...",
--                      "identidad":"...","lo_que_das":"...",
--                      "paso_que":"...","paso_cuando":"...",
--                      "gratitud":"..."}. Autosave, como taller/máscaras.
--                      El paso 5 (lo que te frena) NO se guarda aquí:
--                      vive en mask_results y se lee de allí.
--   last_reviewed_at = último "volver" (paso 9). Es el motor real:
--                      marca cuándo la persona revisó su tablero.
-- ----
CREATE TABLE IF NOT EXISTS ikiboard (
  user_id UUID PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  content JSONB NOT NULL DEFAULT '{}'::jsonb,
  last_reviewed_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- El tablero es privado: cada usuario solo ve y edita el suyo.
ALTER TABLE ikiboard ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "own ikiboard" ON ikiboard;
CREATE POLICY "own ikiboard" ON ikiboard FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
