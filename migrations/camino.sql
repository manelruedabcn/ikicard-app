-- ============================================================
-- TEST CAMINO  (tus capacidades y orientación profesional)
-- Herramienta autónoma: identifica cuál de las seis grandes
-- orientaciones domina tu forma de trabajar. Digitaliza el
-- "Test CAMINO" del libro "El Ikigai que no te contaron".
--
-- Vive sola en el catálogo. IKIBOARD lee su resultado (junto con
-- ESTRELLAS) para sembrar el propósito y la zona Vocación, pero no
-- la necesita para funcionar.
--
-- Ejecutar en el editor SQL de Supabase. Idempotente.
-- ============================================================

-- ----
-- Registrar la herramienta en el catálogo. Ruta: /camino
-- Fase "comprende": profundiza el ikigai activo.
-- ----
INSERT INTO tools (code, name, description, route, phase, sort_order)
VALUES
  ('camino', 'Test CAMINO', 'Descubre tu orientación profesional dominante', '/camino', 'comprende', 27)
ON CONFLICT (code) DO NOTHING;

-- ----
-- Resultado del diagnóstico. UNA fila por usuario (se sobreescribe
-- al repetir; la orientación se mueve con el tiempo).
--
--   scores    = las 30 respuestas 1-5, por número de frase. JSON:
--               {"1":4,"2":3,...,"30":5}. Guarda el crudo para
--               poder recalcular totales o mostrar el detalle.
--   dominant  = la orientación con mayor suma por bloque.
--
-- Bloques (código de orientación):
--   constructor  frases 1-5
--   analista     frases 6-10
--   maestro      frases 11-15
--   innovador    frases 16-20
--   negociador   frases 21-25
--   organizador  frases 26-30
-- ----
CREATE TABLE IF NOT EXISTS camino_results (
  user_id UUID PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  scores JSONB NOT NULL DEFAULT '{}'::jsonb,
  dominant TEXT,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- El resultado es privado: cada usuario solo ve y edita el suyo.
ALTER TABLE camino_results ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "own camino result" ON camino_results;
CREATE POLICY "own camino result" ON camino_results FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
