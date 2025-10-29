-- Create signature_items table
CREATE TABLE public.signature_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  image TEXT NOT NULL,
  category TEXT NOT NULL,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.signature_items ENABLE ROW LEVEL SECURITY;

-- Allow anyone to view signature items
CREATE POLICY "Anyone can view signature items"
ON public.signature_items
FOR SELECT
USING (true);

-- Allow admins to manage signature items
CREATE POLICY "Admin can insert signature items"
ON public.signature_items
FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admin can update signature items"
ON public.signature_items
FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admin can delete signature items"
ON public.signature_items
FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Add trigger for updated_at
CREATE TRIGGER update_signature_items_updated_at
BEFORE UPDATE ON public.signature_items
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default signature items
INSERT INTO public.signature_items (title, image, category, display_order) VALUES
('Custom Cake', '/lovable-uploads/6f30b366-0e3c-498f-a5ab-c9b2a19bac7a.png', 'cakes', 1),
('Brownie Collections', '/lovable-uploads/7a8a873c-4e49-44ee-9063-a6667dc9c301.png', 'cookies', 2),
('Cupcake Collections', '/lovable-uploads/af402a3c-5fb9-4f2c-b8ed-d90572b9c444.png', 'cupcakes', 3);