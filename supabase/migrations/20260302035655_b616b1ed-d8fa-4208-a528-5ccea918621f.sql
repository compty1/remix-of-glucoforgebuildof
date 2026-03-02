
-- Domain 5.1: Provider patient links (without app_role modification)
CREATE TABLE public.provider_patient_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id UUID NOT NULL,
  patient_id UUID NOT NULL,
  consent_status TEXT NOT NULL DEFAULT 'pending' CHECK (consent_status IN ('pending','consented','revoked')),
  linked_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (provider_id, patient_id)
);

ALTER TABLE public.provider_patient_links ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Providers see consented links" ON public.provider_patient_links
  FOR SELECT TO authenticated
  USING (provider_id = auth.uid() OR patient_id = auth.uid());

CREATE POLICY "Providers create links" ON public.provider_patient_links
  FOR INSERT TO authenticated
  WITH CHECK (provider_id = auth.uid());

CREATE POLICY "Patients update consent" ON public.provider_patient_links
  FOR UPDATE TO authenticated
  USING (patient_id = auth.uid());

-- Domain 5.3: Clinic Tenants
CREATE TABLE public.clinic_tenants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  clinic_name TEXT NOT NULL,
  logo_url TEXT,
  primary_color TEXT DEFAULT '#3b82f6',
  secondary_color TEXT DEFAULT '#1e40af',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.clinic_tenants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Tenants publicly readable" ON public.clinic_tenants
  FOR SELECT USING (true);

CREATE POLICY "Admins manage tenants" ON public.clinic_tenants
  FOR ALL TO authenticated
  USING (public.is_admin(auth.uid()));

-- Domain 5.4: Data License Consents
CREATE TABLE public.data_license_consents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  consented_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  revoked_at TIMESTAMPTZ,
  license_tier TEXT NOT NULL DEFAULT 'basic',
  anonymization_level TEXT NOT NULL DEFAULT 'full',
  glucose_data BOOLEAN DEFAULT false,
  device_data BOOLEAN DEFAULT false,
  demographics BOOLEAN DEFAULT false
);

ALTER TABLE public.data_license_consents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own consents" ON public.data_license_consents
  FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Domain 5.5: User Subscriptions
CREATE TYPE public.subscription_tier AS ENUM ('free', 'premium', 'provider');

CREATE TABLE public.user_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  tier subscription_tier NOT NULL DEFAULT 'free',
  stripe_subscription_id TEXT,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.user_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users read own subscription" ON public.user_subscriptions
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Service role manages subscriptions" ON public.user_subscriptions
  FOR ALL TO service_role USING (true);

-- Domain 6.1: Audit Trail (FDA 21 CFR Part 11)
CREATE TYPE public.audit_action AS ENUM ('INSERT', 'UPDATE', 'DELETE');

CREATE TABLE public.audit_trail (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  table_name TEXT NOT NULL,
  record_id TEXT NOT NULL,
  action audit_action NOT NULL,
  old_value JSONB,
  new_value JSONB,
  reason TEXT,
  ip_address TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.audit_trail ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Insert only audit trail" ON public.audit_trail
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Admins read audit trail" ON public.audit_trail
  FOR SELECT TO authenticated
  USING (public.is_admin(auth.uid()));

-- Domain 6.4: Request Traces
CREATE TABLE public.request_traces (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trace_id TEXT NOT NULL,
  user_id UUID,
  function_name TEXT NOT NULL,
  duration_ms INTEGER,
  status_code INTEGER,
  error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.request_traces ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins read traces" ON public.request_traces
  FOR SELECT TO authenticated
  USING (public.is_admin(auth.uid()));

CREATE POLICY "Service role inserts traces" ON public.request_traces
  FOR INSERT TO service_role WITH CHECK (true);

-- Domain 6.5: Feature Flags (dedicated table)
CREATE TABLE public.feature_flags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  flag_name TEXT NOT NULL UNIQUE,
  enabled BOOLEAN NOT NULL DEFAULT false,
  rollout_percentage INTEGER DEFAULT 100 CHECK (rollout_percentage >= 0 AND rollout_percentage <= 100),
  target_roles TEXT[] DEFAULT '{}',
  target_tiers TEXT[] DEFAULT '{}',
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.feature_flags ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Feature flags readable by authenticated" ON public.feature_flags
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins manage feature flags" ON public.feature_flags
  FOR ALL TO authenticated
  USING (public.is_admin(auth.uid()));
