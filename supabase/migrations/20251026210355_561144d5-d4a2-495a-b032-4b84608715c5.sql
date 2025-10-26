-- Create storage bucket for bakery item images
INSERT INTO storage.buckets (id, name, public)
VALUES ('bakery-items', 'bakery-items', true);

-- Allow anyone to view images in the bucket (public bucket)
CREATE POLICY "Anyone can view bakery item images"
ON storage.objects
FOR SELECT
USING (bucket_id = 'bakery-items');

-- Allow anyone to upload images
CREATE POLICY "Anyone can upload bakery item images"
ON storage.objects
FOR INSERT
WITH CHECK (bucket_id = 'bakery-items');

-- Allow anyone to update images
CREATE POLICY "Anyone can update bakery item images"
ON storage.objects
FOR UPDATE
USING (bucket_id = 'bakery-items');

-- Allow anyone to delete images
CREATE POLICY "Anyone can delete bakery item images"
ON storage.objects
FOR DELETE
USING (bucket_id = 'bakery-items');