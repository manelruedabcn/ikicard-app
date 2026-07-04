-- ============================================================
-- IKICARD — Modo Viaje (21 días)
-- Ejecutar en el editor SQL de Supabase.
-- Idempotente: se puede volver a ejecutar sin romper nada.
-- ============================================================

-- Sesión de viaje (una activa por usuario)
CREATE TABLE IF NOT EXISTS journey_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  started_at TIMESTAMPTZ DEFAULT now(),
  current_day INT DEFAULT 1 CHECK (current_day BETWEEN 1 AND 21),
  status TEXT DEFAULT 'active' CHECK (status IN ('active','paused','completed')),
  language TEXT DEFAULT 'es'
);

-- Cartas asignadas a cada día/slot del viaje
CREATE TABLE IF NOT EXISTS journey_cards (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID REFERENCES journey_sessions NOT NULL,
  day INT NOT NULL,
  slot TEXT NOT NULL CHECK (slot IN ('morning','midday','night')),
  card_code TEXT NOT NULL,
  sello TEXT,
  answered_at TIMESTAMPTZ
);

-- Dones (una frase por fase completada)
CREATE TABLE IF NOT EXISTS journey_gifts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID REFERENCES journey_sessions NOT NULL,
  phase TEXT NOT NULL CHECK (phase IN ('despertar','descender','atravesar','retornar')),
  gift_text TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Row Level Security
ALTER TABLE journey_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE journey_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE journey_gifts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "own sessions" ON journey_sessions;
CREATE POLICY "own sessions" ON journey_sessions FOR ALL
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "own cards" ON journey_cards;
CREATE POLICY "own cards" ON journey_cards FOR ALL
  USING (session_id IN (SELECT id FROM journey_sessions WHERE user_id = auth.uid()));

DROP POLICY IF EXISTS "own gifts" ON journey_gifts;
CREATE POLICY "own gifts" ON journey_gifts FOR ALL
  USING (session_id IN (SELECT id FROM journey_sessions WHERE user_id = auth.uid()));
