/*
# Create certificate-images storage bucket

1. Storage
- Create a PUBLIC bucket `certificate-images` for intern photos and certificate image previews.
- Public read so the public verification page can display photos without auth.
- Authenticated write so only signed-in admins can upload.

2. Security — storage.objects policies
- SELECT (read): TO anon, authenticated — anyone can view certificate images (public verification).
- INSERT: TO authenticated — only signed-in admins upload.
- UPDATE: TO authenticated — only signed-in admins replace.
- DELETE: TO authenticated — only signed-in admins remove.

3. Notes
- The bucket is public (public = true) so getPublicUrl returns a reachable URL.
- Upload paths are namespaced under `intern-photos/` and `certificates/` for organization.
*/

INSERT INTO storage.buckets (id, name, public)
VALUES ('certificate-images', 'certificate-images', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "public_read_certificate_images" ON storage.objects;
CREATE POLICY "public_read_certificate_images"
ON storage.objects FOR SELECT
TO anon, authenticated USING (bucket_id = 'certificate-images');

DROP POLICY IF EXISTS "admin_insert_certificate_images" ON storage.objects;
CREATE POLICY "admin_insert_certificate_images"
ON storage.objects FOR INSERT
TO authenticated WITH CHECK (bucket_id = 'certificate-images');

DROP POLICY IF EXISTS "admin_update_certificate_images" ON storage.objects;
CREATE POLICY "admin_update_certificate_images"
ON storage.objects FOR UPDATE
TO authenticated USING (bucket_id = 'certificate-images') WITH CHECK (bucket_id = 'certificate-images');

DROP POLICY IF EXISTS "admin_delete_certificate_images" ON storage.objects;
CREATE POLICY "admin_delete_certificate_images"
ON storage.objects FOR DELETE
TO authenticated USING (bucket_id = 'certificate-images');
