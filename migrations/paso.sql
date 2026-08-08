-- ============================================================
-- PASO — Test de entrada Ikigaier
-- Puerta de entrada gratuita. El test funciona SIN cuenta
-- (contenido y cálculo viven en lib/paso-content.ts).
-- Aquí solo se persiste el RESULTADO de quien está logueado.
-- Ejecutar en el SQL editor de Supabase. Idempotente.
-- ============================================================

-- ----
-- Registrar la herramienta en el catálogo. Ruta: /paso.
-- phase 'descubre' = puerta de entrada al método.
-- ----
INSERT INTO tools (code, name, description, route, phase, sort_order)
VALUES
  ('paso', 'PASO', 'Descubre cómo caminas', '/paso', 'descubre', 5)
ON CONFLICT (code) DO NOTHING;

-- ----
-- Resultado del test por usuario. Una fila por intento.
-- Solo se guarda si la persona tiene sesión (user_id = auth.uid()).
-- Los campos numéricos son las salidas de calcularInformePaso().
-- ----
CREATE TABLE IF NOT EXISTS paso_results (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  codigo_patron TEXT NOT NULL,
  mascara_p INT NOT NULL, mascara_a INT NOT NULL, mascara_s INT NOT NULL, mascara_o INT NOT NULL,
  natural_p INT NOT NULL, natural_a INT NOT NULL, natural_s INT NOT NULL, natural_o INT NOT NULL,
  score_p INT NOT NULL, score_a INT NOT NULL, score_s INT NOT NULL, score_o INT NOT NULL,
  punto_ciego TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS paso_results_user_idx ON paso_results (user_id);

-- Cada usuario solo ve e inserta sus propios resultados.
ALTER TABLE paso_results ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "own paso results" ON paso_results;
CREATE POLICY "own paso results" ON paso_results FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ============================================================
-- PASO GRATIS POR DEFECTO PARA TODOS
-- Cada usuario nuevo recibe automáticamente el entitlement 'paso'
-- (source 'free'), para que la herramienta aparezca siempre en su
-- dashboard. Módulo aislado: trigger propio, no toca handle_new_user.
-- ============================================================
CREATE OR REPLACE FUNCTION grant_paso_on_signup()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  paso_tool_id UUID;
BEGIN
  SELECT id INTO paso_tool_id FROM public.tools WHERE code = 'paso';
  IF paso_tool_id IS NOT NULL THEN
    INSERT INTO public.entitlements (user_id, tool_id, source)
    VALUES (NEW.id, paso_tool_id, 'free')
    ON CONFLICT DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created_grant_paso ON auth.users;
CREATE TRIGGER on_auth_user_created_grant_paso
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION grant_paso_on_signup();

-- Backfill: dar PASO a los usuarios que YA existen y aún no lo tienen.
INSERT INTO entitlements (user_id, tool_id, source)
SELECT u.id, t.id, 'free'
FROM auth.users u
CROSS JOIN tools t
WHERE t.code = 'paso'
  AND NOT EXISTS (
    SELECT 1 FROM entitlements e
    WHERE e.user_id = u.id AND e.tool_id = t.id
  );
