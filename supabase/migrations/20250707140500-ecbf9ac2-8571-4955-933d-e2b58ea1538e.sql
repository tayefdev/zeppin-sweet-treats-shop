
-- Add sale-related columns to the bakery_items table
ALTER TABLE public.bakery_items 
ADD COLUMN is_on_sale BOOLEAN DEFAULT FALSE,
ADD COLUMN sale_percentage NUMERIC(5,2) DEFAULT NULL;

-- Add a check constraint to ensure sale percentage is between 1 and 99
ALTER TABLE public.bakery_items 
ADD CONSTRAINT sale_percentage_range 
CHECK (sale_percentage IS NULL OR (sale_percentage > 0 AND sale_percentage < 100));
