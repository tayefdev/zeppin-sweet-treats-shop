-- Add policy to allow anyone to delete orders
CREATE POLICY "Anyone can delete orders" 
ON public.orders 
FOR DELETE 
USING (true);