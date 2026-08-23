-- ============================================================
-- ¿QUÉ MÁSCARA GOBIERNA TU VIDA?  (La brújula de las máscaras)
-- Herramienta autónoma: identifica tus máscaras dominantes y el
-- miedo que hay debajo (el freno). Digitaliza la brújula del
-- libro "Camina sin separarte de ti".
--
-- Vive sola en el catálogo. Otras herramientas (IKIBOARD, PASO)
-- pueden leer su resultado, pero no la necesitan para funcionar.
--
-- Ejecutar en el editor SQL de Supabase. Idempotente.
-- ============================================================

-- ----
-- Registrar la herramienta en el catálogo. Ruta: /mascaras
-- Fase "comprende": profundiza lo que PASO abre de forma ligera.
-- ----
INSERT INTO tools (code, name, description, route, phase, sort_order)
VALUES
  ('mascaras', '¿Qué máscara gobierna tu vida?', 'Descubre qué te frena por dentro', '/mascaras', 'comprende', 25)
ON CONFLICT (code) DO NOTHING;

-- ----
-- Resultado del diagnóstico. UNA fila por usuario (se sobreescribe
-- al repetir; las máscaras se mueven con el tiempo).
--
--   scores    = las 7 puntuaciones 1-5, por código de máscara. JSON:
--               {"exigente":4,"controladora":2,...}. Guarda el crudo
--               para poder recalcular o mostrar el detalle.
--   dominant  = la máscara que más gobierna (mayor puntuación).
--   top3      = las tres principales, ordenadas de mayor a menor,
--               tal como pide el libro. JSON array de códigos:
--               ["complaciente","exigente","impostora"].
--   fear      = el miedo que hay debajo de la dominante (el freno).
--               Se propone del libro y el usuario puede ajustarlo.
--   reflection= ejercicio "Mi máscara dominante" (4 partes de Camina).
--               JSON por id: {"mask_uso":"...","mask_sirvio":"...",
--               "mask_cuesta":"...","mask_paso":"..."}. La parte
--               "mask_paso" es la semilla del paso 6 de IKIBOARD.
--
-- Códigos de máscara:
--   exigente | controladora | manipuladora | jueza |
--   complaciente | victima | impostora
-- ----
CREATE TABLE IF NOT EXISTS mask_results (
  user_id UUID PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  scores JSONB NOT NULL DEFAULT '{}'::jsonb,
  dominant TEXT,
  top3 JSONB NOT NULL DEFAULT '[]'::jsonb,
  fear TEXT,
  reflection JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Si la tabla ya existía sin la columna de reflexión, añádela.
ALTER TABLE mask_results ADD COLUMN IF NOT EXISTS reflection JSONB NOT NULL DEFAULT '{}'::jsonb;

-- El resultado es privado: cada usuario solo ve y edita el suyo.
ALTER TABLE mask_results ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "own mask result" ON mask_results;
CREATE POLICY "own mask result" ON mask_results FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
