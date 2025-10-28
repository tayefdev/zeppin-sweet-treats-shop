-- Create storage bucket for logo
INSERT INTO storage.buckets (id, name, public) 
VALUES ('logo', 'logo', true);

-- Create RLS policies for logo bucket
CREATE POLICY "Anyone can view logo"
ON storage.objects FOR SELECT
USING (bucket_id = 'logo');

CREATE POLICY "Admin can upload logo"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'logo' AND has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admin can update logo"
ON storage.objects FOR UPDATE
USING (bucket_id = 'logo' AND has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admin can delete logo"
ON storage.objects FOR DELETE
USING (bucket_id = 'logo' AND has_role(auth.uid(), 'admin'::app_role));

-- Create site_settings table
CREATE TABLE public.site_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  key TEXT NOT NULL UNIQUE,
  value TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

-- RLS policies for site_settings
CREATE POLICY "Anyone can view site settings"
ON public.site_settings FOR SELECT
USING (true);

CREATE POLICY "Admin can manage site settings"
ON public.site_settings FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Create trigger for updated_at
CREATE TRIGGER update_site_settings_updated_at
BEFORE UPDATE ON public.site_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();