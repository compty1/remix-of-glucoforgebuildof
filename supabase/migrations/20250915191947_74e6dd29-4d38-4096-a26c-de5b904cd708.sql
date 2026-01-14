-- Insert sample device data for Dexcom G7, Omnipod 5, and Tandem t:slim X2

-- Clear existing device data to prevent conflicts
DELETE FROM public.device_issues;
DELETE FROM public.device_metrics;
DELETE FROM public.devices;

-- Insert devices
INSERT INTO public.devices (name, manufacturer, category, model_number, fda_approved_date, description, key_features, pros, cons, common_issues, retail_price_usd, image_url, website_url) VALUES
('Dexcom G7', 'Dexcom', 'CGM', 'G7', '2022-12-21', 'Next-generation continuous glucose monitor with 10-day wear and 1-minute warm-up', 
 ARRAY['10-day wear time', '1-minute warm-up', 'Direct smartphone connectivity', 'Customizable alerts', 'Share feature'],
 ARRAY['Longest wear time in class', 'Fastest warm-up', 'Excellent accuracy', 'User-friendly app', 'Strong adhesive'],
 ARRAY['Higher cost than competitors', 'Can be bulky for some users', 'Occasional connectivity issues'],
 ARRAY['Adhesive failure', 'Sensor compression lows', 'Bluetooth connectivity drops'],
 70, 'https://images.unsplash.com/photo-1576671081837-49000212a370?w=400', 'https://www.dexcom.com/g7'),

('Omnipod 5', 'Insulet', 'Insulin Pump', 'Omnipod 5', '2022-01-28', 'Tubeless automated insulin delivery system with smartphone control',
 ARRAY['Tubeless design', 'Automated insulin delivery', 'Smartphone PDM', '3-day wear time', 'Waterproof'],
 ARRAY['Complete freedom from tubes', 'Automated basal adjustments', 'Swim and shower safe', 'Discreet design'],
 ARRAY['3-day pod changes', 'Single insulin type only', 'Pod adhesive challenges', 'Higher consumable costs'],
 ARRAY['Pod adhesive failure', 'Occlusion alarms', 'Cannula site reactions', 'PDM connectivity issues'],
 800, 'https://images.unsplash.com/photo-1559757175-0eb30cd8c063?w=400', 'https://www.omnipod.com/omnipod-5'),

('Tandem t:slim X2', 'Tandem Diabetes Care', 'Insulin Pump', 't:slim X2', '2018-06-27', 'Touchscreen insulin pump with Dexcom CGM integration and automated features',
 ARRAY['Color touchscreen', 'Dexcom G6/G7 integration', 'Control-IQ technology', 'Remote software updates', 'Rechargeable battery'],
 ARRAY['Intuitive touchscreen interface', 'Excellent CGM integration', 'Proven automated algorithms', 'Software updatable'],
 ARRAY['Tubing can get caught', 'Learning curve for new users', 'Screen can crack if dropped'],
 ARRAY['Infusion set occlusions', 'Cartridge air bubbles', 'Screen responsiveness issues', 'Battery degradation'],
 4000, 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=400', 'https://www.tandemdiabetes.com/products/t-slim-x2-insulin-pump');

-- Insert device metrics
INSERT INTO public.device_metrics (device_id, reliability_score, social_setting_score, total_reviews) VALUES
((SELECT id FROM public.devices WHERE name = 'Dexcom G7'), 92, 88, 1247),
((SELECT id FROM public.devices WHERE name = 'Omnipod 5'), 87, 95, 892),
((SELECT id FROM public.devices WHERE name = 'Tandem t:slim X2'), 89, 82, 1653);

-- Insert device issues for Dexcom G7
INSERT INTO public.device_issues (device_id, issue_title, description, severity, frequency_percentage, solution, workaround, community_reports) VALUES
((SELECT id FROM public.devices WHERE name = 'Dexcom G7'), 'Adhesive Failure', 'Sensor falls off before 10-day wear period, especially in hot weather or during exercise', 'Medium', 23, 'Use medical tape or adhesive overlay patches designed for CGMs', 'Apply Skin Tac before sensor insertion and cover with Tegaderm', 127),
((SELECT id FROM public.devices WHERE name = 'Dexcom G7'), 'Compression Lows', 'False low readings when sleeping on sensor or during exercise', 'Low', 15, 'Move sensor to different body location with less pressure', 'Ignore single low readings, look for trends instead', 89),
((SELECT id FROM public.devices WHERE name = 'Dexcom G7'), 'Bluetooth Connectivity', 'Intermittent connection loss with smartphone app', 'Medium', 18, 'Restart Bluetooth, force close and reopen app', 'Keep phone within 20 feet and ensure app permissions are correct', 156);

-- Insert device issues for Omnipod 5
INSERT INTO public.device_issues (device_id, issue_title, description, severity, frequency_percentage, solution, workaround, community_reports) VALUES
((SELECT id FROM public.devices WHERE name = 'Omnipod 5'), 'Pod Adhesive Failure', 'Pod detaches from skin before 3-day replacement, particularly around edges', 'High', 31, 'Use adhesive wipes before application and consider overlay patches', 'Apply Skin Tac and use Tegaderm or similar overlay for extra security', 203),
((SELECT id FROM public.devices WHERE name = 'Omnipod 5'), 'Occlusion Alarms', 'False occlusion alarms due to cannula kinks or insulin crystallization', 'Medium', 12, 'Replace pod immediately, check insulin expiration and storage', 'Prime new pod thoroughly and ensure insulin is at room temperature', 97),
((SELECT id FROM public.devices WHERE name = 'Omnipod 5'), 'Site Reactions', 'Skin irritation, redness, or bumps at cannula insertion site', 'Low', 28, 'Rotate sites frequently, use barrier wipes, consider steel cannula pods', 'Apply anti-itch cream after pod removal and give sites time to heal', 178);

-- Insert device issues for Tandem t:slim X2
INSERT INTO public.device_issues (device_id, issue_title, description, severity, frequency_percentage, solution, workaround, community_reports) VALUES
((SELECT id FROM public.devices WHERE name = 'Tandem t:slim X2'), 'Infusion Set Occlusions', 'Blocked tubing or cannula causing high blood sugar and alarms', 'High', 22, 'Replace infusion set, check for air bubbles, prime properly', 'Always carry backup sets and check for kinks in tubing', 312),
((SELECT id FROM public.devices WHERE name = 'Tandem t:slim X2'), 'Cartridge Air Bubbles', 'Air bubbles in insulin cartridge affecting delivery accuracy', 'Medium', 19, 'Fill cartridge slowly, tap to remove bubbles before insertion', 'Prime extra insulin to clear air and monitor blood sugars closely', 267),
((SELECT id FROM public.devices WHERE name = 'Tandem t:slim X2'), 'Screen Responsiveness', 'Touchscreen becomes less responsive or unresponsive in certain conditions', 'Medium', 14, 'Clean screen with microfiber cloth, update software if available', 'Use firm pressure when touching screen, restart pump if necessary', 134);