-- Email subscriptions for weekly digest
CREATE TABLE public.email_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  email TEXT NOT NULL,
  subscription_type TEXT NOT NULL DEFAULT 'weekly_digest',
  is_active BOOLEAN DEFAULT true,
  preferences JSONB DEFAULT '{"include_trials": true, "include_papers": true, "min_impact": "medium"}'::jsonb,
  last_sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  unsubscribe_token TEXT UNIQUE DEFAULT encode(gen_random_bytes(32), 'hex'),
  UNIQUE(user_id, subscription_type)
);

-- Enable RLS
ALTER TABLE public.email_subscriptions ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can view their own subscriptions"
  ON public.email_subscriptions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own subscriptions"
  ON public.email_subscriptions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own subscriptions"
  ON public.email_subscriptions FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own subscriptions"
  ON public.email_subscriptions FOR DELETE
  USING (auth.uid() = user_id);

-- Email digest logs for tracking
CREATE TABLE public.email_digest_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sent_at TIMESTAMPTZ DEFAULT now(),
  recipient_count INTEGER DEFAULT 0,
  papers_included INTEGER DEFAULT 0,
  status TEXT DEFAULT 'sent',
  error_message TEXT
);

-- Enable RLS (admin only access)
ALTER TABLE public.email_digest_logs ENABLE ROW LEVEL SECURITY;

-- Citation relationships for network visualization
CREATE TABLE public.paper_citations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  citing_paper_id UUID REFERENCES public.medical_research_papers(id) ON DELETE CASCADE,
  cited_paper_id UUID REFERENCES public.medical_research_papers(id) ON DELETE CASCADE,
  is_influential BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(citing_paper_id, cited_paper_id)
);

-- Enable RLS
ALTER TABLE public.paper_citations ENABLE ROW LEVEL SECURITY;

-- Public read access for citations (for visualization)
CREATE POLICY "Anyone can view citations"
  ON public.paper_citations FOR SELECT
  USING (true);

-- Create indexes for performance
CREATE INDEX idx_email_subscriptions_user_id ON public.email_subscriptions(user_id);
CREATE INDEX idx_email_subscriptions_active ON public.email_subscriptions(is_active) WHERE is_active = true;
CREATE INDEX idx_paper_citations_citing ON public.paper_citations(citing_paper_id);
CREATE INDEX idx_paper_citations_cited ON public.paper_citations(cited_paper_id);
CREATE INDEX idx_paper_citations_influential ON public.paper_citations(is_influential) WHERE is_influential = true;