-- ============================================================
-- DESPLIEGUE IKIBOARD — todas las migraciones en orden.
-- Generado para pegar de una vez en el SQL Editor de Supabase.
-- Idempotente: se puede ejecutar varias veces sin romper nada.
-- (No incluye platform.sql: ya está en producción.)
-- ============================================================


-- ############ migrations/estrellas.sql ############
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


-- ############ migrations/camino.sql ############
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


-- ############ migrations/masks.sql ############
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


-- ############ migrations/ikiboard.sql ############
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


-- ############ migrations/ikiboard_items.sql ############
-- ============================================================
-- IKIBOARD — Fase 2: las fotos del álbum del futuro de tu vida
-- (ikiboard_items). Una fila por foto. Cada foto vive en una de las
-- 4 zonas (Cuerpo y vida · Vínculos · Lo material · Vocación) y lleva
-- imagen (icono propio, o foto en Storage más adelante) + frase en
-- presente + "qué doy" (recibir para compartir) + cercanía (cuánto la
-- habitas ya). Lo material es zona propia: el deseo tangible es
-- legítimo; la frase-en-presente lo ancla para que no sea una lista.
-- Idempotente: se puede correr varias veces sin romper nada.
-- ============================================================

CREATE TABLE IF NOT EXISTS ikiboard_items (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  -- Las 4 zonas del álbum (eje sostiene -> comparte).
  ambito     TEXT NOT NULL CHECK (ambito IN ('cuerpo','vinculos','material','vocacion')),
  -- 'icono' = id de la biblioteca propia; 'foto' = path en Storage (Fase 2b).
  tipo       TEXT NOT NULL DEFAULT 'icono' CHECK (tipo IN ('icono','foto')),
  ref        TEXT NOT NULL,
  -- La imagen sirve al significado: frase en presente + qué doy.
  frase      TEXT NOT NULL DEFAULT '',
  doy        TEXT NOT NULL DEFAULT '',
  -- Cercanía a habitar esa foto (no logro): lo marca la persona a mano.
  estado     TEXT NOT NULL DEFAULT 'lejos' CHECK (estado IN ('lejos','en_proceso','conseguido')),
  -- Una sola foto puede ser el foco actual. No convierte el álbum en
  -- una lista de tareas: señala qué escena se está moviendo ahora.
  is_priority BOOLEAN NOT NULL DEFAULT false,
  state_changed_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  sort_order INT  NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Puesta al día idempotente sobre tablas ya existentes:
-- 'material' vuelve a ser una zona válida (nunca dejó de estar en el
-- CHECK original); si una iteración intermedia añadió una columna
-- 'material' como capa, la retiramos (lo tangible es zona, no campo).
ALTER TABLE ikiboard_items DROP COLUMN IF EXISTS material;
ALTER TABLE ikiboard_items DROP CONSTRAINT IF EXISTS ikiboard_items_ambito_check;
ALTER TABLE ikiboard_items
  ADD CONSTRAINT ikiboard_items_ambito_check CHECK (ambito IN ('cuerpo','vinculos','material','vocacion'));

-- Cercanía a habitar (álbum del futuro de tu vida): tres estados.
ALTER TABLE ikiboard_items
  ADD COLUMN IF NOT EXISTS estado TEXT NOT NULL DEFAULT 'lejos';
ALTER TABLE ikiboard_items
  ADD COLUMN IF NOT EXISTS is_priority BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE ikiboard_items
  ADD COLUMN IF NOT EXISTS state_changed_at TIMESTAMPTZ DEFAULT now();
ALTER TABLE ikiboard_items
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();
ALTER TABLE ikiboard_items DROP CONSTRAINT IF EXISTS ikiboard_items_estado_check;
ALTER TABLE ikiboard_items
  ADD CONSTRAINT ikiboard_items_estado_check CHECK (estado IN ('lejos','en_proceso','conseguido'));

ALTER TABLE ikiboard_items ENABLE ROW LEVEL SECURITY;

-- Cada persona solo ve y edita lo suyo.
DROP POLICY IF EXISTS "own ikiboard_items" ON ikiboard_items;
CREATE POLICY "own ikiboard_items" ON ikiboard_items
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS ikiboard_items_user_idx ON ikiboard_items (user_id);

-- Historial mínimo del álbum vivo. Cada cambio de cercanía deja una
-- huella para poder mostrar evolución sin gamificación ni IA.
CREATE TABLE IF NOT EXISTS ikiboard_item_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  item_id UUID NOT NULL REFERENCES ikiboard_items ON DELETE CASCADE,
  previous_state TEXT CHECK (previous_state IN ('lejos','en_proceso','conseguido')),
  new_state TEXT NOT NULL CHECK (new_state IN ('lejos','en_proceso','conseguido')),
  reason TEXT,
  note TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE ikiboard_item_reviews ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "own ikiboard_item_reviews" ON ikiboard_item_reviews;
CREATE POLICY "own ikiboard_item_reviews" ON ikiboard_item_reviews
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS ikiboard_item_reviews_user_idx
  ON ikiboard_item_reviews (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS ikiboard_item_reviews_item_idx
  ON ikiboard_item_reviews (item_id, created_at DESC);


-- ############ migrations/ikiboard_storage.sql ############
-- ============================================================
-- IKIBOARD — Fotografías privadas del álbum.
-- Cada usuario guarda en la carpeta <user_id>/... de un bucket privado.
-- Ejecutar en el SQL Editor de Supabase. Idempotente.
-- ============================================================

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'ikiboard',
  'ikiboard',
  false,
  8388608,
  ARRAY['image/jpeg','image/png','image/webp','image/heic','image/heif']
)
ON CONFLICT (id) DO UPDATE SET
  public = false,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

DROP POLICY IF EXISTS "own ikiboard photos select" ON storage.objects;
CREATE POLICY "own ikiboard photos select" ON storage.objects FOR SELECT
  USING (
    bucket_id = 'ikiboard'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

DROP POLICY IF EXISTS "own ikiboard photos insert" ON storage.objects;
CREATE POLICY "own ikiboard photos insert" ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'ikiboard'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

DROP POLICY IF EXISTS "own ikiboard photos update" ON storage.objects;
CREATE POLICY "own ikiboard photos update" ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'ikiboard'
    AND (storage.foldername(name))[1] = auth.uid()::text
  )
  WITH CHECK (
    bucket_id = 'ikiboard'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

DROP POLICY IF EXISTS "own ikiboard photos delete" ON storage.objects;
CREATE POLICY "own ikiboard photos delete" ON storage.objects FOR DELETE
  USING (
    bucket_id = 'ikiboard'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

