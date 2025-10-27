-- Fix the orders RLS policy to be permissive instead of restrictive
-- The existing policy is restrictive which blocks inserts even with true condition

-- Drop the existing restrictive policy
DROP POLICY IF EXISTS "Anyone can create orders" ON public.orders;

-- Recreate as a permissive policy
CREATE POLICY "Anyone can create orders"
ON public.orders
AS PERMISSIVE
FOR INSERT
TO public
WITH CHECK (true);