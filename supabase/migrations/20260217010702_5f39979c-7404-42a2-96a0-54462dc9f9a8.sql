-- Issue 9: Add unique constraint on drug_pricing_data.ndc_code so upserts work
ALTER TABLE public.drug_pricing_data ADD CONSTRAINT drug_pricing_data_ndc_code_key UNIQUE (ndc_code);

-- Also add unique constraint on medicare_coverage_data.device_name for the same reason
ALTER TABLE public.medicare_coverage_data ADD CONSTRAINT medicare_coverage_data_device_name_key UNIQUE (device_name);