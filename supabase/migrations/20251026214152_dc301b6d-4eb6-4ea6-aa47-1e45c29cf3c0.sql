-- Create banner_settings table for managing top banner content
CREATE TABLE public.banner_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  banner_type TEXT NOT NULL CHECK (banner_type IN ('image', 'video')),
  banner_url TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.banner_settings ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Anyone can view active banners"
ON public.banner_settings
FOR SELECT
USING (is_active = true);

CREATE POLICY "Anyone can insert banners"
ON public.banner_settings
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Anyone can update banners"
ON public.banner_settings
FOR UPDATE
USING (true);

CREATE POLICY "Anyone can delete banners"
ON public.banner_settings
FOR DELETE
USING (true);

-- Create trigger for updated_at
CREATE TRIGGER update_banner_settings_updated_at
BEFORE UPDATE ON public.banner_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create storage bucket for banner files
INSERT INTO storage.buckets (id, name, public)
VALUES ('banners', 'banners', true)
ON CONFLICT (id) DO NOTHING;