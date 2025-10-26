-- Temporary storage policies to allow admin uploads without Supabase Auth
-- NOTE: These are permissive and should be tightened once admin auth is added.

-- Allow public read (usually already implied for public buckets, but making explicit)
CREATE POLICY "banners_read_public_20251026"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'banners');

-- Allow anonymous and authenticated clients to upload into the 'banners' bucket
CREATE POLICY "banners_insert_anon_20251026"
ON storage.objects FOR INSERT
TO anon, authenticated
WITH CHECK (bucket_id = 'banners');

-- Allow anonymous and authenticated clients to update objects in the 'banners' bucket
CREATE POLICY "banners_update_anon_20251026"
ON storage.objects FOR UPDATE
TO anon, authenticated
USING (bucket_id = 'banners')
WITH CHECK (bucket_id = 'banners');

-- Allow anonymous and authenticated clients to delete objects in the 'banners' bucket
CREATE POLICY "banners_delete_anon_20251026"
ON storage.objects FOR DELETE
TO anon, authenticated
USING (bucket_id = 'banners');
