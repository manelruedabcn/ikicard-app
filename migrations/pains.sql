-- ============================================================
-- LA HERIDA DOMINANTE  (test de las 3 heridas)
-- Diagnóstico previo: detecta qué herida —profesional, relacional o
-- vital— pesa más ahora mismo. En el embudo va después de IKIBOARD,
-- como filtro justo antes de la mentoría 1:1. Puede leer el resultado
-- de /mascaras más adelante (cruce herida-máscara, hipótesis sin
-- validar todavía), pero no lo necesita para funcionar por sí sola.
--
-- Ejecutar en el editor SQL de Supabase. Idempotente.
-- ============================================================

-- ----
-- Registrar la herramienta en el catálogo. Ruta: /pains
-- Fase "continúa": último paso automático antes de la mentoría 1:1.
-- ----
INSERT INTO tools (code, name, description, route, phase, sort_order)
VALUES
  ('pains', 'La herida dominante', 'Qué herida pesa más ahora mismo', '/pains', 'continua', 45)
ON CONFLICT (code) DO NOTHING;

-- ----
-- Resultado del diagnóstico. UNA fila por usuario (se sobreescribe al
-- repetir; la herida dominante se mueve con el tiempo, igual que las
-- máscaras).
--
--   answers   = las 15 respuestas crudas 1-5, por bloque. JSON:
--               {"profesional":[3,4,2,5,3],"relacional":[...],"vital":[...]}.
--               Se guarda el crudo para poder recalcular sin repetir el test.
--   scores    = la suma de cada bloque (5-25). JSON:
--               {"profesional":17,"relacional":9,"vital":22}.
--   case_kind = qué rama de lectura aplica:
--               'single' (una herida domina con claridad) |
--               'tie'    (las dos más altas quedan a ≤3 puntos) |
--               'low'    (las tres en banda baja, 5-11) |
--               'high'   (las tres en banda alta, 19-25).
--   dominant  = la herida que más pesa. NULL si case_kind='low'.
--   second    = la segunda herida del empate. Solo si case_kind='tie'.
--   reflection = ejercicio de cierre (3 partes). JSON por id:
--                {"pain_dominant":"...","pain_reminder":"...","pain_gesture":"..."}.
--
-- Códigos de bloque: profesional | relacional | vital
-- ----
CREATE TABLE IF NOT EXISTS pain_results (
  user_id UUID PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  answers JSONB NOT NULL DEFAULT '{}'::jsonb,
  scores JSONB NOT NULL DEFAULT '{}'::jsonb,
  case_kind TEXT CHECK (case_kind IN ('single','tie','low','high')),
  dominant TEXT,
  second TEXT,
  reflection JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- El resultado es privado: cada usuario solo ve y edita el suyo.
ALTER TABLE pain_results ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "own pain result" ON pain_results;
CREATE POLICY "own pain result" ON pain_results FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
