-- ============================================================
-- IKIGAIER — Capa de plataforma (perfiles + permisos)
-- Paso 1: cimientos del sistema de permisos y dashboard dinámico.
-- Ejecutar en el editor SQL de Supabase.
-- Idempotente: se puede volver a ejecutar sin romper nada.
-- ============================================================

-- ------------------------------------------------------------
-- 1) PERFILES
--    Un perfil por usuario de auth. Datos de presentación.
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  display_name TEXT,
  language TEXT DEFAULT 'es',
  is_admin BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ------------------------------------------------------------
-- 2) HERRAMIENTAS (catálogo)
--    Cada herramienta desbloqueable de la plataforma.
--    Añadir una herramienta nueva = insertar una fila aquí.
--    phase = agrupación por proceso (Descubre → ... → Continúa)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS tools (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  route TEXT,
  phase TEXT CHECK (phase IN ('descubre','comprende','practica','integra','continua')),
  sort_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ------------------------------------------------------------
-- 3) PROGRAMAS (paquetes de permisos)
--    Un programa agrupa varias herramientas y se asigna de una vez.
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS programs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Qué herramientas incluye cada programa
CREATE TABLE IF NOT EXISTS program_tools (
  program_id UUID REFERENCES programs ON DELETE CASCADE,
  tool_id UUID REFERENCES tools ON DELETE CASCADE,
  PRIMARY KEY (program_id, tool_id)
);

-- ------------------------------------------------------------
-- 4) PERMISOS (entitlements)
--    Lo que tiene desbloqueado cada usuario.
--    Puede apuntar a UNA herramienta suelta O a UN programa.
--    source     = por qué lo tiene (gratis/pagado/promo/manual/admin)
--    expires_at = hasta cuándo (NULL = para siempre)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS entitlements (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  tool_id UUID REFERENCES tools ON DELETE CASCADE,
  program_id UUID REFERENCES programs ON DELETE CASCADE,
  source TEXT DEFAULT 'manual' CHECK (source IN ('free','paid','promo','manual','admin')),
  granted_at TIMESTAMPTZ DEFAULT now(),
  expires_at TIMESTAMPTZ,
  -- exactamente uno de los dos: herramienta suelta o programa
  CONSTRAINT one_target CHECK (
    (tool_id IS NOT NULL)::int + (program_id IS NOT NULL)::int = 1
  )
);

CREATE INDEX IF NOT EXISTS entitlements_user_idx ON entitlements (user_id);

-- Un permiso por (usuario, herramienta) y por (usuario, programa). Sin esto,
-- el `ON CONFLICT DO NOTHING` del trigger de alta no tiene a qué agarrarse y
-- podrían colarse permisos duplicados. Deduplicamos antes de crear los índices
-- (nos quedamos con el más antiguo) para que no fallen sobre datos ya sucios.
DELETE FROM entitlements e USING entitlements dup
WHERE e.tool_id IS NOT NULL
  AND e.user_id = dup.user_id AND e.tool_id = dup.tool_id
  AND (e.granted_at, e.id) > (dup.granted_at, dup.id);
DELETE FROM entitlements e USING entitlements dup
WHERE e.program_id IS NOT NULL
  AND e.user_id = dup.user_id AND e.program_id = dup.program_id
  AND (e.granted_at, e.id) > (dup.granted_at, dup.id);

CREATE UNIQUE INDEX IF NOT EXISTS entitlements_user_tool_uidx
  ON entitlements (user_id, tool_id) WHERE tool_id IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS entitlements_user_program_uidx
  ON entitlements (user_id, program_id) WHERE program_id IS NOT NULL;

