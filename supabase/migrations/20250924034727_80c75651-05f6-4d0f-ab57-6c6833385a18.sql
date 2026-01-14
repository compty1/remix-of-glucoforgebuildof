-- Fix security linter warnings
-- Fix 1: Set search_path for functions that don't have it set
CREATE OR REPLACE FUNCTION public.update_trends()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    keyword_record RECORD;
    mention_count INTEGER;
BEGIN
    FOR keyword_record IN SELECT unnest(ARRAY['adhesive', 'compression low', 'sensor failure', 'pre-bolus', 'brain fog']) AS keyword
    LOOP
        SELECT COUNT(*) INTO mention_count
        FROM public.community_posts
        WHERE (post_json->'data'->>'title' ILIKE '%' || keyword_record.keyword || '%' OR post_json->'data'->>'selftext' ILIKE '%' || keyword_record.keyword || '%')
        AND cached_at >= NOW() - INTERVAL '30 days';
        
        INSERT INTO public.trend_analysis_metrics (issue_title, thirty_day_count, updated_at)
        VALUES (keyword_record.keyword, mention_count, NOW())
        ON CONFLICT (issue_title) DO UPDATE SET thirty_day_count = EXCLUDED.thirty_day_count, updated_at = NOW();
    END LOOP;
END;
$$;

-- Fix 2: Update the update_discovery_cards_search_vector function to have SET search_path
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