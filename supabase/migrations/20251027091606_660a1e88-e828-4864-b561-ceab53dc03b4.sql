-- Ensure public (anon, authenticated) can insert orders, and avoid SELECT requirement
DROP POLICY IF EXISTS "Anon can create orders" ON public.orders;
DROP POLICY IF EXISTS "Authenticated can create orders" ON public.orders;
DROP POLICY IF EXISTS "Anyone can create orders" ON public.orders;

CREATE POLICY "Anon can create orders"
ON public.orders
AS PERMISSIVE
FOR INSERT
TO anon
WITH CHECK (true);

CREATE POLICY "Authenticated can create orders"
ON public.orders
AS PERMISSIVE
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Optional but safe grants (idempotent)
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT INSERT ON TABLE public.orders TO anon, authenticated;