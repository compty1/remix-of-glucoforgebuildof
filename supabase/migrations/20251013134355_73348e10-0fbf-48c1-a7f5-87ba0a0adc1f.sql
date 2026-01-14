-- Fix SECURITY DEFINER functions to include fixed search_path
-- This prevents search_path manipulation attacks

-- Fix is_admin function
CREATE OR REPLACE FUNCTION public.is_admin(user_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_roles.user_id = $1 AND role = 'admin'
  );
$$;

-- Fix add_admin_by_email function
CREATE OR REPLACE FUNCTION public.add_admin_by_email(user_email text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    target_user_id uuid;
BEGIN
    -- Get the user_id from auth.users (this requires SECURITY DEFINER)
    SELECT id INTO target_user_id 
    FROM auth.users 
    WHERE email = user_email;
    
    -- If user exists, insert admin role
    IF target_user_id IS NOT NULL THEN
        INSERT INTO public.user_roles (user_id, role)
        VALUES (target_user_id, 'admin'::app_role)
        ON CONFLICT (user_id, role) DO NOTHING;
    END IF;
END;
$$;

-- Fix update_discovery_cards_search_vector function
CREATE OR REPLACE FUNCTION public.update_discovery_cards_search_vector()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.search_vector := to_tsvector('english', 
    COALESCE(NEW.title, '') || ' ' || 
    COALESCE(NEW.snippet, '') || ' ' || 
    COALESCE(NEW.mechanism, '')
  );
  RETURN NEW;
END;
$$;