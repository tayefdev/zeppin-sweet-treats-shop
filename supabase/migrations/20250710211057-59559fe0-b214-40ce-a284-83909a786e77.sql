-- Create global_sales table for managing site-wide sales events
CREATE TABLE public.global_sales (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  discount_percentage NUMERIC(5,2) NOT NULL CHECK (discount_percentage > 0 AND discount_percentage <= 100),
  is_active BOOLEAN NOT NULL DEFAULT FALSE,
  start_date TIMESTAMP WITH TIME ZONE,
  end_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.global_sales ENABLE ROW LEVEL SECURITY;

-- Create policies for global sales management (admin access)
CREATE POLICY "Anyone can view global sales" 
ON public.global_sales 
FOR SELECT 
USING (true);

CREATE POLICY "Anyone can create global sales" 
ON public.global_sales 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Anyone can update global sales" 
ON public.global_sales 
FOR UPDATE 
USING (true);

CREATE POLICY "Anyone can delete global sales" 
ON public.global_sales 
FOR DELETE 
USING (true);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_global_sales_updated_at
BEFORE UPDATE ON public.global_sales
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Ensure only one active sale at a time
CREATE UNIQUE INDEX idx_global_sales_single_active 
ON public.global_sales (is_active) 
WHERE is_active = true;