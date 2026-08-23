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
