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
