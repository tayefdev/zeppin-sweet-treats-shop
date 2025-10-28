DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'global_sales' AND policyname = 'Admin can view all global sales'
  ) THEN
    CREATE POLICY "Admin can view all global sales"
    ON public.global_sales
    FOR SELECT
    USING (public.has_role(auth.uid(), 'admin'::public.app_role));
  END IF;
END
$$;