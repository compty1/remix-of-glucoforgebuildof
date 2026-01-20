-- Add new columns to devices table for comprehensive device information
ALTER TABLE public.devices
ADD COLUMN IF NOT EXISTS device_type TEXT,
ADD COLUMN IF NOT EXISTS price_range TEXT,
ADD COLUMN IF NOT EXISTS availability TEXT DEFAULT 'Available',
ADD COLUMN IF NOT EXISTS fda_status TEXT DEFAULT 'FDA Cleared',
ADD COLUMN IF NOT EXISTS specifications JSONB DEFAULT '{}';

-- Add new columns to cure_therapies table for detailed therapy information
ALTER TABLE public.cure_therapies
ADD COLUMN IF NOT EXISTS approach_type TEXT,
ADD COLUMN IF NOT EXISTS mechanism TEXT,
ADD COLUMN IF NOT EXISTS advantages TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS risks TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS current_status_text TEXT,
ADD COLUMN IF NOT EXISTS estimated_availability_text TEXT,
ADD COLUMN IF NOT EXISTS life_after_treatment TEXT,
ADD COLUMN IF NOT EXISTS requirements TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS clinical_trial_ids TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT FALSE;

-- Add comments for documentation
COMMENT ON COLUMN public.devices.device_type IS 'Device category type: Insulin Pump, CGM, Glucose Meter, etc.';
COMMENT ON COLUMN public.devices.price_range IS 'Price range with insurance context, e.g., $400-500/month (without insurance)';
COMMENT ON COLUMN public.devices.availability IS 'Availability status: Widely Available, Limited, Prescription Only';
COMMENT ON COLUMN public.devices.fda_status IS 'FDA approval status: FDA Approved, FDA Cleared, Pending';
COMMENT ON COLUMN public.devices.specifications IS 'JSONB of device-specific specs like bolus, reservoir, basal_rates for pumps';

COMMENT ON COLUMN public.cure_therapies.approach_type IS 'Type of cure approach: Stem Cell Replacement, Immunotherapy, Gene Editing, etc.';
COMMENT ON COLUMN public.cure_therapies.mechanism IS 'Detailed mechanism of action description';
COMMENT ON COLUMN public.cure_therapies.advantages IS 'Array of therapy advantages/benefits';
COMMENT ON COLUMN public.cure_therapies.risks IS 'Array of risks and considerations';
COMMENT ON COLUMN public.cure_therapies.current_status_text IS 'Narrative description of current trial/development status';
COMMENT ON COLUMN public.cure_therapies.estimated_availability_text IS 'Human-readable availability timeline';
COMMENT ON COLUMN public.cure_therapies.life_after_treatment IS 'Description of post-treatment life and ongoing needs';
COMMENT ON COLUMN public.cure_therapies.requirements IS 'Array of ongoing requirements after treatment';
COMMENT ON COLUMN public.cure_therapies.clinical_trial_ids IS 'Array of NCT IDs for associated clinical trials';
COMMENT ON COLUMN public.cure_therapies.is_featured IS 'Whether to highlight this therapy as featured';