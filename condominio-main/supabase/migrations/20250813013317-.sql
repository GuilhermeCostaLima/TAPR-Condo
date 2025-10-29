-- Fix security issue: Replace permissive RLS policies with proper restrictive policies
-- This ensures users can only see their own reservations and admins can see all

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their own reservations" ON public.reservations;
DROP POLICY IF EXISTS "Admins can view all reservations" ON public.reservations;

-- Create new restrictive policies that properly separate user and admin access
CREATE POLICY "Users can view only their own reservations" 
ON public.reservations 
FOR SELECT 
TO authenticated
USING (
  CASE 
    WHEN get_user_role(auth.uid()) = 'admin'::user_role THEN true
    ELSE auth.uid() = user_id
  END
);

-- Also fix the condominium_settings issue mentioned in the security scan
DROP POLICY IF EXISTS "Users can view public settings" ON public.condominium_settings;

CREATE POLICY "Only admins can view condominium settings" 
ON public.condominium_settings 
FOR SELECT 
TO authenticated
USING (get_user_role(auth.uid()) = 'admin'::user_role);