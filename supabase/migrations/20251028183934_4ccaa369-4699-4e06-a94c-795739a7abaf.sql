-- Insert admin role for the current user
INSERT INTO public.user_roles (user_id, role) 
VALUES ('c844292e-1155-4397-9dba-9f1c8c6472c1', 'admin'::app_role)
ON CONFLICT (user_id, role) DO NOTHING;