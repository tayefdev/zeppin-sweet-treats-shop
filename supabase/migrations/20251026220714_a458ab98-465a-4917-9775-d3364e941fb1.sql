-- Create role enum
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

-- Create user_roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE (user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- RLS policy for user_roles table
CREATE POLICY "Users can view their own roles"
ON public.user_roles FOR SELECT
TO authenticated
USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage all roles"
ON public.user_roles FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Drop permissive policies on bakery_items
DROP POLICY IF EXISTS "Anyone can delete bakery items" ON public.bakery_items;
DROP POLICY IF EXISTS "Anyone can insert bakery items" ON public.bakery_items;
DROP POLICY IF EXISTS "Anyone can update bakery items" ON public.bakery_items;

-- Create admin-only policies for bakery_items
CREATE POLICY "Admin can insert bakery items"
ON public.bakery_items FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admin can update bakery items"
ON public.bakery_items FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admin can delete bakery items"
ON public.bakery_items FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Drop permissive policies on banner_settings
DROP POLICY IF EXISTS "Anyone can delete banners" ON public.banner_settings;
DROP POLICY IF EXISTS "Anyone can insert banners" ON public.banner_settings;
DROP POLICY IF EXISTS "Anyone can update banners" ON public.banner_settings;

-- Create admin-only policies for banner_settings
CREATE POLICY "Admin can manage banners"
ON public.banner_settings FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Drop permissive policies on global_sales
DROP POLICY IF EXISTS "Anyone can delete global sales" ON public.global_sales;
DROP POLICY IF EXISTS "Anyone can insert global sales" ON public.global_sales;
DROP POLICY IF EXISTS "Anyone can update global sales" ON public.global_sales;

-- Create admin-only policies for global_sales
CREATE POLICY "Admin can insert global sales"
ON public.global_sales FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admin can update global sales"
ON public.global_sales FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admin can delete global sales"
ON public.global_sales FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Drop public SELECT policy on orders
DROP POLICY IF EXISTS "Anyone can view orders" ON public.orders;

-- Create admin-only SELECT policy for orders
CREATE POLICY "Admin can view all orders"
ON public.orders FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Drop ALL existing storage policies first
DROP POLICY IF EXISTS "Anyone can upload banners" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can update banners" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can delete banners" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can upload bakery items" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can update bakery items storage" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can delete bakery items" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view banner images" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view bakery item images" ON storage.objects;
DROP POLICY IF EXISTS "Public can view banner images" ON storage.objects;
DROP POLICY IF EXISTS "Public can view bakery item images" ON storage.objects;

-- Create admin-only policies for storage
CREATE POLICY "Admin can manage banners storage"
ON storage.objects FOR ALL
TO authenticated
USING (bucket_id = 'banners' AND public.has_role(auth.uid(), 'admin'))
WITH CHECK (bucket_id = 'banners' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admin can manage bakery items storage"
ON storage.objects FOR ALL
TO authenticated
USING (bucket_id = 'bakery-items' AND public.has_role(auth.uid(), 'admin'))
WITH CHECK (bucket_id = 'bakery-items' AND public.has_role(auth.uid(), 'admin'));

-- Keep public SELECT policies for viewing
CREATE POLICY "Public can view banners"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'banners');

CREATE POLICY "Public can view bakery items"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'bakery-items');