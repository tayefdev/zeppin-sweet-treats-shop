-- Grant admin role to existing user
INSERT INTO public.user_roles (user_id, role) 
VALUES ('f1260fce-ca3b-4580-b849-c75e0439dab9', 'admin')
ON CONFLICT (user_id, role) DO NOTHING;