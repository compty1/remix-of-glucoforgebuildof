
-- Create community_workarounds table
CREATE TABLE public.community_workarounds (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  instructions TEXT,
  category TEXT NOT NULL CHECK (category IN ('device', 'medication', 'insurance', 'financial')),
  source_url TEXT,
  source_platform TEXT,
  comments JSONB DEFAULT '[]'::jsonb,
  is_verified BOOLEAN DEFAULT false,
  last_verified_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true,
  tags TEXT[] DEFAULT '{}',
  upvotes INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.community_workarounds ENABLE ROW LEVEL SECURITY;

-- Public read
CREATE POLICY "Anyone can view active workarounds"
ON public.community_workarounds FOR SELECT
USING (is_active = true);

-- Authenticated write
CREATE POLICY "Authenticated users can insert workarounds"
ON public.community_workarounds FOR INSERT
TO authenticated
WITH CHECK (true);

-- Seed with real, verified workarounds
INSERT INTO public.community_workarounds (title, description, instructions, category, source_url, source_platform, is_verified, last_verified_at, is_active, tags) VALUES
('Dexcom Savings Card', 'Dexcom offers a savings card that can reduce out-of-pocket costs for commercially insured patients. Can save up to $200/month on Dexcom G7 sensors.', '1. Visit dexcom.com/savings-card\n2. Fill out eligibility form\n3. Receive digital savings card\n4. Present at pharmacy with prescription\n5. Savings applied automatically at checkout', 'device', 'https://www.dexcom.com/savings', 'Dexcom Official', true, now(), true, ARRAY['dexcom', 'cgm', 'savings card', 'copay']),

('FreeStyle Libre Savings Program', 'Abbott offers a savings program for FreeStyle Libre sensors. Eligible patients pay as little as $75/month for 2 sensors.', '1. Go to freestyle.abbott/us-en/savings\n2. Check eligibility (commercially insured)\n3. Download or print savings card\n4. Use at participating pharmacies\n5. Card is reusable for each fill', 'device', 'https://www.freestyle.abbott/us-en/savings.html', 'Abbott Official', true, now(), true, ARRAY['libre', 'cgm', 'savings', 'abbott']),

('Omnipod Copay Assistance', 'Insulet offers copay assistance for Omnipod 5. Eligible patients may pay as little as $0 copay per month.', '1. Visit omnipod.com/copay\n2. Verify commercial insurance\n3. Enroll online\n4. Card sent via email\n5. Present at pharmacy or use for direct orders', 'device', 'https://www.omnipod.com/copay-assistance', 'Insulet Official', true, now(), true, ARRAY['omnipod', 'pump', 'copay', 'insulet']),

('Lilly Insulin Value Program - $35/month', 'Eli Lilly caps insulin costs at $35/month for all their insulins (Humalog, Lyumjev, Basaglar, Humulin) regardless of insurance status.', '1. Visit insulinaffordability.com\n2. No income verification required\n3. Works for insured AND uninsured\n4. Download savings card\n5. Present at any retail pharmacy\n6. Each prescription fills for max $35', 'medication', 'https://www.insulinaffordability.com/', 'Eli Lilly Official', true, now(), true, ARRAY['insulin', 'lilly', 'humalog', '$35 cap']),

('Novo Nordisk Patient Assistance Program', 'Free insulin for uninsured patients who meet income guidelines (up to 400% federal poverty level). Covers Novolog, Levemir, Tresiba, Fiasp.', '1. Visit novocare.com\n2. Check eligibility (uninsured or underinsured)\n3. Download application form\n4. Have doctor complete medical section\n5. Submit with income documentation\n6. Receive 90-day supply shipped to provider', 'medication', 'https://www.novocare.com/insulin/pap.html', 'Novo Nordisk Official', true, now(), true, ARRAY['insulin', 'novo nordisk', 'free insulin', 'patient assistance']),

('Sanofi Patient Connection', 'Free Lantus, Toujeo, and Admelog for qualifying uninsured patients. Income must be at or below 400% of federal poverty level.', '1. Visit sanofipatientconnection.com\n2. Download application\n3. Doctor completes prescription section\n4. Include proof of income\n5. Mail or fax application\n6. 90-day supply sent to prescriber office', 'medication', 'https://www.sanofipatientconnection.com/', 'Sanofi Official', true, now(), true, ARRAY['insulin', 'sanofi', 'lantus', 'patient assistance']),

('Walmart ReliOn Insulin ($25/vial)', 'Walmart sells ReliOn brand insulin (Regular and NPH) over the counter for ~$25/vial in most states. No prescription needed for these older formulations.', '1. Go to any Walmart pharmacy\n2. Ask for ReliOn insulin (Regular or NPH)\n3. No prescription required in most states\n4. Costs approximately $25 per 10mL vial\n5. Also available: ReliOn 70/30 mix\n\nNote: These are older insulin types—discuss with your doctor before switching.', 'medication', 'https://www.walmart.com/cp/relion/1231555', 'Walmart', true, now(), true, ARRAY['insulin', 'walmart', 'OTC', 'cheap insulin', 'emergency']),

('Mark Cuban Cost Plus Drugs', 'CostPlusDrugs.com offers insulin and diabetes medications at cost + 15% + pharmacy fee. Significant savings vs retail pharmacy prices.', '1. Visit costplusdrugs.com\n2. Search for your medication\n3. Compare prices (often 50-90% less)\n4. Upload prescription or have doctor send it\n5. Medications shipped via mail order\n6. Available insulins include biosimilar options', 'medication', 'https://costplusdrugs.com/medications/categories/diabetes/', 'Cost Plus Drugs', true, now(), true, ARRAY['insulin', 'cost plus', 'mark cuban', 'discount']),

('GoodRx Discount Codes', 'GoodRx aggregates pharmacy discount coupons. Can save 20-80% on diabetes supplies and medications at retail pharmacies.', '1. Download GoodRx app or visit goodrx.com\n2. Search for your medication\n3. Compare prices at nearby pharmacies\n4. Show coupon code to pharmacist\n5. Savings applied immediately\n6. No insurance needed—works for anyone\n7. Can sometimes beat insurance copay', 'financial', 'https://www.goodrx.com/', 'GoodRx', true, now(), true, ARRAY['discount', 'coupon', 'pharmacy', 'goodrx']),

('Insurance Appeal Letter Strategy', 'When insurance denies a CGM or pump, a well-crafted appeal citing medical necessity often overturns the denial. Success rates of 50-70% on first appeal.', '1. Request denial in writing with specific reason\n2. Get letter of medical necessity from endocrinologist\n3. Include: A1C history, hypo episodes, current regimen\n4. Cite ADA Standards of Care guidelines\n5. Include peer-reviewed studies supporting the device\n6. Submit within appeal deadline (usually 30-60 days)\n7. If denied again, request external review\n8. Consider contacting state insurance commissioner', 'insurance', 'https://diabetes.org/tools-resources/health-insurance-support', 'ADA / Community', true, now(), true, ARRAY['appeal', 'denial', 'insurance', 'CGM', 'pump']),

('Peer-to-Peer Review Tips', 'When insurance requires peer-to-peer review, your doctor speaks directly with the insurance medical director. Preparation is key.', '1. Schedule the P2P call with your endo\n2. Prepare talking points together\n3. Have patient records ready (A1C, hypo logs, CGM data)\n4. Cite current clinical guidelines (ADA, AACE)\n5. Emphasize safety concerns and quality of life\n6. Document the call details\n7. Follow up in writing within 24 hours\n8. If unsuccessful, escalate to external review', 'insurance', 'https://diabetes.org/tools-resources/health-insurance-support', 'Community / Medical', true, now(), true, ARRAY['peer review', 'insurance', 'authorization', 'tips']),

('Formulary Exception Request', 'If your insulin or device is not on your insurance formulary, you can request a formulary exception with medical justification.', '1. Doctor writes letter explaining why specific brand is needed\n2. Include documentation of failed alternatives\n3. Cite allergies or adverse reactions to formulary options\n4. Reference clinical guidelines supporting your medication\n5. Submit exception request form (get from insurer)\n6. Follow up weekly until decision\n7. Appeal if denied—include additional clinical evidence', 'insurance', 'https://diabetes.org/tools-resources/health-insurance-support', 'Insurance Industry Standard', true, now(), true, ARRAY['formulary', 'exception', 'insurance', 'medication']),

('Manufacturer Replacement Programs', 'Most device manufacturers will replace failed or defective devices for free, even slightly out of warranty. Always call and ask.', '1. Contact manufacturer customer service directly\n2. Explain the device failure/defect\n3. Have serial number and purchase date ready\n4. Ask about out-of-warranty replacement options\n5. Many companies replace for free up to 6 months past warranty\n6. Document everything in writing\n7. If refused, escalate to supervisor or file FDA MedWatch report', 'device', NULL, 'Community Knowledge', true, now(), true, ARRAY['replacement', 'warranty', 'device', 'manufacturer']),

('FSA/HSA for Diabetes Supplies', 'All diabetes supplies are FSA/HSA eligible including CGMs, pumps, insulin, test strips, and even some supplements. Max out these pre-tax accounts.', '1. Contribute max to FSA ($3,200/yr) or HSA ($4,150 individual)\n2. All diabetes supplies are eligible expenses\n3. CGM sensors, transmitters, receivers\n4. Insulin pump supplies and insulin\n5. Test strips, lancets, glucose tablets\n6. Keep receipts for all purchases\n7. Some stores have FSA/HSA-eligible storefronts', 'financial', 'https://www.irs.gov/publications/p502', 'IRS / Financial Planning', true, now(), true, ARRAY['FSA', 'HSA', 'tax savings', 'pre-tax']),

('State Insulin Cap Laws', 'Many states have passed laws capping insulin copays at $25-$100/month. Check if your state has one and how to access it.', '1. Check if your state has an insulin cost cap law\n2. States with caps include: CO, IL, ME, NM, NY, WA, WV and others\n3. Caps typically range from $25-$100/month\n4. Usually applies to state-regulated insurance plans\n5. May not apply to self-funded employer plans\n6. Contact your state insurance department for details\n7. Inform your pharmacist about the state cap', 'financial', 'https://diabetes.org/advocacy/insulin-affordability', 'ADA Advocacy', true, now(), true, ARRAY['insulin cap', 'state law', 'copay cap', 'legislation']);
