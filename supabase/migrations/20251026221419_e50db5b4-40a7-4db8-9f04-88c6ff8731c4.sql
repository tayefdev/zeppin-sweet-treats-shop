-- Drop the dangerous public delete policy on orders table
DROP POLICY IF EXISTS "Anyone can delete orders" ON public.orders;

-- Create admin-only delete policy for orders
CREATE POLICY "Admin can delete orders"
  ON public.orders
  FOR DELETE
  USING (has_role(auth.uid(), 'admin'::app_role));