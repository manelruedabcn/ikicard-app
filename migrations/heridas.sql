-- ============================================================
-- LA HERIDA QUE MÁS PESA  (Test de la herida dominante · "3 pains")
-- Herramienta autónoma: 15 frases en 3 bloques (profesional,
-- relacional, vital), escala 1-5. Suma por bloque → banda → copy
-- fijo (determinista, cero IA). Detecta de qué te proteges;
-- máscaras responde cómo te proteges.
--
-- Fuente canónica de frases y bandas: Guia_Ikigai_Consciente_El_Sistema.md
-- (sección V). Precede al test de máscaras en el embudo, pero vive
-- sola: puede leer el resultado de mask_results, no lo necesita.
--
-- Ejecutar en el editor SQL de Supabase. Idempotente.
-- ============================================================

-- ----
-- Registrar la herramienta en el catálogo. Ruta: /heridas
-- Fase "comprende": diagnóstico de fondo, junto a máscaras.
-- ----
INSERT INTO tools (code, name, description, route, phase, sort_order)
VALUES
  ('heridas', 'La herida que más pesa', 'Descubre qué pesa de fondo ahora mismo', '/heridas', 'comprende', 28)
ON CONFLICT (code) DO NOTHING;

-- ----
-- Resultado del diagnóstico. UNA fila por usuario (se sobreescribe
-- al repetir; la herida que más pesa se mueve con el tiempo).
--
--   scores    = las 15 puntuaciones 1-5, por id de frase. JSON crudo
--               para poder recalcular o mostrar el detalle:
--               {"prof_1":4,"prof_2":2,...,"vit_5":5}.
--   sums      = la suma por bloque (rango 5-25 cada uno). JSON:
--               {"profesional":18,"relacional":11,"vital":22}.
--   dominant  = el bloque con la suma más alta (la herida que más
--               gobierna). Códigos: profesional | relacional | vital.
--               El copy de resultado (empate, todo bajo, todo alto)
--               se recalcula en cliente desde sums; aquí se guarda
--               el crudo y el dominante para lectura rápida.
--   reflection= ejercicio de cierre en pantalla (3 partes). JSON por
--               id: {"herida_cual":"...","herida_recordo":"...",
--               "herida_gesto":"..."}.
-- ----
CREATE TABLE IF NOT EXISTS herida_results (
  user_id UUID PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  scores JSONB NOT NULL DEFAULT '{}'::jsonb,
  sums JSONB NOT NULL DEFAULT '{}'::jsonb,
  dominant TEXT,
  reflection JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Si la tabla ya existía sin la columna de reflexión, añádela.
ALTER TABLE herida_results ADD COLUMN IF NOT EXISTS reflection JSONB NOT NULL DEFAULT '{}'::jsonb;

-- El resultado es privado: cada usuario solo ve y edita el suyo.
ALTER TABLE herida_results ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "own herida result" ON herida_results;
CREATE POLICY "own herida result" ON herida_results FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
