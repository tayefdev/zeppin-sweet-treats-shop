-- Drop existing policies first
DROP POLICY IF EXISTS "Anyone can view active banners" ON banner_settings;
DROP POLICY IF EXISTS "Admin can manage banners" ON banner_settings;

-- Now we can drop the is_active column
ALTER TABLE banner_settings
DROP COLUMN IF EXISTS is_active;

-- Add display_order column for ordering
ALTER TABLE banner_settings
ADD COLUMN IF NOT EXISTS display_order integer DEFAULT 0;

-- Update existing banners with sequential order
UPDATE banner_settings
SET display_order = (
  SELECT COUNT(*) 
  FROM banner_settings b2 
  WHERE b2.created_at <= banner_settings.created_at
);

-- Add index for better performance
CREATE INDEX IF NOT EXISTS idx_banner_display_order ON banner_settings(display_order);

-- Create new RLS policies
CREATE POLICY "Anyone can view all banners"
  ON banner_settings
  FOR SELECT
  USING (true);

CREATE POLICY "Admin can manage all banners"
  ON banner_settings
  FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));