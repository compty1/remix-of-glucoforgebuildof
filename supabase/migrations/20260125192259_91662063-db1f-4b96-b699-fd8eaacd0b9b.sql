-- Add enhanced analysis columns to uploads table for clinical-grade CGM analysis

-- Confidence scoring
ALTER TABLE public.uploads
ADD COLUMN IF NOT EXISTS confidence_score integer DEFAULT 100,
ADD COLUMN IF NOT EXISTS confidence_band text DEFAULT 'unknown' CHECK (confidence_band IN ('high', 'moderate', 'low', 'unreliable', 'unknown')),
ADD COLUMN IF NOT EXISTS validation_flags jsonb DEFAULT '[]'::jsonb;

-- Data quality metrics
ALTER TABLE public.uploads
ADD COLUMN IF NOT EXISTS wear_time_percent numeric,
ADD COLUMN IF NOT EXISTS gap_analysis jsonb DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS data_quality jsonb DEFAULT '{}'::jsonb;

-- Device metadata
ALTER TABLE public.uploads
ADD COLUMN IF NOT EXISTS device_metadata jsonb DEFAULT '{}'::jsonb;

-- Novel signals (missed-bolus, meal-timing, sensor drift, etc.)
ALTER TABLE public.uploads
ADD COLUMN IF NOT EXISTS novel_signals jsonb DEFAULT '{}'::jsonb;

-- Insulin and meal event tracking
ALTER TABLE public.uploads
ADD COLUMN IF NOT EXISTS insulin_events jsonb DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS meal_events jsonb DEFAULT '[]'::jsonb;

-- Day/night breakdown
ALTER TABLE public.uploads
ADD COLUMN IF NOT EXISTS day_night_analysis jsonb DEFAULT '{}'::jsonb;

-- Add index for faster confidence-based queries
CREATE INDEX IF NOT EXISTS idx_uploads_confidence_score ON public.uploads(confidence_score) WHERE status = 'completed';
CREATE INDEX IF NOT EXISTS idx_uploads_confidence_band ON public.uploads(confidence_band) WHERE status = 'completed';

-- Add comments for documentation
COMMENT ON COLUMN public.uploads.confidence_score IS 'Data quality confidence score (0-100)';
COMMENT ON COLUMN public.uploads.confidence_band IS 'Confidence interpretation: high (>=85), moderate (60-84), low (30-59), unreliable (<30)';
COMMENT ON COLUMN public.uploads.validation_flags IS 'Array of triggered validation rules with id, severity, penalty, message';
COMMENT ON COLUMN public.uploads.wear_time_percent IS 'Percentage of CGM active time over analysis period';
COMMENT ON COLUMN public.uploads.gap_analysis IS 'Array of detected gaps with start, end, duration, type';
COMMENT ON COLUMN public.uploads.data_quality IS 'Comprehensive data quality metrics including sampling interval, coverage, etc.';
COMMENT ON COLUMN public.uploads.device_metadata IS 'Device type, firmware version, sensor info, upload source';
COMMENT ON COLUMN public.uploads.novel_signals IS 'Advanced signals: missed-bolus events, meal-timing score, sensor drift, auto-mode metrics';
COMMENT ON COLUMN public.uploads.insulin_events IS 'Parsed insulin delivery events (bolus, basal, temp basal)';
COMMENT ON COLUMN public.uploads.meal_events IS 'Parsed meal/carb events';
COMMENT ON COLUMN public.uploads.day_night_analysis IS 'Day vs night breakdown of key metrics';