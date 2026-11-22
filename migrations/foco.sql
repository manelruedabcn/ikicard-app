-- ============================================================
-- TEST FOCO  («¿Eres de una cosa o de muchas?»)
-- Test de autoconocimiento (no médico) del espectro especialista ↔
-- multipotencial. 25 frases, escala 1-5, cinco dimensiones: cuatro
-- de espectro (lo que te gusta, cuando cambias de tarea, cómo
-- trabajas, cómo te presentas) y una de integración («cómo lo
-- llevas»: cierre y visibilidad). Cálculo determinista, cero IA.
--
-- Puerta de entrada GRATUITA, como PASO: /foco funciona sin cuenta.
-- Si la persona tiene sesión, el resultado se guarda aquí (una fila
-- por usuario, se sobreescribe al repetir) para que IKIBOARD pueda
-- leerlo más adelante.
--
-- Ejecutar en el editor SQL de Supabase. Idempotente.
-- ============================================================

-- ----
-- Registrar la herramienta en el catálogo. Ruta: /foco
-- Fase "descubre", justo detrás de PASO.
-- ----
INSERT INTO tools (code, name, description, route, phase, sort_order)
VALUES
  ('foco', 'Test FOCO', '¿Eres de una cosa o de muchas?', '/foco', 'descubre', 6)
ON CONFLICT (code) DO NOTHING;

-- ----
-- Resultado. UNA fila por usuario.
--
--   answers   = las 25 respuestas 1-5, en el orden de las preguntas
--               (array JSON: [3,5,1,...]). Crudo para recalcular.
--   scores    = 0-100 por dimensión. JSON:
--               {"int":72,"ene":60,"rit":81,"ide":55,"gin":40}.
--   profile   = A (de una cosa) | M (de las dos) | B (de muchas).
--   integ     = L (te pesa) | M (vas bien) | H (lo llevas bien).
-- ----
CREATE TABLE IF NOT EXISTS foco_results (
  user_id UUID PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  answers JSONB NOT NULL DEFAULT '[]'::jsonb,
  scores JSONB NOT NULL DEFAULT '{}'::jsonb,
  profile TEXT CHECK (profile IN ('A','M','B')),
  integ TEXT CHECK (integ IN ('L','M','H')),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- El resultado es privado: cada usuario solo ve y edita el suyo.
ALTER TABLE foco_results ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "own foco result" ON foco_results;
CREATE POLICY "own foco result" ON foco_results FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ============================================================
-- FOCO GRATIS PARA TODOS (mismo patrón que PASO)
-- Cada usuario nuevo recibe el permiso 'foco' (source 'free') para que
-- aparezca en su panel. Trigger propio: no toca los de PASO ni el alta.
-- ============================================================
CREATE OR REPLACE FUNCTION grant_foco_on_signup()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  foco_tool_id UUID;
BEGIN
  SELECT id INTO foco_tool_id FROM public.tools WHERE code = 'foco';
  IF foco_tool_id IS NOT NULL THEN
    INSERT INTO public.entitlements (user_id, tool_id, source)
    VALUES (NEW.id, foco_tool_id, 'free')
    ON CONFLICT DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created_grant_foco ON auth.users;
CREATE TRIGGER on_auth_user_created_grant_foco
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION grant_foco_on_signup();

-- Backfill: dar FOCO a los usuarios que YA existen y aún no lo tienen.
INSERT INTO entitlements (user_id, tool_id, source)
SELECT u.id, t.id, 'free'
FROM auth.users u
CROSS JOIN tools t
WHERE t.code = 'foco'
  AND NOT EXISTS (
    SELECT 1 FROM entitlements e
    WHERE e.user_id = u.id AND e.tool_id = t.id
  );
