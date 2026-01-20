import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Comprehensive T1D Research Surveys with practical questions
const researchSurveys = [
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
      {
        id: "cgm_brand",
        type: "radio",
        text: "Which CGM system do you currently use?",
        required: true,
        options: ["Dexcom G6", "Dexcom G7", "Dexcom ONE", "Libre 2", "Libre 3", "Medtronic Guardian 4", "Medtronic Guardian 3", "Eversense E3", "Other", "I don't use a CGM"]
      },
      {
        id: "cgm_duration",
        type: "radio",
        text: "How long have you been using your current CGM?",
        required: true,
        options: ["Less than 3 months", "3-6 months", "6-12 months", "1-2 years", "2-5 years", "More than 5 years"]
      },
      {
        id: "accuracy_rating",
        type: "scale",
        text: "How would you rate the overall accuracy of your CGM compared to fingerstick readings?",
        required: true,
        min: 1,
        max: 10,
        minLabel: "Very inaccurate",
        maxLabel: "Highly accurate"
      },
      {
        id: "discrepancy_frequency",
        type: "radio",
        text: "How often do you notice significant discrepancies (>20 mg/dL) between your CGM and fingerstick?",
        required: true,
        options: ["Rarely (less than once a week)", "Sometimes (1-3 times a week)", "Often (daily)", "Very often (multiple times daily)", "I don't compare with fingersticks"]
      },
      {
        id: "compression_lows",
        type: "radio",
        text: "How often do you experience compression lows (false low readings when sleeping on sensor)?",
        required: true,
        options: ["Never", "Rarely (monthly)", "Sometimes (weekly)", "Often (multiple times per week)", "Every night"]
      },
      {
        id: "sensor_failures",
        type: "radio",
        text: "In the past 3 months, how many sensors failed before their expected lifespan?",
        required: true,
        options: ["None", "1 sensor", "2-3 sensors", "4-5 sensors", "More than 5 sensors"]
      },
      {
        id: "time_in_range",
        type: "radio",
        text: "What is your typical Time in Range (70-180 mg/dL) percentage?",
        required: true,
        options: ["Below 30%", "30-40%", "40-50%", "50-60%", "60-70%", "70-80%", "Above 80%", "I don't track TIR"]
      },
      {
        id: "calibration_frequency",
        type: "radio",
        text: "How often do you calibrate your CGM with fingerstick readings?",
        required: true,
        options: ["Never (factory calibrated)", "Only when prompted", "Once daily", "2-3 times daily", "More than 3 times daily"]
      },
      {
        id: "alert_fatigue",
        type: "scale",
        text: "How much does CGM alert fatigue affect your daily life?",
        required: true,
        min: 1,
        max: 10,
        minLabel: "Not at all",
        maxLabel: "Significantly impacts my life"
      },
      {
        id: "night_reliability",
        type: "radio",
        text: "How reliable are your CGM nighttime readings and alerts?",
        required: true,
        options: ["Very reliable", "Mostly reliable", "Somewhat reliable", "Often unreliable", "Very unreliable"]
      },
      {
        id: "integration_satisfaction",
        type: "scale",
        text: "How satisfied are you with your CGM's integration with your pump/phone/smartwatch?",
        required: true,
        min: 1,
        max: 10,
        minLabel: "Very dissatisfied",
        maxLabel: "Very satisfied"
      },
      {
        id: "biggest_improvement",
        type: "textarea",
        text: "What single improvement would most enhance your CGM experience?",
        required: false,
        placeholder: "Describe the improvement you'd like to see..."
      }
    ]
  },
  {
    title: "Insulin Pump Therapy Assessment",
    description: "Help researchers understand the real-world challenges and benefits of insulin pump therapy to improve future device development and clinical guidelines.",
    category: "Treatment",
    survey_type: "survey",
    research_category: "Treatment",
    estimated_time_minutes: 12,
    is_anonymous: true,
    requires_demographics: true,
    status: "active",
    target_responses: 400,
    consent_text: "Your responses will inform pump manufacturers and healthcare providers about user experiences.",
    questions: [
      {
        id: "pump_brand",
        type: "radio",
        text: "Which insulin pump do you currently use?",
        required: true,
        options: ["Tandem t:slim X2", "Tandem Mobi", "Medtronic 780G", "Medtronic 770G", "Omnipod 5", "Omnipod DASH", "Omnipod Eros", "YpsoPump", "DANA-i", "DIY Loop/OpenAPS", "Other", "I don't use a pump"]
      },
      {
        id: "pump_duration",
        type: "radio",
        text: "How long have you been using insulin pump therapy?",
        required: true,
        options: ["Less than 6 months", "6-12 months", "1-2 years", "2-5 years", "5-10 years", "More than 10 years"]
      },
      {
        id: "closed_loop_usage",
        type: "radio",
        text: "Are you using automated insulin delivery (closed loop/hybrid closed loop)?",
        required: true,
        options: ["Yes - commercial system (Control-IQ, 780G, Omnipod 5)", "Yes - DIY system (Loop, OpenAPS, AndroidAPS)", "No - manual pump mode", "Switching between modes"]
      },
      {
        id: "auto_mode_percentage",
        type: "radio",
        text: "If using automated mode, what percentage of time are you in auto mode?",
        required: false,
        options: ["Less than 50%", "50-70%", "70-80%", "80-90%", "More than 90%", "N/A - not using auto mode"]
      },
      {
        id: "site_rotation",
        type: "radio",
        text: "How strictly do you follow infusion site rotation?",
        required: true,
        options: ["Very strictly - documented rotation", "Mostly - general rotation pattern", "Somewhat - occasional same-site use", "Rarely - frequently use same areas", "Not at all"]
      },
      {
        id: "site_failure_frequency",
        type: "radio",
        text: "How often do you experience infusion site failures?",
        required: true,
        options: ["Rarely (less than once every 3 months)", "Occasionally (monthly)", "Sometimes (2-3 times per month)", "Often (weekly)", "Very often (multiple times per week)"]
      },
      {
        id: "occlusion_frequency",
        type: "radio",
        text: "How often do you experience occlusion alarms?",
        required: true,
        options: ["Never", "Rarely (less than once a month)", "Sometimes (1-2 times per month)", "Often (weekly)", "Very often"]
      },
      {
        id: "basal_adjustments",
        type: "radio",
        text: "How often do you manually adjust your basal rates?",
        required: true,
        options: ["Never - trust the algorithm completely", "Rarely - only for special circumstances", "Sometimes - monthly adjustments", "Often - weekly adjustments", "Very often - daily adjustments"]
      },
      {
        id: "bolus_calculation_satisfaction",
        type: "scale",
        text: "How accurate do you find your pump's bolus calculations?",
        required: true,
        min: 1,
        max: 10,
        minLabel: "Very inaccurate",
        maxLabel: "Very accurate"
      },
      {
        id: "extended_bolus_usage",
        type: "radio",
        text: "How often do you use extended/square wave boluses?",
        required: true,
        options: ["Never", "Rarely (special occasions)", "Sometimes (weekly)", "Often (most high-fat meals)", "Always for certain meals"]
      },
      {
        id: "override_frequency",
        type: "radio",
        text: "How often do you override your pump's recommendations?",
        required: true,
        options: ["Never", "Rarely (less than once a week)", "Sometimes (1-3 times per week)", "Often (daily)", "Very often (multiple times daily)"]
      },
      {
        id: "insurance_challenges",
        type: "checkbox",
        text: "What insurance/access challenges have you faced with pump therapy? (Select all that apply)",
        required: false,
        options: ["Prior authorization delays", "Denial of coverage", "High out-of-pocket costs", "Supply shortages", "Formulary restrictions", "Appeals process", "None"]
      },
      {
        id: "pump_improvement",
        type: "textarea",
        text: "What feature would you most like to see in future insulin pumps?",
        required: false,
        placeholder: "Describe your ideal pump feature..."
      }
    ]
  },
  {
    title: "Quality of Life & Daily Management",
    description: "This comprehensive survey captures the daily realities of living with Type 1 Diabetes to help researchers quantify the disease burden and identify areas for support improvement.",
    category: "Quality of Life",
    survey_type: "survey",
    research_category: "Quality of Life",
    estimated_time_minutes: 15,
    is_anonymous: true,
    requires_demographics: true,
    status: "active",
    target_responses: 600,
    consent_text: "Your responses will help healthcare systems better support people with T1D.",
    questions: [
      {
        id: "daily_time_management",
        type: "radio",
        text: "On average, how much time do you spend daily on diabetes management tasks?",
        required: true,
        options: ["Less than 30 minutes", "30-60 minutes", "1-2 hours", "2-3 hours", "More than 3 hours"]
      },
      {
        id: "work_school_impact",
        type: "scale",
        text: "How much does diabetes management affect your work or school performance?",
        required: true,
        min: 1,
        max: 10,
        minLabel: "No impact",
        maxLabel: "Severe impact"
      },
      {
        id: "missed_work_days",
        type: "radio",
        text: "In the past year, how many work/school days have you missed due to diabetes-related issues?",
        required: true,
        options: ["None", "1-3 days", "4-7 days", "8-14 days", "15-30 days", "More than 30 days"]
      },
      {
        id: "social_limitations",
        type: "scale",
        text: "How often does diabetes limit your social activities?",
        required: true,
        min: 1,
        max: 10,
        minLabel: "Never",
        maxLabel: "Always"
      },
      {
        id: "travel_burden",
        type: "radio",
        text: "How burdensome is preparing for travel with diabetes?",
        required: true,
        options: ["Not burdensome at all", "Slightly burdensome", "Moderately burdensome", "Very burdensome", "Extremely burdensome - I avoid travel"]
      },
      {
        id: "exercise_challenges",
        type: "checkbox",
        text: "What challenges do you face with exercise? (Select all that apply)",
        required: true,
        options: ["Fear of hypoglycemia", "Difficulty predicting glucose response", "Timing insulin around exercise", "Carrying supplies", "Explaining to others", "Motivation due to glucose swings", "None - exercise is manageable"]
      },
      {
        id: "meal_planning_stress",
        type: "scale",
        text: "How stressful is meal planning and carb counting for you?",
        required: true,
        min: 1,
        max: 10,
        minLabel: "Not stressful",
        maxLabel: "Extremely stressful"
      },
      {
        id: "sleep_disruption",
        type: "radio",
        text: "How often is your sleep disrupted by diabetes (alarms, lows, highs)?",
        required: true,
        options: ["Rarely (less than once a month)", "Sometimes (1-3 times per month)", "Often (weekly)", "Very often (multiple times per week)", "Every night"]
      },
      {
        id: "relationship_impact",
        type: "scale",
        text: "How has diabetes affected your personal relationships?",
        required: true,
        min: 1,
        max: 10,
        minLabel: "No impact",
        maxLabel: "Significant impact"
      },
      {
        id: "healthcare_access_satisfaction",
        type: "scale",
        text: "How satisfied are you with your access to diabetes healthcare?",
        required: true,
        min: 1,
        max: 10,
        minLabel: "Very dissatisfied",
        maxLabel: "Very satisfied"
      },
      {
        id: "financial_burden",
        type: "radio",
        text: "How would you describe the financial burden of diabetes care?",
        required: true,
        options: ["No burden - fully covered", "Minor burden - manageable costs", "Moderate burden - sometimes difficult", "Significant burden - often struggle", "Severe burden - frequently skip supplies/care"]
      },
      {
        id: "monthly_out_of_pocket",
        type: "radio",
        text: "What is your estimated monthly out-of-pocket cost for diabetes care?",
        required: true,
        options: ["$0 - fully covered", "$1-50", "$51-100", "$101-200", "$201-400", "$401-600", "More than $600"]
      },
      {
        id: "emotional_support",
        type: "radio",
        text: "Do you feel you have adequate emotional support for managing diabetes?",
        required: true,
        options: ["Yes, very well supported", "Mostly supported", "Somewhat supported", "Not well supported", "No support at all"]
      },
      {
        id: "quality_of_life_rating",
        type: "scale",
        text: "Overall, how would you rate your quality of life with T1D?",
        required: true,
        min: 1,
        max: 10,
        minLabel: "Very poor",
        maxLabel: "Excellent"
      }
    ]
  },
  {
    title: "Hypoglycemia Experience Registry",
    description: "Help researchers understand the patterns, causes, and impacts of hypoglycemia to develop better prevention strategies and treatments.",
    category: "Safety",
    survey_type: "survey",
    research_category: "Safety",
    estimated_time_minutes: 10,
    is_anonymous: true,
    requires_demographics: true,
    status: "active",
    target_responses: 500,
    consent_text: "Your responses will contribute to hypoglycemia prevention research.",
    questions: [
      {
        id: "severe_hypo_frequency",
        type: "radio",
        text: "In the past year, how many severe hypoglycemic events have you experienced (required assistance from another person)?",
        required: true,
        options: ["None", "1", "2-3", "4-6", "7-12", "More than 12"]
      },
      {
        id: "mild_hypo_frequency",
        type: "radio",
        text: "How often do you experience mild hypoglycemia (can self-treat)?",
        required: true,
        options: ["Less than once a week", "1-3 times per week", "4-7 times per week", "1-2 times per day", "More than 2 times per day"]
      },
      {
        id: "hypo_awareness",
        type: "radio",
        text: "How would you describe your hypoglycemia awareness?",
        required: true,
        options: ["Always aware - feel symptoms above 70 mg/dL", "Usually aware - feel symptoms around 55-70 mg/dL", "Reduced awareness - often don't feel symptoms until below 55 mg/dL", "Impaired awareness - frequently unaware of lows", "Hypoglycemia unawareness - rarely feel any symptoms"]
      },
      {
        id: "common_causes",
        type: "checkbox",
        text: "What are the most common causes of your hypoglycemia? (Select all that apply)",
        required: true,
        options: ["Miscounted carbs", "Delayed meal", "Exercise", "Too much bolus insulin", "Basal rate too high", "Alcohol", "Stress", "Illness", "Heat/weather", "Unknown"]
      },
      {
        id: "treatment_method",
        type: "checkbox",
        text: "How do you typically treat hypoglycemia? (Select all that apply)",
        required: true,
        options: ["Glucose tablets", "Juice", "Regular soda", "Candy", "Food with carbs", "Glucose gel", "Suspend pump", "Let CGM guide treatment"]
      },
      {
        id: "recovery_time",
        type: "radio",
        text: "How long does it typically take you to recover from hypoglycemia?",
        required: true,
        options: ["Less than 15 minutes", "15-30 minutes", "30-60 minutes", "1-2 hours", "More than 2 hours"]
      },
      {
        id: "driving_impact",
        type: "radio",
        text: "How has hypoglycemia affected your driving?",
        required: true,
        options: ["No impact - I don't drive", "No impact - never had a driving-related hypo", "Minor impact - I check before driving", "Moderate impact - I avoid long drives", "Significant impact - I limit or avoid driving", "Severe impact - I don't drive due to hypo risk"]
      },
      {
        id: "glucagon_availability",
        type: "radio",
        text: "Do you have glucagon available?",
        required: true,
        options: ["Yes - injectable glucagon kit", "Yes - nasal glucagon (Baqsimi)", "Yes - Gvoke/Zegalogue auto-injector", "Yes - multiple forms available", "No - don't have glucagon", "Expired - need to replace"]
      },
      {
        id: "glucagon_usage",
        type: "radio",
        text: "Have you ever needed to use glucagon?",
        required: true,
        options: ["Never", "Once in my lifetime", "2-3 times total", "4-10 times total", "More than 10 times"]
      },
      {
        id: "er_visits",
        type: "radio",
        text: "In the past 2 years, how many ER visits have you had for hypoglycemia?",
        required: true,
        options: ["None", "1", "2-3", "4-5", "More than 5"]
      },
      {
        id: "workplace_incidents",
        type: "radio",
        text: "Have you experienced hypoglycemia at work/school that affected your performance?",
        required: true,
        options: ["Never", "Once or twice", "Occasionally (few times per year)", "Frequently (monthly)", "Very frequently (weekly)"]
      },
      {
        id: "prevention_strategies",
        type: "checkbox",
        text: "What strategies do you use to prevent hypoglycemia? (Select all that apply)",
        required: true,
        options: ["CGM alerts", "Pre-meal timing", "Exercise planning", "Reduce bolus for activity", "Increase snacking", "Lower TIR targets", "Regular pattern review", "None specific"]
      }
    ]
  },
  {
    title: "Technology Integration Assessment",
    description: "Share your experiences with diabetes technology ecosystems to help researchers and developers understand interoperability needs and improve future integrations.",
    category: "Technology",
    survey_type: "survey",
    research_category: "Technology",
    estimated_time_minutes: 10,
    is_anonymous: true,
    requires_demographics: true,
    status: "active",
    target_responses: 400,
    consent_text: "Your responses will help shape the future of diabetes technology integration.",
    questions: [
      {
        id: "diy_experience",
        type: "radio",
        text: "Have you used DIY/open-source diabetes systems?",
        required: true,
        options: ["Yes - currently using (Loop, OpenAPS, AndroidAPS)", "Yes - previously used", "No - but interested", "No - prefer commercial solutions", "Not familiar with DIY systems"]
      },
      {
        id: "commercial_aap_satisfaction",
        type: "scale",
        text: "If using a commercial automated insulin delivery system, how satisfied are you?",
        required: false,
        min: 1,
        max: 10,
        minLabel: "Very dissatisfied",
        maxLabel: "Very satisfied"
      },
      {
        id: "apps_used",
        type: "checkbox",
        text: "Which diabetes-related apps do you use? (Select all that apply)",
        required: true,
        options: ["Manufacturer CGM app", "Manufacturer pump app", "Sugarmate", "mySugr", "Tidepool", "Nightscout", "Glooko", "xDrip+", "Spike", "Diabits", "Happy Bob", "None"]
      },
      {
        id: "data_sharing",
        type: "checkbox",
        text: "Who do you share your diabetes data with? (Select all that apply)",
        required: true,
        options: ["Endocrinologist/Diabetes team", "Primary care physician", "Family members", "Partners/Spouse", "School nurse", "No one", "Research studies"]
      },
      {
        id: "interoperability_frustrations",
        type: "checkbox",
        text: "What interoperability frustrations have you experienced? (Select all that apply)",
        required: true,
        options: ["Devices don't connect to each other", "Apps don't share data", "Multiple separate apps needed", "Data format incompatibility", "Bluetooth connection issues", "Cloud sync problems", "None"]
      },
      {
        id: "feature_priorities",
        type: "checkbox",
        text: "What features are most important to you in diabetes technology? (Select top 3)",
        required: true,
        options: ["Accuracy", "Ease of use", "Small size/discreet", "Long battery life", "Phone integration", "Smartwatch support", "Data sharing", "Algorithm customization", "Alert customization", "Interoperability"]
      },
      {
        id: "algorithm_trust",
        type: "scale",
        text: "How much do you trust automated insulin delivery algorithms?",
        required: true,
        min: 1,
        max: 10,
        minLabel: "Don't trust at all",
        maxLabel: "Completely trust"
      },
      {
        id: "manual_override_reasons",
        type: "checkbox",
        text: "What situations cause you to override or exit automated mode? (Select all that apply)",
        required: false,
        options: ["High-fat meals", "Exercise", "Illness", "Algorithm not aggressive enough", "Algorithm too aggressive", "Sensor inaccuracy", "Site issues", "Special events", "Never override"]
      },
      {
        id: "tech_support_rating",
        type: "scale",
        text: "How would you rate the technical support from your device manufacturers?",
        required: true,
        min: 1,
        max: 10,
        minLabel: "Very poor",
        maxLabel: "Excellent"
      },
      {
        id: "future_tech_priorities",
        type: "textarea",
        text: "What technology improvement would most transform your diabetes management?",
        required: false,
        placeholder: "Describe your ideal technology advancement..."
      }
    ]
  },
  {
    title: "Pediatric to Adult Transition Experience",
    description: "Help researchers understand the challenges of transitioning from pediatric to adult diabetes care to improve support systems and outcomes.",
    category: "Transitions",
    survey_type: "survey",
    research_category: "Transitions",
    estimated_time_minutes: 12,
    is_anonymous: true,
    requires_demographics: true,
    status: "active",
    target_responses: 300,
    consent_text: "Your responses will help improve transition programs for young adults with T1D.",
    questions: [
      {
        id: "transition_age",
        type: "radio",
        text: "At what age did you transition from pediatric to adult care?",
        required: true,
        options: ["Under 16", "16-17", "18-19", "20-21", "22-25", "Over 25", "Haven't transitioned yet", "Was diagnosed as an adult"]
      },
      {
        id: "transition_preparation",
        type: "scale",
        text: "How well were you prepared for the transition to adult care?",
        required: true,
        min: 1,
        max: 10,
        minLabel: "Not at all prepared",
        maxLabel: "Very well prepared"
      },
      {
        id: "care_continuity",
        type: "radio",
        text: "How would you describe the continuity of care during transition?",
        required: true,
        options: ["Seamless - no gap in care", "Minor gap - few weeks", "Moderate gap - 1-3 months", "Significant gap - 3-6 months", "Major gap - over 6 months", "Lost to care temporarily"]
      },
      {
        id: "self_management_readiness",
        type: "scale",
        text: "How ready did you feel to manage your diabetes independently?",
        required: true,
        min: 1,
        max: 10,
        minLabel: "Not at all ready",
        maxLabel: "Completely ready"
      },
      {
        id: "insurance_challenges",
        type: "checkbox",
        text: "What insurance challenges did you face during transition? (Select all that apply)",
        required: true,
        options: ["Loss of coverage", "Changed to different plan", "Prior authorizations needed again", "Different formulary/supplies", "Higher out-of-pocket costs", "Confusion about coverage", "No challenges"]
      },
      {
        id: "emotional_support_transition",
        type: "scale",
        text: "How adequate was emotional support during your transition?",
        required: true,
        min: 1,
        max: 10,
        minLabel: "No support",
        maxLabel: "Excellent support"
      },
      {
        id: "education_gaps",
        type: "checkbox",
        text: "What diabetes education gaps did you discover during transition? (Select all that apply)",
        required: true,
        options: ["Managing on your own", "Understanding prescriptions", "Insurance navigation", "Sick day management", "Alcohol and diabetes", "Sexual health considerations", "Mental health resources", "Career considerations", "No gaps"]
      },
      {
        id: "new_team_relationship",
        type: "scale",
        text: "How would you rate your relationship with your new adult care team?",
        required: true,
        min: 1,
        max: 10,
        minLabel: "Very poor",
        maxLabel: "Excellent"
      },
      {
        id: "a1c_change",
        type: "radio",
        text: "How did your A1C change after transition?",
        required: true,
        options: ["Improved significantly", "Improved slightly", "Stayed the same", "Worsened slightly", "Worsened significantly", "Don't know"]
      },
      {
        id: "recommendations",
        type: "textarea",
        text: "What advice would you give to someone preparing for the transition to adult care?",
        required: false,
        placeholder: "Share your recommendations..."
      }
    ]
  },
  {
    title: "Newly Diagnosed Experience (First 2 Years)",
    description: "Share your diagnosis and early management experience to help improve initial care and support for newly diagnosed individuals.",
    category: "Diagnosis",
    survey_type: "survey",
    research_category: "Diagnosis",
    estimated_time_minutes: 12,
    is_anonymous: true,
    requires_demographics: true,
    status: "active",
    target_responses: 400,
    consent_text: "Your responses will help improve the diagnosis experience for future patients.",
    questions: [
      {
        id: "time_to_diagnosis",
        type: "radio",
        text: "How long was it from first symptoms to diagnosis?",
        required: true,
        options: ["Less than 1 week", "1-2 weeks", "2-4 weeks", "1-3 months", "3-6 months", "More than 6 months", "No symptoms (routine bloodwork)"]
      },
      {
        id: "initial_symptoms",
        type: "checkbox",
        text: "What symptoms did you experience before diagnosis? (Select all that apply)",
        required: true,
        options: ["Extreme thirst", "Frequent urination", "Unexplained weight loss", "Fatigue", "Blurred vision", "Slow-healing wounds", "Frequent infections", "Mood changes", "Nausea/vomiting", "Fruity breath", "None/asymptomatic"]
      },
      {
        id: "misdiagnosis",
        type: "radio",
        text: "Were you initially misdiagnosed?",
        required: true,
        options: ["No - correctly diagnosed immediately", "Yes - Type 2 diabetes", "Yes - other condition (infection, flu, etc.)", "Yes - told I was fine initially", "Other misdiagnosis"]
      },
      {
        id: "dka_at_diagnosis",
        type: "radio",
        text: "Were you in diabetic ketoacidosis (DKA) at diagnosis?",
        required: true,
        options: ["Yes - severe DKA (ICU)", "Yes - moderate DKA", "Yes - mild DKA", "No - not in DKA", "Don't know"]
      },
      {
        id: "hospital_stay",
        type: "radio",
        text: "How long was your initial hospital stay?",
        required: true,
        options: ["Not hospitalized", "1-2 days", "3-5 days", "1-2 weeks", "More than 2 weeks"]
      },
      {
        id: "education_quality",
        type: "scale",
        text: "How would you rate the quality of initial diabetes education you received?",
        required: true,
        min: 1,
        max: 10,
        minLabel: "Very poor",
        maxLabel: "Excellent"
      },
      {
        id: "technology_timing",
        type: "radio",
        text: "When did you start using diabetes technology (CGM/pump)?",
        required: true,
        options: ["Within first month", "1-3 months", "3-6 months", "6-12 months", "1-2 years", "More than 2 years", "Still not using technology"]
      },
      {
        id: "emotional_support_diagnosis",
        type: "scale",
        text: "How adequate was emotional/psychological support after diagnosis?",
        required: true,
        min: 1,
        max: 10,
        minLabel: "No support",
        maxLabel: "Excellent support"
      },
      {
        id: "family_adjustment",
        type: "scale",
        text: "How challenging was the adjustment for your family/support system?",
        required: true,
        min: 1,
        max: 10,
        minLabel: "Not challenging",
        maxLabel: "Extremely challenging"
      },
      {
        id: "return_to_normal",
        type: "radio",
        text: "How long until you felt you had returned to a 'normal' life?",
        required: true,
        options: ["Less than 1 month", "1-3 months", "3-6 months", "6-12 months", "1-2 years", "More than 2 years", "Still adjusting"]
      },
      {
        id: "helpful_resources",
        type: "checkbox",
        text: "What resources were most helpful early on? (Select all that apply)",
        required: true,
        options: ["Diabetes educator", "Endocrinologist", "Support groups", "Online communities", "Books/guides", "Mobile apps", "Friends/family with T1D", "JDRF/ADA", "None were helpful"]
      },
      {
        id: "wish_knew_earlier",
        type: "textarea",
        text: "What do you wish you had known earlier after diagnosis?",
        required: false,
        placeholder: "Share what you wish you knew..."
      }
    ]
  },
  {
    title: "Long-Term Health & Complications Screening",
    description: "Help researchers understand screening practices and long-term outcomes to improve prevention strategies and early intervention.",
    category: "Health Outcomes",
    survey_type: "survey",
    research_category: "Health Outcomes",
    estimated_time_minutes: 10,
    is_anonymous: true,
    requires_demographics: true,
    status: "active",
    target_responses: 500,
    consent_text: "Your responses will contribute to complications prevention research.",
    questions: [
      {
        id: "diabetes_duration",
        type: "radio",
        text: "How long have you had Type 1 Diabetes?",
        required: true,
        options: ["Less than 5 years", "5-10 years", "10-15 years", "15-20 years", "20-30 years", "30-40 years", "More than 40 years"]
      },
      {
        id: "screening_eye",
        type: "radio",
        text: "How often do you have dilated eye exams?",
        required: true,
        options: ["Every year", "Every 2 years", "Less frequently", "Only when symptoms occur", "Never had one"]
      },
      {
        id: "screening_kidney",
        type: "radio",
        text: "When was your last kidney function test (urine microalbumin/creatinine)?",
        required: true,
        options: ["Within past year", "1-2 years ago", "More than 2 years ago", "Never had one", "Don't know"]
      },
      {
        id: "screening_feet",
        type: "radio",
        text: "How often does a healthcare provider examine your feet?",
        required: true,
        options: ["Every visit", "Yearly", "Occasionally", "Never"]
      },
      {
        id: "complications_experienced",
        type: "checkbox",
        text: "Have you been diagnosed with any of the following? (Select all that apply)",
        required: true,
        options: ["Retinopathy (eye disease)", "Nephropathy (kidney disease)", "Neuropathy (nerve damage)", "Cardiovascular disease", "Thyroid condition", "Celiac disease", "None of the above"]
      },
      {
        id: "prevention_lifestyle",
        type: "checkbox",
        text: "What lifestyle measures do you take for complication prevention? (Select all that apply)",
        required: true,
        options: ["Regular exercise", "Healthy diet", "Blood pressure management", "Cholesterol management", "Smoking cessation", "Limited alcohol", "Stress management", "Regular sleep schedule", "None specific"]
      },
      {
        id: "provider_communication",
        type: "scale",
        text: "How well does your healthcare team communicate about complication risks?",
        required: true,
        min: 1,
        max: 10,
        minLabel: "Poor communication",
        maxLabel: "Excellent communication"
      },
      {
        id: "specialist_access",
        type: "radio",
        text: "How easy is it to access specialists (ophthalmologist, nephrologist, etc.)?",
        required: true,
        options: ["Very easy", "Somewhat easy", "Neutral", "Somewhat difficult", "Very difficult", "No access"]
      },
      {
        id: "risk_factor_knowledge",
        type: "scale",
        text: "How well do you understand the risk factors for diabetes complications?",
        required: true,
        min: 1,
        max: 10,
        minLabel: "Not at all",
        maxLabel: "Very well"
      },
      {
        id: "quality_of_care",
        type: "scale",
        text: "Overall, how would you rate the quality of your long-term diabetes care?",
        required: true,
        min: 1,
        max: 10,
        minLabel: "Very poor",
        maxLabel: "Excellent"
      },
      {
        id: "barrier_to_screening",
        type: "textarea",
        text: "What barriers, if any, prevent you from getting regular complication screenings?",
        required: false,
        placeholder: "Describe any barriers..."
      }
    ]
  }
];

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error("Missing Supabase environment variables");
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log("Starting to seed research surveys...");

    // Clear existing surveys (optional - for development)
    const { body } = await req.json().catch(() => ({ body: {} }));
    const clearExisting = body?.clearExisting || false;

    if (clearExisting) {
      console.log("Clearing existing surveys...");
      await supabase.from("surveys").delete().neq("id", "00000000-0000-0000-0000-000000000000");
    }

    // Insert surveys
    const results = [];
    for (const survey of researchSurveys) {
      const { data, error } = await supabase
        .from("surveys")
        .upsert(
          {
            title: survey.title,
            description: survey.description,
            category: survey.category,
            questions: survey.questions,
            survey_type: survey.survey_type,
            research_category: survey.research_category,
            estimated_time_minutes: survey.estimated_time_minutes,
            is_anonymous: survey.is_anonymous,
            requires_demographics: survey.requires_demographics,
            status: survey.status,
            target_responses: survey.target_responses,
            consent_text: survey.consent_text,
          },
          { onConflict: "title" }
        )
        .select();

      if (error) {
        console.error(`Error inserting survey "${survey.title}":`, error);
        results.push({ title: survey.title, success: false, error: error.message });
      } else {
        console.log(`Successfully inserted survey: ${survey.title}`);
        results.push({ title: survey.title, success: true, id: data?.[0]?.id });
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: `Seeded ${results.filter((r) => r.success).length} surveys`,
        results,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error seeding surveys:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
