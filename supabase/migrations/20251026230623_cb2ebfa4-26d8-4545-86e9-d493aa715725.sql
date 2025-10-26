-- TEMPORARY permissive policies to allow uploads without Supabase Auth (until admin auth is added)

CREATE POLICY "Temp anyone can insert banners"
  ON banner_settings
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Temp anyone can update banners"
  ON banner_settings
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Temp anyone can delete banners"
  ON banner_settings
  FOR DELETE
  USING (true);
