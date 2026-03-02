
-- Fix audit trail INSERT policy to require user_id matches auth
DROP POLICY IF EXISTS "Insert only audit trail" ON public.audit_trail;
CREATE POLICY "Users insert own audit entries" ON public.audit_trail
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Fix service_role policies - these are intentional for backend-only access
-- The service_role INSERT on request_traces is correct (edge functions use service role)
-- No changes needed there.
