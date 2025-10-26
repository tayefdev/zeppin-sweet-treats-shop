-- Create storage policies for banners bucket
CREATE POLICY "Anyone can upload banners"
ON storage.objects
FOR INSERT
TO public
WITH CHECK (bucket_id = 'banners');

CREATE POLICY "Anyone can view banners"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'banners');

CREATE POLICY "Anyone can update banners"
ON storage.objects
FOR UPDATE
TO public
USING (bucket_id = 'banners');

CREATE POLICY "Anyone can delete banners"
ON storage.objects
FOR DELETE
TO public
USING (bucket_id = 'banners');