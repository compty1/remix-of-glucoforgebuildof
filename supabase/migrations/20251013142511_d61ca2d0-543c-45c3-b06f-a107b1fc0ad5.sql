-- Fix infinite recursion in user_roles RLS policy
-- This migration creates the has_role security definer function
-- and updates the RLS policy to use it instead of recursive query

-- Create the has_role security definer function
-- This allows checking roles without triggering RLS recursion
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role text)
RETURNS boolean
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

-- Drop the broken recursive policy
DROP POLICY IF EXISTS "Admins can manage all roles" ON public.user_roles;

-- Recreate the policy using the has_role function (no recursion)
CREATE POLICY "Admins can manage all roles"
ON public.user_roles
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));