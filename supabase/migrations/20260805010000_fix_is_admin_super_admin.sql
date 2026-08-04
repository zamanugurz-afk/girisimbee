-- Fix is_admin() to include super_admin (required for admin panel mutations under RLS).
-- Apply in Supabase SQL Editor if not yet pushed.

CREATE OR REPLACE FUNCTION public.is_admin(uid UUID DEFAULT auth.uid())
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE id = uid
      AND role IN ('admin', 'super_admin')
  );
$$;
