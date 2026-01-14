-- Insert sample device data
INSERT INTO public.devices (name, manufacturer, category, model_number, fda_approved_date, description, key_features, pros, cons, common_issues, retail_price_usd, image_url, website_url) VALUES
('Dexcom G7', 'Dexcom', 'CGM', 'G7', '2022-12-20', 'Latest generation continuous glucose monitor with 10-day wear time and real-time glucose readings.', 
 ARRAY['10-day wear time', 'Real-time glucose readings', 'Customizable alarms', 'Share data with up to 10 followers', 'Smartphone integration'],
 ARRAY['Accurate readings', 'Long wear time', 'Easy insertion', 'Small form factor', 'Excellent app interface'],
 ARRAY['Expensive without insurance', 'Occasional sensor failures', 'Adhesive issues in humid weather'],
 ARRAY['Sensor adhesive failing early', 'Compression lows during sleep', 'Bluetooth connectivity drops'],
 70, 'https://images.unsplash.com/photo-1559757175-0eb30cd8c063?w=400', 'https://www.dexcom.com/g7'),

('Omnipod 5', 'Insulet', 'Insulin Pump', 'Pod-5', '2022-01-28', 'Tubeless insulin pump system with automated insulin delivery and smartphone control.',
 ARRAY['Tubeless design', 'Automated insulin delivery', 'Smartphone control', '3-day pod wear time', 'Waterproof pods'],
 ARRAY['No tubing to get caught', 'Automated basal adjustments', 'Discreet under clothing', 'Waterproof for swimming'],
 ARRAY['Pod failures can be costly', 'Limited insulin capacity (200 units)', 'Insertion site reactions'],
 ARRAY['Pod occlusions during insertion', 'PDM connectivity issues', 'Skin irritation from adhesive'],
 350, 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=400', 'https://www.omnipod.com/omnipod-5'),

('Tandem t:slim X2', 'Tandem Diabetes Care', 'Insulin Pump', 'TSLIM-X2', '2017-09-13', 'Touchscreen insulin pump with Control-IQ automated insulin delivery technology.',
 ARRAY['Color touchscreen', 'Control-IQ technology', 'Remote software updates', '300-unit cartridge', 'Dexcom G6/G7 integration'],
 ARRAY['Intuitive touchscreen interface', 'Predictive low glucose suspend', 'Remote updates without new hardware', 'Sleek design'],
 ARRAY['Tubing can get tangled', 'Screen can be difficult to see in bright sunlight', 'Learning curve for new users'],
 ARRAY['Cartridge air bubbles', 'Infusion set occlusions', 'Touchscreen responsiveness in cold weather'],
 500, 'https://images.unsplash.com/photo-1559757175-0eb30cd8c063?w=400', 'https://www.tandemdiabetes.com/products/t-slim-x2-insulin-pump');

-- Insert corresponding device metrics
INSERT INTO public.device_metrics (device_id, reliability_score, social_setting_score, total_reviews) VALUES
((SELECT id FROM public.devices WHERE name = 'Dexcom G7'), 88, 92, 1247),
((SELECT id FROM public.devices WHERE name = 'Omnipod 5'), 82, 89, 891),
((SELECT id FROM public.devices WHERE name = 'Tandem t:slim X2'), 85, 78, 1533);

-- Insert common device issues
INSERT INTO public.device_issues (device_id, issue_title, description, severity, frequency_percentage, solution, workaround, community_reports) VALUES
-- Dexcom G7 issues
((SELECT id FROM public.devices WHERE name = 'Dexcom G7'), 'Sensor Adhesive Failure', 'Sensor comes off before 10-day period, especially in humid conditions or during exercise.', 'Medium', 15, 'Use additional adhesive patches like Simpatch or GrifGrips', 'Apply extra medical tape around edges', 127),
((SELECT id FROM public.devices WHERE name = 'Dexcom G7'), 'Compression Lows', 'False low readings when lying on sensor during sleep.', 'Low', 8, 'Sleep on opposite side or use pillow barrier', 'Wait 15 minutes and recheck if reading seems off', 89),
((SELECT id FROM public.devices WHERE name = 'Dexcom G7'), 'Bluetooth Disconnection', 'App loses connection requiring phone restart or sensor restart.', 'Medium', 12, 'Force close and restart Dexcom app', 'Toggle Bluetooth off/on or restart phone', 156),

-- Omnipod 5 issues  
((SELECT id FROM public.devices WHERE name = 'Omnipod 5'), 'Pod Occlusion During Insertion', 'Pod fails to prime or shows occlusion alarm immediately after insertion.', 'High', 18, 'Replace pod and try different insertion site', 'Ensure insulin is at room temperature before insertion', 201),
((SELECT id FROM public.devices WHERE name = 'Omnipod 5'), 'PDM Connectivity Issues', 'Personal Diabetes Manager loses connection with pod requiring frequent re-pairing.', 'Medium', 22, 'Keep PDM within 5 feet of pod and restart if needed', 'Manually bolus using PDM if phone app fails', 189),
((SELECT id FROM public.devices WHERE name = 'Omnipod 5'), 'Skin Irritation', 'Red, itchy, or raised skin reaction at pod insertion site.', 'Low', 25, 'Rotate insertion sites and use barrier wipes before insertion', 'Apply hydrocortisone cream after pod removal', 143),

-- Tandem t:slim X2 issues
((SELECT id FROM public.devices WHERE name = 'Tandem t:slim X2'), 'Cartridge Air Bubbles', 'Air bubbles in insulin cartridge causing delivery interruptions.', 'Medium', 20, 'Prime cartridge more thoroughly and tap to remove bubbles', 'Disconnect and reconnect infusion set to clear line', 178),
((SELECT id FROM public.devices WHERE name = 'Tandem t:slim X2'), 'Infusion Set Occlusions', 'Blocked infusion set preventing insulin delivery.', 'High', 14, 'Replace infusion set and choose different insertion site', 'Use manual injection for correction while troubleshooting', 167),
((SELECT id FROM public.devices WHERE name = 'Tandem t:slim X2'), 'Touchscreen Cold Weather Issues', 'Screen becomes unresponsive in cold temperatures.', 'Low', 8, 'Warm pump to body temperature before use', 'Keep pump under clothing in cold weather', 92);