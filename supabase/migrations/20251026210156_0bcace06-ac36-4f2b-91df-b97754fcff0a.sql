-- Add RLS policies for admin operations on bakery_items table
-- Note: These policies allow anyone to modify items. 
-- For production, you should implement proper authentication and restrict these operations to authenticated admins only.

CREATE POLICY "Anyone can insert bakery items" 
ON public.bakery_items 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Anyone can update bakery items" 
ON public.bakery_items 
FOR UPDATE 
USING (true);

CREATE POLICY "Anyone can delete bakery items" 
ON public.bakery_items 
FOR DELETE 
USING (true);

-- Add similar policies for global_sales table
CREATE POLICY "Anyone can insert global sales" 
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

-- Add policies for orders table (for admin to view and delete)
CREATE POLICY "Anyone can view orders" 
ON public.orders 
FOR SELECT 
USING (true);

CREATE POLICY "Anyone can delete orders" 
ON public.orders 
FOR DELETE 
USING (true);