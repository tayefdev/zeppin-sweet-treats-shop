
-- Create a table for bakery items
CREATE TABLE public.bakery_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  description TEXT,
  image TEXT NOT NULL,
  category TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create a table for orders
CREATE TABLE public.orders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id TEXT NOT NULL UNIQUE,
  item_name TEXT NOT NULL,
  item_id UUID REFERENCES public.bakery_items(id),
  quantity INTEGER NOT NULL DEFAULT 1,
  total_amount DECIMAL(10,2) NOT NULL,
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  customer_address TEXT NOT NULL,
  special_notes TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security (RLS) for both tables
ALTER TABLE public.bakery_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Create policies for bakery_items (public read access, no auth required for viewing items)
CREATE POLICY "Anyone can view bakery items" 
  ON public.bakery_items 
  FOR SELECT 
  USING (true);

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

-- Create policies for orders (public access for creating orders, viewing for admin)
CREATE POLICY "Anyone can create orders" 
  ON public.orders 
  FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "Anyone can view orders" 
  ON public.orders 
  FOR SELECT 
  USING (true);

-- Insert default bakery items
INSERT INTO public.bakery_items (name, price, description, image, category) VALUES
('Strawberry Dream Cake', 25.99, 'Fluffy vanilla sponge layered with fresh strawberries and whipped cream', 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400&h=300&fit=crop&crop=center', 'Cakes'),
('Chocolate Chip Cookies', 12.99, 'Warm, gooey cookies packed with premium chocolate chips (dozen)', 'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=400&h=300&fit=crop&crop=center', 'Cookies'),
('Blueberry Muffins', 8.99, 'Fresh-baked muffins bursting with juicy blueberries (pack of 6)', 'https://images.unsplash.com/photo-1607958996333-41aef7caefaa?w=400&h=300&fit=crop&crop=center', 'Pastries'),
('Rainbow Cupcakes', 18.99, 'Colorful vanilla cupcakes with rainbow buttercream frosting (set of 12)', 'https://images.unsplash.com/photo-1614707267537-b85aaf00c4b7?w=400&h=300&fit=crop&crop=center', 'Cupcakes'),
('Apple Cinnamon Danish', 6.99, 'Flaky pastry filled with spiced apples and topped with glaze', 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&h=300&fit=crop&crop=center', 'Pastries'),
('Red Velvet Cake', 28.99, 'Rich red velvet layers with cream cheese frosting', 'https://images.unsplash.com/photo-1586985289688-ca3cf47d3e6e?w=400&h=300&fit=crop&crop=center', 'Cakes');
