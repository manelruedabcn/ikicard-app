-- ============================================================
-- «UN MES CONOCIENDO TU IKIGAI» — el programa dentro del panel.
-- Para hacer el programa hay que tener cuenta. Al apuntarse, la persona
-- recibe la herramienta «programa» en su panel (/mes): el calendario de
-- las cuatro semanas, el contenido de cada una y su libreta (lo que
-- escribe, guardado en programa_respuestas).
-- Requiere migrations/programa.sql y programa-confirmacion.sql.
-- Ejecutar en el SQL editor de Supabase. Idempotente.
-- ============================================================

-- La herramienta en el catálogo. Ruta: /mes. Primera del panel.
INSERT INTO tools (code, name, description, route, phase, sort_order)
VALUES ('programa', 'Un mes conociendo tu ikigai', 'Tu programa de cuatro semanas', '/mes', 'descubre', 5)
ON CONFLICT (code) DO NOTHING;

-- Cada persona ve SOLO su propia inscripción (para el panel y para que la
-- política de programa_respuestas pueda comprobar que es suya). Escribir
-- sigue siendo cosa del servidor.
DROP POLICY IF EXISTS "programa_inscripciones: ver la propia" ON programa_inscripciones;
CREATE POLICY "programa_inscripciones: ver la propia" ON programa_inscripciones
  FOR SELECT USING (user_id = auth.uid());

-- La libreta: lo que escribe en cada campo del programa (la frase del
-- primer día, la frase madre, «Cuando el ruido baja, yo soy…»…). Una fila
-- por inscripción y campo; se sobreescribe al editar.
CREATE TABLE IF NOT EXISTS programa_respuestas (
  inscripcion_id UUID NOT NULL REFERENCES programa_inscripciones ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  -- código del campo (independiente del idioma): ancla, frase_madre, ruido…
  campo TEXT NOT NULL CHECK (campo ~ '^[a-z_]{2,30}$'),
  texto TEXT NOT NULL CHECK (char_length(texto) <= 2000),
  updated_at TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (inscripcion_id, campo)
);

CREATE INDEX IF NOT EXISTS programa_respuestas_user_idx ON programa_respuestas (user_id);

ALTER TABLE programa_respuestas ENABLE ROW LEVEL SECURITY;

-- Cada persona lee, escribe y borra solo lo suyo, y solo en una inscripción suya.
DROP POLICY IF EXISTS "programa_respuestas: ver las propias" ON programa_respuestas;
CREATE POLICY "programa_respuestas: ver las propias" ON programa_respuestas
  FOR SELECT USING (user_id = auth.uid());

DROP POLICY IF EXISTS "programa_respuestas: escribir las propias" ON programa_respuestas;
CREATE POLICY "programa_respuestas: escribir las propias" ON programa_respuestas
  FOR INSERT WITH CHECK (
    user_id = auth.uid()
    AND EXISTS (SELECT 1 FROM programa_inscripciones i WHERE i.id = inscripcion_id AND i.user_id = auth.uid())
  );

DROP POLICY IF EXISTS "programa_respuestas: editar las propias" ON programa_respuestas;
CREATE POLICY "programa_respuestas: editar las propias" ON programa_respuestas
  FOR UPDATE USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "programa_respuestas: borrar las propias" ON programa_respuestas;
CREATE POLICY "programa_respuestas: borrar las propias" ON programa_respuestas
  FOR DELETE USING (user_id = auth.uid());
