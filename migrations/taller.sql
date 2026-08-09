-- ============================================================
-- TALLER — Cuaderno "Camina sin separarte de ti"
-- Módulo de taller: ejercicios + espacios de respuesta por usuario.
-- Ejecutar en el SQL editor de Supabase.
-- ============================================================

-- ----
-- Registrar la herramienta en el catálogo (para que aparezca en el dashboard
-- de quien tenga el entitlement). Ruta: /taller
-- ----
INSERT INTO tools (code, name, description, route, phase, sort_order)
VALUES
  ('taller', 'Taller', 'Camina sin separarte de ti', '/taller', 'comprende', 30)
ON CONFLICT (code) DO NOTHING;

-- ----
-- Respuestas del usuario. Una fila por bloque respondido (block_id estable,
-- definido en lib/taller-content.ts). value guarda el texto o la puntuación.
-- ----
CREATE TABLE IF NOT EXISTS taller_answers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  block_id TEXT NOT NULL,
  value TEXT,
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (user_id, block_id)
);

-- Las respuestas son privadas: cada usuario solo ve y edita las suyas.
ALTER TABLE taller_answers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "own taller answers" ON taller_answers;
CREATE POLICY "own taller answers" ON taller_answers FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
