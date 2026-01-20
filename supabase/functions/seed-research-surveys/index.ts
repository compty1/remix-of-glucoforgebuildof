import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Comprehensive T1D Research Surveys with practical questions
const researchSurveys = [
  // ============================================
  // DEVICE EXPERIENCE SURVEYS (11 total)
  // ============================================
  {
    title: "CGM Experience & Accuracy Study",
    description: "Share your experiences with continuous glucose monitoring systems to help researchers understand real-world device performance and identify areas for improvement.",
    category: "Device Experience",
    survey_type: "survey",
    research_category: "Device Experience",
    estimated_time_minutes: 10,
    is_anonymous: true,
    requires_demographics: true,
    status: "active",
    target_responses: 500,
    consent_text: "Your responses will help manufacturers and researchers understand real-world CGM performance.",
    questions: [
      { id: "cgm_brand", type: "radio", text: "Which CGM system do you currently use?", required: true, options: ["Dexcom G6", "Dexcom G7", "Dexcom ONE", "Libre 2", "Libre 3", "Medtronic Guardian 4", "Medtronic Guardian 3", "Eversense E3", "Other", "I don't use a CGM"] },
      { id: "cgm_duration", type: "radio", text: "How long have you been using your current CGM?", required: true, options: ["Less than 3 months", "3-6 months", "6-12 months", "1-2 years", "2-5 years", "More than 5 years"] },
      { id: "accuracy_rating", type: "scale", text: "How would you rate the overall accuracy of your CGM compared to fingerstick readings?", required: true, min: 1, max: 10, minLabel: "Very inaccurate", maxLabel: "Highly accurate" },
      { id: "discrepancy_frequency", type: "radio", text: "How often do you notice significant discrepancies (>20 mg/dL) between your CGM and fingerstick?", required: true, options: ["Rarely (less than once a week)", "Sometimes (1-3 times a week)", "Often (daily)", "Very often (multiple times daily)", "I don't compare with fingersticks"] },
      { id: "compression_lows", type: "radio", text: "How often do you experience compression lows (false low readings when sleeping on sensor)?", required: true, options: ["Never", "Rarely (monthly)", "Sometimes (weekly)", "Often (multiple times per week)", "Every night"] },
      { id: "sensor_failures", type: "radio", text: "In the past 3 months, how many sensors failed before their expected lifespan?", required: true, options: ["None", "1 sensor", "2-3 sensors", "4-5 sensors", "More than 5 sensors"] },
      { id: "time_in_range", type: "radio", text: "What is your typical Time in Range (70-180 mg/dL) percentage?", required: true, options: ["Below 30%", "30-40%", "40-50%", "50-60%", "60-70%", "70-80%", "Above 80%", "I don't track TIR"] },
      { id: "alert_fatigue", type: "scale", text: "How much does CGM alert fatigue affect your daily life?", required: true, min: 1, max: 10, minLabel: "Not at all", maxLabel: "Significantly impacts my life" },
      { id: "improvement_suggestions", type: "textarea", text: "What one feature or improvement would you most want to see in CGM technology?", required: false }
    ]
  },
  {
    title: "CGM Sensor Adhesion & Skin Reactions Study",
    description: "Help researchers understand skin-related issues with CGM sensors and develop better solutions for sensor adhesion and skin health.",
    category: "Device Experience",
    survey_type: "survey",
    research_category: "Device Experience",
    estimated_time_minutes: 8,
    is_anonymous: true,
    requires_demographics: true,
    status: "active",
    target_responses: 400,
    consent_text: "Your feedback will inform better adhesive and skin-friendly device designs.",
    questions: [
      { id: "skin_reaction_frequency", type: "radio", text: "How often do you experience skin reactions from your CGM sensor?", required: true, options: ["Never", "Rarely (1-2 times per year)", "Sometimes (every few months)", "Often (monthly)", "Every sensor"] },
      { id: "reaction_type", type: "checkbox", text: "What types of skin reactions have you experienced? (Select all that apply)", required: false, options: ["Redness/irritation", "Itching", "Blistering", "Scarring", "Allergic reaction/hives", "Skin discoloration", "None"] },
      { id: "adhesion_issues", type: "radio", text: "How often does your sensor fall off or lose adhesion before the end of its wear period?", required: true, options: ["Never", "Rarely", "Sometimes", "Often", "Every sensor"] },
      { id: "adhesion_methods", type: "checkbox", text: "What methods do you use to improve sensor adhesion? (Select all that apply)", required: false, options: ["Skin prep wipes", "Barrier sprays/wipes", "Overtape/patches", "Adhesive removers", "Shaving insertion area", "None - I don't have issues"] },
      { id: "skin_prep_time", type: "radio", text: "How much time do you spend on skin preparation before sensor insertion?", required: true, options: ["No prep needed", "Less than 1 minute", "1-3 minutes", "3-5 minutes", "More than 5 minutes"] },
      { id: "placement_rotation", type: "radio", text: "How many different sites do you rotate between for sensor placement?", required: true, options: ["1 site only", "2-3 sites", "4-5 sites", "6+ sites", "I use wherever works"] },
      { id: "skin_healing_time", type: "radio", text: "How long does it typically take for your skin to fully heal after sensor removal?", required: true, options: ["1-2 days", "3-5 days", "1 week", "2 weeks", "More than 2 weeks", "I still have marks from old sites"] },
      { id: "brand_switch_skin", type: "radio", text: "Have you ever switched CGM brands due to skin issues?", required: true, options: ["Yes, and it helped", "Yes, but issues continued", "No, but I'm considering it", "No, I don't have skin issues"] },
      { id: "skin_solution_feedback", type: "textarea", text: "What has worked best for you in managing skin reactions or adhesion issues?", required: false }
    ]
  },
  {
    title: "DIY Loop System User Experience",
    description: "Share your experience with DIY automated insulin delivery systems like Loop, OpenAPS, or AndroidAPS to help the community understand real-world performance.",
    category: "Device Experience",
    survey_type: "survey",
    research_category: "Device Experience",
    estimated_time_minutes: 12,
    is_anonymous: true,
    requires_demographics: true,
    status: "active",
    target_responses: 300,
    consent_text: "Your insights will help the DIY diabetes technology community and researchers understand open-source AID systems.",
    questions: [
      { id: "diy_system", type: "radio", text: "Which DIY AID system do you use?", required: true, options: ["Loop (iOS)", "OpenAPS", "AndroidAPS", "iAPS/FreeAPS X", "Trio", "I've used multiple", "I'm considering starting", "I used to use DIY but stopped"] },
      { id: "diy_duration", type: "radio", text: "How long have you been using a DIY system?", required: true, options: ["Less than 3 months", "3-6 months", "6-12 months", "1-2 years", "2+ years", "Not yet started"] },
      { id: "setup_difficulty", type: "scale", text: "How difficult was the initial setup process?", required: true, min: 1, max: 10, minLabel: "Very easy", maxLabel: "Extremely difficult" },
      { id: "tir_improvement", type: "radio", text: "How has your Time in Range changed since starting DIY looping?", required: true, options: ["Improved significantly (>20%)", "Improved moderately (10-20%)", "Improved slightly (<10%)", "About the same", "Got worse", "N/A"] },
      { id: "overnight_control", type: "scale", text: "How well does your DIY system handle overnight glucose control?", required: true, min: 1, max: 10, minLabel: "Poorly", maxLabel: "Excellently" },
      { id: "meal_handling", type: "scale", text: "How well does your DIY system handle meal-time glucose spikes?", required: true, min: 1, max: 10, minLabel: "Poorly", maxLabel: "Excellently" },
      { id: "technical_issues", type: "checkbox", text: "What technical challenges have you faced? (Select all that apply)", required: false, options: ["App crashes", "Bluetooth connectivity", "Pump communication issues", "CGM data gaps", "RileyLink/OrangeLink issues", "iPhone/phone compatibility", "Build/update difficulties", "None significant"] },
      { id: "community_support", type: "scale", text: "How helpful has the DIY community been for troubleshooting?", required: true, min: 1, max: 10, minLabel: "Not helpful", maxLabel: "Extremely helpful" },
      { id: "endo_support", type: "radio", text: "Does your endocrinologist support your use of DIY systems?", required: true, options: ["Fully supportive and helps optimize", "Supportive but hands-off", "Neutral/doesn't know", "Discourages but tolerates", "Strongly opposes"] },
      { id: "commercial_vs_diy", type: "radio", text: "Have you also tried commercial AID systems (like Control-IQ or 780G)?", required: true, options: ["Yes, prefer DIY", "Yes, prefer commercial", "Yes, use both", "No, only DIY", "Switched from commercial to DIY"] },
      { id: "diy_advice", type: "textarea", text: "What advice would you give someone considering a DIY AID system?", required: false }
    ]
  },
  {
    title: "Smartwatch Integration Satisfaction",
    description: "Tell us about your experience using smartwatches for diabetes management and monitoring.",
    category: "Device Experience",
    survey_type: "survey",
    research_category: "Device Experience",
    estimated_time_minutes: 8,
    is_anonymous: true,
    requires_demographics: true,
    status: "active",
    target_responses: 400,
    consent_text: "Your feedback will help improve smartwatch integration for diabetes devices.",
    questions: [
      { id: "watch_brand", type: "radio", text: "Which smartwatch do you use for diabetes management?", required: true, options: ["Apple Watch", "Garmin", "Fitbit", "Samsung Galaxy Watch", "Wear OS watch", "Other", "I don't use a smartwatch"] },
      { id: "cgm_display", type: "radio", text: "Do you display CGM data on your smartwatch?", required: true, options: ["Yes, always visible", "Yes, with complications", "Yes, via app", "No, but I want to", "No, not interested"] },
      { id: "watch_app", type: "checkbox", text: "Which diabetes apps do you use on your watch? (Select all that apply)", required: false, options: ["Dexcom", "Libre", "Sugarmate", "Nightscout", "Loop/DIY apps", "Glucose tracking apps", "None"] },
      { id: "glance_frequency", type: "radio", text: "How often do you check your glucose on your watch?", required: true, options: ["Multiple times per hour", "Every 30-60 minutes", "Every 1-2 hours", "A few times daily", "Rarely"] },
      { id: "watch_alerts", type: "scale", text: "How useful are glucose alerts on your smartwatch?", required: true, min: 1, max: 10, minLabel: "Not useful", maxLabel: "Essential" },
      { id: "haptic_alerts", type: "radio", text: "Do haptic (vibration) alerts on your watch help you catch highs/lows you'd otherwise miss?", required: true, options: ["Yes, frequently", "Yes, sometimes", "Rarely", "No", "I don't use haptic alerts"] },
      { id: "watch_battery", type: "radio", text: "Does diabetes monitoring significantly impact your watch battery life?", required: true, options: ["Yes, major impact", "Yes, moderate impact", "Minimal impact", "No impact", "Not sure"] },
      { id: "integration_rating", type: "scale", text: "How satisfied are you with the overall CGM-smartwatch integration?", required: true, min: 1, max: 10, minLabel: "Very dissatisfied", maxLabel: "Very satisfied" },
      { id: "watch_feature_wish", type: "textarea", text: "What smartwatch feature would most improve your diabetes management?", required: false }
    ]
  },
  {
    title: "CGM Alarm Fatigue Assessment",
    description: "Help researchers understand how CGM alerts affect daily life and identify better alert strategies.",
    category: "Device Experience",
    survey_type: "survey",
    research_category: "Device Experience",
    estimated_time_minutes: 10,
    is_anonymous: true,
    requires_demographics: true,
    status: "active",
    target_responses: 500,
    consent_text: "Your responses will help improve alert systems and reduce alarm fatigue.",
    questions: [
      { id: "alerts_per_day", type: "radio", text: "On average, how many CGM alerts do you receive per day?", required: true, options: ["0-2", "3-5", "6-10", "11-20", "More than 20"] },
      { id: "night_alerts", type: "radio", text: "How often are you woken by CGM alerts at night?", required: true, options: ["Rarely (less than once a week)", "1-2 times per week", "3-4 times per week", "Almost every night", "Multiple times per night"] },
      { id: "alert_response", type: "radio", text: "How often do you immediately respond to CGM alerts?", required: true, options: ["Always", "Usually", "Sometimes", "Rarely", "I often sleep through or ignore them"] },
      { id: "snoozed_alerts", type: "radio", text: "How often do you snooze or dismiss alerts without taking action?", required: true, options: ["Never", "Rarely", "Sometimes", "Often", "Almost always"] },
      { id: "fatigue_level", type: "scale", text: "How would you rate your current level of alarm fatigue?", required: true, min: 1, max: 10, minLabel: "No fatigue", maxLabel: "Severe fatigue" },
      { id: "disabled_alerts", type: "checkbox", text: "Have you disabled any of these alerts? (Select all that apply)", required: false, options: ["High alerts", "Low alerts", "Urgent low alerts", "Rise rate alerts", "Fall rate alerts", "Signal loss alerts", "None disabled"] },
      { id: "alert_customization", type: "radio", text: "How satisfied are you with your CGM's alert customization options?", required: true, options: ["Very satisfied", "Satisfied", "Neutral", "Dissatisfied", "Very dissatisfied"] },
      { id: "social_impact", type: "scale", text: "How much do CGM alerts impact your social situations or work?", required: true, min: 1, max: 10, minLabel: "No impact", maxLabel: "Major impact" },
      { id: "ideal_alert_system", type: "textarea", text: "Describe your ideal CGM alert system - what would work better for you?", required: false }
    ]
  },
  {
    title: "Device Training & Onboarding Experience",
    description: "Share your experience with initial device training and setup to help improve onboarding for new users.",
    category: "Device Experience",
    survey_type: "survey",
    research_category: "Device Experience",
    estimated_time_minutes: 8,
    is_anonymous: true,
    requires_demographics: true,
    status: "active",
    target_responses: 400,
    consent_text: "Your feedback will help improve device training programs for new users.",
    questions: [
      { id: "training_source", type: "checkbox", text: "How did you learn to use your current diabetes devices? (Select all that apply)", required: true, options: ["Doctor/endocrinologist", "Diabetes educator/CDE", "Manufacturer rep", "YouTube videos", "Online forums/communities", "Family/friends with T1D", "Trial and error", "Device manual/instructions"] },
      { id: "training_quality", type: "scale", text: "How well did your initial training prepare you to use your devices effectively?", required: true, min: 1, max: 10, minLabel: "Not at all prepared", maxLabel: "Fully prepared" },
      { id: "learning_curve", type: "radio", text: "How long did it take to feel confident with your devices?", required: true, options: ["Less than 1 week", "1-2 weeks", "2-4 weeks", "1-3 months", "More than 3 months", "I still don't feel confident"] },
      { id: "gaps_in_training", type: "checkbox", text: "What aspects were not adequately covered in your training? (Select all that apply)", required: false, options: ["Troubleshooting problems", "Optimizing settings", "Skin/adhesion issues", "App/software features", "Data analysis", "Exercise adjustments", "Travel considerations", "Training was comprehensive"] },
      { id: "followup_support", type: "radio", text: "Did you receive adequate follow-up support after initial training?", required: true, options: ["Yes, excellent ongoing support", "Yes, adequate support", "Some support but not enough", "Very little follow-up", "No follow-up at all"] },
      { id: "self_learning", type: "scale", text: "How much did you have to learn on your own through self-research?", required: true, min: 1, max: 10, minLabel: "Nothing - training was complete", maxLabel: "Everything - I taught myself" },
      { id: "training_improvement", type: "textarea", text: "What would have made your device training experience better?", required: false }
    ]
  },
  {
    title: "Backup Device Preparedness Survey",
    description: "Assess how prepared the T1D community is for device failures and emergencies.",
    category: "Device Experience",
    survey_type: "survey",
    research_category: "Device Experience",
    estimated_time_minutes: 6,
    is_anonymous: true,
    requires_demographics: true,
    status: "active",
    target_responses: 400,
    consent_text: "Your responses will help develop better guidance for device backup strategies.",
    questions: [
      { id: "backup_cgm", type: "radio", text: "Do you have backup CGM sensors available at home?", required: true, options: ["Yes, always have extras", "Yes, 1-2 extras", "Sometimes", "Rarely", "Never"] },
      { id: "backup_pump_supplies", type: "radio", text: "If you use a pump, do you have backup supplies (infusion sets, reservoirs)?", required: true, options: ["Yes, at least 2 weeks worth", "Yes, about 1 week worth", "Just a few days", "No backup supplies", "I don't use a pump"] },
      { id: "mdi_backup", type: "radio", text: "Do you have insulin pens/syringes as backup for pump failure?", required: true, options: ["Yes, current prescription", "Yes, but may be expired", "No, but I have old supplies", "No backup insulin delivery", "I use MDI as primary"] },
      { id: "glucometer_backup", type: "radio", text: "Do you have a working glucometer and strips as CGM backup?", required: true, options: ["Yes, with fresh strips", "Yes, but strips may be old", "Glucometer only, no strips", "No glucometer available"] },
      { id: "device_failure_experience", type: "radio", text: "Have you experienced a device failure that left you without your primary device?", required: true, options: ["Yes, multiple times", "Yes, once", "No, never", "No, but came close"] },
      { id: "failure_recovery_time", type: "radio", text: "If your device failed, how long would it take to get a replacement?", required: true, options: ["Same day", "1-2 days", "3-5 days", "1 week or more", "Not sure"] },
      { id: "travel_backup", type: "checkbox", text: "When traveling, what backup supplies do you bring? (Select all that apply)", required: false, options: ["Extra CGM sensors", "Extra pump supplies", "Insulin pens/syringes", "Glucometer & strips", "Extra batteries/chargers", "I don't travel with backups"] },
      { id: "preparedness_rating", type: "scale", text: "Overall, how prepared do you feel for a device failure emergency?", required: true, min: 1, max: 10, minLabel: "Not prepared", maxLabel: "Fully prepared" }
    ]
  },
  {
    title: "Device Switching Experience Study",
    description: "Share your experience switching between diabetes device brands or models.",
    category: "Device Experience",
    survey_type: "survey",
    research_category: "Device Experience",
    estimated_time_minutes: 10,
    is_anonymous: true,
    requires_demographics: true,
    status: "active",
    target_responses: 350,
    consent_text: "Your insights will help others make informed device switching decisions.",
    questions: [
      { id: "switch_type", type: "checkbox", text: "What type of device switch have you made? (Select all that apply)", required: true, options: ["CGM brand change", "CGM model upgrade", "Pump brand change", "Pump model upgrade", "MDI to pump", "Pump to MDI", "Started using CGM", "Stopped using CGM"] },
      { id: "switch_reason", type: "checkbox", text: "Why did you switch devices? (Select all that apply)", required: true, options: ["Better features", "Insurance/cost", "Skin reactions", "Accuracy issues", "Integration with other devices", "Smaller size", "Doctor recommendation", "Community recommendations"] },
      { id: "switch_difficulty", type: "scale", text: "How difficult was the transition to your new device?", required: true, min: 1, max: 10, minLabel: "Very easy", maxLabel: "Very difficult" },
      { id: "transition_time", type: "radio", text: "How long did it take to feel as comfortable with your new device as your old one?", required: true, options: ["Less than 1 week", "1-2 weeks", "2-4 weeks", "1-2 months", "More than 2 months", "I'm still adjusting"] },
      { id: "outcome_satisfaction", type: "scale", text: "How satisfied are you with the outcome of switching devices?", required: true, min: 1, max: 10, minLabel: "Very dissatisfied", maxLabel: "Very satisfied" },
      { id: "regret_switch", type: "radio", text: "Do you regret switching devices?", required: true, options: ["No, very happy with switch", "Mostly satisfied", "Neutral", "Somewhat regret it", "Strongly regret it"] },
      { id: "training_for_new", type: "radio", text: "Did you receive adequate training for your new device?", required: true, options: ["Yes, comprehensive training", "Yes, adequate training", "Minimal training", "No training provided", "I taught myself"] },
      { id: "switch_advice", type: "textarea", text: "What advice would you give someone considering switching to your current device?", required: false }
    ]
  },
  {
    title: "CGM Data Sharing with Healthcare Providers",
    description: "Help us understand how CGM data is shared and used in clinical care.",
    category: "Device Experience",
    survey_type: "survey",
    research_category: "Device Experience",
    estimated_time_minutes: 8,
    is_anonymous: true,
    requires_demographics: true,
    status: "active",
    target_responses: 400,
    consent_text: "Your feedback will help improve data sharing practices between patients and providers.",
    questions: [
      { id: "sharing_method", type: "checkbox", text: "How do you share CGM data with your healthcare team? (Select all that apply)", required: true, options: ["Dexcom Clarity", "LibreView", "CareLink", "Glooko/Diasend", "Tidepool", "Printed reports", "Show phone at appointment", "I don't share data", "Other"] },
      { id: "sharing_frequency", type: "radio", text: "How often do you share/upload CGM data before appointments?", required: true, options: ["Always before every appointment", "Usually", "Sometimes", "Rarely", "Never"] },
      { id: "provider_reviews", type: "radio", text: "Does your provider actually review your CGM data before/during appointments?", required: true, options: ["Always thoroughly reviewed", "Usually reviewed", "Sometimes glanced at", "Rarely reviewed", "Never reviewed"] },
      { id: "data_discussion_time", type: "radio", text: "How much appointment time is spent discussing your CGM data?", required: true, options: ["Most of the appointment", "About half", "A few minutes", "Very little", "None"] },
      { id: "actionable_insights", type: "scale", text: "How often do you get actionable insights from your provider based on CGM data?", required: true, min: 1, max: 10, minLabel: "Never", maxLabel: "Always" },
      { id: "remote_monitoring", type: "radio", text: "Does your provider monitor your CGM data remotely between appointments?", required: true, options: ["Yes, regularly", "Yes, occasionally", "Only when I request it", "No, but I wish they would", "No, and I prefer it that way"] },
      { id: "data_value", type: "scale", text: "How valuable is CGM data sharing in improving your diabetes care?", required: true, min: 1, max: 10, minLabel: "Not valuable", maxLabel: "Extremely valuable" },
      { id: "sharing_barriers", type: "textarea", text: "What barriers do you face in sharing CGM data effectively with your healthcare team?", required: false }
    ]
  },
  {
    title: "Device Compatibility & Interoperability Survey",
    description: "Help identify challenges with device integration and compatibility in the diabetes ecosystem.",
    category: "Device Experience",
    survey_type: "survey",
    research_category: "Device Experience",
    estimated_time_minutes: 10,
    is_anonymous: true,
    requires_demographics: true,
    status: "active",
    target_responses: 400,
    consent_text: "Your feedback will inform advocacy for better device interoperability.",
    questions: [
      { id: "devices_used", type: "checkbox", text: "Which devices do you currently use together? (Select all that apply)", required: true, options: ["CGM", "Insulin pump", "Smartphone", "Smartwatch", "Glucometer", "Insulin pen with memory", "Smart insulin pen cap", "AID system"] },
      { id: "integration_issues", type: "checkbox", text: "What integration issues have you experienced? (Select all that apply)", required: false, options: ["Devices won't connect to each other", "Bluetooth connectivity problems", "Apps not compatible with phone", "Data doesn't sync between platforms", "Different devices show different readings", "Pump won't work with preferred CGM", "None - everything works well"] },
      { id: "platform_frustration", type: "scale", text: "How frustrated are you by lack of device interoperability?", required: true, min: 1, max: 10, minLabel: "Not frustrated", maxLabel: "Extremely frustrated" },
      { id: "brand_lock", type: "radio", text: "Do you feel locked into a particular brand ecosystem?", required: true, options: ["Yes, very much", "Somewhat", "A little", "Not really", "No, I can switch freely"] },
      { id: "phone_compatibility", type: "radio", text: "Have you ever chosen a phone based on diabetes device compatibility?", required: true, options: ["Yes, switched phones for compatibility", "Yes, considered it when buying", "No, but compatibility was a concern", "No, never considered it"] },
      { id: "data_consolidation", type: "radio", text: "Can you view all your diabetes data in one place?", required: true, options: ["Yes, everything integrates", "Mostly, with some gaps", "Partially - need multiple apps", "No, data is fragmented", "I don't try to consolidate"] },
      { id: "ideal_integration", type: "textarea", text: "Describe your ideal device integration scenario - how would devices work together perfectly?", required: false }
    ]
  },
  {
    title: "Infusion Set Preference Study",
    description: "Share your experiences with different infusion set types to help guide pump users.",
    category: "Device Experience",
    survey_type: "survey",
    research_category: "Device Experience",
    estimated_time_minutes: 8,
    is_anonymous: true,
    requires_demographics: true,
    status: "active",
    target_responses: 350,
    consent_text: "Your preferences will help guide recommendations for infusion set selection.",
    questions: [
      { id: "current_infusion_set", type: "radio", text: "What type of infusion set do you currently use?", required: true, options: ["Angled plastic cannula (e.g., Silhouette)", "90-degree plastic cannula (e.g., Mio)", "Steel needle (e.g., Sure-T)", "All-in-one (e.g., Omnipod)", "Tubeless patch pump", "Other", "I don't use a pump"] },
      { id: "cannula_length", type: "radio", text: "What cannula/needle length do you use?", required: true, options: ["4mm", "6mm", "8mm", "9mm", "Other", "Not sure"] },
      { id: "insertion_method", type: "radio", text: "How do you insert your infusion sets?", required: true, options: ["Manual insertion", "Auto-inserter device", "Built-in inserter", "Varies by set type"] },
      { id: "site_longevity", type: "radio", text: "How long do you typically wear each infusion site?", required: true, options: ["1-2 days", "3 days (as recommended)", "4 days", "5+ days", "Until it fails"] },
      { id: "site_failures", type: "radio", text: "How often do you experience site failures (occlusions, bent cannulas)?", required: true, options: ["Rarely (less than monthly)", "Monthly", "Every 1-2 weeks", "Weekly", "Multiple times per week"] },
      { id: "favorite_sites", type: "checkbox", text: "Which body sites work best for you? (Select all that apply)", required: true, options: ["Abdomen", "Upper buttock", "Thigh", "Upper arm", "Lower back", "Hip"] },
      { id: "infusion_set_satisfaction", type: "scale", text: "How satisfied are you with your current infusion set?", required: true, min: 1, max: 10, minLabel: "Very dissatisfied", maxLabel: "Very satisfied" },
      { id: "tried_alternatives", type: "radio", text: "Have you tried other infusion set types?", required: true, options: ["Yes, multiple types", "Yes, one other type", "No, but interested", "No, happy with current"] },
      { id: "infusion_improvements", type: "textarea", text: "What improvements would you like to see in infusion set design?", required: false }
    ]
  },

  // ============================================
  // TREATMENT SURVEYS (11 total)
  // ============================================
  {
    title: "Insulin Pump Satisfaction Study",
    description: "Help researchers understand real-world insulin pump experiences to improve future device development.",
    category: "Treatment",
    survey_type: "survey",
    research_category: "Treatment",
    estimated_time_minutes: 12,
    is_anonymous: true,
    requires_demographics: true,
    status: "active",
    target_responses: 500,
    consent_text: "Your experiences will help improve insulin pump technology for the T1D community.",
    questions: [
      { id: "pump_brand", type: "radio", text: "Which insulin pump do you currently use?", required: true, options: ["Tandem t:slim X2", "Medtronic 780G", "Medtronic 770G", "Omnipod 5", "Omnipod DASH", "Insulet Eros", "YpsoPump", "DANA-i", "Other", "I don't use a pump"] },
      { id: "pump_duration", type: "radio", text: "How long have you been using an insulin pump?", required: true, options: ["Less than 6 months", "6-12 months", "1-2 years", "2-5 years", "5-10 years", "More than 10 years"] },
      { id: "aid_satisfaction", type: "scale", text: "How satisfied are you with your pump's automated insulin delivery features?", required: true, min: 1, max: 10, minLabel: "Very dissatisfied", maxLabel: "Very satisfied" },
      { id: "time_in_auto", type: "radio", text: "What percentage of time do you spend in automated/closed-loop mode?", required: true, options: ["90-100%", "75-90%", "50-75%", "25-50%", "Less than 25%", "My pump doesn't have auto mode"] },
      { id: "exit_auto_reasons", type: "checkbox", text: "Why do you exit automated mode? (Select all that apply)", required: false, options: ["Exercise", "Meals", "Sleep", "Sensor issues", "Better manual control", "Site changes", "Illness", "I rarely exit auto mode", "N/A"] },
      { id: "tubing_preference", type: "radio", text: "What is your preference regarding pump tubing?", required: true, options: ["Prefer tubed pump", "Prefer tubeless/patch pump", "No strong preference", "Haven't tried both types"] },
      { id: "overall_pump_rating", type: "scale", text: "How would you rate your overall pump satisfaction?", required: true, min: 1, max: 10, minLabel: "Very dissatisfied", maxLabel: "Very satisfied" },
      { id: "pump_improvements", type: "textarea", text: "What single improvement would most enhance your pump experience?", required: false }
    ]
  },
  {
    title: "Insulin Dosing Adjustment Patterns",
    description: "Help researchers understand how T1D individuals fine-tune their insulin settings.",
    category: "Treatment",
    survey_type: "survey",
    research_category: "Treatment",
    estimated_time_minutes: 10,
    is_anonymous: true,
    requires_demographics: true,
    status: "active",
    target_responses: 450,
    consent_text: "Your dosing patterns will help develop better dosing algorithms and recommendations.",
    questions: [
      { id: "adjustment_frequency", type: "radio", text: "How often do you adjust your insulin-to-carb ratio?", required: true, options: ["Daily", "Weekly", "Monthly", "Every few months", "Rarely", "Never - I use fixed ratios"] },
      { id: "who_adjusts", type: "radio", text: "Who primarily makes adjustments to your insulin settings?", required: true, options: ["I do, independently", "I do, with endo guidance", "My endocrinologist/CDE", "My parents/caregivers", "AID system auto-adjusts"] },
      { id: "basal_patterns", type: "radio", text: "How many different basal rate segments do you use in 24 hours?", required: true, options: ["1 (flat rate)", "2-3 segments", "4-6 segments", "7+ segments", "I use MDI, not a pump"] },
      { id: "correction_factor_accuracy", type: "scale", text: "How accurate is your correction factor for bringing down highs?", required: true, min: 1, max: 10, minLabel: "Very inaccurate", maxLabel: "Very accurate" },
      { id: "ratio_variation", type: "checkbox", text: "For which situations do you use different carb ratios? (Select all that apply)", required: false, options: ["Morning/breakfast", "Lunch", "Dinner", "Late night snacks", "High-fat meals", "Exercise days", "Menstrual cycle", "Sick days", "Same ratio always"] },
      { id: "data_for_adjustments", type: "checkbox", text: "What data do you use to make dosing adjustments? (Select all that apply)", required: true, options: ["CGM patterns/reports", "A1C results", "Daily glucose log", "How I feel", "Doctor recommendations", "Online calculators", "AID learning"] },
      { id: "adjustment_confidence", type: "scale", text: "How confident are you in making your own dosing adjustments?", required: true, min: 1, max: 10, minLabel: "Not confident", maxLabel: "Very confident" },
      { id: "adjustment_challenges", type: "textarea", text: "What makes insulin dosing adjustments challenging for you?", required: false }
    ]
  },
  {
    title: "MDI vs Pump Therapy Comparison",
    description: "Compare experiences between multiple daily injection and insulin pump therapy.",
    category: "Treatment",
    survey_type: "survey",
    research_category: "Treatment",
    estimated_time_minutes: 12,
    is_anonymous: true,
    requires_demographics: true,
    status: "active",
    target_responses: 400,
    consent_text: "Your comparison insights will help others make informed therapy choices.",
    questions: [
      { id: "current_therapy", type: "radio", text: "What is your current insulin delivery method?", required: true, options: ["MDI (multiple daily injections)", "Insulin pump (tubed)", "Insulin pump (tubeless)", "I've used both at different times"] },
      { id: "experience_with_both", type: "radio", text: "Have you used both MDI and pump therapy?", required: true, options: ["Yes, currently on pump, was on MDI", "Yes, currently on MDI, was on pump", "Yes, switched back and forth", "No, only MDI", "No, only pump"] },
      { id: "therapy_preference", type: "radio", text: "Which therapy method do you prefer overall?", required: true, options: ["Strongly prefer pump", "Slightly prefer pump", "No preference", "Slightly prefer MDI", "Strongly prefer MDI", "Only experienced one"] },
      { id: "a1c_difference", type: "radio", text: "How has your A1C differed between therapies?", required: true, options: ["Significantly better on pump", "Slightly better on pump", "About the same", "Slightly better on MDI", "Significantly better on MDI", "Only experienced one"] },
      { id: "flexibility_rating", type: "scale", text: "How would you rate the flexibility of your current therapy?", required: true, min: 1, max: 10, minLabel: "Very inflexible", maxLabel: "Very flexible" },
      { id: "lifestyle_fit", type: "scale", text: "How well does your current therapy fit your lifestyle?", required: true, min: 1, max: 10, minLabel: "Poor fit", maxLabel: "Perfect fit" },
      { id: "mdi_challenges", type: "checkbox", text: "What challenges have you experienced with MDI? (Select all that apply)", required: false, options: ["Carrying supplies", "Multiple injections daily", "Dosing precision", "Basal coverage", "Injection site issues", "Social stigma", "Never used MDI", "No significant challenges"] },
      { id: "pump_challenges", type: "checkbox", text: "What challenges have you experienced with pumps? (Select all that apply)", required: false, options: ["Site failures", "Tubing issues", "Device bulk", "Sleeping/comfort", "Cost/insurance", "Technical problems", "Never used pump", "No significant challenges"] },
      { id: "switch_consideration", type: "radio", text: "Are you considering switching therapy methods?", required: true, options: ["Yes, actively planning", "Yes, considering it", "Maybe in the future", "No, satisfied with current", "No, not an option for me"] }
    ]
  },
  {
    title: "Rapid-Acting Insulin Timing Study",
    description: "Explore pre-bolusing habits and meal timing strategies in the T1D community.",
    category: "Treatment",
    survey_type: "survey",
    research_category: "Treatment",
    estimated_time_minutes: 8,
    is_anonymous: true,
    requires_demographics: true,
    status: "active",
    target_responses: 450,
    consent_text: "Your timing strategies will help develop better mealtime dosing guidance.",
    questions: [
      { id: "insulin_type", type: "radio", text: "Which rapid-acting insulin do you use?", required: true, options: ["Humalog (lispro)", "Novolog (aspart)", "Fiasp", "Lyumjev", "Apidra", "Admelog", "Other biosimilar", "Inhaled (Afrezza)"] },
      { id: "prebolus_habit", type: "radio", text: "How often do you pre-bolus (take insulin before eating)?", required: true, options: ["Always", "Usually (75%+)", "Sometimes (50%)", "Occasionally (25%)", "Rarely", "Never"] },
      { id: "prebolus_timing", type: "radio", text: "When you pre-bolus, how far in advance do you typically dose?", required: true, options: ["5-10 minutes", "10-15 minutes", "15-20 minutes", "20-30 minutes", "30+ minutes", "I don't pre-bolus"] },
      { id: "prebolus_factors", type: "checkbox", text: "What factors affect your pre-bolus timing? (Select all that apply)", required: false, options: ["Current glucose level", "Type of food", "Time of day", "Activity level", "Convenience/forgetting", "Fear of hypoglycemia", "AID system handles it"] },
      { id: "post_meal_spike", type: "radio", text: "How often do you experience significant post-meal glucose spikes (>180 mg/dL)?", required: true, options: ["Rarely", "Sometimes", "Often", "Almost always", "I don't track post-meal"] },
      { id: "spike_bothers_you", type: "scale", text: "How much do post-meal spikes bother you?", required: true, min: 1, max: 10, minLabel: "Not at all", maxLabel: "Extremely bothersome" },
      { id: "timing_strategies", type: "textarea", text: "What timing strategies have worked best for you to minimize post-meal spikes?", required: false }
    ]
  },
  {
    title: "Ultra-Rapid Insulin Experience",
    description: "Assess real-world experiences with ultra-rapid insulin formulations like Fiasp and Lyumjev.",
    category: "Treatment",
    survey_type: "survey",
    research_category: "Treatment",
    estimated_time_minutes: 8,
    is_anonymous: true,
    requires_demographics: true,
    status: "active",
    target_responses: 350,
    consent_text: "Your experience will help others understand ultra-rapid insulin options.",
    questions: [
      { id: "ultra_rapid_used", type: "checkbox", text: "Which ultra-rapid insulin have you tried? (Select all that apply)", required: true, options: ["Fiasp (faster aspart)", "Lyumjev (faster lispro)", "Afrezza (inhaled)", "None - I use regular rapid-acting", "None - interested in trying"] },
      { id: "switch_reason", type: "checkbox", text: "Why did you try/consider ultra-rapid insulin? (Select all that apply)", required: false, options: ["Reduce post-meal spikes", "Doctor recommendation", "Heard positive reviews", "Reduce pre-bolus time", "Insurance coverage", "Pump compatibility", "Haven't tried"] },
      { id: "onset_difference", type: "radio", text: "Did you notice faster onset compared to regular rapid-acting?", required: true, options: ["Yes, significantly faster", "Yes, somewhat faster", "No noticeable difference", "It seemed slower", "Haven't compared"] },
      { id: "post_meal_improvement", type: "scale", text: "How much did ultra-rapid insulin improve your post-meal glucose?", required: true, min: 1, max: 10, minLabel: "No improvement", maxLabel: "Major improvement" },
      { id: "site_reactions", type: "radio", text: "Did you experience injection/infusion site reactions?", required: true, options: ["Yes, significant burning/stinging", "Yes, mild reactions", "No reactions", "Reactions stopped over time", "Haven't tried"] },
      { id: "still_using", type: "radio", text: "Are you still using ultra-rapid insulin?", required: true, options: ["Yes, exclusively", "Yes, sometimes", "No, went back to regular", "Never tried it", "Just started"] },
      { id: "recommendation", type: "scale", text: "How likely are you to recommend ultra-rapid insulin to others?", required: true, min: 1, max: 10, minLabel: "Not at all", maxLabel: "Highly recommend" }
    ]
  },
  {
    title: "Correction Factor Accuracy Assessment",
    description: "Help understand how accurate correction factors are across different situations.",
    category: "Treatment",
    survey_type: "survey",
    research_category: "Treatment",
    estimated_time_minutes: 8,
    is_anonymous: true,
    requires_demographics: true,
    status: "active",
    target_responses: 400,
    consent_text: "Your feedback will help improve correction factor recommendations.",
    questions: [
      { id: "correction_factor_known", type: "radio", text: "Do you know your insulin sensitivity/correction factor?", required: true, options: ["Yes, use one factor all day", "Yes, use different factors for different times", "Roughly know it", "Not sure what mine is", "AID handles corrections"] },
      { id: "factor_accuracy_morning", type: "scale", text: "How accurate is your correction factor in the morning?", required: true, min: 1, max: 10, minLabel: "Very inaccurate", maxLabel: "Very accurate" },
      { id: "factor_accuracy_afternoon", type: "scale", text: "How accurate is your correction factor in the afternoon/evening?", required: true, min: 1, max: 10, minLabel: "Very inaccurate", maxLabel: "Very accurate" },
      { id: "factor_accuracy_night", type: "scale", text: "How accurate is your correction factor at night?", required: true, min: 1, max: 10, minLabel: "Very inaccurate", maxLabel: "Very accurate" },
      { id: "overcorrection_frequency", type: "radio", text: "How often do corrections cause hypoglycemia?", required: true, options: ["Frequently", "Sometimes", "Rarely", "Never", "I don't take separate corrections"] },
      { id: "undercorrection_frequency", type: "radio", text: "How often do corrections fail to bring you to target?", required: true, options: ["Frequently", "Sometimes", "Rarely", "Never", "I don't take separate corrections"] },
      { id: "stacking_awareness", type: "radio", text: "How often do you consider insulin on board before correcting?", required: true, options: ["Always", "Usually", "Sometimes", "Rarely", "My pump/app calculates it"] },
      { id: "correction_strategies", type: "textarea", text: "What strategies help your corrections work better?", required: false }
    ]
  },
  {
    title: "Carb Counting Methods & Tools",
    description: "Explore the various methods and tools people use for carbohydrate counting.",
    category: "Treatment",
    survey_type: "survey",
    research_category: "Treatment",
    estimated_time_minutes: 10,
    is_anonymous: true,
    requires_demographics: true,
    status: "active",
    target_responses: 450,
    consent_text: "Your carb counting practices will help develop better tools and guidance.",
    questions: [
      { id: "carb_counting_method", type: "radio", text: "How do you primarily count carbs?", required: true, options: ["Estimate by looking", "Use a food scale", "Use nutrition labels only", "Use an app", "Count exchanges instead", "Don't count - use fixed doses", "AID estimates for me"] },
      { id: "counting_confidence", type: "scale", text: "How confident are you in your carb counting accuracy?", required: true, min: 1, max: 10, minLabel: "Not confident", maxLabel: "Very confident" },
      { id: "apps_used", type: "checkbox", text: "Which carb counting apps do you use? (Select all that apply)", required: false, options: ["MyFitnessPal", "Calorie King", "Lose It", "Carbs & Cals", "Figwee", "Built-in pump app", "Other app", "None - I don't use apps"] },
      { id: "food_scale_use", type: "radio", text: "How often do you use a food scale?", required: true, options: ["Always", "Often", "Sometimes", "Rarely", "Never", "Don't own one"] },
      { id: "challenging_foods", type: "checkbox", text: "Which foods are hardest to count accurately? (Select all that apply)", required: true, options: ["Restaurant meals", "Home-cooked meals", "Pizza", "Asian cuisine", "High-fat foods", "Fried foods", "Casseroles/mixed dishes", "Alcoholic drinks", "All foods are challenging"] },
      { id: "estimation_accuracy", type: "radio", text: "When you estimate carbs, how accurate are you typically?", required: true, options: ["Very accurate (within 10%)", "Reasonably accurate (within 25%)", "Somewhat accurate (within 50%)", "Often inaccurate", "I always measure, never estimate"] },
      { id: "counting_training", type: "radio", text: "Did you receive formal carb counting training?", required: true, options: ["Yes, comprehensive training", "Yes, basic training", "Some informal guidance", "Self-taught only", "Never learned formally"] },
      { id: "counting_tips", type: "textarea", text: "What carb counting tips or tricks work best for you?", required: false }
    ]
  },
  {
    title: "Insulin Storage & Handling Practices",
    description: "Understand how T1D individuals store and handle insulin in various conditions.",
    category: "Treatment",
    survey_type: "survey",
    research_category: "Treatment",
    estimated_time_minutes: 6,
    is_anonymous: true,
    requires_demographics: true,
    status: "active",
    target_responses: 400,
    consent_text: "Your practices will help develop better storage guidance.",
    questions: [
      { id: "storage_awareness", type: "radio", text: "How well do you know the storage requirements for your insulin?", required: true, options: ["Very well", "Generally aware", "Somewhat aware", "Not very aware", "Not sure"] },
      { id: "room_temp_duration", type: "radio", text: "How long do you keep in-use insulin at room temperature?", required: true, options: ["Less than 2 weeks", "2-4 weeks", "Up to manufacturer limit (usually 28 days)", "I don't track it", "I keep it refrigerated always"] },
      { id: "extreme_temp_exposure", type: "radio", text: "Has your insulin been exposed to extreme temperatures in the past year?", required: true, options: ["Yes, multiple times", "Yes, once or twice", "Possibly, not sure", "No, I'm very careful", "I use cooling cases"] },
      { id: "travel_storage", type: "checkbox", text: "How do you store insulin when traveling? (Select all that apply)", required: true, options: ["Insulated bag/case", "Frio cooling wallet", "Hotel refrigerator", "Cooler with ice packs", "Just in my bag", "Temperature monitoring device", "I rarely travel"] },
      { id: "suspected_degraded", type: "radio", text: "Have you suspected your insulin lost potency before expiration?", required: true, options: ["Yes, multiple times", "Yes, once or twice", "Not sure", "No, never"] },
      { id: "vial_vs_pen", type: "radio", text: "Do you primarily use vials or pens?", required: true, options: ["Vials only", "Pens only", "Both", "Pump cartridges only"] },
      { id: "storage_challenges", type: "textarea", text: "What storage challenges do you face with your insulin?", required: false }
    ]
  },
  {
    title: "Split Bolus Strategies for Complex Meals",
    description: "Explore how T1D individuals handle high-fat, high-protein, and complex meals.",
    category: "Treatment",
    survey_type: "survey",
    research_category: "Treatment",
    estimated_time_minutes: 10,
    is_anonymous: true,
    requires_demographics: true,
    status: "active",
    target_responses: 400,
    consent_text: "Your strategies will help others manage challenging meals.",
    questions: [
      { id: "split_bolus_use", type: "radio", text: "How often do you use split/extended/dual-wave boluses?", required: true, options: ["Always for qualifying meals", "Often", "Sometimes", "Rarely", "Never", "My pump doesn't have this feature"] },
      { id: "meal_types_split", type: "checkbox", text: "For which meals do you typically split bolus? (Select all that apply)", required: false, options: ["Pizza", "High-fat meals", "High-protein meals", "Large meals", "Slow-digesting foods", "Restaurant meals", "I don't split bolus"] },
      { id: "split_ratio", type: "radio", text: "What's your typical split ratio (upfront vs extended)?", required: true, options: ["70-30", "60-40", "50-50", "40-60", "30-70", "It varies significantly", "I don't split bolus"] },
      { id: "extension_duration", type: "radio", text: "How long do you typically extend the second part of a split bolus?", required: true, options: ["1-2 hours", "2-3 hours", "3-4 hours", "4+ hours", "It varies by meal", "I don't split bolus"] },
      { id: "split_success_rate", type: "scale", text: "How successful are your split bolus strategies overall?", required: true, min: 1, max: 10, minLabel: "Rarely work well", maxLabel: "Usually work great" },
      { id: "trial_and_error", type: "radio", text: "How much trial and error did it take to find effective strategies?", required: true, options: ["A lot - still figuring it out", "Moderate experimentation", "Some trial and error", "Found what works quickly", "I don't use these strategies"] },
      { id: "pizza_strategy", type: "textarea", text: "Describe your strategy for handling pizza or similarly challenging foods:", required: false }
    ]
  },
  {
    title: "Basal Rate Testing Practices",
    description: "Understand how T1D individuals test and optimize their basal insulin rates.",
    category: "Treatment",
    survey_type: "survey",
    research_category: "Treatment",
    estimated_time_minutes: 8,
    is_anonymous: true,
    requires_demographics: true,
    status: "active",
    target_responses: 350,
    consent_text: "Your testing practices will help develop better basal optimization guidance.",
    questions: [
      { id: "basal_testing_frequency", type: "radio", text: "How often do you formally test/verify your basal rates?", required: true, options: ["Monthly", "Every few months", "Yearly", "When things seem off", "Never done formal testing", "AID auto-adjusts my basal"] },
      { id: "testing_method", type: "radio", text: "How do you test basal rates?", required: true, options: ["Skip meals and monitor", "Use CGM data patterns", "Doctor analyzes reports", "Gut feeling/adjustment", "I don't test basal rates", "AID handles it"] },
      { id: "basal_stability", type: "scale", text: "How stable is your overnight basal (do you wake up close to where you fell asleep)?", required: true, min: 1, max: 10, minLabel: "Very unstable", maxLabel: "Very stable" },
      { id: "dawn_phenomenon", type: "radio", text: "Do you experience dawn phenomenon (rising glucose in early morning)?", required: true, options: ["Yes, significant rise", "Yes, moderate rise", "Mild rise", "No", "Not sure"] },
      { id: "feet_on_floor", type: "radio", text: "Do you experience 'feet on floor' syndrome (glucose rise upon waking)?", required: true, options: ["Yes, significant rise", "Yes, moderate rise", "Mild rise", "No", "Not sure"] },
      { id: "basal_adjustments", type: "checkbox", text: "For what situations do you adjust basal rates? (Select all that apply)", required: false, options: ["Exercise/activity days", "Sick days", "Menstrual cycle", "Travel/time zones", "Stress", "Weather changes", "I don't adjust basal", "AID adjusts automatically"] },
      { id: "basal_confidence", type: "scale", text: "How confident are you that your basal rates are optimized?", required: true, min: 1, max: 10, minLabel: "Not confident", maxLabel: "Very confident" }
    ]
  },
  {
    title: "Adjunct Therapy Experience (GLP-1/SGLT2)",
    description: "Explore experiences with medications used alongside insulin for T1D management.",
    category: "Treatment",
    survey_type: "survey",
    research_category: "Treatment",
    estimated_time_minutes: 10,
    is_anonymous: true,
    requires_demographics: true,
    status: "active",
    target_responses: 300,
    consent_text: "Your experience will help others understand adjunct therapy options.",
    questions: [
      { id: "adjunct_used", type: "checkbox", text: "Which adjunct medications have you tried for T1D? (Select all that apply)", required: true, options: ["Ozempic (semaglutide)", "Wegovy (semaglutide)", "Trulicity (dulaglutide)", "Victoza (liraglutide)", "Mounjaro (tirzepatide)", "Invokana (canagliflozin)", "Jardiance (empagliflozin)", "Metformin", "None", "Other"] },
      { id: "adjunct_reason", type: "checkbox", text: "Why did you start adjunct therapy? (Select all that apply)", required: false, options: ["Weight management", "Reduce insulin doses", "Improve glucose stability", "Doctor recommendation", "Cardiovascular protection", "Research/curiosity", "Haven't started"] },
      { id: "insulin_reduction", type: "radio", text: "Did adjunct therapy reduce your total daily insulin?", required: true, options: ["Yes, significantly (>30%)", "Yes, moderately (15-30%)", "Yes, slightly (<15%)", "No change", "Insulin increased", "Haven't tried adjuncts"] },
      { id: "glucose_stability", type: "scale", text: "How much did adjunct therapy improve your glucose stability?", required: true, min: 1, max: 10, minLabel: "No improvement", maxLabel: "Major improvement" },
      { id: "side_effects", type: "checkbox", text: "What side effects did you experience? (Select all that apply)", required: false, options: ["Nausea", "GI issues", "Appetite loss", "DKA risk concern", "UTI/genital infections", "Weight loss (desired)", "Weight loss (undesired)", "None significant", "Haven't tried adjuncts"] },
      { id: "dka_monitoring", type: "radio", text: "If using SGLT2 inhibitors, how do you monitor for DKA risk?", required: true, options: ["Regular ketone testing", "Ketone monitoring if feeling unwell", "Trust CGM patterns", "Don't specifically monitor", "Not using SGLT2 inhibitors"] },
      { id: "endo_support", type: "radio", text: "Does your endocrinologist support adjunct therapy for your T1D?", required: true, options: ["Yes, prescribed it", "Yes, monitors it", "Neutral", "Skeptical but allows it", "Against it", "Haven't discussed"] },
      { id: "adjunct_recommendation", type: "scale", text: "How likely are you to recommend adjunct therapy to other T1D adults?", required: true, min: 1, max: 10, minLabel: "Not at all", maxLabel: "Highly recommend" }
    ]
  },

  // ============================================
  // QUALITY OF LIFE SURVEYS (11 total)
  // ============================================
  {
    title: "Diabetes Burnout Assessment",
    description: "Help researchers understand the prevalence and causes of diabetes burnout to develop better support strategies.",
    category: "Quality of Life",
    survey_type: "survey",
    research_category: "Quality of Life",
    estimated_time_minutes: 10,
    is_anonymous: true,
    requires_demographics: true,
    status: "active",
    target_responses: 600,
    consent_text: "Your honest responses will help develop better mental health support for the T1D community.",
    questions: [
      { id: "burnout_frequency", type: "radio", text: "How often do you feel overwhelmed by diabetes management?", required: true, options: ["Rarely or never", "Sometimes (monthly)", "Often (weekly)", "Very often (daily)", "Constantly"] },
      { id: "burnout_manifestations", type: "checkbox", text: "When experiencing diabetes fatigue, which behaviors do you recognize in yourself? (Select all that apply)", required: true, options: ["Skipping glucose checks", "Missing insulin doses", "Ignoring high/low alerts", "Avoiding looking at CGM data", "Eating without bolusing", "Missing endo appointments", "Feeling hopeless about control", "None of these"] },
      { id: "burnout_triggers", type: "checkbox", text: "What triggers your diabetes burnout? (Select all that apply)", required: true, options: ["Unexplained glucose variations", "Device issues", "Healthcare costs", "Judgment from others", "Feeling different", "Constant decision-making", "Fear of complications", "Work/life stress", "Relationship stress"] },
      { id: "coping_strategies", type: "checkbox", text: "What helps you cope with diabetes burnout? (Select all that apply)", required: true, options: ["Taking breaks from data", "Therapy/counseling", "Support groups", "Exercise", "Talking to other T1Ds", "Simplifying routine", "Medication adjustment", "Nothing has helped", "I haven't experienced burnout"] },
      { id: "mental_health_support", type: "radio", text: "Do you have access to mental health support that understands diabetes?", required: true, options: ["Yes, specialized diabetes support", "Yes, general mental health support", "Limited access", "No access but want it", "Haven't sought support"] },
      { id: "burnout_impact", type: "scale", text: "How much has diabetes burnout affected your A1C or time in range?", required: true, min: 1, max: 10, minLabel: "No impact", maxLabel: "Severe impact" },
      { id: "recovery_strategies", type: "textarea", text: "What has helped you recover from diabetes burnout in the past?", required: false }
    ]
  },
  {
    title: "Workplace Diabetes Management Challenges",
    description: "Understand the unique challenges of managing T1D in professional settings.",
    category: "Quality of Life",
    survey_type: "survey",
    research_category: "Quality of Life",
    estimated_time_minutes: 10,
    is_anonymous: true,
    requires_demographics: true,
    status: "active",
    target_responses: 450,
    consent_text: "Your experiences will help improve workplace accommodations for people with T1D.",
    questions: [
      { id: "employment_status", type: "radio", text: "What is your current employment status?", required: true, options: ["Full-time employed", "Part-time employed", "Self-employed", "Student", "Not currently employed", "Retired"] },
      { id: "disclosure_to_employer", type: "radio", text: "Have you disclosed your T1D to your employer?", required: true, options: ["Yes, to HR and manager", "Yes, to manager only", "Yes, to coworkers", "Only to close colleagues", "No, I haven't disclosed", "N/A - self-employed/not working"] },
      { id: "workplace_accommodations", type: "checkbox", text: "What workplace accommodations have you used or needed? (Select all that apply)", required: false, options: ["Breaks for glucose checks", "Snacks at desk", "Flexible schedule for appointments", "Working from home", "Time for insulin dosing", "Refrigerator for insulin", "None needed", "Needed but not provided"] },
      { id: "discrimination_experience", type: "radio", text: "Have you experienced diabetes-related discrimination at work?", required: true, options: ["Yes, significant discrimination", "Yes, minor incidents", "Subtle/micro-aggressions", "No discrimination", "Not sure"] },
      { id: "work_impact_on_control", type: "scale", text: "How much does your work environment impact your glucose control?", required: true, min: 1, max: 10, minLabel: "No impact", maxLabel: "Major negative impact" },
      { id: "stress_glucose_connection", type: "radio", text: "How often does work stress affect your glucose levels?", required: true, options: ["Daily", "Several times a week", "Weekly", "Occasionally", "Rarely/never"] },
      { id: "job_choice_impact", type: "radio", text: "Has T1D influenced your career or job choices?", required: true, options: ["Yes, significantly", "Yes, somewhat", "Slightly", "Not at all"] },
      { id: "workplace_suggestions", type: "textarea", text: "What workplace changes would most improve your diabetes management?", required: false }
    ]
  },
  {
    title: "Diabetes & Dating/Relationships Survey",
    description: "Explore how T1D affects romantic relationships and dating experiences.",
    category: "Quality of Life",
    survey_type: "survey",
    research_category: "Quality of Life",
    estimated_time_minutes: 12,
    is_anonymous: true,
    requires_demographics: true,
    status: "active",
    target_responses: 400,
    consent_text: "Your experiences will help others navigate dating and relationships with T1D.",
    questions: [
      { id: "relationship_status", type: "radio", text: "What is your current relationship status?", required: true, options: ["Single", "Dating", "In a relationship", "Married/partnered", "Divorced/separated", "Prefer not to say"] },
      { id: "disclosure_timing", type: "radio", text: "When dating, when do you typically disclose your T1D?", required: true, options: ["Before first date", "On first date", "After a few dates", "When it comes up naturally", "Only when relationship gets serious", "I don't hide it - visible devices", "N/A"] },
      { id: "disclosure_anxiety", type: "scale", text: "How anxious do you feel about disclosing T1D to a new romantic interest?", required: true, min: 1, max: 10, minLabel: "Not anxious", maxLabel: "Extremely anxious" },
      { id: "rejection_experience", type: "radio", text: "Have you experienced rejection related to your T1D?", required: true, options: ["Yes, explicitly due to T1D", "Yes, I suspect T1D was a factor", "No, never", "Not sure", "N/A - haven't dated since diagnosis"] },
      { id: "partner_involvement", type: "radio", text: "How involved is/was your partner in your diabetes management?", required: true, options: ["Very involved - helps actively", "Somewhat involved - supportive", "Aware but not involved", "Prefers not to be involved", "Not applicable"] },
      { id: "intimacy_impact", type: "scale", text: "How much does T1D affect intimacy in your relationships?", required: true, min: 1, max: 10, minLabel: "No impact", maxLabel: "Significant impact" },
      { id: "hypo_partner", type: "radio", text: "Does your partner know how to help during hypoglycemia?", required: true, options: ["Yes, fully trained including glucagon", "Yes, knows basics", "Somewhat aware", "No", "Not applicable"] },
      { id: "relationship_advice", type: "textarea", text: "What advice would you give to someone with T1D about dating/relationships?", required: false }
    ]
  },
  {
    title: "Travel with Diabetes Experience",
    description: "Share your experiences traveling with T1D to help others prepare for their journeys.",
    category: "Quality of Life",
    survey_type: "survey",
    research_category: "Quality of Life",
    estimated_time_minutes: 10,
    is_anonymous: true,
    requires_demographics: true,
    status: "active",
    target_responses: 400,
    consent_text: "Your travel experiences will help create better resources for traveling with T1D.",
    questions: [
      { id: "travel_frequency", type: "radio", text: "How often do you travel (domestic or international)?", required: true, options: ["Rarely or never", "1-2 times per year", "3-5 times per year", "6-10 times per year", "More than 10 times per year"] },
      { id: "travel_type", type: "checkbox", text: "What types of travel do you typically do? (Select all that apply)", required: true, options: ["Domestic flights", "International flights", "Road trips", "Cruises", "Camping/outdoors", "Business travel", "Adventure travel"] },
      { id: "tsa_experience", type: "radio", text: "How would you rate your experiences with TSA/airport security?", required: true, options: ["Always smooth", "Usually fine", "Sometimes difficult", "Often problematic", "Haven't flown with diabetes supplies"] },
      { id: "supply_packing", type: "checkbox", text: "What challenges do you face packing diabetes supplies? (Select all that apply)", required: false, options: ["Calculating how much to bring", "Keeping insulin cool", "Security concerns", "Space limitations", "Forgetting items", "Documentation requirements", "No significant challenges"] },
      { id: "time_zone_adjustment", type: "scale", text: "How difficult is adjusting insulin for time zone changes?", required: true, min: 1, max: 10, minLabel: "Very easy", maxLabel: "Very difficult" },
      { id: "travel_mishaps", type: "checkbox", text: "What travel mishaps have you experienced? (Select all that apply)", required: false, options: ["Ran out of supplies", "Insulin exposed to extreme temperature", "Device malfunction", "Lost supplies", "Severe high/low glucose", "Needed medical care abroad", "None"] },
      { id: "travel_confidence", type: "scale", text: "How confident do you feel traveling with T1D?", required: true, min: 1, max: 10, minLabel: "Not confident", maxLabel: "Very confident" },
      { id: "travel_tips", type: "textarea", text: "What's your best travel tip for someone with T1D?", required: false }
    ]
  },
  {
    title: "Diabetes & Parenting Challenges",
    description: "Explore the unique challenges of managing T1D while raising children.",
    category: "Quality of Life",
    survey_type: "survey",
    research_category: "Quality of Life",
    estimated_time_minutes: 12,
    is_anonymous: true,
    requires_demographics: true,
    status: "active",
    target_responses: 350,
    consent_text: "Your experiences will help develop resources for T1D parents.",
    questions: [
      { id: "parenting_status", type: "radio", text: "What is your parenting status?", required: true, options: ["Parent of young children (0-5)", "Parent of school-age children (6-12)", "Parent of teens (13-18)", "Parent of adult children", "Planning to become a parent", "Not a parent", "Other caregiver role"] },
      { id: "self_care_impact", type: "scale", text: "How much does parenting impact your diabetes self-care?", required: true, min: 1, max: 10, minLabel: "No impact", maxLabel: "Severe impact" },
      { id: "parenting_challenges", type: "checkbox", text: "Which parenting-related diabetes challenges do you face? (Select all that apply)", required: false, options: ["Finding time for glucose checks", "Eating regular meals", "Managing during child's illness", "Sleep deprivation effects", "Explaining T1D to children", "Fear of hypos around children", "Modeling healthy behaviors", "Not applicable"] },
      { id: "hypo_while_parenting", type: "radio", text: "How often do you experience hypoglycemia while caring for children?", required: true, options: ["Rarely", "Monthly", "Weekly", "Multiple times per week", "Not applicable"] },
      { id: "child_awareness", type: "radio", text: "Are your children aware of your T1D and what to do in an emergency?", required: true, options: ["Yes, fully trained age-appropriately", "Yes, basic awareness", "Somewhat aware", "Too young to understand", "Not applicable"] },
      { id: "support_system", type: "radio", text: "Do you have a support system for diabetes emergencies while parenting?", required: true, options: ["Yes, strong support system", "Yes, adequate support", "Limited support", "No support system", "Not applicable"] },
      { id: "parenting_advice", type: "textarea", text: "What advice would you give to T1D parents struggling to manage both?", required: false }
    ]
  },
  {
    title: "Social Event Management Survey",
    description: "Understand how T1D individuals navigate social situations and gatherings.",
    category: "Quality of Life",
    survey_type: "survey",
    research_category: "Quality of Life",
    estimated_time_minutes: 8,
    is_anonymous: true,
    requires_demographics: true,
    status: "active",
    target_responses: 450,
    consent_text: "Your social strategies will help others feel more confident in social settings.",
    questions: [
      { id: "social_anxiety", type: "scale", text: "How anxious do you feel about managing T1D in social settings?", required: true, min: 1, max: 10, minLabel: "Not anxious", maxLabel: "Very anxious" },
      { id: "avoid_events", type: "radio", text: "Do you ever avoid social events because of your T1D?", required: true, options: ["Often", "Sometimes", "Rarely", "Never"] },
      { id: "public_management", type: "checkbox", text: "Which diabetes tasks are you comfortable doing publicly? (Select all that apply)", required: true, options: ["Checking CGM", "Fingerstick testing", "Injecting insulin", "Operating pump", "Treating a low", "Discussing my T1D", "All of the above", "None - I prefer privacy"] },
      { id: "food_at_events", type: "radio", text: "How do you typically handle food at social events?", required: true, options: ["Eat what's served, dose accordingly", "Eat carefully, avoid tricky foods", "Bring my own food sometimes", "Eat beforehand to minimize dosing", "Varies by situation"] },
      { id: "alcohol_social", type: "radio", text: "How do you approach alcohol at social events?", required: true, options: ["Drink freely, manage glucose", "Drink moderately with caution", "Rarely drink due to T1D", "Don't drink for non-T1D reasons", "Have stopped drinking because of T1D"] },
      { id: "questions_from_others", type: "scale", text: "How comfortable are you answering questions about your T1D at social events?", required: true, min: 1, max: 10, minLabel: "Very uncomfortable", maxLabel: "Very comfortable" },
      { id: "social_strategies", type: "textarea", text: "What strategies help you manage T1D at social events?", required: false }
    ]
  },
  {
    title: "Diabetes & Sleep Quality Study",
    description: "Explore the relationship between T1D management and sleep quality.",
    category: "Quality of Life",
    survey_type: "survey",
    research_category: "Quality of Life",
    estimated_time_minutes: 10,
    is_anonymous: true,
    requires_demographics: true,
    status: "active",
    target_responses: 500,
    consent_text: "Your sleep patterns will help understand T1D's impact on rest and recovery.",
    questions: [
      { id: "sleep_quality", type: "scale", text: "How would you rate your overall sleep quality?", required: true, min: 1, max: 10, minLabel: "Very poor", maxLabel: "Excellent" },
      { id: "sleep_hours", type: "radio", text: "On average, how many hours of sleep do you get per night?", required: true, options: ["Less than 5 hours", "5-6 hours", "6-7 hours", "7-8 hours", "More than 8 hours"] },
      { id: "night_waking_frequency", type: "radio", text: "How often do you wake up due to T1D (alarms, symptoms, treatment)?", required: true, options: ["Rarely (monthly or less)", "Sometimes (weekly)", "Often (several times a week)", "Almost every night", "Multiple times per night"] },
      { id: "waking_reasons", type: "checkbox", text: "What T1D-related reasons wake you up? (Select all that apply)", required: false, options: ["CGM high alarms", "CGM low alarms", "Feeling symptoms of low", "Feeling symptoms of high", "Need to eat/treat low", "Compression low alarms", "Pump alarms", "Anxiety about overnight glucose"] },
      { id: "sleep_impact_on_glucose", type: "scale", text: "How much does poor sleep affect your next-day glucose control?", required: true, min: 1, max: 10, minLabel: "No impact", maxLabel: "Major impact" },
      { id: "glucose_impact_on_sleep", type: "scale", text: "How much do your glucose levels affect your sleep quality?", required: true, min: 1, max: 10, minLabel: "No impact", maxLabel: "Major impact" },
      { id: "sleep_strategies", type: "checkbox", text: "What strategies do you use for better sleep with T1D? (Select all that apply)", required: false, options: ["Adjust alarm settings at night", "Evening snack routine", "Consistent bedtime glucose target", "Sleep schedule consistency", "Limiting screen time", "CGM share with partner", "Nothing specific", "Still looking for solutions"] },
      { id: "sleep_improvement_wish", type: "textarea", text: "What would most improve your sleep quality as a T1D?", required: false }
    ]
  },
  {
    title: "Spontaneity Impact Assessment",
    description: "Understand how T1D affects spontaneous activities and decisions.",
    category: "Quality of Life",
    survey_type: "survey",
    research_category: "Quality of Life",
    estimated_time_minutes: 8,
    is_anonymous: true,
    requires_demographics: true,
    status: "active",
    target_responses: 400,
    consent_text: "Your experiences will help develop strategies for maintaining spontaneity with T1D.",
    questions: [
      { id: "spontaneity_loss", type: "scale", text: "How much has T1D reduced your ability to be spontaneous?", required: true, min: 1, max: 10, minLabel: "No impact", maxLabel: "Severe impact" },
      { id: "planning_requirement", type: "radio", text: "How much advance planning does your T1D require for activities?", required: true, options: ["Minimal - I can do almost anything spontaneously", "Some - need basic supplies", "Moderate - need to plan food/insulin", "Significant - most activities need planning", "Extensive - everything needs detailed planning"] },
      { id: "spontaneous_activities_avoided", type: "checkbox", text: "What spontaneous activities do you avoid because of T1D? (Select all that apply)", required: false, options: ["Unplanned exercise", "Impromptu restaurant visits", "Last-minute travel", "Spontaneous swimming", "Drinking with friends", "Skipping meals", "Staying up late", "None - I don't limit myself"] },
      { id: "supply_readiness", type: "radio", text: "How prepared are you to handle T1D during unplanned activities?", required: true, options: ["Always have everything I need", "Usually prepared for basics", "Sometimes caught without supplies", "Often unprepared", "Rarely leave home without extensive supplies"] },
      { id: "regained_spontaneity", type: "checkbox", text: "What has helped you regain spontaneity? (Select all that apply)", required: false, options: ["CGM technology", "Insulin pump", "AID/closed loop", "Better glucose stability", "Experience/confidence", "Accepting imperfect control", "Always carrying supplies", "Nothing has helped"] },
      { id: "spontaneity_advice", type: "textarea", text: "What advice would you give to someone struggling with loss of spontaneity?", required: false }
    ]
  },
  {
    title: "Diabetes Disclosure Preferences",
    description: "Explore how, when, and to whom people disclose their T1D.",
    category: "Quality of Life",
    survey_type: "survey",
    research_category: "Quality of Life",
    estimated_time_minutes: 8,
    is_anonymous: true,
    requires_demographics: true,
    status: "active",
    target_responses: 450,
    consent_text: "Your disclosure experiences will help others navigate this personal decision.",
    questions: [
      { id: "general_disclosure", type: "radio", text: "In general, how open are you about your T1D?", required: true, options: ["Very open - tell everyone", "Moderately open - tell most people", "Selective - only certain people", "Private - rarely disclose", "Varies significantly by context"] },
      { id: "disclosure_groups", type: "checkbox", text: "Who knows about your T1D? (Select all that apply)", required: true, options: ["Immediate family", "Extended family", "Close friends", "Coworkers", "Boss/supervisor", "Neighbors", "Acquaintances", "Social media followers", "Very few people"] },
      { id: "disclosure_method", type: "radio", text: "How do you typically disclose your T1D?", required: true, options: ["Proactively tell people", "Wait for questions about devices", "Only if directly relevant", "Avoid discussing unless necessary", "Depends on the situation"] },
      { id: "disclosure_comfort", type: "scale", text: "How comfortable are you disclosing your T1D to new people?", required: true, min: 1, max: 10, minLabel: "Very uncomfortable", maxLabel: "Very comfortable" },
      { id: "negative_reactions", type: "radio", text: "Have you experienced negative reactions to disclosure?", required: true, options: ["Yes, frequently", "Yes, occasionally", "Rarely", "Never", "I rarely disclose"] },
      { id: "disclosure_benefits", type: "checkbox", text: "What benefits have you experienced from disclosure? (Select all that apply)", required: false, options: ["Emergency safety", "Accommodations at work/school", "Understanding from others", "Found other T1Ds", "Reduced hiding stress", "Advocacy opportunities", "No significant benefits", "I rarely disclose"] },
      { id: "disclosure_evolution", type: "radio", text: "Has your disclosure approach changed over time?", required: true, options: ["More open now than before", "About the same", "More private now than before", "Varies too much to say"] }
    ]
  },
  {
    title: "Healthcare Provider Communication Survey",
    description: "Assess the quality of communication with diabetes healthcare providers.",
    category: "Quality of Life",
    survey_type: "survey",
    research_category: "Quality of Life",
    estimated_time_minutes: 10,
    is_anonymous: true,
    requires_demographics: true,
    status: "active",
    target_responses: 500,
    consent_text: "Your feedback will help improve patient-provider communication in diabetes care.",
    questions: [
      { id: "provider_type", type: "checkbox", text: "Which providers are part of your diabetes care team? (Select all that apply)", required: true, options: ["Endocrinologist", "Diabetes educator/CDE", "Primary care physician", "Nurse practitioner/PA", "Dietitian", "Mental health professional", "Pharmacist", "Other specialists"] },
      { id: "appointment_frequency", type: "radio", text: "How often do you see your main diabetes provider?", required: true, options: ["Monthly", "Every 2-3 months", "Every 6 months", "Annually", "Less than annually", "As needed only"] },
      { id: "feeling_heard", type: "scale", text: "How well does your provider listen to your concerns?", required: true, min: 1, max: 10, minLabel: "Not at all", maxLabel: "Completely" },
      { id: "knowledge_level", type: "scale", text: "How knowledgeable is your provider about current T1D technology and treatments?", required: true, min: 1, max: 10, minLabel: "Not knowledgeable", maxLabel: "Very knowledgeable" },
      { id: "communication_challenges", type: "checkbox", text: "What communication challenges do you face? (Select all that apply)", required: false, options: ["Not enough time during appointments", "Provider doesn't understand my lifestyle", "Feeling judged about glucose control", "Difficulty getting timely responses", "Language/cultural barriers", "Provider dismisses my concerns", "I feel rushed", "No significant challenges"] },
      { id: "shared_decision", type: "scale", text: "How much does your provider involve you in treatment decisions?", required: true, min: 1, max: 10, minLabel: "Not at all", maxLabel: "Full partnership" },
      { id: "provider_switch", type: "radio", text: "Have you ever switched providers due to communication issues?", required: true, options: ["Yes, multiple times", "Yes, once", "Considered it but didn't", "No, satisfied with current", "Limited options in my area"] },
      { id: "ideal_communication", type: "textarea", text: "Describe what ideal communication with your diabetes provider would look like:", required: false }
    ]
  },
  {
    title: "Diabetes Support Network Assessment",
    description: "Evaluate the support networks available to people with T1D.",
    category: "Quality of Life",
    survey_type: "survey",
    research_category: "Quality of Life",
    estimated_time_minutes: 8,
    is_anonymous: true,
    requires_demographics: true,
    status: "active",
    target_responses: 450,
    consent_text: "Your experiences will help identify gaps in T1D support systems.",
    questions: [
      { id: "support_sources", type: "checkbox", text: "Where do you get support for your T1D? (Select all that apply)", required: true, options: ["Family members", "Friends without T1D", "Friends with T1D", "Online T1D communities", "In-person support groups", "Healthcare providers", "T1D organizations", "Therapist/counselor", "I don't have T1D-specific support"] },
      { id: "support_adequacy", type: "scale", text: "How adequate is your overall support network?", required: true, min: 1, max: 10, minLabel: "Very inadequate", maxLabel: "Very adequate" },
      { id: "isolation_frequency", type: "radio", text: "How often do you feel isolated because of your T1D?", required: true, options: ["Rarely or never", "Sometimes", "Often", "Very often", "Almost always"] },
      { id: "online_communities", type: "checkbox", text: "Which online T1D communities do you participate in? (Select all that apply)", required: false, options: ["Reddit (r/diabetes_t1, r/diabetes)", "Facebook groups", "Glu/BeyondType1 platform", "Twitter/X diabetes community", "Instagram diabetes community", "TuDiabetes", "Discord servers", "Other forums", "None"] },
      { id: "in_person_connection", type: "radio", text: "Do you know other people with T1D in person?", required: true, options: ["Yes, many (5+)", "Yes, a few (2-4)", "Yes, one person", "No, but I'd like to", "No, and I don't feel the need"] },
      { id: "family_understanding", type: "scale", text: "How well does your family understand your T1D challenges?", required: true, min: 1, max: 10, minLabel: "Not at all", maxLabel: "Completely understand" },
      { id: "support_gap", type: "textarea", text: "What type of support do you wish you had but currently don't?", required: false }
    ]
  },

  // ============================================
  // SAFETY SURVEYS (11 total)
  // ============================================
  {
    title: "Hypoglycemia Experience Study",
    description: "Help researchers understand hypoglycemia patterns and prevention strategies in the T1D community.",
    category: "Safety",
    survey_type: "survey",
    research_category: "Safety",
    estimated_time_minutes: 10,
    is_anonymous: true,
    requires_demographics: true,
    status: "active",
    target_responses: 500,
    consent_text: "Your hypoglycemia experiences will help improve prevention and treatment strategies.",
    questions: [
      { id: "hypo_frequency", type: "radio", text: "How often do you experience blood glucose below 70 mg/dL?", required: true, options: ["Rarely (less than monthly)", "Monthly", "Weekly", "Several times a week", "Daily", "Multiple times daily"] },
      { id: "severe_hypo_frequency", type: "radio", text: "In the past year, how many severe lows required assistance from another person?", required: true, options: ["None", "1", "2-3", "4-5", "More than 5"] },
      { id: "hypo_awareness", type: "radio", text: "How would you describe your hypoglycemia awareness?", required: true, options: ["Full awareness - always feel lows early", "Good awareness - usually feel lows", "Reduced awareness - sometimes miss lows", "Hypoglycemia unawareness - rarely feel lows", "Variable - awareness comes and goes"] },
      { id: "early_symptoms", type: "checkbox", text: "What are your earliest hypoglycemia symptoms? (Select all that apply)", required: true, options: ["Shakiness/trembling", "Sweating", "Hunger", "Anxiety/irritability", "Confusion", "Dizziness", "Fast heartbeat", "Weakness", "I don't feel symptoms until very low", "CGM alerts me before symptoms"] },
      { id: "treatment_choice", type: "checkbox", text: "What do you typically use to treat low blood sugar? (Select all that apply)", required: true, options: ["Glucose tablets", "Juice/soda", "Candy (Skittles, etc.)", "Gummies/fruit snacks", "Gel packets", "Honey/sugar", "Regular food", "Whatever is available"] },
      { id: "overtreatment", type: "radio", text: "How often do you overtreat low blood sugar?", required: true, options: ["Rarely", "Sometimes", "Often", "Almost always"] },
      { id: "glucagon_available", type: "radio", text: "Do you have unexpired glucagon available?", required: true, options: ["Yes, and I carry it", "Yes, at home", "I have expired glucagon", "No, I don't have glucagon"] },
      { id: "hypo_prevention", type: "textarea", text: "What strategies have been most effective for preventing hypoglycemia?", required: false }
    ]
  },
  {
    title: "Night-time Hypoglycemia Patterns",
    description: "Study nocturnal hypoglycemia to develop better prevention strategies.",
    category: "Safety",
    survey_type: "survey",
    research_category: "Safety",
    estimated_time_minutes: 10,
    is_anonymous: true,
    requires_demographics: true,
    status: "active",
    target_responses: 500,
    consent_text: "Your experiences will help improve overnight glucose safety.",
    questions: [
      { id: "overnight_low_frequency", type: "radio", text: "How often do you experience overnight lows (while sleeping)?", required: true, options: ["Rarely (less than monthly)", "Monthly", "Weekly", "Several times a week", "Almost nightly"] },
      { id: "wake_from_low", type: "radio", text: "Do you wake up from overnight lows?", required: true, options: ["Always wake from symptoms", "Usually wake from symptoms", "Usually wake from CGM alarm", "Sometimes sleep through alarms", "Often sleep through alarms", "Rarely experience overnight lows"] },
      { id: "morning_discovery", type: "radio", text: "How often do you discover a low occurred only from CGM data the next morning?", required: true, options: ["Never", "Rarely", "Sometimes", "Often", "I don't use CGM overnight"] },
      { id: "overnight_fear", type: "scale", text: "How much fear of overnight lows affects your sleep?", required: true, min: 1, max: 10, minLabel: "No fear", maxLabel: "Severe fear" },
      { id: "bedtime_routine", type: "checkbox", text: "What's part of your bedtime routine for glucose safety? (Select all that apply)", required: false, options: ["Check glucose before bed", "Eat a snack if below target", "Adjust basal if needed", "Use sleep/night mode on AID", "Have glucose at bedside", "Set specific overnight alarms", "CGM shared with someone", "Nothing specific"] },
      { id: "overnight_treatment", type: "radio", text: "When you wake for an overnight low, what do you typically do?", required: true, options: ["Treat and go back to sleep", "Treat and stay awake until stable", "Over-treat to ensure recovery", "Varies depending on the situation", "I rarely wake for lows"] },
      { id: "morning_after_effects", type: "checkbox", text: "After an overnight low, what effects do you notice the next day? (Select all that apply)", required: false, options: ["Headache", "Fatigue", "Brain fog", "Irritability", "Elevated glucose", "Poor sleep quality", "No noticeable effects", "Rarely have overnight lows"] },
      { id: "overnight_prevention", type: "textarea", text: "What has worked best to prevent overnight lows?", required: false }
    ]
  },
  {
    title: "Exercise-Induced Hypoglycemia Prevention",
    description: "Explore strategies for managing glucose during and after physical activity.",
    category: "Safety",
    survey_type: "survey",
    research_category: "Safety",
    estimated_time_minutes: 10,
    is_anonymous: true,
    requires_demographics: true,
    status: "active",
    target_responses: 450,
    consent_text: "Your exercise strategies will help others stay safe during physical activity.",
    questions: [
      { id: "exercise_frequency", type: "radio", text: "How often do you exercise?", required: true, options: ["Daily", "4-6 times per week", "2-3 times per week", "Weekly", "Occasionally", "Rarely/never"] },
      { id: "exercise_types", type: "checkbox", text: "What types of exercise do you do? (Select all that apply)", required: true, options: ["Walking", "Running/jogging", "Cycling", "Swimming", "Strength training", "HIIT/interval training", "Yoga/stretching", "Team sports", "Hiking/outdoor activities", "Other"] },
      { id: "exercise_hypo_frequency", type: "radio", text: "How often do you experience hypoglycemia during or after exercise?", required: true, options: ["Rarely", "Sometimes", "Often", "Almost always", "I avoid exercise due to hypos"] },
      { id: "delayed_hypo", type: "radio", text: "How often do you experience delayed hypoglycemia (hours after exercise)?", required: true, options: ["Never/rarely", "Sometimes", "Often", "Almost always after intense exercise", "I haven't noticed a pattern"] },
      { id: "pre_exercise_strategies", type: "checkbox", text: "What do you do before exercise? (Select all that apply)", required: false, options: ["Reduce bolus insulin", "Reduce basal/suspend pump", "Eat extra carbs", "Check glucose frequently", "Set higher CGM target", "Use activity/exercise mode", "Nothing special"] },
      { id: "during_exercise_strategies", type: "checkbox", text: "What do you do during exercise? (Select all that apply)", required: false, options: ["Carry fast-acting glucose", "Monitor CGM frequently", "Take small carb supplements", "Suspend insulin delivery", "Use exercise mode on AID", "Nothing special"] },
      { id: "post_exercise_strategies", type: "checkbox", text: "What do you do after exercise to prevent delayed lows? (Select all that apply)", required: false, options: ["Reduce basal for several hours", "Eat extra carbs", "Reduce nighttime basal", "More frequent monitoring", "Lower correction doses", "Nothing special"] },
      { id: "exercise_strategy_success", type: "scale", text: "How successful are your current exercise strategies?", required: true, min: 1, max: 10, minLabel: "Not successful", maxLabel: "Very successful" },
      { id: "exercise_tips", type: "textarea", text: "What's your best tip for managing glucose during exercise?", required: false }
    ]
  },
  {
    title: "Driving Safety Practices Survey",
    description: "Assess driving safety practices among T1D individuals.",
    category: "Safety",
    survey_type: "survey",
    research_category: "Safety",
    estimated_time_minutes: 10,
    is_anonymous: true,
    requires_demographics: true,
    status: "active",
    target_responses: 450,
    consent_text: "Your driving practices will help develop safety guidelines for T1D drivers.",
    questions: [
      { id: "driving_frequency", type: "radio", text: "How often do you drive?", required: true, options: ["Daily", "Several times a week", "Weekly", "Occasionally", "Rarely", "I don't drive"] },
      { id: "pre_drive_check", type: "radio", text: "Do you check your glucose before driving?", required: true, options: ["Always", "Usually", "Sometimes", "Rarely", "Never", "CGM is always visible - I glance at it"] },
      { id: "minimum_to_drive", type: "radio", text: "What is your personal minimum glucose level to start driving?", required: true, options: ["70 mg/dL", "80 mg/dL", "90 mg/dL", "100 mg/dL", "110+ mg/dL", "I don't have a specific cutoff"] },
      { id: "glucose_supplies_in_car", type: "checkbox", text: "What glucose supplies do you keep in your car? (Select all that apply)", required: true, options: ["Glucose tablets", "Juice boxes", "Candy", "Snacks", "Glucagon", "Backup glucose meter", "None - I carry supplies on me", "None at all"] },
      { id: "hypo_while_driving", type: "radio", text: "Have you ever experienced hypoglycemia while driving?", required: true, options: ["Yes, multiple times", "Yes, once or twice", "I've had to pull over as a precaution", "Never while actively driving", "I don't drive"] },
      { id: "pull_over_practice", type: "radio", text: "If your glucose drops while driving, what do you do?", required: true, options: ["Immediately pull over and treat", "Treat at the next safe stopping point", "Wait until I reach my destination", "Depends on how low and how far", "I don't drive"] },
      { id: "long_drive_practices", type: "checkbox", text: "For longer drives (1+ hours), what do you do? (Select all that apply)", required: false, options: ["Check glucose before and during", "Keep snacks readily accessible", "Plan rest stops", "Have higher glucose target", "Inform passenger about T1D", "Set CGM alerts differently", "Nothing special"] },
      { id: "driving_confidence", type: "scale", text: "How confident do you feel about your driving safety with T1D?", required: true, min: 1, max: 10, minLabel: "Not confident", maxLabel: "Very confident" }
    ]
  },
  {
    title: "Emergency Preparedness Assessment",
    description: "Evaluate T1D emergency preparedness for various situations.",
    category: "Safety",
    survey_type: "survey",
    research_category: "Safety",
    estimated_time_minutes: 8,
    is_anonymous: true,
    requires_demographics: true,
    status: "active",
    target_responses: 450,
    consent_text: "Your preparedness levels will help identify gaps in emergency readiness.",
    questions: [
      { id: "emergency_supplies", type: "checkbox", text: "What emergency supplies do you have readily accessible? (Select all that apply)", required: true, options: ["Extra insulin (30+ day supply)", "Extra CGM sensors", "Extra pump supplies", "Backup insulin delivery (syringes/pens)", "Glucagon", "Glucose tabs/gel", "Backup batteries/chargers", "Medical ID", "Emergency contact list", "None of these"] },
      { id: "glucagon_type", type: "radio", text: "What type of glucagon do you have?", required: true, options: ["Baqsimi (nasal)", "Gvoke (auto-injector)", "Traditional glucagon kit", "Multiple types", "No glucagon", "Not sure what type"] },
      { id: "others_trained_glucagon", type: "radio", text: "How many people in your life know how to use your glucagon?", required: true, options: ["5+ people", "2-4 people", "1 person", "No one", "I don't have glucagon"] },
      { id: "medical_id", type: "radio", text: "Do you wear or carry medical identification?", required: true, options: ["Always wear medical ID", "Usually carry medical ID card", "ID is on my phone", "Sometimes", "No medical ID"] },
      { id: "natural_disaster_prep", type: "radio", text: "Are you prepared to manage T1D during a natural disaster or power outage?", required: true, options: ["Very prepared", "Somewhat prepared", "Minimally prepared", "Not prepared", "Haven't thought about it"] },
      { id: "insurance_gap_prep", type: "radio", text: "Could you manage if you lost insurance access for 30 days?", required: true, options: ["Yes, have significant backup supplies", "Probably, have some buffer", "Would be very difficult", "No, would run out", "Not sure"] },
      { id: "emergency_improvement", type: "textarea", text: "What aspect of emergency preparedness do you most need to improve?", required: false }
    ]
  },
  {
    title: "Sick Day Management Protocol Survey",
    description: "Understand how T1D individuals manage glucose during illness.",
    category: "Safety",
    survey_type: "survey",
    research_category: "Safety",
    estimated_time_minutes: 10,
    is_anonymous: true,
    requires_demographics: true,
    status: "active",
    target_responses: 400,
    consent_text: "Your sick day experiences will help develop better management guidelines.",
    questions: [
      { id: "sick_day_confidence", type: "scale", text: "How confident are you managing your T1D during illness?", required: true, min: 1, max: 10, minLabel: "Not confident", maxLabel: "Very confident" },
      { id: "sick_day_training", type: "radio", text: "Have you received formal sick day management training?", required: true, options: ["Yes, comprehensive training", "Yes, basic guidelines", "Some information from provider", "Self-taught/online research", "No training"] },
      { id: "ketone_testing", type: "radio", text: "Do you test for ketones when sick?", required: true, options: ["Always", "Usually", "Sometimes", "Rarely", "Never", "Don't have ketone testing supplies"] },
      { id: "ketone_type", type: "radio", text: "How do you test for ketones?", required: true, options: ["Blood ketone meter", "Urine ketone strips", "Both methods", "I don't test for ketones", "Don't have testing supplies"] },
      { id: "insulin_adjustment_sick", type: "radio", text: "How do you typically adjust insulin when sick?", required: true, options: ["Increase basal and corrections", "Keep same doses but correct more", "Decrease if not eating", "Let AID system handle it", "Not sure what to do", "Varies too much to say"] },
      { id: "dka_experience", type: "radio", text: "Have you ever experienced DKA (diabetic ketoacidosis)?", required: true, options: ["Yes, multiple times", "Yes, once", "Came close but caught it", "Never", "Not sure"] },
      { id: "hydration_focus", type: "radio", text: "How well do you maintain hydration when sick?", required: true, options: ["Very focused on hydration", "Try to stay hydrated", "Sometimes forget", "Struggle with hydration", "Varies by illness"] },
      { id: "when_seek_help", type: "checkbox", text: "What would prompt you to seek emergency care when sick? (Select all that apply)", required: true, options: ["Ketones above 1.5 mmol/L", "Vomiting and can't keep fluids down", "Glucose won't come down with corrections", "Feeling extremely unwell", "High fever with high ketones", "Confusion or difficulty staying awake", "I'm not sure when to seek help"] },
      { id: "sick_day_tips", type: "textarea", text: "What's your best sick day management tip?", required: false }
    ]
  },
  {
    title: "Alcohol & Diabetes Safety Study",
    description: "Explore safe alcohol consumption practices with T1D.",
    category: "Safety",
    survey_type: "survey",
    research_category: "Safety",
    estimated_time_minutes: 10,
    is_anonymous: true,
    requires_demographics: true,
    status: "active",
    target_responses: 400,
    consent_text: "Your experiences will help develop safe drinking guidelines for T1D adults.",
    questions: [
      { id: "alcohol_frequency", type: "radio", text: "How often do you consume alcohol?", required: true, options: ["Never", "Rarely (few times a year)", "Occasionally (monthly)", "Weekly", "Multiple times per week", "Daily"] },
      { id: "alcohol_types", type: "checkbox", text: "What types of alcohol do you typically consume? (Select all that apply)", required: false, options: ["Beer", "Wine", "Spirits/liquor", "Mixed drinks/cocktails", "Ciders", "Low-carb/sugar-free drinks", "I don't drink"] },
      { id: "alcohol_glucose_effect", type: "radio", text: "How does alcohol typically affect your glucose?", required: true, options: ["Causes delayed hypoglycemia", "Causes initial spike then drop", "Causes hyperglycemia", "Minimal effect", "Unpredictable effects", "I don't drink"] },
      { id: "delayed_hypo_alcohol", type: "radio", text: "How often do you experience delayed hypoglycemia after drinking?", required: true, options: ["Always", "Often", "Sometimes", "Rarely", "Never", "I don't drink"] },
      { id: "alcohol_strategies", type: "checkbox", text: "What strategies do you use when drinking? (Select all that apply)", required: false, options: ["Eat before/while drinking", "Reduce evening/overnight insulin", "Set higher CGM low alarm", "Have someone watch my glucose", "Limit number of drinks", "Check glucose frequently", "Avoid bolusing for alcohol carbs", "No special strategies", "I don't drink"] },
      { id: "drinking_companions_aware", type: "radio", text: "When drinking socially, do your companions know about your T1D?", required: true, options: ["Yes, all know and can help", "Yes, most know", "Only close friends know", "I prefer not to disclose", "I drink alone/rarely drink socially"] },
      { id: "alcohol_education", type: "radio", text: "Have you received education about alcohol and T1D from healthcare providers?", required: true, options: ["Yes, detailed guidance", "Yes, basic information", "Brief mention only", "Never discussed", "I haven't asked about it"] },
      { id: "alcohol_safety_tips", type: "textarea", text: "What's your best safety tip for drinking with T1D?", required: false }
    ]
  },
  {
    title: "High-Risk Activity Safety Practices",
    description: "Understand how T1D individuals manage extreme or high-risk activities.",
    category: "Safety",
    survey_type: "survey",
    research_category: "Safety",
    estimated_time_minutes: 8,
    is_anonymous: true,
    requires_demographics: true,
    status: "active",
    target_responses: 300,
    consent_text: "Your experiences will help others safely pursue adventurous activities.",
    questions: [
      { id: "high_risk_activities", type: "checkbox", text: "Which high-risk activities have you done with T1D? (Select all that apply)", required: true, options: ["Scuba diving", "Skydiving", "Rock climbing", "Mountain climbing/high altitude", "Marathon/ultra running", "Triathlon", "Backcountry skiing/snowboarding", "Solo wilderness travel", "Extreme water sports", "None of these"] },
      { id: "activity_restrictions", type: "radio", text: "Have you avoided activities because of your T1D?", required: true, options: ["Yes, many activities", "Yes, a few activities", "No, I do what I want", "Unsure what's safe to do"] },
      { id: "pre_activity_prep", type: "checkbox", text: "For high-risk activities, what preparations do you make? (Select all that apply)", required: false, options: ["Inform activity leaders/guides", "Carry extra supplies", "Train partners on T1D basics", "Research T1D-specific considerations", "Get medical clearance", "Adjust insulin significantly", "Have detailed emergency plan", "Nothing special", "I don't do high-risk activities"] },
      { id: "supply_challenges", type: "radio", text: "How challenging is it to manage supplies during extreme activities?", required: true, options: ["Very challenging", "Moderately challenging", "Minor challenges", "Not challenging", "I avoid these activities"] },
      { id: "altitude_effects", type: "radio", text: "Have you noticed altitude affecting your glucose or devices?", required: true, options: ["Yes, significant effects", "Yes, minor effects", "No noticeable effects", "Haven't been at altitude", "Not sure"] },
      { id: "activity_incident", type: "radio", text: "Have you had a T1D-related incident during a high-risk activity?", required: true, options: ["Yes, serious incident", "Yes, minor incident", "Close calls", "No incidents", "I avoid these activities"] },
      { id: "adventure_advice", type: "textarea", text: "What advice would you give to someone with T1D wanting to try adventurous activities?", required: false }
    ]
  },
  {
    title: "Hypoglycemia Awareness Trends",
    description: "Track changes in hypoglycemia awareness over time within the T1D population.",
    category: "Safety",
    survey_type: "survey",
    research_category: "Safety",
    estimated_time_minutes: 10,
    is_anonymous: true,
    requires_demographics: true,
    status: "active",
    target_responses: 500,
    consent_text: "Your awareness patterns will help understand hypoglycemia unawareness trends.",
    questions: [
      { id: "current_awareness", type: "radio", text: "How would you rate your current hypoglycemia awareness?", required: true, options: ["Excellent - always feel symptoms above 60", "Good - usually feel symptoms at 60-70", "Fair - sometimes miss lows until 50-60", "Poor - often don't feel lows until below 50", "Very poor - rarely feel symptoms at any level"] },
      { id: "awareness_change", type: "radio", text: "How has your awareness changed over your time with T1D?", required: true, options: ["Improved significantly", "Improved somewhat", "Stayed about the same", "Declined somewhat", "Declined significantly"] },
      { id: "awareness_recovery", type: "radio", text: "If your awareness declined, have you been able to regain it?", required: true, options: ["Yes, fully recovered", "Partially recovered", "No recovery yet", "Currently trying to recover", "My awareness hasn't declined", "Haven't tried to recover"] },
      { id: "awareness_strategies", type: "checkbox", text: "What strategies have you used to improve hypoglycemia awareness? (Select all that apply)", required: false, options: ["Strict avoidance of lows", "Higher glucose targets temporarily", "CGM with tight low alerts", "BGAT training", "Working with endo on strategy", "Exercise changes", "None - haven't tried", "Awareness hasn't been an issue"] },
      { id: "awareness_impact_factors", type: "checkbox", text: "What factors have affected your hypoglycemia awareness? (Select all that apply)", required: false, options: ["Duration of diabetes", "Frequency of lows", "CGM use (improved awareness)", "CGM use (less reliance on symptoms)", "Better overall control", "Certain medications", "Alcohol use", "Sleep quality", "Not sure what affects it"] },
      { id: "cgm_reliance", type: "radio", text: "How much do you rely on CGM vs. symptoms to detect lows?", required: true, options: ["Almost entirely on CGM", "Mostly CGM, some symptoms", "Equal mix", "Mostly symptoms, CGM backup", "Almost entirely on symptoms", "I don't use CGM"] },
      { id: "awareness_concerns", type: "scale", text: "How concerned are you about your hypoglycemia awareness?", required: true, min: 1, max: 10, minLabel: "Not concerned", maxLabel: "Very concerned" }
    ]
  },
  {
    title: "Ketoacidosis Prevention Strategies",
    description: "Understand DKA prevention practices and risk awareness.",
    category: "Safety",
    survey_type: "survey",
    research_category: "Safety",
    estimated_time_minutes: 8,
    is_anonymous: true,
    requires_demographics: true,
    status: "active",
    target_responses: 450,
    consent_text: "Your prevention practices will help improve DKA awareness and prevention.",
    questions: [
      { id: "dka_history", type: "radio", text: "Have you ever had DKA (excluding at diagnosis)?", required: true, options: ["Yes, multiple episodes", "Yes, once", "Came close/caught early", "Never", "At diagnosis only"] },
      { id: "ketone_testing_frequency", type: "radio", text: "How often do you test for ketones?", required: true, options: ["Whenever glucose is high (>250)", "When feeling unwell", "When pump site seems problematic", "Rarely", "Never", "Don't have testing supplies"] },
      { id: "ketone_supplies", type: "radio", text: "Do you have ketone testing supplies available?", required: true, options: ["Yes, blood ketone meter", "Yes, urine strips", "Yes, both types", "Expired supplies", "No supplies"] },
      { id: "pump_failure_protocol", type: "radio", text: "If you use a pump, do you have a protocol for suspected site/pump failure?", required: true, options: ["Yes, detailed protocol", "Yes, basic plan", "General idea of what to do", "Not really", "I don't use a pump"] },
      { id: "high_glucose_response", type: "checkbox", text: "When your glucose is very high (>300), what do you do? (Select all that apply)", required: true, options: ["Give correction via pump", "Give injection instead of pump", "Test for ketones", "Drink extra water", "Check pump/site for problems", "Call healthcare provider", "Wait and recheck", "Not sure what to do"] },
      { id: "dka_symptoms_knowledge", type: "checkbox", text: "Which DKA symptoms would prompt you to seek care? (Select all that apply)", required: true, options: ["Nausea/vomiting", "Fruity breath", "Rapid/deep breathing", "Confusion", "Abdominal pain", "High ketones that won't clear", "Persistent high glucose despite corrections", "I'm not sure of DKA symptoms"] },
      { id: "dka_education", type: "radio", text: "How well has your healthcare team educated you about DKA prevention?", required: true, options: ["Very thoroughly", "Adequately", "Minimally", "Not at all", "I learned on my own"] },
      { id: "prevention_confidence", type: "scale", text: "How confident are you in your ability to prevent DKA?", required: true, min: 1, max: 10, minLabel: "Not confident", maxLabel: "Very confident" }
    ]
  },
  {
    title: "Medication Error Tracking Survey",
    description: "Understand the frequency and types of medication errors in T1D management.",
    category: "Safety",
    survey_type: "survey",
    research_category: "Safety",
    estimated_time_minutes: 8,
    is_anonymous: true,
    requires_demographics: true,
    status: "active",
    target_responses: 450,
    consent_text: "Your honest responses about errors will help improve medication safety.",
    questions: [
      { id: "error_frequency", type: "radio", text: "How often do you make insulin dosing errors?", required: true, options: ["Rarely (few times a year)", "Monthly", "Weekly", "Multiple times per week", "I don't think I make errors"] },
      { id: "error_types", type: "checkbox", text: "What types of dosing errors have you made? (Select all that apply)", required: true, options: ["Forgot if I took insulin", "Double-dosed by mistake", "Wrong insulin type (basal vs bolus)", "Miscalculated carbs significantly", "Forgot to bolus for a meal", "Incorrect correction dose", "Gave injection but thought it was bolus", "Pump programming error", "None of these"] },
      { id: "forgot_bolus", type: "radio", text: "How often do you forget to bolus for meals?", required: true, options: ["Never", "Rarely", "Sometimes", "Often", "Very often"] },
      { id: "double_dose_experience", type: "radio", text: "Have you ever accidentally double-dosed insulin?", required: true, options: ["Yes, multiple times", "Yes, once or twice", "I've caught myself before doing it", "Never"] },
      { id: "error_prevention", type: "checkbox", text: "What helps you prevent dosing errors? (Select all that apply)", required: false, options: ["Smart pen that tracks doses", "Pump history feature", "CGM bolus reminders", "Routine/habit", "Phone app to log doses", "Verbal confirmation", "Partner reminder", "Nothing specific"] },
      { id: "error_consequences", type: "radio", text: "Have medication errors caused significant hypo or hyperglycemia?", required: true, options: ["Yes, serious events", "Yes, moderate events", "Minor inconveniences only", "No significant consequences", "I don't think I make errors"] },
      { id: "reported_to_provider", type: "radio", text: "Do you report medication errors to your healthcare provider?", required: true, options: ["Always", "Usually", "Sometimes", "Rarely", "Never"] },
      { id: "error_prevention_tip", type: "textarea", text: "What's your best tip for preventing medication errors?", required: false }
    ]
  },

  // ============================================
  // TECHNOLOGY SURVEYS (11 total)
  // ============================================
  {
    title: "Diabetes Technology Adoption Survey",
    description: "Help researchers understand what drives technology adoption decisions in the T1D community.",
    category: "Technology",
    survey_type: "survey",
    research_category: "Technology",
    estimated_time_minutes: 10,
    is_anonymous: true,
    requires_demographics: true,
    status: "active",
    target_responses: 500,
    consent_text: "Your technology preferences will guide future diabetes tech development.",
    questions: [
      { id: "current_tech", type: "checkbox", text: "What diabetes technology do you currently use? (Select all that apply)", required: true, options: ["Continuous glucose monitor (CGM)", "Insulin pump (tubed)", "Tubeless/patch pump", "Automated insulin delivery (AID/closed loop)", "Smart insulin pen", "Glucose meter", "Diabetes apps", "None of the above"] },
      { id: "adoption_timing", type: "radio", text: "How quickly do you typically adopt new diabetes technology?", required: true, options: ["Early adopter - as soon as available", "After some positive reviews", "Once well-established (1-2 years)", "Only when my current device stops working", "Resistant to new technology"] },
      { id: "adoption_barriers", type: "checkbox", text: "What barriers prevent you from adopting new technology? (Select all that apply)", required: true, options: ["Cost/insurance coverage", "Fear of learning new system", "Current system works fine", "Concerns about reliability", "Don't want more devices on body", "Privacy concerns", "Limited access in my country", "Healthcare provider hasn't recommended"] },
      { id: "information_sources", type: "checkbox", text: "Where do you get information about new diabetes technology? (Select all that apply)", required: true, options: ["Online T1D communities", "Healthcare providers", "Manufacturer websites", "Friends with T1D", "Social media", "Medical publications", "Diabetes conferences/events", "News articles"] },
      { id: "satisfaction_current", type: "scale", text: "How satisfied are you with your current technology setup?", required: true, min: 1, max: 10, minLabel: "Very dissatisfied", maxLabel: "Very satisfied" },
      { id: "most_wanted_feature", type: "textarea", text: "What technology feature would most improve your diabetes management?", required: false }
    ]
  },
  {
    title: "Diabetes App Usage Patterns",
    description: "Understand how people use smartphone apps for diabetes management.",
    category: "Technology",
    survey_type: "survey",
    research_category: "Technology",
    estimated_time_minutes: 8,
    is_anonymous: true,
    requires_demographics: true,
    status: "active",
    target_responses: 450,
    consent_text: "Your app usage patterns will help improve diabetes apps.",
    questions: [
      { id: "apps_used", type: "checkbox", text: "Which diabetes-related apps do you use regularly? (Select all that apply)", required: true, options: ["CGM manufacturer app (Dexcom, Libre, etc.)", "Pump manufacturer app", "Sugarmate", "Nightscout", "Glooko/Diasend", "MySugr", "Carb counting apps", "Insulin dosing calculators", "General health apps", "None"] },
      { id: "app_frequency", type: "radio", text: "How often do you actively engage with diabetes apps (beyond passive CGM monitoring)?", required: true, options: ["Multiple times daily", "Daily", "Few times a week", "Weekly", "Rarely", "Never - just passive monitoring"] },
      { id: "most_valuable_feature", type: "checkbox", text: "What app features do you find most valuable? (Select all that apply)", required: true, options: ["Real-time glucose display", "Glucose history/trends", "Carb logging", "Insulin dose logging", "Reports/statistics", "Sharing with caregivers", "Reminders/alerts", "Integration with other apps", "Insights/pattern detection"] },
      { id: "app_frustrations", type: "checkbox", text: "What frustrates you about diabetes apps? (Select all that apply)", required: false, options: ["Too many apps needed", "Poor integration between apps", "Battery drain", "Frequent crashes/bugs", "Complicated to use", "Data not exportable", "Subscription costs", "Privacy concerns", "None - I'm satisfied"] },
      { id: "app_recommendation", type: "scale", text: "How likely are you to recommend your favorite diabetes app to others?", required: true, min: 1, max: 10, minLabel: "Not at all", maxLabel: "Highly likely" },
      { id: "ideal_app_feature", type: "textarea", text: "Describe your ideal diabetes app - what would it do?", required: false }
    ]
  },
  {
    title: "Data Export & Analysis Preferences",
    description: "Understand how T1D individuals prefer to access and analyze their health data.",
    category: "Technology",
    survey_type: "survey",
    research_category: "Technology",
    estimated_time_minutes: 8,
    is_anonymous: true,
    requires_demographics: true,
    status: "active",
    target_responses: 400,
    consent_text: "Your data preferences will help improve health data accessibility.",
    questions: [
      { id: "data_export_frequency", type: "radio", text: "How often do you export or review detailed diabetes data?", required: true, options: ["Daily", "Weekly", "Before doctor appointments", "Monthly", "Rarely", "Never"] },
      { id: "platforms_used", type: "checkbox", text: "Which data platforms do you use? (Select all that apply)", required: true, options: ["Dexcom Clarity", "LibreView", "CareLink", "Glooko/Diasend", "Tidepool", "Nightscout", "Sugarmate", "Apple Health", "Google Fit", "None"] },
      { id: "report_preferences", type: "checkbox", text: "Which reports do you find most useful? (Select all that apply)", required: true, options: ["AGP (Ambulatory Glucose Profile)", "Time in Range summary", "Daily glucose overlay", "Patterns/trends report", "Insulin usage summary", "Carb intake analysis", "Custom date comparisons", "I don't look at reports"] },
      { id: "data_ownership", type: "scale", text: "How important is having full ownership and export ability of your health data?", required: true, min: 1, max: 10, minLabel: "Not important", maxLabel: "Extremely important" },
      { id: "data_challenges", type: "checkbox", text: "What challenges do you face with diabetes data? (Select all that apply)", required: false, options: ["Can't combine data from different devices", "Hard to export in usable format", "Too much data to analyze", "Don't understand the reports", "Can't share with all providers", "Data not detailed enough", "No challenges"] },
      { id: "data_use", type: "textarea", text: "How do you use your diabetes data to improve management?", required: false }
    ]
  },
  {
    title: "AI/ML Feature Adoption Survey",
    description: "Explore attitudes toward AI and machine learning in diabetes management.",
    category: "Technology",
    survey_type: "survey",
    research_category: "Technology",
    estimated_time_minutes: 10,
    is_anonymous: true,
    requires_demographics: true,
    status: "active",
    target_responses: 400,
    consent_text: "Your perspectives will shape the future of AI in diabetes care.",
    questions: [
      { id: "ai_awareness", type: "radio", text: "How aware are you of AI/ML features in diabetes devices?", required: true, options: ["Very aware - use them actively", "Somewhat aware", "Heard of them", "Not aware", "Not interested"] },
      { id: "ai_features_used", type: "checkbox", text: "Which AI/ML features do you currently use? (Select all that apply)", required: false, options: ["AID/closed-loop insulin delivery", "Glucose prediction arrows", "Pattern detection alerts", "Auto-adjusted insulin settings", "Meal impact predictions", "Activity recommendations", "None", "Not sure which features use AI"] },
      { id: "ai_trust", type: "scale", text: "How much do you trust AI/ML to make insulin dosing decisions?", required: true, min: 1, max: 10, minLabel: "Don't trust at all", maxLabel: "Complete trust" },
      { id: "ai_concerns", type: "checkbox", text: "What concerns do you have about AI in diabetes management? (Select all that apply)", required: false, options: ["Loss of personal control", "Algorithm errors/safety", "Privacy of health data", "Becoming too dependent", "Not understanding how it works", "Lack of personalization", "No concerns"] },
      { id: "ai_desired_features", type: "checkbox", text: "Which AI features would you want in the future? (Select all that apply)", required: false, options: ["Fully automated insulin dosing", "Accurate meal detection without input", "Exercise impact prediction", "Illness/stress detection", "Mental health pattern detection", "Automated basal adjustment", "Predictive low prevention", "All of the above", "None - prefer manual control"] },
      { id: "ai_recommendation", type: "textarea", text: "How would AI need to improve for you to trust it more?", required: false }
    ]
  },
  {
    title: "Remote Monitoring Preferences",
    description: "Understand preferences for glucose sharing and remote monitoring.",
    category: "Technology",
    survey_type: "survey",
    research_category: "Technology",
    estimated_time_minutes: 8,
    is_anonymous: true,
    requires_demographics: true,
    status: "active",
    target_responses: 450,
    consent_text: "Your monitoring preferences will help improve remote care options.",
    questions: [
      { id: "share_with", type: "checkbox", text: "Who do you share your glucose data with in real-time? (Select all that apply)", required: true, options: ["Spouse/partner", "Parents", "Adult children", "Friends", "Healthcare provider", "No one", "Would like to but don't"] },
      { id: "sharing_platform", type: "checkbox", text: "What platforms do you use for sharing? (Select all that apply)", required: false, options: ["Dexcom Share/Follow", "LibreLinkUp", "Nightscout", "Sugarmate", "CareLink Connect", "Other", "I don't share data"] },
      { id: "sharing_comfort", type: "scale", text: "How comfortable are you with others seeing your glucose data?", required: true, min: 1, max: 10, minLabel: "Very uncomfortable", maxLabel: "Very comfortable" },
      { id: "sharing_benefits", type: "checkbox", text: "What benefits do you get from sharing? (Select all that apply)", required: false, options: ["Safety net for severe lows", "Help with management decisions", "Peace of mind for loved ones", "Accountability for self-care", "Easier to explain glucose state", "Don't experience benefits", "I don't share"] },
      { id: "sharing_negatives", type: "checkbox", text: "What downsides have you experienced from sharing? (Select all that apply)", required: false, options: ["Too many alerts to followers", "Feeling watched/judged", "Followers overreact to readings", "Privacy concerns", "Technical issues", "No downsides", "I don't share"] },
      { id: "provider_remote_monitoring", type: "radio", text: "Would you want your healthcare provider to monitor your glucose between appointments?", required: true, options: ["Yes, actively with intervention", "Yes, passively for appointment prep", "Only during specific periods", "No, prefer privacy", "My provider already monitors"] },
      { id: "remote_monitoring_future", type: "textarea", text: "How could remote monitoring be improved to meet your needs?", required: false }
    ]
  },
  {
    title: "Telemedicine Experience Study",
    description: "Evaluate virtual care experiences for diabetes management.",
    category: "Technology",
    survey_type: "survey",
    research_category: "Technology",
    estimated_time_minutes: 10,
    is_anonymous: true,
    requires_demographics: true,
    status: "active",
    target_responses: 450,
    consent_text: "Your telemedicine experiences will help improve virtual diabetes care.",
    questions: [
      { id: "telemedicine_frequency", type: "radio", text: "How often do you use telemedicine for diabetes care?", required: true, options: ["All my appointments are virtual", "Most appointments virtual", "Mix of virtual and in-person", "Mostly in-person, occasional virtual", "Never used telemedicine", "Not available to me"] },
      { id: "telemedicine_preference", type: "radio", text: "What is your preferred format for diabetes appointments?", required: true, options: ["Strongly prefer virtual", "Slightly prefer virtual", "No preference", "Slightly prefer in-person", "Strongly prefer in-person"] },
      { id: "telemedicine_quality", type: "scale", text: "How would you rate the quality of your telemedicine appointments?", required: true, min: 1, max: 10, minLabel: "Very poor", maxLabel: "Excellent" },
      { id: "telemedicine_advantages", type: "checkbox", text: "What advantages does telemedicine offer you? (Select all that apply)", required: false, options: ["No travel time", "More appointment availability", "Can share screen with glucose data", "More comfortable at home", "Less time off work", "Better access to specialists", "Haven't used telemedicine"] },
      { id: "telemedicine_disadvantages", type: "checkbox", text: "What disadvantages have you experienced? (Select all that apply)", required: false, options: ["Technical difficulties", "Less personal connection", "Can't do physical exam", "Harder to show devices", "Distractions at home", "Internet reliability issues", "Haven't used telemedicine", "No disadvantages"] },
      { id: "data_sharing_virtual", type: "radio", text: "Is sharing diabetes data during virtual appointments easy?", required: true, options: ["Yes, very easy", "Somewhat easy", "Somewhat difficult", "Very difficult", "Haven't tried"] },
      { id: "future_telemedicine", type: "radio", text: "How do you want telemedicine to be part of your care going forward?", required: true, options: ["Primary method for all visits", "Primary with occasional in-person", "Equal mix", "Occasional virtual, mainly in-person", "In-person only"] }
    ]
  },
  {
    title: "Third-Party Integration Preferences",
    description: "Understand how people integrate diabetes tech with general health apps.",
    category: "Technology",
    survey_type: "survey",
    research_category: "Technology",
    estimated_time_minutes: 8,
    is_anonymous: true,
    requires_demographics: true,
    status: "active",
    target_responses: 400,
    consent_text: "Your integration preferences will help improve health ecosystem connectivity.",
    questions: [
      { id: "health_apps_used", type: "checkbox", text: "Which general health apps/platforms do you use? (Select all that apply)", required: true, options: ["Apple Health", "Google Fit", "Fitbit app", "Garmin Connect", "Samsung Health", "Strava", "MyFitnessPal", "None"] },
      { id: "diabetes_health_integration", type: "radio", text: "Do your diabetes apps integrate with general health apps?", required: true, options: ["Yes, fully integrated", "Partially integrated", "No, but I want them to", "No, and I don't need it", "Not sure"] },
      { id: "data_integration_value", type: "scale", text: "How valuable would it be to see all health data in one place?", required: true, min: 1, max: 10, minLabel: "Not valuable", maxLabel: "Extremely valuable" },
      { id: "integration_challenges", type: "checkbox", text: "What integration challenges have you faced? (Select all that apply)", required: false, options: ["Apps don't support integration", "Data syncs but not accurately", "Can't get devices to connect", "Different units/formats", "Privacy settings block sharing", "Too complicated to set up", "No challenges", "Haven't tried to integrate"] },
      { id: "desired_integrations", type: "checkbox", text: "What integrations would you most want? (Select all that apply)", required: true, options: ["Glucose with activity/exercise", "Glucose with food logging", "Insulin with weight tracking", "Sleep data with glucose", "Heart rate with glucose", "Stress/mood with glucose", "All health data unified", "Happy with current setup"] },
      { id: "wearable_synergy", type: "textarea", text: "How could wearables and diabetes devices work better together?", required: false }
    ]
  },
  {
    title: "Privacy & Data Security Concerns",
    description: "Assess privacy and security concerns around diabetes health data.",
    category: "Technology",
    survey_type: "survey",
    research_category: "Technology",
    estimated_time_minutes: 10,
    is_anonymous: true,
    requires_demographics: true,
    status: "active",
    target_responses: 450,
    consent_text: "Your privacy perspectives will help improve data protection practices.",
    questions: [
      { id: "privacy_concern_level", type: "scale", text: "How concerned are you about the privacy of your diabetes health data?", required: true, min: 1, max: 10, minLabel: "Not concerned", maxLabel: "Very concerned" },
      { id: "data_access_concerns", type: "checkbox", text: "Which potential data users concern you most? (Select all that apply)", required: true, options: ["Insurance companies", "Employers", "Government agencies", "Tech companies", "Data brokers", "Hackers/criminals", "No concerns about any"] },
      { id: "privacy_policy_review", type: "radio", text: "Do you read privacy policies for diabetes apps and devices?", required: true, options: ["Always read carefully", "Skim them", "Rarely read", "Never read", "Assume they're all the same"] },
      { id: "data_selling_awareness", type: "radio", text: "Are you concerned that your health data might be sold to third parties?", required: true, options: ["Very concerned", "Somewhat concerned", "Slightly concerned", "Not concerned", "Already assume it happens"] },
      { id: "security_practices", type: "checkbox", text: "What security practices do you follow for diabetes apps? (Select all that apply)", required: false, options: ["Strong passwords", "Two-factor authentication", "Regular password changes", "Review connected apps", "Limit data sharing permissions", "Use VPN", "None specifically", "Didn't know I should do these"] },
      { id: "data_breach_concern", type: "radio", text: "How would you feel if your diabetes data was part of a data breach?", required: true, options: ["Extremely upset", "Very concerned", "Somewhat concerned", "Not very concerned", "Wouldn't care much"] },
      { id: "privacy_tradeoff", type: "scale", text: "Would you trade some privacy for better diabetes management features?", required: true, min: 1, max: 10, minLabel: "Never - privacy first", maxLabel: "Yes - features first" },
      { id: "privacy_improvements", type: "textarea", text: "What would make you feel more secure about your diabetes data?", required: false }
    ]
  },
  {
    title: "Voice Assistant Usage for Diabetes",
    description: "Explore how voice assistants are used for diabetes management.",
    category: "Technology",
    survey_type: "survey",
    research_category: "Technology",
    estimated_time_minutes: 6,
    is_anonymous: true,
    requires_demographics: true,
    status: "active",
    target_responses: 350,
    consent_text: "Your voice assistant experiences will help improve hands-free diabetes tools.",
    questions: [
      { id: "voice_assistant_used", type: "checkbox", text: "Which voice assistants do you use? (Select all that apply)", required: true, options: ["Siri", "Alexa", "Google Assistant", "Bixby", "Cortana", "Other", "I don't use voice assistants"] },
      { id: "diabetes_voice_use", type: "radio", text: "Do you use voice assistants for diabetes-related tasks?", required: true, options: ["Yes, regularly", "Yes, occasionally", "Tried but stopped", "No, but interested", "No, not interested"] },
      { id: "voice_tasks", type: "checkbox", text: "What diabetes tasks do you use voice for? (Select all that apply)", required: false, options: ["Check current glucose", "Log food/carbs", "Set reminders", "Calculate doses", "Ask health questions", "Control devices", "None", "Don't use for diabetes"] },
      { id: "voice_convenience", type: "scale", text: "How convenient would hands-free diabetes management be for you?", required: true, min: 1, max: 10, minLabel: "Not convenient", maxLabel: "Very convenient" },
      { id: "voice_barriers", type: "checkbox", text: "What prevents you from using voice for diabetes tasks? (Select all that apply)", required: false, options: ["Privacy concerns", "Not accurate enough", "Features don't exist", "Prefer manual control", "Don't own voice devices", "Haven't thought about it", "Nothing - I use it"] },
      { id: "ideal_voice_feature", type: "textarea", text: "What voice command would most help your diabetes management?", required: false }
    ]
  },
  {
    title: "Automated Reporting Preferences",
    description: "Understand preferences for automated diabetes reports and summaries.",
    category: "Technology",
    survey_type: "survey",
    research_category: "Technology",
    estimated_time_minutes: 8,
    is_anonymous: true,
    requires_demographics: true,
    status: "active",
    target_responses: 400,
    consent_text: "Your reporting preferences will help improve automated insights.",
    questions: [
      { id: "report_frequency", type: "radio", text: "How often would you like to receive automated diabetes reports?", required: true, options: ["Daily summary", "Weekly summary", "Monthly summary", "Before appointments only", "On-demand only", "I don't want automated reports"] },
      { id: "report_delivery", type: "checkbox", text: "How would you prefer to receive reports? (Select all that apply)", required: true, options: ["In-app notification", "Email", "Text message", "Push notification", "Printed (mailed)", "Healthcare portal", "I'll look them up myself"] },
      { id: "report_content", type: "checkbox", text: "What should automated reports include? (Select all that apply)", required: true, options: ["Time in Range summary", "A1C estimate", "Pattern highlights", "Hypo/hyper events", "Comparison to previous period", "Personalized recommendations", "Device performance stats", "Medication usage summary"] },
      { id: "actionable_insights", type: "scale", text: "How important is it that reports include actionable recommendations?", required: true, min: 1, max: 10, minLabel: "Just show data", maxLabel: "Need specific actions" },
      { id: "report_sharing", type: "radio", text: "Would you automatically share reports with your healthcare provider?", required: true, options: ["Yes, automatically before appointments", "Yes, if I can review first", "Only if I choose to send", "No, keep reports private"] },
      { id: "current_satisfaction", type: "scale", text: "How satisfied are you with current automated reporting options?", required: true, min: 1, max: 10, minLabel: "Very dissatisfied", maxLabel: "Very satisfied" },
      { id: "report_improvement", type: "textarea", text: "How could automated diabetes reports be more useful to you?", required: false }
    ]
  },
  {
    title: "Future Technology Wishlist Survey",
    description: "Gather community input on desired future diabetes technology.",
    category: "Technology",
    survey_type: "survey",
    research_category: "Technology",
    estimated_time_minutes: 10,
    is_anonymous: true,
    requires_demographics: true,
    status: "active",
    target_responses: 500,
    consent_text: "Your technology wishes will help guide future diabetes innovation.",
    questions: [
      { id: "top_wish", type: "radio", text: "What is your number one diabetes technology wish?", required: true, options: ["True closed-loop (no carb counting)", "Implantable CGM (no sensors to change)", "Cure via beta cell replacement", "Non-invasive glucose monitoring", "Much smaller/invisible devices", "Perfect algorithm that works for everyone", "Affordable access to current tech"] },
      { id: "feature_priorities", type: "checkbox", text: "Which future features are most important to you? (Select all that apply)", required: true, options: ["Longer-lasting sensors/sites", "Faster-acting insulin", "No calibration ever needed", "Seamless device-to-device communication", "Predictive AI that learns my patterns", "Mood/stress integration", "Automatic meal detection", "Smaller form factors"] },
      { id: "timeline_expectation", type: "radio", text: "When do you expect significant diabetes tech improvements?", required: true, options: ["Within 2 years", "3-5 years", "5-10 years", "10+ years", "I've given up expecting breakthroughs"] },
      { id: "pay_for_innovation", type: "radio", text: "Would you pay out-of-pocket for significantly better technology?", required: true, options: ["Yes, a lot more", "Yes, somewhat more", "Only if affordable", "No, insurance should cover everything", "Can't afford more than current costs"] },
      { id: "innovation_blockers", type: "checkbox", text: "What do you think blocks faster innovation? (Select all that apply)", required: true, options: ["FDA approval process", "Insurance coverage limitations", "Lack of research funding", "Company profit motives", "Technical limitations", "Regulatory fragmentation (US vs EU)", "Not enough patient input"] },
      { id: "beta_tester_interest", type: "radio", text: "Would you be interested in beta testing new diabetes technology?", required: true, options: ["Yes, eager to try new things", "Yes, if minimal risk", "Maybe, need more information", "No, prefer proven technology"] },
      { id: "dream_device", type: "textarea", text: "Describe your dream diabetes device - what would it do and how would it work?", required: false }
    ]
  },

  // ============================================
  // TRANSITIONS SURVEYS (11 total)
  // ============================================
  {
    title: "Life Transitions with T1D Survey",
    description: "Help researchers understand how major life changes affect T1D management.",
    category: "Transitions",
    survey_type: "survey",
    research_category: "Transitions",
    estimated_time_minutes: 10,
    is_anonymous: true,
    requires_demographics: true,
    status: "active",
    target_responses: 400,
    consent_text: "Your experiences navigating life changes will help others facing similar transitions.",
    questions: [
      { id: "transitions_experienced", type: "checkbox", text: "Which major life transitions have you experienced since your T1D diagnosis? (Select all that apply)", required: true, options: ["Started college/university", "First full-time job", "Marriage/partnership", "Pregnancy/childbirth", "Divorce/separation", "Major career change", "Relocation", "Retirement", "Loss of loved one", "Significant health change", "None of these"] },
      { id: "most_challenging", type: "radio", text: "Which transition was most challenging for your T1D management?", required: true, options: ["Starting school/college", "Entering workforce", "Relationship changes", "Parenthood", "Career transitions", "Aging-related changes", "Geographic moves", "None were particularly challenging"] },
      { id: "transition_impact", type: "scale", text: "How much did your most challenging transition impact your A1C or time in range?", required: true, min: 1, max: 10, minLabel: "No impact", maxLabel: "Severe negative impact" },
      { id: "support_during_transition", type: "radio", text: "Did you have adequate support for diabetes management during transitions?", required: true, options: ["Yes, excellent support", "Yes, adequate support", "Some support but not enough", "Very little support", "No support at all"] },
      { id: "recovery_time", type: "radio", text: "How long did it take to stabilize your diabetes management after a major transition?", required: true, options: ["Less than a month", "1-3 months", "3-6 months", "6-12 months", "More than a year", "Still adjusting"] },
      { id: "transition_advice", type: "textarea", text: "What advice would you give to someone with T1D facing a major life transition?", required: false }
    ]
  },
  {
    title: "New Parent with Diabetes Experience",
    description: "Explore the challenges of becoming a parent while managing T1D.",
    category: "Transitions",
    survey_type: "survey",
    research_category: "Transitions",
    estimated_time_minutes: 12,
    is_anonymous: true,
    requires_demographics: true,
    status: "active",
    target_responses: 350,
    consent_text: "Your parenting experiences will help other T1D individuals prepare for parenthood.",
    questions: [
      { id: "parent_stage", type: "radio", text: "What is your current parenting stage?", required: true, options: ["Planning/trying for a child", "Currently pregnant", "Have infant (0-1 year)", "Have toddler (1-3 years)", "Have young children (3-8 years)", "Have older children", "N/A - not a parent"] },
      { id: "pregnancy_planning", type: "radio", text: "If applicable, did you work with your diabetes team to plan your pregnancy?", required: true, options: ["Yes, extensive planning", "Some planning", "Minimal planning", "Unplanned pregnancy", "N/A"] },
      { id: "pregnancy_a1c_target", type: "radio", text: "What A1C target were you given for pre-conception?", required: true, options: ["Below 6.0%", "Below 6.5%", "Below 7.0%", "No specific target given", "N/A"] },
      { id: "newborn_challenges", type: "checkbox", text: "What challenges did/do you face with a newborn and T1D? (Select all that apply)", required: false, options: ["Sleep deprivation affecting glucose", "Finding time for diabetes tasks", "Breastfeeding and glucose swings", "Forgetting to eat/bolus", "Difficulty wearing devices while holding baby", "Stress affecting control", "None specific", "N/A"] },
      { id: "self_care_priority", type: "scale", text: "How well are/were you able to prioritize your diabetes self-care with a new baby?", required: true, min: 1, max: 10, minLabel: "Very poorly", maxLabel: "Very well" },
      { id: "partner_involvement", type: "radio", text: "How involved is/was your partner in supporting your diabetes while parenting?", required: true, options: ["Very involved and helpful", "Somewhat involved", "Minimal involvement", "No partner support", "N/A"] },
      { id: "postpartum_support", type: "radio", text: "Did you receive adequate diabetes support during the postpartum period?", required: true, options: ["Yes, comprehensive support", "Yes, adequate", "Some but not enough", "Very little", "None", "N/A"] },
      { id: "new_parent_tips", type: "textarea", text: "What tips would you give to someone with T1D about to become a parent?", required: false }
    ]
  },
  {
    title: "Career Change Impact Survey",
    description: "Understand how career changes affect T1D management.",
    category: "Transitions",
    survey_type: "survey",
    research_category: "Transitions",
    estimated_time_minutes: 10,
    is_anonymous: true,
    requires_demographics: true,
    status: "active",
    target_responses: 400,
    consent_text: "Your career transition experiences will help others navigate similar changes.",
    questions: [
      { id: "career_change_type", type: "checkbox", text: "What type of career changes have you experienced? (Select all that apply)", required: true, options: ["New job same field", "Complete career change", "Started own business", "Returned to work after break", "Shift work to regular hours", "Regular hours to shift work", "Remote to office", "Office to remote", "Laid off/job loss", "None"] },
      { id: "insurance_gap", type: "radio", text: "Have you experienced gaps in health insurance during career transitions?", required: true, options: ["Yes, significant gap", "Yes, brief gap with COBRA", "No, seamless transition", "Not applicable"] },
      { id: "disclosure_new_job", type: "radio", text: "Did you disclose your T1D during your most recent job change?", required: true, options: ["Yes, during interview", "Yes, after being hired", "No, kept private", "Not applicable"] },
      { id: "new_job_challenges", type: "checkbox", text: "What diabetes-related challenges did you face in a new job? (Select all that apply)", required: false, options: ["Learning new schedule", "Finding space for diabetes tasks", "New stress affecting glucose", "Different physical demands", "New insurance formulary", "Traveling/commute changes", "Explaining T1D to new coworkers", "None", "Haven't changed jobs"] },
      { id: "work_life_impact", type: "scale", text: "How much did your most recent career change impact your diabetes management?", required: true, min: 1, max: 10, minLabel: "No impact", maxLabel: "Major impact" },
      { id: "job_stability_value", type: "radio", text: "How important is job stability for insurance in your career decisions?", required: true, options: ["Primary factor", "Major factor", "One of several factors", "Minor factor", "Not a factor"] },
      { id: "career_advice", type: "textarea", text: "What advice would you give for managing T1D during career transitions?", required: false }
    ]
  },
  {
    title: "Moving to New Healthcare System",
    description: "Explore challenges of establishing diabetes care in a new location.",
    category: "Transitions",
    survey_type: "survey",
    research_category: "Transitions",
    estimated_time_minutes: 10,
    is_anonymous: true,
    requires_demographics: true,
    status: "active",
    target_responses: 350,
    consent_text: "Your relocation experiences will help others transitioning to new healthcare systems.",
    questions: [
      { id: "relocation_type", type: "radio", text: "What type of move have you made with T1D?", required: true, options: ["Within same city", "To different city (same state)", "To different state", "To different country", "Multiple moves", "Haven't moved since diagnosis"] },
      { id: "finding_new_endo", type: "radio", text: "How difficult was finding a new endocrinologist?", required: true, options: ["Very difficult - long wait or limited options", "Somewhat difficult", "Relatively easy", "Very easy", "Still looking", "Haven't moved"] },
      { id: "care_gap", type: "radio", text: "How long were you without established diabetes care after moving?", required: true, options: ["No gap - seamless transition", "Less than a month", "1-3 months", "3-6 months", "More than 6 months", "Haven't moved"] },
      { id: "prescription_challenges", type: "checkbox", text: "What prescription challenges did you face after moving? (Select all that apply)", required: false, options: ["Couldn't get refills without new doctor", "Different insurance formulary", "Prior authorizations needed again", "Different brands available", "Supply shortages", "Pharmacy issues", "None", "Haven't moved"] },
      { id: "record_transfer", type: "radio", text: "How well did your medical records transfer to new providers?", required: true, options: ["Complete and easy transfer", "Mostly transferred", "Significant gaps", "Had to start fresh", "Haven't moved"] },
      { id: "care_quality_comparison", type: "radio", text: "How did care quality compare after moving?", required: true, options: ["Much better", "Somewhat better", "About the same", "Somewhat worse", "Much worse", "Haven't moved"] },
      { id: "moving_preparation", type: "checkbox", text: "What did you do to prepare for diabetes care during a move? (Select all that apply)", required: false, options: ["Got extra prescriptions", "Researched endos in new area", "Got complete medical records", "Asked current endo for referral", "Contacted insurance about network", "Nothing specific", "Haven't moved"] },
      { id: "relocation_tips", type: "textarea", text: "What tips would you give for managing diabetes care during a relocation?", required: false }
    ]
  },
  {
    title: "Insurance Change Experience",
    description: "Understand the impact of health insurance changes on T1D care.",
    category: "Transitions",
    survey_type: "survey",
    research_category: "Transitions",
    estimated_time_minutes: 10,
    is_anonymous: true,
    requires_demographics: true,
    status: "active",
    target_responses: 450,
    consent_text: "Your insurance experiences will help advocacy for better coverage policies.",
    questions: [
      { id: "insurance_changes", type: "radio", text: "How many times has your health insurance changed in the past 5 years?", required: true, options: ["Never", "Once", "2-3 times", "4+ times", "Frequently (annually)"] },
      { id: "change_reasons", type: "checkbox", text: "What caused your insurance changes? (Select all that apply)", required: false, options: ["Changed jobs", "Employer changed plans", "Marketplace plan changes", "Aged out of parent's plan", "Marriage/divorce", "Turned 65/Medicare", "Cost", "Quality concerns", "No changes"] },
      { id: "supply_disruption", type: "radio", text: "Have insurance changes disrupted access to your diabetes supplies?", required: true, options: ["Yes, significant disruption", "Yes, brief disruption", "Minor inconvenience", "No disruption", "Haven't changed insurance"] },
      { id: "prior_auth_frequency", type: "radio", text: "How often do you need to deal with prior authorizations for diabetes supplies?", required: true, options: ["Every prescription/refill", "Annually", "When changing insurance", "Rarely", "Never"] },
      { id: "formulary_issues", type: "checkbox", text: "What formulary issues have you faced? (Select all that apply)", required: false, options: ["Preferred insulin different", "Preferred CGM different", "Preferred pump supplies different", "Higher copay tiers", "Needed to try/fail alternatives", "Not covered at all", "None"] },
      { id: "coverage_denial", type: "radio", text: "Have you ever been denied coverage for essential diabetes supplies?", required: true, options: ["Yes, multiple times", "Yes, once", "Denied then overturned on appeal", "Never denied", "Haven't tried to get coverage"] },
      { id: "insurance_stress", type: "scale", text: "How much stress does insurance management add to your diabetes burden?", required: true, min: 1, max: 10, minLabel: "No stress", maxLabel: "Extreme stress" },
      { id: "insurance_advice", type: "textarea", text: "What advice would you give for navigating insurance with T1D?", required: false }
    ]
  },
  {
    title: "Aging with Diabetes Challenges",
    description: "Explore the unique challenges of managing T1D as you age.",
    category: "Transitions",
    survey_type: "survey",
    research_category: "Transitions",
    estimated_time_minutes: 12,
    is_anonymous: true,
    requires_demographics: true,
    status: "active",
    target_responses: 350,
    consent_text: "Your aging experiences will help develop better care for older T1D adults.",
    questions: [
      { id: "age_bracket", type: "radio", text: "What is your age range?", required: true, options: ["Under 30", "30-39", "40-49", "50-59", "60-69", "70-79", "80+"] },
      { id: "years_with_t1d", type: "radio", text: "How long have you had T1D?", required: true, options: ["Less than 10 years", "10-20 years", "20-30 years", "30-40 years", "40-50 years", "50+ years"] },
      { id: "aging_changes", type: "checkbox", text: "What changes have you noticed in T1D management as you've aged? (Select all that apply)", required: true, options: ["Hypoglycemia awareness decreased", "Insulin sensitivity changed", "More stable glucose patterns", "Less stable glucose patterns", "Harder to manage with other conditions", "Vision changes affecting device use", "Dexterity changes", "Memory concerns", "None noticed"] },
      { id: "comorbidities", type: "checkbox", text: "What other health conditions do you manage alongside T1D? (Select all that apply)", required: false, options: ["Hypertension", "Thyroid conditions", "Celiac disease", "Cardiovascular disease", "Kidney disease", "Neuropathy", "Retinopathy", "Arthritis", "None", "Prefer not to say"] },
      { id: "tech_adaptation", type: "radio", text: "How well do you adapt to new diabetes technology as you age?", required: true, options: ["Easily adopt new tech", "Moderate adjustment period", "Struggle but manage", "Prefer to stick with what I know", "Rely on others to help with tech"] },
      { id: "future_care_planning", type: "radio", text: "Have you planned for future diabetes care as you age (e.g., if you can't manage alone)?", required: true, options: ["Yes, comprehensive plan", "Some planning", "Been thinking about it", "Haven't considered it yet"] },
      { id: "endo_age_awareness", type: "radio", text: "Does your healthcare team address age-related T1D concerns?", required: true, options: ["Yes, proactively addresses them", "Yes, when I bring them up", "Not really", "No", "Not applicable yet"] },
      { id: "aging_advice", type: "textarea", text: "What have you learned about managing T1D as you age that you'd share with others?", required: false }
    ]
  },
  {
    title: "Device Upgrade Transitions",
    description: "Understand the experience of transitioning to new diabetes devices.",
    category: "Transitions",
    survey_type: "survey",
    research_category: "Transitions",
    estimated_time_minutes: 8,
    is_anonymous: true,
    requires_demographics: true,
    status: "active",
    target_responses: 400,
    consent_text: "Your device upgrade experiences will help others prepare for transitions.",
    questions: [
      { id: "recent_upgrade", type: "checkbox", text: "What device upgrades have you made in the past 2 years? (Select all that apply)", required: true, options: ["CGM model upgrade (same brand)", "CGM brand change", "Pump model upgrade (same brand)", "Pump brand change", "Added AID system", "Started CGM", "Started pump", "None"] },
      { id: "upgrade_motivation", type: "checkbox", text: "What motivated your most recent upgrade? (Select all that apply)", required: false, options: ["Insurance coverage", "New features", "Doctor recommendation", "Community reviews", "Old device warranty ending", "Problems with old device", "Wanted to try something new", "N/A"] },
      { id: "training_received", type: "radio", text: "What training did you receive for your new device?", required: true, options: ["Comprehensive in-person training", "Brief in-person overview", "Online/video training only", "Self-taught from manuals", "No training", "N/A - haven't upgraded"] },
      { id: "transition_difficulty", type: "scale", text: "How difficult was the transition to your new device?", required: true, min: 1, max: 10, minLabel: "Very easy", maxLabel: "Very difficult" },
      { id: "settings_transfer", type: "radio", text: "Were your settings properly transferred to the new device?", required: true, options: ["Yes, automatic and accurate", "Yes, but needed adjustments", "Had to manually enter", "Started from scratch", "N/A"] },
      { id: "outcomes_comparison", type: "radio", text: "How do your outcomes compare with the new device vs. old?", required: true, options: ["Significantly better", "Somewhat better", "About the same", "Somewhat worse", "Significantly worse", "Too early to tell", "N/A"] },
      { id: "upgrade_tips", type: "textarea", text: "What tips would you give for making device upgrades go smoothly?", required: false }
    ]
  },
  {
    title: "MDI to Pump Transition Experience",
    description: "Explore the experience of transitioning from injections to pump therapy.",
    category: "Transitions",
    survey_type: "survey",
    research_category: "Transitions",
    estimated_time_minutes: 10,
    is_anonymous: true,
    requires_demographics: true,
    status: "active",
    target_responses: 350,
    consent_text: "Your transition experiences will help others considering pump therapy.",
    questions: [
      { id: "transition_status", type: "radio", text: "What is your MDI/pump status?", required: true, options: ["Currently on MDI, considering pump", "Recently transitioned to pump (< 1 year)", "Longtime pump user (started on MDI)", "Tried pump but went back to MDI", "Always been on pump", "Currently on MDI, not interested in pump"] },
      { id: "mdi_duration", type: "radio", text: "How long were you on MDI before switching to a pump?", required: true, options: ["Less than 1 year", "1-2 years", "2-5 years", "5-10 years", "10+ years", "Never used MDI", "Still on MDI"] },
      { id: "transition_drivers", type: "checkbox", text: "What drove/is driving your consideration of pump therapy? (Select all that apply)", required: false, options: ["Better glucose control", "Flexibility", "Fewer injections", "AID/closed-loop features", "Doctor recommendation", "Other T1D users' experiences", "Pregnancy planning", "Active lifestyle", "N/A"] },
      { id: "transition_fears", type: "checkbox", text: "What fears did/do you have about switching to a pump? (Select all that apply)", required: false, options: ["Being attached 24/7", "Device visibility", "Site changes", "Technical problems", "Cost", "Learning curve", "Sleeping with it", "Swimming/sports", "None", "N/A"] },
      { id: "adjustment_period", type: "radio", text: "How long did it take to feel comfortable with your pump?", required: true, options: ["Less than a week", "1-2 weeks", "2-4 weeks", "1-3 months", "More than 3 months", "Still adjusting", "N/A"] },
      { id: "outcomes_after_switch", type: "radio", text: "How did your glucose control change after switching to pump?", required: true, options: ["Much improved", "Somewhat improved", "About the same", "Somewhat worse", "Much worse", "N/A"] },
      { id: "biggest_surprise", type: "textarea", text: "What surprised you most about transitioning to a pump?", required: false }
    ]
  },
  {
    title: "Pregnancy Planning with T1D",
    description: "Understand the pre-conception and pregnancy planning process with T1D.",
    category: "Transitions",
    survey_type: "survey",
    research_category: "Transitions",
    estimated_time_minutes: 12,
    is_anonymous: true,
    requires_demographics: true,
    status: "active",
    target_responses: 300,
    consent_text: "Your pregnancy experiences will help others planning families with T1D.",
    questions: [
      { id: "pregnancy_status", type: "radio", text: "What is your pregnancy/family planning status?", required: true, options: ["Currently planning/trying", "Currently pregnant", "Recently gave birth (past year)", "Have children (past pregnancy with T1D)", "Chose not to have children", "Not applicable", "Prefer not to say"] },
      { id: "planning_duration", type: "radio", text: "How long did/are you spending on pre-conception planning?", required: true, options: ["Less than 3 months", "3-6 months", "6-12 months", "More than a year", "Wasn't planned", "N/A"] },
      { id: "a1c_goal_achieved", type: "radio", text: "Did you achieve your pre-conception A1C goal?", required: true, options: ["Yes, within target", "Close to target", "Above target but proceeded", "Worked on it throughout pregnancy", "No specific target set", "N/A"] },
      { id: "care_team_additions", type: "checkbox", text: "Who was added to your care team for pregnancy? (Select all that apply)", required: false, options: ["Maternal-fetal medicine specialist", "Dedicated pregnancy endo", "Diabetes educator", "Dietitian", "Mental health support", "No additions to team", "N/A"] },
      { id: "appointment_frequency", type: "radio", text: "How often did/do you see diabetes specialists during pregnancy?", required: true, options: ["Weekly", "Every 2 weeks", "Monthly", "Same as pre-pregnancy", "N/A"] },
      { id: "technology_changes", type: "checkbox", text: "What technology changes did you make for pregnancy? (Select all that apply)", required: false, options: ["Started CGM", "Started pump", "Started AID", "Changed CGM targets", "Changed pump settings frequently", "No technology changes", "N/A"] },
      { id: "pregnancy_challenges", type: "checkbox", text: "What were/are the biggest challenges of pregnancy with T1D? (Select all that apply)", required: false, options: ["Tight glucose control", "Changing insulin needs", "Fear of complications", "Appointment burden", "Work/life balance", "Finding experienced providers", "Insurance coverage", "N/A"] },
      { id: "pregnancy_advice", type: "textarea", text: "What advice would you give to someone with T1D planning a pregnancy?", required: false }
    ]
  },
  {
    title: "Retirement & Medicare Transition",
    description: "Explore the challenges of transitioning to Medicare and retirement with T1D.",
    category: "Transitions",
    survey_type: "survey",
    research_category: "Transitions",
    estimated_time_minutes: 10,
    is_anonymous: true,
    requires_demographics: true,
    status: "active",
    target_responses: 300,
    consent_text: "Your Medicare transition experiences will help others prepare for retirement.",
    questions: [
      { id: "medicare_status", type: "radio", text: "What is your Medicare status?", required: true, options: ["On Medicare (65+)", "On Medicare (disability)", "Approaching Medicare eligibility", "Not yet eligible (under 55)", "Not in US/different system"] },
      { id: "coverage_change_impact", type: "radio", text: "How did/do you expect the transition to Medicare to impact your diabetes coverage?", required: true, options: ["Significant improvement", "Slight improvement", "About the same", "Slight negative impact", "Significant negative impact", "Not sure"] },
      { id: "device_coverage", type: "radio", text: "How well does Medicare cover your diabetes devices?", required: true, options: ["Full coverage", "Good coverage with copays", "Partial coverage", "Limited coverage", "No coverage for preferred devices", "Not on Medicare"] },
      { id: "cgm_medicare_coverage", type: "radio", text: "Did you have to change CGM or pump due to Medicare coverage?", required: true, options: ["Yes, significant change required", "Yes, minor change", "No, kept same devices", "Still figuring it out", "Not on Medicare"] },
      { id: "supplemental_insurance", type: "radio", text: "Do you have supplemental insurance (Medigap/Medicare Advantage)?", required: true, options: ["Yes, Medigap plan", "Yes, Medicare Advantage", "No supplemental insurance", "Not yet decided", "Not on Medicare"] },
      { id: "cost_comparison", type: "radio", text: "How do your out-of-pocket costs compare to before Medicare?", required: true, options: ["Much lower", "Somewhat lower", "About the same", "Somewhat higher", "Much higher", "Not on Medicare"] },
      { id: "medicare_challenges", type: "checkbox", text: "What challenges have you faced with Medicare and T1D? (Select all that apply)", required: false, options: ["CGM coverage limitations", "Pump coverage issues", "Formulary differences", "Prior authorization requirements", "4-times-daily testing requirement", "Donut hole issues", "Provider acceptance", "None", "Not on Medicare"] },
      { id: "medicare_tips", type: "textarea", text: "What tips would you give for managing T1D on Medicare?", required: false }
    ]
  },
  {
    title: "College/University Transition",
    description: "Understand the challenges of managing T1D during the transition to higher education.",
    category: "Transitions",
    survey_type: "survey",
    research_category: "Transitions",
    estimated_time_minutes: 10,
    is_anonymous: true,
    requires_demographics: true,
    status: "active",
    target_responses: 350,
    consent_text: "Your college experiences will help future students prepare for university life with T1D.",
    questions: [
      { id: "college_status", type: "radio", text: "What is your current college/university status?", required: true, options: ["Currently in college", "Recently graduated (past 3 years)", "Graduated longer ago", "Planning to attend", "Didn't attend college", "Other"] },
      { id: "living_situation", type: "radio", text: "What was/is your living situation in college?", required: true, options: ["On-campus dorm", "Off-campus housing", "Living at home", "Fraternity/sorority house", "N/A"] },
      { id: "independence_level", type: "radio", text: "How independent was your diabetes management before college?", required: true, options: ["Fully independent", "Mostly independent with some parent help", "Shared management with parents", "Parents primarily managed", "N/A"] },
      { id: "college_challenges", type: "checkbox", text: "What T1D challenges did you face in college? (Select all that apply)", required: false, options: ["Irregular schedule", "Alcohol and parties", "Dining hall food", "Stress and exams", "Sleep deprivation", "Finding healthcare on campus", "Roommate issues", "Affording supplies", "No challenges", "N/A"] },
      { id: "a1c_during_college", type: "radio", text: "How did your A1C change during college compared to high school?", required: true, options: ["Improved significantly", "Improved slightly", "Stayed about the same", "Got slightly worse", "Got significantly worse", "N/A"] },
      { id: "campus_resources", type: "checkbox", text: "What campus resources did you use for T1D? (Select all that apply)", required: false, options: ["Student health center", "Disability services", "Counseling center", "Diabetes support group", "Dining services accommodations", "Housing accommodations", "None available", "Didn't need resources", "N/A"] },
      { id: "roommate_disclosure", type: "radio", text: "Did you disclose your T1D to your roommate(s)?", required: true, options: ["Yes, before living together", "Yes, after moving in", "Only after it came up", "No, kept private", "N/A"] },
      { id: "college_advice", type: "textarea", text: "What's your best advice for managing T1D in college?", required: false }
    ]
  },

  // ============================================
  // DIAGNOSIS SURVEYS (11 total)
  // ============================================
  {
    title: "Diagnosis Experience Survey",
    description: "Help researchers understand the T1D diagnosis journey to improve early detection and support.",
    category: "Diagnosis",
    survey_type: "survey",
    research_category: "Diagnosis",
    estimated_time_minutes: 12,
    is_anonymous: true,
    requires_demographics: true,
    status: "active",
    target_responses: 500,
    consent_text: "Your diagnosis story will help improve the experience for newly diagnosed individuals.",
    questions: [
      { id: "age_at_diagnosis", type: "radio", text: "At what age were you diagnosed with T1D?", required: true, options: ["0-5 years", "6-10 years", "11-15 years", "16-20 years", "21-30 years", "31-40 years", "Over 40 years"] },
      { id: "time_to_diagnosis", type: "radio", text: "How long did it take from first symptoms to diagnosis?", required: true, options: ["Less than 1 week", "1-2 weeks", "2-4 weeks", "1-3 months", "More than 3 months", "I don't remember"] },
      { id: "diagnosis_setting", type: "radio", text: "Where were you diagnosed?", required: true, options: ["Emergency room (DKA)", "Hospital (non-emergency)", "Doctor's office", "Urgent care", "Screening/routine checkup", "Don't remember"] },
      { id: "dka_at_diagnosis", type: "radio", text: "Were you in DKA (diabetic ketoacidosis) at diagnosis?", required: true, options: ["Yes, severe DKA", "Yes, moderate DKA", "Yes, mild DKA", "No DKA", "Not sure/don't remember"] },
      { id: "misdiagnosis", type: "radio", text: "Were you initially misdiagnosed?", required: true, options: ["Yes, misdiagnosed as Type 2", "Yes, misdiagnosed as something else", "Diagnosis was delayed", "No, diagnosed correctly", "Don't remember"] },
      { id: "initial_education", type: "scale", text: "How well did your initial education prepare you to manage T1D?", required: true, min: 1, max: 10, minLabel: "Not at all prepared", maxLabel: "Very well prepared" },
      { id: "emotional_support", type: "radio", text: "Did you receive adequate emotional/mental health support at diagnosis?", required: true, options: ["Yes, comprehensive support", "Yes, some support", "Minimal support", "No support offered", "Didn't need it at the time"] },
      { id: "diagnosis_impact", type: "textarea", text: "How did your diagnosis experience impact your early T1D management and mental health?", required: false }
    ]
  },
  {
    title: "Misdiagnosis Experience Study",
    description: "Understand the frequency and impact of T1D misdiagnosis.",
    category: "Diagnosis",
    survey_type: "survey",
    research_category: "Diagnosis",
    estimated_time_minutes: 10,
    is_anonymous: true,
    requires_demographics: true,
    status: "active",
    target_responses: 400,
    consent_text: "Your misdiagnosis experiences will help improve diagnostic accuracy.",
    questions: [
      { id: "initially_diagnosed", type: "radio", text: "What were you initially diagnosed with?", required: true, options: ["Type 1 Diabetes (correct)", "Type 2 Diabetes", "Gestational Diabetes", "LADA mentioned", "Viral illness", "Flu or infection", "Other condition", "Don't remember"] },
      { id: "age_at_initial_diagnosis", type: "radio", text: "What was your age when first (mis)diagnosed?", required: true, options: ["0-10 years", "11-17 years", "18-25 years", "26-35 years", "36-45 years", "Over 45 years"] },
      { id: "misdiagnosis_duration", type: "radio", text: "How long did the misdiagnosis last before correct T1D diagnosis?", required: true, options: ["Was correctly diagnosed first time", "Days", "Weeks", "Months", "1-2 years", "More than 2 years"] },
      { id: "treatment_during_misdiagnosis", type: "checkbox", text: "If misdiagnosed, what treatment were you given? (Select all that apply)", required: false, options: ["Oral diabetes medications", "Lifestyle changes only", "Wrong insulin regimen", "Antibiotics", "Other medications", "No treatment", "Correctly diagnosed - N/A"] },
      { id: "what_led_to_correct", type: "checkbox", text: "What led to the correct diagnosis? (Select all that apply)", required: false, options: ["DKA hospitalization", "Oral meds not working", "Continued weight loss", "Requested antibody testing", "Changed doctors", "Family history review", "Correctly diagnosed first time"] },
      { id: "misdiagnosis_harm", type: "scale", text: "How much harm resulted from the misdiagnosis?", required: true, min: 1, max: 10, minLabel: "No harm", maxLabel: "Severe harm" },
      { id: "antibody_testing", type: "radio", text: "Were antibody tests done during initial diagnosis?", required: true, options: ["Yes, at diagnosis", "Yes, but weeks/months later", "No, never tested", "Don't know"] },
      { id: "misdiagnosis_feelings", type: "textarea", text: "How did being misdiagnosed affect you?", required: false }
    ]
  },
  {
    title: "Time to Diagnosis Survey",
    description: "Analyze factors that speed up or delay T1D diagnosis.",
    category: "Diagnosis",
    survey_type: "survey",
    research_category: "Diagnosis",
    estimated_time_minutes: 8,
    is_anonymous: true,
    requires_demographics: true,
    status: "active",
    target_responses: 450,
    consent_text: "Your timeline will help identify opportunities for earlier diagnosis.",
    questions: [
      { id: "first_symptoms", type: "checkbox", text: "What were your first noticeable symptoms? (Select all that apply)", required: true, options: ["Excessive thirst", "Frequent urination", "Weight loss", "Fatigue", "Blurred vision", "Slow-healing wounds", "Mood changes", "Nausea/vomiting", "Fruity breath", "Don't remember symptoms"] },
      { id: "symptom_recognition", type: "radio", text: "Did you or your family recognize these as potential diabetes symptoms?", required: true, options: ["Yes, immediately suspected diabetes", "Suspected something was wrong", "Dismissed as minor/other illness", "No, didn't recognize symptoms", "Don't remember"] },
      { id: "first_medical_visit", type: "radio", text: "How long after symptoms started did you first seek medical care?", required: true, options: ["Same day", "1-3 days", "4-7 days", "1-2 weeks", "2-4 weeks", "More than a month", "Don't remember"] },
      { id: "healthcare_access", type: "radio", text: "Did access to healthcare affect your diagnosis timeline?", required: true, options: ["No barriers - quick access", "Some wait time for appointment", "Financial barriers", "Geographic barriers", "Insurance issues", "Don't remember"] },
      { id: "family_history_known", type: "radio", text: "Was there known family history of T1D before your diagnosis?", required: true, options: ["Yes, immediate family member with T1D", "Yes, extended family with T1D", "Family history of other diabetes", "No known family history", "Learned of family history after diagnosis"] },
      { id: "screening_participation", type: "radio", text: "Were you part of any T1D screening program before diagnosis?", required: true, options: ["Yes, diagnosed through screening", "Yes, but diagnosed separately", "No, wasn't aware of screening programs", "Screening wasn't available then"] },
      { id: "diagnosis_speed_factors", type: "textarea", text: "What factors sped up or delayed your diagnosis?", required: false }
    ]
  },
  {
    title: "Initial Education Quality Assessment",
    description: "Evaluate the quality of education provided at T1D diagnosis.",
    category: "Diagnosis",
    survey_type: "survey",
    research_category: "Diagnosis",
    estimated_time_minutes: 10,
    is_anonymous: true,
    requires_demographics: true,
    status: "active",
    target_responses: 450,
    consent_text: "Your education feedback will help improve programs for newly diagnosed patients.",
    questions: [
      { id: "education_setting", type: "radio", text: "Where did you receive your initial diabetes education?", required: true, options: ["Hospital inpatient", "Outpatient diabetes center", "Doctor's office", "Diabetes educator visits", "Online/self-taught", "Combination of above", "Don't remember"] },
      { id: "education_duration", type: "radio", text: "How much formal education did you receive in the first month?", required: true, options: ["Less than 1 hour", "1-3 hours", "3-6 hours", "6-12 hours", "More than 12 hours", "Don't remember"] },
      { id: "topics_covered", type: "checkbox", text: "What topics were covered in your initial education? (Select all that apply)", required: true, options: ["Insulin injection technique", "Blood glucose monitoring", "Hypoglycemia treatment", "Carb counting", "Sick day management", "Exercise guidelines", "Long-term complications", "Mental health", "Driving safety", "School/work management", "Don't remember"] },
      { id: "topics_missing", type: "checkbox", text: "What topics were NOT covered but should have been? (Select all that apply)", required: false, options: ["Day-to-day practical management", "Emotional/mental health", "Technology options", "Insurance/cost navigation", "Real-life scenarios", "Peer support/community", "Everything was covered", "Don't remember"] },
      { id: "educator_quality", type: "scale", text: "How knowledgeable were your initial diabetes educators?", required: true, min: 1, max: 10, minLabel: "Not knowledgeable", maxLabel: "Very knowledgeable" },
      { id: "education_format", type: "radio", text: "What education format would have been most helpful?", required: true, options: ["One-on-one sessions", "Group classes", "Written materials", "Videos/online", "Peer mentoring", "Combination of formats"] },
      { id: "education_improvement", type: "textarea", text: "What would have made your initial diabetes education better?", required: false }
    ]
  },
  {
    title: "First Year Challenges Survey",
    description: "Understand the major challenges faced in the first year after T1D diagnosis.",
    category: "Diagnosis",
    survey_type: "survey",
    research_category: "Diagnosis",
    estimated_time_minutes: 12,
    is_anonymous: true,
    requires_demographics: true,
    status: "active",
    target_responses: 450,
    consent_text: "Your first-year experiences will help develop better support for new diagnoses.",
    questions: [
      { id: "biggest_challenge", type: "radio", text: "What was your biggest challenge in the first year?", required: true, options: ["Learning to dose insulin", "Remembering all the tasks", "Emotional adjustment", "School/work management", "Social situations", "Hypoglycemia fear", "Cost/insurance", "Finding the right doctor", "Everything felt overwhelming"] },
      { id: "first_year_challenges", type: "checkbox", text: "What challenges did you face in year one? (Select all that apply)", required: true, options: ["Accurate carb counting", "Predicting glucose patterns", "Managing exercise", "Sleeping through the night", "Explaining T1D to others", "Maintaining mental health", "Affording supplies", "Getting time off work/school", "Dating and social life", "None significant"] },
      { id: "support_adequacy", type: "scale", text: "How adequate was your support system in the first year?", required: true, min: 1, max: 10, minLabel: "Very inadequate", maxLabel: "Very adequate" },
      { id: "a1c_first_year", type: "radio", text: "How was your A1C in the first year after diagnosis?", required: true, options: ["Below 7%", "7-8%", "8-9%", "Above 9%", "Varied significantly", "Don't remember/wasn't tested often"] },
      { id: "honeymoon_phase", type: "radio", text: "Did you experience a honeymoon phase?", required: true, options: ["Yes, several months", "Yes, briefly", "Not sure", "No", "Don't know what that is"] },
      { id: "first_year_helps", type: "checkbox", text: "What helped you most in the first year? (Select all that apply)", required: true, options: ["Supportive family", "Good healthcare team", "Online T1D communities", "Books/educational materials", "Diabetes camp", "Technology (CGM/pump)", "Other people with T1D", "Therapy/counseling", "Time and experience"] },
      { id: "what_you_wish_known", type: "textarea", text: "What do you wish you had known in your first year with T1D?", required: false }
    ]
  },
  {
    title: "Family Impact at Diagnosis",
    description: "Explore how T1D diagnosis affects the entire family unit.",
    category: "Diagnosis",
    survey_type: "survey",
    research_category: "Diagnosis",
    estimated_time_minutes: 10,
    is_anonymous: true,
    requires_demographics: true,
    status: "active",
    target_responses: 400,
    consent_text: "Your family's experience will help develop better family support resources.",
    questions: [
      { id: "family_role", type: "radio", text: "What was your role at diagnosis?", required: true, options: ["Person diagnosed (child)", "Person diagnosed (adult)", "Parent of diagnosed child", "Spouse/partner of diagnosed adult", "Sibling of diagnosed person", "Other family member"] },
      { id: "family_adjustment", type: "scale", text: "How difficult was the adjustment for your family?", required: true, min: 1, max: 10, minLabel: "Not difficult", maxLabel: "Extremely difficult" },
      { id: "family_education", type: "radio", text: "Was your family included in diabetes education?", required: true, options: ["Yes, all family members", "Yes, primary caregivers only", "Partially", "No, I educated them myself", "No family involvement", "N/A - diagnosed as adult living alone"] },
      { id: "relationship_changes", type: "checkbox", text: "How did family relationships change after diagnosis? (Select all that apply)", required: true, options: ["Brought family closer", "Created tension/conflict", "Shifted responsibility to one parent/partner", "Siblings felt neglected", "Overprotection developed", "No significant change"] },
      { id: "family_mental_health", type: "radio", text: "Did any family members need mental health support due to the diagnosis?", required: true, options: ["Yes, multiple family members", "Yes, one family member", "Considered but didn't seek it", "No, but probably should have", "No, not needed"] },
      { id: "sibling_impact", type: "radio", text: "If there are siblings, how were they affected?", required: true, options: ["Received less attention", "Worried about getting T1D", "Became protective/helpful", "Felt guilty", "Not significantly affected", "No siblings/not applicable"] },
      { id: "family_roles_now", type: "radio", text: "How involved is your family in T1D management now?", required: true, options: ["Very involved", "Moderately involved", "Minimally involved", "Not involved", "I live independently"] },
      { id: "family_advice", type: "textarea", text: "What advice would you give families facing a new T1D diagnosis?", required: false }
    ]
  },
  {
    title: "Honeymoon Phase Experience",
    description: "Study the honeymoon phase of T1D and its implications for management.",
    category: "Diagnosis",
    survey_type: "survey",
    research_category: "Diagnosis",
    estimated_time_minutes: 8,
    is_anonymous: true,
    requires_demographics: true,
    status: "active",
    target_responses: 400,
    consent_text: "Your honeymoon phase experience will help others navigate this confusing period.",
    questions: [
      { id: "honeymoon_experienced", type: "radio", text: "Did you experience a honeymoon phase?", required: true, options: ["Yes, clearly", "Possibly/not sure", "No", "Still in honeymoon", "Don't know what that is"] },
      { id: "honeymoon_duration", type: "radio", text: "How long did/has your honeymoon phase last(ed)?", required: true, options: ["Less than 1 month", "1-3 months", "3-6 months", "6-12 months", "1-2 years", "More than 2 years", "Still ongoing", "N/A"] },
      { id: "honeymoon_insulin", type: "radio", text: "During honeymoon, how much did your insulin needs decrease?", required: true, options: ["Significantly (needed very little)", "Moderately reduced", "Slightly reduced", "Not noticeably reduced", "N/A"] },
      { id: "honeymoon_control", type: "radio", text: "How was your glucose control during honeymoon?", required: true, options: ["Much easier than expected", "Relatively easy", "Variable", "Still challenging", "N/A"] },
      { id: "honeymoon_expectations", type: "radio", text: "Were you warned that the honeymoon would end?", required: true, options: ["Yes, clearly explained", "Briefly mentioned", "Only after it ended", "No, I learned on my own", "N/A"] },
      { id: "honeymoon_end_experience", type: "radio", text: "How did you feel when the honeymoon ended?", required: true, options: ["Prepared and adjusted well", "Surprised but managed", "Struggled significantly", "Felt like diagnosis all over", "Still in honeymoon", "N/A"] },
      { id: "honeymoon_management_changes", type: "checkbox", text: "What changed when honeymoon ended? (Select all that apply)", required: false, options: ["Increased insulin doses", "More glucose variability", "Needed to start CGM", "Needed to start pump", "More difficult control", "Nothing significant", "N/A"] },
      { id: "honeymoon_advice", type: "textarea", text: "What advice would you give to someone currently in the honeymoon phase?", required: false }
    ]
  },
  {
    title: "Initial Device Decisions Survey",
    description: "Understand what influences early technology decisions after T1D diagnosis.",
    category: "Diagnosis",
    survey_type: "survey",
    research_category: "Diagnosis",
    estimated_time_minutes: 10,
    is_anonymous: true,
    requires_demographics: true,
    status: "active",
    target_responses: 400,
    consent_text: "Your device decision experiences will help newly diagnosed individuals make choices.",
    questions: [
      { id: "time_to_cgm", type: "radio", text: "How soon after diagnosis did you start using a CGM?", required: true, options: ["Immediately (within first week)", "Within first month", "1-6 months", "6-12 months", "1-2 years", "More than 2 years", "Still don't use CGM"] },
      { id: "time_to_pump", type: "radio", text: "How soon after diagnosis did you start using an insulin pump?", required: true, options: ["Within first month", "1-6 months", "6-12 months", "1-2 years", "2-5 years", "More than 5 years", "Never used/still on MDI"] },
      { id: "cgm_first_choice", type: "radio", text: "Was your first CGM based on preference or what was available/covered?", required: true, options: ["My choice after research", "Doctor recommendation", "What insurance covered", "Only option available", "Given during hospital stay", "N/A - don't use CGM"] },
      { id: "pump_first_choice", type: "radio", text: "Was your first pump based on preference or what was available/covered?", required: true, options: ["My choice after research", "Doctor recommendation", "What insurance covered", "Only option available", "N/A - don't use pump"] },
      { id: "decision_influences", type: "checkbox", text: "What influenced your early device decisions? (Select all that apply)", required: true, options: ["Doctor's recommendation", "Insurance coverage", "Cost out of pocket", "Online research", "Other T1D users", "Features offered", "Size/aesthetics", "Brand reputation", "Parent decision (if diagnosed young)"] },
      { id: "regret_early_decisions", type: "radio", text: "Do you regret any early technology decisions?", required: true, options: ["Yes, wish I had started sooner", "Yes, chose wrong device", "Slightly wish I did something different", "No regrets", "Too early to say"] },
      { id: "advice_for_new_diagnoses", type: "textarea", text: "What device advice would you give to someone newly diagnosed?", required: false }
    ]
  },
  {
    title: "Early Warning Signs Recognition",
    description: "Improve awareness of T1D symptoms for faster diagnosis.",
    category: "Diagnosis",
    survey_type: "survey",
    research_category: "Diagnosis",
    estimated_time_minutes: 8,
    is_anonymous: true,
    requires_demographics: true,
    status: "active",
    target_responses: 500,
    consent_text: "Your symptom experiences will help improve T1D awareness campaigns.",
    questions: [
      { id: "symptoms_experienced", type: "checkbox", text: "Which symptoms did you experience before diagnosis? (Select all that apply)", required: true, options: ["Extreme thirst", "Frequent urination", "Unexplained weight loss", "Constant fatigue", "Blurry vision", "Slow-healing cuts", "Mood changes/irritability", "Nausea or vomiting", "Stomach pain", "Fruity breath odor", "Rapid/heavy breathing", "None that I remember"] },
      { id: "most_noticeable", type: "radio", text: "What was your most noticeable symptom?", required: true, options: ["Thirst/urination", "Weight loss", "Fatigue", "Vision changes", "Mood changes", "Nausea/vomiting", "Don't remember"] },
      { id: "symptom_duration", type: "radio", text: "How long did you have symptoms before diagnosis?", required: true, options: ["Less than 1 week", "1-2 weeks", "2-4 weeks", "1-2 months", "2-6 months", "More than 6 months", "Don't remember"] },
      { id: "who_noticed", type: "radio", text: "Who first noticed something was wrong?", required: true, options: ["I noticed myself", "Parent", "Spouse/partner", "Teacher/coach", "Friend", "Doctor during routine visit", "Other", "Don't remember"] },
      { id: "initial_explanation", type: "radio", text: "Before diagnosis, what did you think was causing the symptoms?", required: true, options: ["Suspected diabetes", "Thought it was a virus/flu", "Thought it was stress", "Thought nothing of it", "Other explanation", "Don't remember"] },
      { id: "awareness_beforehand", type: "radio", text: "Were you aware of T1D symptoms before your diagnosis?", required: true, options: ["Yes, very aware", "Somewhat aware", "Heard of diabetes but not symptoms", "Not aware at all"] },
      { id: "symptom_awareness_message", type: "textarea", text: "What T1D symptom awareness message would you share?", required: false }
    ]
  },
  {
    title: "Diagnosis Age Impact Study",
    description: "Compare how diagnosis at different ages affects the T1D journey.",
    category: "Diagnosis",
    survey_type: "survey",
    research_category: "Diagnosis",
    estimated_time_minutes: 10,
    is_anonymous: true,
    requires_demographics: true,
    status: "active",
    target_responses: 450,
    consent_text: "Your age-related experiences will help tailor support for different life stages.",
    questions: [
      { id: "diagnosis_age_exact", type: "radio", text: "At what age were you diagnosed?", required: true, options: ["0-2 years", "3-5 years", "6-10 years", "11-15 years", "16-20 years", "21-30 years", "31-40 years", "41-50 years", "Over 50 years"] },
      { id: "age_advantages", type: "checkbox", text: "What advantages came from your age at diagnosis? (Select all that apply)", required: true, options: ["Don't remember life without T1D", "Parents handled early management", "Old enough to understand", "Had established routines", "More maturity for self-care", "Peer support available", "Can't identify any advantages"] },
      { id: "age_disadvantages", type: "checkbox", text: "What disadvantages came from your age at diagnosis? (Select all that apply)", required: true, options: ["Don't remember life without T1D", "Affected childhood experiences", "Difficult teen years with T1D", "Established habits hard to change", "Career/family disruption", "Adult-onset misdiagnosis risk", "Can't identify disadvantages"] },
      { id: "self_management_age", type: "radio", text: "At what age did you take over primary T1D management?", required: true, options: ["Always managed by others", "10-12 years", "13-15 years", "16-18 years", "Was an adult at diagnosis"] },
      { id: "age_specific_challenges", type: "checkbox", text: "What age-specific challenges did you face? (Select all that apply)", required: false, options: ["School management", "Sports and activities", "Puberty glucose swings", "Teen independence conflicts", "College transition", "Career establishment", "Family planning", "Aging with long-duration T1D", "None specific"] },
      { id: "comparison_thoughts", type: "radio", text: "Do you think being diagnosed at a different age would have been better?", required: true, options: ["Earlier would have been better", "Later would have been better", "My age was fine", "Impossible to say"] },
      { id: "age_specific_advice", type: "textarea", text: "What advice would you give to someone diagnosed at your age?", required: false }
    ]
  },
  {
    title: "Support Resources at Diagnosis",
    description: "Evaluate what support resources are helpful at the time of T1D diagnosis.",
    category: "Diagnosis",
    survey_type: "survey",
    research_category: "Diagnosis",
    estimated_time_minutes: 10,
    is_anonymous: true,
    requires_demographics: true,
    status: "active",
    target_responses: 450,
    consent_text: "Your resource experiences will help improve support for newly diagnosed individuals.",
    questions: [
      { id: "resources_offered", type: "checkbox", text: "What resources were offered to you at diagnosis? (Select all that apply)", required: true, options: ["Diabetes educator sessions", "Nutritionist consultation", "Social worker", "Psychologist/counselor", "Written materials", "Online resources", "Support group info", "Connection to other T1Ds", "Diabetes camp info", "None offered"] },
      { id: "resources_used", type: "checkbox", text: "Which resources did you actually use? (Select all that apply)", required: true, options: ["Diabetes educator sessions", "Nutritionist consultation", "Social worker", "Psychologist/counselor", "Written materials", "Online resources", "Support groups", "Peer connections", "Diabetes camp", "None used"] },
      { id: "most_helpful_resource", type: "radio", text: "What was the single most helpful resource?", required: true, options: ["Diabetes educator", "Nutritionist", "Mental health support", "Books/written materials", "Online communities", "In-person support groups", "Other T1D individuals", "Diabetes camp", "None were helpful"] },
      { id: "missing_resources", type: "checkbox", text: "What resources do you wish had been available? (Select all that apply)", required: false, options: ["Peer mentor with T1D", "Parent support group", "Online community connection", "Mental health support", "Financial/insurance guidance", "School/work advocacy", "Technology guidance", "Everything I needed was available"] },
      { id: "resource_timing", type: "radio", text: "When did you find the most helpful resources?", required: true, options: ["Immediately at diagnosis", "Within first month", "First 6 months", "First year", "After the first year", "Still looking for good resources"] },
      { id: "t1d_connection", type: "radio", text: "How soon after diagnosis did you connect with another person with T1D?", required: true, options: ["Immediately knew someone", "Within first month", "First 6 months", "First year", "After the first year", "Still haven't connected"] },
      { id: "resource_recommendation", type: "textarea", text: "What resource would you most recommend to someone newly diagnosed?", required: false }
    ]
  },

  // ============================================
  // HEALTH OUTCOMES SURVEYS (11 total)
  // ============================================
  {
    title: "Long-term Health Outcomes Study",
    description: "Track health outcomes over the diabetes journey to inform long-term care strategies.",
    category: "Health Outcomes",
    survey_type: "survey",
    research_category: "Health Outcomes",
    estimated_time_minutes: 12,
    is_anonymous: true,
    requires_demographics: true,
    status: "active",
    target_responses: 500,
    consent_text: "Your health outcomes will help improve long-term T1D care and complication prevention.",
    questions: [
      { id: "years_with_t1d", type: "radio", text: "How long have you had T1D?", required: true, options: ["Less than 5 years", "5-10 years", "10-20 years", "20-30 years", "30-40 years", "More than 40 years"] },
      { id: "current_a1c", type: "radio", text: "What is your most recent A1C?", required: true, options: ["Below 6%", "6.0-6.5%", "6.5-7.0%", "7.0-7.5%", "7.5-8.0%", "8.0-9.0%", "Above 9%", "Don't know"] },
      { id: "a1c_over_time", type: "radio", text: "How has your A1C trended over your years with T1D?", required: true, options: ["Steadily improved", "Mostly stable", "Varied significantly", "Gradually increased", "Recently improved after years of higher"] },
      { id: "complications", type: "checkbox", text: "Which complications have you been diagnosed with? (Select all that apply)", required: true, options: ["Retinopathy (eye)", "Nephropathy (kidney)", "Neuropathy (nerve)", "Cardiovascular disease", "Foot problems", "Gastroparesis", "Celiac disease", "Thyroid condition", "None", "Prefer not to say"] },
      { id: "complication_severity", type: "radio", text: "If you have complications, how would you rate their impact on daily life?", required: true, options: ["Minimal impact", "Moderate impact", "Significant impact", "Severe impact", "No complications"] },
      { id: "screening_adherence", type: "radio", text: "How consistently do you attend complication screening appointments?", required: true, options: ["Always attend all screenings", "Usually attend most screenings", "Attend some screenings", "Rarely attend screenings", "Haven't been recommended screenings"] },
      { id: "preventive_care", type: "checkbox", text: "What preventive care do you regularly receive? (Select all that apply)", required: true, options: ["Annual eye exam", "Annual foot exam", "Regular kidney function tests", "Cholesterol monitoring", "Blood pressure monitoring", "Dental checkups", "Flu vaccinations", "None regularly"] },
      { id: "health_outlook", type: "textarea", text: "How has your overall health outlook changed over your years with T1D?", required: false }
    ]
  },
  {
    title: "A1C Trends Over Time Survey",
    description: "Understand factors that influence A1C changes over the T1D journey.",
    category: "Health Outcomes",
    survey_type: "survey",
    research_category: "Health Outcomes",
    estimated_time_minutes: 8,
    is_anonymous: true,
    requires_demographics: true,
    status: "active",
    target_responses: 500,
    consent_text: "Your A1C history will help identify successful management strategies.",
    questions: [
      { id: "lowest_a1c", type: "radio", text: "What is the lowest A1C you've achieved?", required: true, options: ["Below 5.5%", "5.5-6.0%", "6.0-6.5%", "6.5-7.0%", "7.0-7.5%", "7.5-8.0%", "Above 8%", "Don't know"] },
      { id: "highest_a1c", type: "radio", text: "What is the highest A1C you've had (excluding diagnosis)?", required: true, options: ["Below 7%", "7-8%", "8-9%", "9-10%", "10-12%", "Above 12%", "Don't know"] },
      { id: "a1c_improvement_factor", type: "checkbox", text: "What has most helped improve your A1C? (Select all that apply)", required: true, options: ["CGM use", "Insulin pump", "AID/closed loop", "Carb counting improvement", "Exercise routine", "Dietary changes", "Better healthcare team", "Mental health support", "Life changes (less stress)", "Nothing has helped", "A1C has always been good"] },
      { id: "a1c_worsening_factors", type: "checkbox", text: "What has caused your A1C to worsen? (Select all that apply)", required: false, options: ["Life stress", "Diabetes burnout", "Depression/anxiety", "Work/school demands", "Financial barriers", "Loss of healthcare access", "Pregnancy", "Other health conditions", "A1C has never worsened", "N/A"] },
      { id: "target_a1c", type: "radio", text: "What A1C target have you and your doctor agreed on?", required: true, options: ["Below 6%", "Below 6.5%", "Below 7%", "Below 7.5%", "Below 8%", "No specific target", "Haven't discussed target"] },
      { id: "realistic_target", type: "radio", text: "Do you feel your A1C target is realistic for you?", required: true, options: ["Yes, achievable and right for me", "Maybe, with more effort", "Too aggressive for my situation", "Too lenient - I could do better", "Not sure what's realistic"] },
      { id: "a1c_vs_tir", type: "radio", text: "Which metric do you focus on more?", required: true, options: ["A1C primarily", "Time in Range primarily", "Both equally", "Neither - go by how I feel", "Don't track either regularly"] }
    ]
  },
  {
    title: "Complication Screening Adherence",
    description: "Assess how well T1D individuals adhere to complication screening recommendations.",
    category: "Health Outcomes",
    survey_type: "survey",
    research_category: "Health Outcomes",
    estimated_time_minutes: 10,
    is_anonymous: true,
    requires_demographics: true,
    status: "active",
    target_responses: 450,
    consent_text: "Your screening patterns will help improve complication prevention programs.",
    questions: [
      { id: "eye_exam_frequency", type: "radio", text: "How often do you get dilated eye exams?", required: true, options: ["Annually", "Every 2 years", "Less often", "Only when symptoms", "Never", "Had recent exam, now on different schedule"] },
      { id: "last_eye_exam", type: "radio", text: "When was your last dilated eye exam?", required: true, options: ["Within 6 months", "6-12 months ago", "1-2 years ago", "2-5 years ago", "More than 5 years", "Never had one"] },
      { id: "kidney_screening", type: "radio", text: "How often is your kidney function tested (urine albumin, blood creatinine)?", required: true, options: ["Every visit", "Annually", "Every 2 years", "Rarely", "Never", "Not sure"] },
      { id: "foot_exam", type: "radio", text: "How often does a healthcare provider examine your feet?", required: true, options: ["Every visit", "Annually", "Less often", "Never - I check myself", "Never checked"] },
      { id: "lipid_panel", type: "radio", text: "How often do you have cholesterol/lipid panel checked?", required: true, options: ["Annually", "Every 2 years", "Less often", "Only when requested", "Never"] },
      { id: "screening_barriers", type: "checkbox", text: "What barriers prevent you from getting recommended screenings? (Select all that apply)", required: false, options: ["Cost/insurance", "Time constraints", "Forget/not reminded", "Anxiety about results", "Don't think they're necessary", "Can't find specialists", "No barriers - I stay on schedule"] },
      { id: "screening_motivation", type: "checkbox", text: "What motivates you to attend screenings? (Select all that apply)", required: true, options: ["Want to catch problems early", "Doctor's recommendation", "Family pressure", "Peace of mind", "Had a scare before", "Required for insurance/work", "Nothing - I don't prioritize screenings"] },
      { id: "screening_improvement", type: "textarea", text: "What would make it easier for you to stay on top of screenings?", required: false }
    ]
  },
  {
    title: "Time in Range Improvement Strategies",
    description: "Identify successful strategies for improving Time in Range.",
    category: "Health Outcomes",
    survey_type: "survey",
    research_category: "Health Outcomes",
    estimated_time_minutes: 10,
    is_anonymous: true,
    requires_demographics: true,
    status: "active",
    target_responses: 500,
    consent_text: "Your TIR strategies will help others improve their glucose management.",
    questions: [
      { id: "current_tir", type: "radio", text: "What is your typical Time in Range (70-180 mg/dL)?", required: true, options: ["Below 30%", "30-40%", "40-50%", "50-60%", "60-70%", "70-80%", "Above 80%", "Don't track TIR"] },
      { id: "tir_improvement", type: "radio", text: "Has your TIR improved in the past year?", required: true, options: ["Improved significantly (>10%)", "Improved moderately (5-10%)", "Improved slightly (<5%)", "Stayed the same", "Got worse", "Don't track"] },
      { id: "biggest_tir_impact", type: "radio", text: "What has had the biggest positive impact on your TIR?", required: true, options: ["CGM technology", "Insulin pump", "AID/closed-loop", "Pre-bolusing", "Low-carb diet", "Exercise routine", "Better sleep", "Stress management", "Nothing specific", "Haven't improved TIR"] },
      { id: "tir_strategies", type: "checkbox", text: "What strategies help you maintain good TIR? (Select all that apply)", required: true, options: ["Pre-bolusing", "Low-carb eating", "Consistent meal timing", "Exercise routine", "Good sleep", "Stress management", "Avoiding alcohol", "Staying hydrated", "Nothing specific works", "TIR is not a focus"] },
      { id: "tir_challenges", type: "checkbox", text: "What most negatively impacts your TIR? (Select all that apply)", required: true, options: ["Restaurant meals", "Stress", "Sleep deprivation", "Exercise variability", "Illness", "Menstrual cycle", "Travel", "Social events", "Nothing specific"] },
      { id: "tir_vs_a1c", type: "scale", text: "How important is TIR compared to A1C in your management?", required: true, min: 1, max: 10, minLabel: "A1C is more important", maxLabel: "TIR is more important" },
      { id: "tir_goal", type: "radio", text: "What is your TIR goal?", required: true, options: ["Above 70%", "Above 60%", "Above 50%", "Above 40%", "Any improvement", "No specific goal"] },
      { id: "tir_tips", type: "textarea", text: "What's your best tip for improving Time in Range?", required: false }
    ]
  },
  {
    title: "Eye Health Monitoring Practices",
    description: "Assess eye health practices and retinopathy awareness in the T1D community.",
    category: "Health Outcomes",
    survey_type: "survey",
    research_category: "Health Outcomes",
    estimated_time_minutes: 8,
    is_anonymous: true,
    requires_demographics: true,
    status: "active",
    target_responses: 450,
    consent_text: "Your eye health experiences will help improve retinopathy prevention.",
    questions: [
      { id: "retinopathy_status", type: "radio", text: "Have you been diagnosed with diabetic retinopathy?", required: true, options: ["No retinopathy", "Mild/background retinopathy", "Moderate retinopathy", "Severe/proliferative retinopathy", "Had treatment (laser/injection)", "Not sure", "Never been checked"] },
      { id: "exam_type", type: "radio", text: "What type of eye exams do you receive?", required: true, options: ["Dilated exam by ophthalmologist", "Dilated exam by optometrist", "Retinal imaging (no dilation)", "Basic eye exam only", "Combination of above", "Haven't had diabetes eye exam"] },
      { id: "exam_regularity", type: "radio", text: "How regularly do you get diabetes eye exams?", required: true, options: ["Annually or more often", "Every 2 years", "Less than every 2 years", "Only when symptomatic", "Never had one"] },
      { id: "vision_changes", type: "checkbox", text: "Have you noticed any vision changes? (Select all that apply)", required: true, options: ["Blurry vision", "Floaters", "Dark spots", "Difficulty with night vision", "Color perception changes", "No changes noticed"] },
      { id: "exam_barriers", type: "checkbox", text: "What barriers affect your eye exam attendance? (Select all that apply)", required: false, options: ["Cost", "Time off work/school", "Transportation", "Fear of results", "Dilated exam inconvenience", "Can't find specialist", "No barriers - I attend regularly"] },
      { id: "glucose_vision_connection", type: "radio", text: "Do you notice vision changes with glucose fluctuations?", required: true, options: ["Yes, frequently", "Yes, occasionally", "Rarely", "Never", "Haven't paid attention"] },
      { id: "eye_health_concern", type: "scale", text: "How concerned are you about long-term eye health?", required: true, min: 1, max: 10, minLabel: "Not concerned", maxLabel: "Very concerned" }
    ]
  },
  {
    title: "Kidney Health Awareness Survey",
    description: "Assess kidney health monitoring and diabetic nephropathy awareness.",
    category: "Health Outcomes",
    survey_type: "survey",
    research_category: "Health Outcomes",
    estimated_time_minutes: 8,
    is_anonymous: true,
    requires_demographics: true,
    status: "active",
    target_responses: 450,
    consent_text: "Your kidney health experiences will help improve nephropathy prevention.",
    questions: [
      { id: "kidney_status", type: "radio", text: "What is your current kidney health status?", required: true, options: ["No kidney issues", "Microalbuminuria (early stage)", "Macroalbuminuria", "Chronic kidney disease (CKD)", "On dialysis", "Kidney transplant", "Not sure - haven't been tested"] },
      { id: "urine_test_frequency", type: "radio", text: "How often is your urine tested for protein/albumin?", required: true, options: ["Every visit", "Annually", "Every 2 years", "Rarely", "Never", "Not sure"] },
      { id: "egfr_awareness", type: "radio", text: "Do you know your eGFR (kidney function measure)?", required: true, options: ["Yes, I track it regularly", "Yes, I know the recent result", "I've seen it but don't remember", "No, I don't know what it is", "Never been tested"] },
      { id: "kidney_protective_steps", type: "checkbox", text: "What steps do you take to protect kidney health? (Select all that apply)", required: true, options: ["Control blood glucose", "Control blood pressure", "Take ACE inhibitor/ARB medication", "Limit sodium intake", "Stay hydrated", "Avoid NSAIDs", "Regular monitoring", "Nothing specific", "Not sure what to do"] },
      { id: "blood_pressure_monitoring", type: "radio", text: "How often is your blood pressure checked?", required: true, options: ["Every medical visit", "Monthly", "Occasionally", "Rarely", "I check at home regularly", "I check at home occasionally"] },
      { id: "kidney_education", type: "radio", text: "Have you received education about diabetic kidney disease?", required: true, options: ["Yes, comprehensive", "Yes, basic information", "Briefly mentioned", "No, never discussed", "I've researched on my own"] },
      { id: "kidney_concern", type: "scale", text: "How concerned are you about kidney health?", required: true, min: 1, max: 10, minLabel: "Not concerned", maxLabel: "Very concerned" }
    ]
  },
  {
    title: "Cardiovascular Risk Management",
    description: "Assess heart health awareness and management practices in T1D.",
    category: "Health Outcomes",
    survey_type: "survey",
    research_category: "Health Outcomes",
    estimated_time_minutes: 10,
    is_anonymous: true,
    requires_demographics: true,
    status: "active",
    target_responses: 450,
    consent_text: "Your cardiovascular experiences will help improve heart health in T1D.",
    questions: [
      { id: "cv_history", type: "checkbox", text: "Have you been diagnosed with any cardiovascular conditions? (Select all that apply)", required: true, options: ["High blood pressure", "High cholesterol", "Coronary artery disease", "Heart attack history", "Stroke history", "Heart failure", "Arrhythmia", "None", "Prefer not to say"] },
      { id: "cholesterol_monitoring", type: "radio", text: "How often is your cholesterol checked?", required: true, options: ["Annually", "Every 2-3 years", "Less often", "Only when symptomatic", "Never"] },
      { id: "statin_use", type: "radio", text: "Do you take a statin or other cholesterol medication?", required: true, options: ["Yes", "No, but recommended", "No, not recommended", "Stopped due to side effects", "Not sure"] },
      { id: "bp_medication", type: "radio", text: "Do you take blood pressure medication?", required: true, options: ["Yes, for BP control", "Yes, for kidney protection", "Yes, for both reasons", "No, don't need it", "No, but may need to start"] },
      { id: "cv_risk_awareness", type: "scale", text: "How aware are you that T1D increases cardiovascular risk?", required: true, min: 1, max: 10, minLabel: "Not aware", maxLabel: "Very aware" },
      { id: "heart_healthy_habits", type: "checkbox", text: "What heart-healthy habits do you practice? (Select all that apply)", required: true, options: ["Regular exercise", "Heart-healthy diet", "Maintain healthy weight", "Don't smoke", "Limit alcohol", "Manage stress", "Take recommended medications", "None specifically"] },
      { id: "cv_education", type: "radio", text: "Has your healthcare team discussed cardiovascular risk with you?", required: true, options: ["Yes, in detail", "Yes, briefly", "No, never discussed", "I've researched on my own"] },
      { id: "cv_concern", type: "scale", text: "How concerned are you about heart health?", required: true, min: 1, max: 10, minLabel: "Not concerned", maxLabel: "Very concerned" }
    ]
  },
  {
    title: "Foot Care Practices Survey",
    description: "Evaluate foot care practices and neuropathy awareness in the T1D community.",
    category: "Health Outcomes",
    survey_type: "survey",
    research_category: "Health Outcomes",
    estimated_time_minutes: 8,
    is_anonymous: true,
    requires_demographics: true,
    status: "active",
    target_responses: 450,
    consent_text: "Your foot care experiences will help improve neuropathy prevention.",
    questions: [
      { id: "neuropathy_status", type: "radio", text: "Do you have diabetic neuropathy (nerve damage)?", required: true, options: ["No, no symptoms", "Yes, mild symptoms", "Yes, moderate symptoms", "Yes, significant symptoms", "Not sure/haven't been tested"] },
      { id: "neuropathy_symptoms", type: "checkbox", text: "What symptoms have you experienced? (Select all that apply)", required: false, options: ["Tingling/pins and needles", "Numbness", "Burning sensation", "Sharp pains", "Sensitivity to touch", "Loss of temperature sensation", "Muscle weakness", "None"] },
      { id: "daily_foot_check", type: "radio", text: "How often do you check your feet for problems?", required: true, options: ["Daily", "Few times a week", "Weekly", "Occasionally", "Rarely", "Never"] },
      { id: "professional_foot_exam", type: "radio", text: "How often does a healthcare provider examine your feet?", required: true, options: ["Every visit", "Annually", "Less often", "Never", "Only when I have a problem"] },
      { id: "podiatrist_visits", type: "radio", text: "Do you see a podiatrist regularly?", required: true, options: ["Yes, regularly", "Yes, occasionally", "Only when there's a problem", "Never", "Been referred but haven't gone"] },
      { id: "foot_care_practices", type: "checkbox", text: "What foot care practices do you follow? (Select all that apply)", required: true, options: ["Daily foot inspection", "Proper footwear", "Never walk barefoot", "Keep feet moisturized", "Check water temperature", "Cut nails carefully", "See podiatrist regularly", "None specifically"] },
      { id: "foot_injury_history", type: "radio", text: "Have you had any foot injuries or wounds that healed slowly?", required: true, options: ["Yes, significant wound", "Yes, minor issues", "No, never", "Yes, led to serious complication"] },
      { id: "foot_health_concern", type: "scale", text: "How concerned are you about foot health?", required: true, min: 1, max: 10, minLabel: "Not concerned", maxLabel: "Very concerned" }
    ]
  },
  {
    title: "Mental Health Screening Experiences",
    description: "Assess mental health screening and support within diabetes care.",
    category: "Health Outcomes",
    survey_type: "survey",
    research_category: "Health Outcomes",
    estimated_time_minutes: 10,
    is_anonymous: true,
    requires_demographics: true,
    status: "active",
    target_responses: 500,
    consent_text: "Your mental health experiences will help improve psychosocial support in T1D care.",
    questions: [
      { id: "mental_health_screening", type: "radio", text: "Has your diabetes care team ever screened you for depression/anxiety?", required: true, options: ["Yes, regularly", "Yes, once", "I filled out a questionnaire once", "No, never", "Not sure"] },
      { id: "mental_health_conditions", type: "checkbox", text: "Have you been diagnosed with any mental health conditions? (Select all that apply)", required: true, options: ["Depression", "Anxiety", "Diabetes distress/burnout", "Eating disorder", "PTSD", "Other", "None", "Prefer not to say"] },
      { id: "mental_health_support", type: "radio", text: "Have you received mental health support related to your diabetes?", required: true, options: ["Yes, from diabetes-specialized provider", "Yes, from general mental health provider", "Tried but couldn't find appropriate support", "Wanted to but barriers prevented", "Haven't needed/sought support"] },
      { id: "diabetes_impact_mental", type: "scale", text: "How much has T1D affected your mental health?", required: true, min: 1, max: 10, minLabel: "No impact", maxLabel: "Severe impact" },
      { id: "care_integration", type: "radio", text: "Is mental health support integrated into your diabetes care?", required: true, options: ["Yes, fully integrated", "Somewhat connected", "Separate but communicated", "Completely separate", "No mental health support"] },
      { id: "mental_health_barriers", type: "checkbox", text: "What barriers affect mental health care access? (Select all that apply)", required: false, options: ["Cost/insurance", "Stigma", "Time", "Can't find diabetes-aware providers", "Doesn't seem necessary", "Previous bad experience", "No barriers - I access care freely"] },
      { id: "peer_support_value", type: "scale", text: "How valuable is peer support (from other T1Ds) for your mental health?", required: true, min: 1, max: 10, minLabel: "Not valuable", maxLabel: "Extremely valuable" },
      { id: "mental_health_improvement", type: "textarea", text: "How could mental health support in diabetes care be improved?", required: false }
    ]
  },
  {
    title: "Preventive Care Adherence",
    description: "Assess overall preventive care practices in the T1D population.",
    category: "Health Outcomes",
    survey_type: "survey",
    research_category: "Health Outcomes",
    estimated_time_minutes: 8,
    is_anonymous: true,
    requires_demographics: true,
    status: "active",
    target_responses: 450,
    consent_text: "Your preventive care patterns will help improve health maintenance guidance.",
    questions: [
      { id: "annual_physical", type: "radio", text: "How often do you have an annual physical/checkup?", required: true, options: ["Annually", "Every 2 years", "Less often", "Only when sick", "Never"] },
      { id: "dental_visits", type: "radio", text: "How often do you see a dentist?", required: true, options: ["Twice a year", "Annually", "Every 2 years", "Less often", "Only when problems arise", "Never"] },
      { id: "flu_vaccine", type: "radio", text: "Do you get an annual flu vaccine?", required: true, options: ["Yes, every year", "Most years", "Sometimes", "Rarely", "Never"] },
      { id: "pneumonia_vaccine", type: "radio", text: "Have you received the pneumonia vaccine as recommended for diabetes?", required: true, options: ["Yes", "No, wasn't recommended", "No, declined", "Not sure"] },
      { id: "covid_vaccines", type: "radio", text: "Are you up to date on COVID-19 vaccinations?", required: true, options: ["Yes, including boosters", "Partially vaccinated", "Not vaccinated", "Prefer not to say"] },
      { id: "thyroid_screening", type: "radio", text: "How often is your thyroid function tested?", required: true, options: ["Annually", "Every few years", "Only when symptomatic", "Never", "Not sure"] },
      { id: "celiac_screening", type: "radio", text: "Have you been screened for celiac disease?", required: true, options: ["Yes, at diagnosis", "Yes, multiple times", "Yes, once", "No, never", "Not sure"] },
      { id: "preventive_care_barriers", type: "checkbox", text: "What barriers affect your preventive care? (Select all that apply)", required: false, options: ["Cost", "Time", "Forget/not reminded", "Don't see the need", "Hard to get appointments", "No barriers"] }
    ]
  },
  {
    title: "Long-term Outcome Tracking",
    description: "Understand how people track and monitor their long-term diabetes outcomes.",
    category: "Health Outcomes",
    survey_type: "survey",
    research_category: "Health Outcomes",
    estimated_time_minutes: 10,
    is_anonymous: true,
    requires_demographics: true,
    status: "active",
    target_responses: 400,
    consent_text: "Your tracking practices will help develop better outcome monitoring tools.",
    questions: [
      { id: "metrics_tracked", type: "checkbox", text: "What health metrics do you personally track over time? (Select all that apply)", required: true, options: ["A1C history", "Time in Range trends", "Weight", "Blood pressure", "Cholesterol levels", "Kidney function (eGFR)", "Eye exam results", "Medication changes", "None - rely on doctor to track"] },
      { id: "tracking_method", type: "checkbox", text: "How do you track your health metrics? (Select all that apply)", required: false, options: ["Paper records", "Spreadsheet", "Health app", "Patient portal", "Diabetes-specific app", "Memory only", "Don't track"] },
      { id: "tracking_frequency", type: "radio", text: "How often do you review your long-term health trends?", required: true, options: ["Monthly", "Quarterly", "Before appointments", "Annually", "Rarely", "Never"] },
      { id: "lab_access", type: "radio", text: "Can you easily access your lab results?", required: true, options: ["Yes, through patient portal", "Yes, I request copies", "With some effort", "No, rarely see results", "Results discussed but not provided"] },
      { id: "data_sharing", type: "radio", text: "Do you share tracked data with your healthcare team?", required: true, options: ["Yes, regularly and proactively", "Yes, when asked", "Sometimes", "Rarely", "Never"] },
      { id: "tracking_value", type: "scale", text: "How valuable is long-term tracking for your health management?", required: true, min: 1, max: 10, minLabel: "Not valuable", maxLabel: "Extremely valuable" },
      { id: "desired_tracking", type: "checkbox", text: "What would make tracking easier or more useful? (Select all that apply)", required: false, options: ["Automatic data collection", "Single app for all metrics", "Visualization of trends", "Comparison to targets", "Reminders for screenings", "Integration across providers", "Already satisfied with tracking"] },
      { id: "tracking_goals", type: "textarea", text: "What long-term health goals are you working toward?", required: false }
    ]
  }
];

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Starting research surveys seed...");

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !supabaseKey) {
      throw new Error("Missing Supabase environment variables");
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Parse request body to check if we should clear existing
    let clearExisting = false;
    try {
      const body = await req.json();
      clearExisting = body?.clearExisting === true;
    } catch {
      // No body or invalid JSON, that's fine
    }

    if (clearExisting) {
      console.log("Clearing existing surveys...");
      const { error: deleteError } = await supabase
        .from("surveys")
        .delete()
        .neq("id", "00000000-0000-0000-0000-000000000000");
      
      if (deleteError) {
        console.error("Error clearing surveys:", deleteError);
      }
    }

    const results = [];

    for (const survey of researchSurveys) {
      console.log(`Upserting survey: ${survey.title}`);
      
      const { data, error } = await supabase
        .from("surveys")
        .upsert(
          {
            title: survey.title,
            description: survey.description,
            category: survey.category,
            survey_type: survey.survey_type,
            research_category: survey.research_category,
            estimated_time_minutes: survey.estimated_time_minutes,
            is_anonymous: survey.is_anonymous,
            requires_demographics: survey.requires_demographics,
            status: survey.status,
            target_responses: survey.target_responses,
            consent_text: survey.consent_text,
            questions: survey.questions,
          },
          { 
            onConflict: "title",
            ignoreDuplicates: false 
          }
        )
        .select();

      if (error) {
        console.error(`Error upserting survey "${survey.title}":`, error);
        results.push({ title: survey.title, success: false, error: error.message });
      } else {
        console.log(`Successfully upserted: ${survey.title}`);
        results.push({ title: survey.title, success: true });
      }
    }

    const successCount = results.filter(r => r.success).length;
    const failCount = results.filter(r => !r.success).length;

    console.log(`Seeding complete. Success: ${successCount}, Failed: ${failCount}`);

    return new Response(
      JSON.stringify({
        success: true,
        message: `Seeded ${successCount} surveys successfully, ${failCount} failed`,
        totalSurveys: researchSurveys.length,
        results: results,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error: unknown) {
    console.error("Error seeding surveys:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({
        success: false,
        error: errorMessage,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
