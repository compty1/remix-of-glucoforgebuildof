-- Create manufacturer support resources table
CREATE TABLE public.manufacturer_support_resources (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  manufacturer text NOT NULL,
  resource_type text NOT NULL,
  title text NOT NULL,
  url text,
  phone_number text,
  description text,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.manufacturer_support_resources ENABLE ROW LEVEL SECURITY;

-- Allow public read access (support resources are public info)
CREATE POLICY "Anyone can read support resources"
  ON public.manufacturer_support_resources
  FOR SELECT
  USING (true);

-- Create index for faster lookups
CREATE INDEX idx_manufacturer_support_manufacturer ON public.manufacturer_support_resources(manufacturer);

-- Insert seed data for manufacturer support resources
INSERT INTO public.manufacturer_support_resources (manufacturer, resource_type, title, url, phone_number, description) VALUES
-- Dexcom
('Dexcom', 'replacement', 'Request Replacement Sensor/Transmitter', 'https://www.dexcom.com/contact', '1-888-738-3646', 'Submit a replacement request for defective sensors or transmitters'),
('Dexcom', 'support', 'Technical Support', 'https://www.dexcom.com/contact/technical-support', '1-888-738-3646', '24/7 technical support for Dexcom devices'),
('Dexcom', 'warranty', 'Warranty Information', 'https://www.dexcom.com/warranty', NULL, 'Check warranty status and coverage details'),
('Dexcom', 'faq', 'FAQ & Troubleshooting', 'https://www.dexcom.com/faq', NULL, 'Common questions and troubleshooting guides'),
('Dexcom', 'adverse_report', 'Report Adverse Event', 'https://www.fda.gov/safety/medwatch-fda-safety-information-and-adverse-event-reporting-program', NULL, 'Report serious adverse events to FDA MedWatch'),

-- Abbott (Freestyle)
('Abbott', 'replacement', 'Libre Sensor Replacement', 'https://www.freestyle.abbott/us-en/support/request-replacement.html', '1-855-632-8658', 'Request a replacement for defective Libre sensors'),
('Abbott', 'support', 'FreeStyle Customer Service', 'https://www.freestyle.abbott/us-en/support', '1-855-632-8658', 'Customer support for Freestyle Libre products'),
('Abbott', 'warranty', 'Libre Reader Warranty', 'https://www.freestyle.abbott/us-en/support/warranty.html', NULL, 'Reader warranty and coverage information'),
('Abbott', 'faq', 'Help & Support', 'https://www.freestyle.abbott/us-en/support/faq.html', NULL, 'Frequently asked questions and guides'),

-- Insulet (Omnipod)
('Insulet', 'replacement', 'Pod Replacement Request', 'https://www.omnipod.com/podder-support/pod-replacement', '1-800-591-3455', 'Request replacement for failed Omnipod pods'),
('Insulet', 'support', 'Podder Support', 'https://www.omnipod.com/podder-support', '1-800-591-3455', '24/7 customer support for Omnipod users'),
('Insulet', 'warranty', 'PDM Warranty', 'https://www.omnipod.com/podder-support/warranty', NULL, 'Personal Diabetes Manager warranty information'),
('Insulet', 'faq', 'FAQs', 'https://www.omnipod.com/podder-support/faqs', NULL, 'Common questions about Omnipod 5'),

-- Tandem
('Tandem', 'replacement', 'Device Replacement', 'https://www.tandemdiabetes.com/support/replacement', '1-877-801-6901', 'Request replacement for pump or supplies'),
('Tandem', 'support', 'Customer Support', 'https://www.tandemdiabetes.com/support', '1-877-801-6901', '24/7 technical support for t:slim pumps'),
('Tandem', 'warranty', 'Pump Warranty', 'https://www.tandemdiabetes.com/support/warranty', NULL, '4-year pump warranty information'),
('Tandem', 'faq', 'Support Resources', 'https://www.tandemdiabetes.com/support/resources', NULL, 'Training videos, guides, and FAQs'),

-- Medtronic
('Medtronic', 'replacement', 'Device Exchange Program', 'https://www.medtronicdiabetes.com/support/replacement', '1-800-646-4633', 'Request replacement for defective pumps or sensors'),
('Medtronic', 'support', 'Technical Support', 'https://www.medtronicdiabetes.com/support', '1-800-646-4633', '24/7 helpline for Medtronic devices'),
('Medtronic', 'warranty', 'Warranty Coverage', 'https://www.medtronicdiabetes.com/support/warranty', NULL, 'Pump and CGM warranty details'),
('Medtronic', 'faq', 'Help Center', 'https://www.medtronicdiabetes.com/support/help-center', NULL, 'FAQs, videos, and troubleshooting');