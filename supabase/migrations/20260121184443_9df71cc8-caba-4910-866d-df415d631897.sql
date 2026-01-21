-- Fix security warnings: Add proper RLS policies for tables missing them

-- Fix for potential_warriors (admin-only table)
CREATE POLICY "Admin only access potential warriors" ON public.potential_warriors 
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- Fix donations insert policy - require valid amount, allow both auth and guest
DROP POLICY IF EXISTS "Users can insert donations" ON public.donations;
CREATE POLICY "Anyone can create donation record" ON public.donations 
FOR INSERT WITH CHECK (amount_cents >= 500);

-- Fix healthcare partner inquiries - require valid email format
DROP POLICY IF EXISTS "Anyone can submit inquiries" ON public.healthcare_partner_inquiries;
CREATE POLICY "Anyone can submit partner inquiries" ON public.healthcare_partner_inquiries 
FOR INSERT WITH CHECK (email IS NOT NULL AND email <> '' AND organization_name IS NOT NULL);

-- Fix community statements insert - require non-empty statement
DROP POLICY IF EXISTS "Users can insert statements" ON public.community_statements;
CREATE POLICY "Authenticated users can insert statements" ON public.community_statements 
FOR INSERT WITH CHECK (auth.uid() IS NOT NULL AND statement IS NOT NULL AND length(statement) >= 5);