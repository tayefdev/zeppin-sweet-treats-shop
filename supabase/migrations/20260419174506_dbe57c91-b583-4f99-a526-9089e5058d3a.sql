-- Fix 1: Lock down user_roles to prevent privilege escalation
DROP POLICY IF EXISTS "Admins can manage all roles" ON public.user_roles;

CREATE POLICY "Admins can insert roles"
ON public.user_roles
AS PERMISSIVE
FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update roles"
ON public.user_roles
AS PERMISSIVE
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete roles"
ON public.user_roles
AS PERMISSIVE
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));

-- Restrictive policy: explicitly blocks any non-admin write attempts
CREATE POLICY "Block non-admin writes to user_roles"
ON public.user_roles
AS RESTRICTIVE
FOR ALL
TO authenticated, anon
USING (public.has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

-- Fix 2: Remove temporary public write policies on banner_settings
DROP POLICY IF EXISTS "Temp anyone can insert banners" ON public.banner_settings;
DROP POLICY IF EXISTS "Temp anyone can update banners" ON public.banner_settings;
DROP POLICY IF EXISTS "Temp anyone can delete banners" ON public.banner_settings;