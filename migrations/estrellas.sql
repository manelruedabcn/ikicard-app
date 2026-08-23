-- ============================================================
-- LAS CUATRO ESTRELLAS  (tu estilo de estar y relacionarte)
-- Herramienta autónoma: identifica cuál de los cuatro estilos
-- domina tu forma de estar. Digitaliza el "Test de las cuatro
-- estrellas" del libro "El Ikigai que no te contaron".
--
-- Vive sola en el catálogo. IKIBOARD lee su resultado (junto con
-- CAMINO) para sembrar el propósito y la zona Vocación, pero no
-- la necesita para funcionar.
--
-- Ejecutar en el editor SQL de Supabase. Idempotente.
-- ============================================================

-- ----
-- Registrar la herramienta en el catálogo. Ruta: /estrellas
-- Fase "comprende": profundiza el ikigai activo.
-- ----
INSERT INTO tools (code, name, description, route, phase, sort_order)
VALUES
  ('estrellas', 'Las cuatro estrellas', 'Descubre tu estilo de estar y relacionarte', '/estrellas', 'comprende', 26)
ON CONFLICT (code) DO NOTHING;

-- ----
-- Resultado del diagnóstico. UNA fila por usuario (se sobreescribe
-- al repetir; el estilo se mueve con el tiempo).
--
--   scores    = las 20 respuestas 1-5, por número de frase. JSON:
--               {"1":4,"2":3,...,"20":5}. Guarda el crudo para
--               poder recalcular totales o mostrar el detalle.
--   dominant  = la estrella con mayor suma por bloque.
--
-- Bloques (código de estrella):
--   explorador  frases 1-5
--   comunicador frases 6-10
--   protector   frases 11-15
--   visionario  frases 16-20
-- ----
CREATE TABLE IF NOT EXISTS estrella_results (
  user_id UUID PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  scores JSONB NOT NULL DEFAULT '{}'::jsonb,
  dominant TEXT,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- El resultado es privado: cada usuario solo ve y edita el suyo.
ALTER TABLE estrella_results ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "own estrella result" ON estrella_results;
CREATE POLICY "own estrella result" ON estrella_results FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