-- ============================================================
-- FUNCIÓN CENTRAL: get_my_tools()
-- Único punto que resuelve "qué ve este usuario ahora mismo".
-- Reúne permisos directos + permisos vía programa, descarta
-- lo caducado y lo inactivo. El dashboard solo llama a esto.
-- ============================================================
CREATE OR REPLACE FUNCTION get_my_tools()
RETURNS TABLE (
  id UUID,
  code TEXT,
  name TEXT,
  description TEXT,
  route TEXT,
  phase TEXT,
  sort_order INT,
  expires_at TIMESTAMPTZ
)
LANGUAGE sql
STABLE
SECURITY INVOKER
AS $$
  WITH granted AS (
    -- permisos vigentes del usuario actual
    SELECT e.tool_id, e.program_id, e.expires_at
    FROM entitlements e
    WHERE e.user_id = auth.uid()
      AND (e.expires_at IS NULL OR e.expires_at > now())
  ),
  tool_ids AS (
    -- herramientas sueltas
    SELECT g.tool_id AS tool_id, g.expires_at
    FROM granted g
    WHERE g.tool_id IS NOT NULL
    UNION ALL
    -- herramientas heredadas de un programa
    SELECT pt.tool_id, g.expires_at
    FROM granted g
    JOIN program_tools pt ON pt.program_id = g.program_id
    WHERE g.program_id IS NOT NULL
  ),
  resolved AS (
    -- por herramienta: si algún permiso es permanente (NULL), gana NULL;
    -- si todos caducan, se queda la fecha más lejana.
    SELECT
      ti.tool_id,
      CASE
        WHEN bool_or(ti.expires_at IS NULL) THEN NULL
        ELSE max(ti.expires_at)
      END AS expires_at
    FROM tool_ids ti
    GROUP BY ti.tool_id
  )
  SELECT
    t.id, t.code, t.name, t.description, t.route, t.phase, t.sort_order,
    r.expires_at
  FROM resolved r
  JOIN tools t ON t.id = r.tool_id
  WHERE t.is_active = true
  ORDER BY t.sort_order, t.name;
$$;

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
ALTER TABLE profiles      ENABLE ROW LEVEL SECURITY;
ALTER TABLE tools         ENABLE ROW LEVEL SECURITY;
ALTER TABLE programs      ENABLE ROW LEVEL SECURITY;
ALTER TABLE program_tools ENABLE ROW LEVEL SECURITY;
ALTER TABLE entitlements  ENABLE ROW LEVEL SECURITY;

-- Perfiles: cada usuario ve y edita solo el suyo.
DROP POLICY IF EXISTS "own profile - select" ON profiles;
CREATE POLICY "own profile - select" ON profiles FOR SELECT
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "own profile - update" ON profiles;
CREATE POLICY "own profile - update" ON profiles FOR UPDATE
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "own profile - insert" ON profiles;
CREATE POLICY "own profile - insert" ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Catálogo (tools / programs / program_tools): lectura para autenticados.
-- La escritura la hace el admin con service_role, que se salta la RLS.
DROP POLICY IF EXISTS "tools readable" ON tools;
CREATE POLICY "tools readable" ON tools FOR SELECT
  USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "programs readable" ON programs;
CREATE POLICY "programs readable" ON programs FOR SELECT
  USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "program_tools readable" ON program_tools;
CREATE POLICY "program_tools readable" ON program_tools FOR SELECT
  USING (auth.role() = 'authenticated');

-- Permisos: cada usuario solo puede LEER los suyos.
-- La asignación/revocación la hace el admin (service_role), que se salta la RLS.
DROP POLICY IF EXISTS "own entitlements - select" ON entitlements;
CREATE POLICY "own entitlements - select" ON entitlements FOR SELECT
  USING (auth.uid() = user_id);

-- ============================================================
-- CREACIÓN AUTOMÁTICA DE PERFIL AL REGISTRARSE
-- Cada nuevo usuario de auth obtiene su fila en profiles.
-- ============================================================
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name)
  VALUES (NEW.id, split_part(NEW.email, '@', 1))
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ============================================================
-- SEED: registrar las herramientas que YA existen
-- (IKICARD y Viaje de 21 días) en el catálogo.
-- ============================================================
INSERT INTO tools (code, name, description, route, phase, sort_order)
VALUES
  ('ikicard', 'IKICARD',            'Cartas del oráculo IKICARD',      '/oraculo', 'practica', 10),
  ('viaje21', 'Viaje de 21 días',   'El recorrido de 21 días',         '/viaje',   'integra',  20)
ON CONFLICT (code) DO NOTHING;
