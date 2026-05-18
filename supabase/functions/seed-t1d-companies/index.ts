import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

import { guardSeedFunction } from "../_shared/seedGuard.ts";
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Comprehensive list of T1D-focused companies and startups
const t1dCompanies = [
  // Major Public Companies
  {
    name: "Dexcom",
    description: "Leading manufacturer of continuous glucose monitoring (CGM) systems. Their G7 is one of the most popular CGMs worldwide.",
    company_type: "public",
    focus_areas: ["CGM", "Glucose Monitoring", "Digital Health"],
    total_funding_usd: null,
    funding_stage: "Public (DXCM)",
    founded_year: 1999,
    headquarters: "San Diego, CA",
    country: "United States",
    employee_count: "5000+",
    key_people: [{ name: "Kevin Sayer", role: "CEO" }],
    products: [
      { name: "Dexcom G7", status: "Commercial", description: "Latest CGM with 10.5 day wear" },
      { name: "Dexcom ONE+", status: "Commercial", description: "Affordable CGM option" }
    ],
    technology_summary: "Real-time continuous glucose monitoring using minimally invasive sensors",
    clinical_stage: "Commercial",
    website_url: "https://www.dexcom.com",
    linkedin_url: "https://www.linkedin.com/company/dexcom",
    data_source: "manual"
  },
  {
    name: "Abbott Laboratories",
    description: "Global healthcare company and creator of the FreeStyle Libre continuous glucose monitoring system.",
    company_type: "public",
    focus_areas: ["CGM", "Glucose Monitoring", "Medical Devices"],
    total_funding_usd: null,
    funding_stage: "Public (ABT)",
    founded_year: 1888,
    headquarters: "Abbott Park, IL",
    country: "United States",
    employee_count: "10000+",
    key_people: [{ name: "Robert Ford", role: "CEO" }],
    products: [
      { name: "FreeStyle Libre 3", status: "Commercial", description: "World's smallest, thinnest CGM" },
      { name: "FreeStyle Libre 2", status: "Commercial", description: "Flash glucose monitoring system" }
    ],
    technology_summary: "Flash and continuous glucose monitoring technology",
    clinical_stage: "Commercial",
    website_url: "https://www.abbott.com",
    linkedin_url: "https://www.linkedin.com/company/abbott-",
    data_source: "manual"
  },
  {
    name: "Medtronic Diabetes",
    description: "World's largest medical device company with comprehensive diabetes management solutions including insulin pumps and CGMs.",
    company_type: "public",
    focus_areas: ["Insulin Delivery", "CGM", "Automated Insulin Delivery", "Medical Devices"],
    total_funding_usd: null,
    funding_stage: "Public (MDT)",
    founded_year: 1949,
    headquarters: "Dublin, Ireland",
    country: "Ireland",
    employee_count: "10000+",
    key_people: [{ name: "Geoffrey Martha", role: "CEO" }],
    products: [
      { name: "MiniMed 780G", status: "Commercial", description: "Advanced hybrid closed-loop system" },
      { name: "Guardian 4 Sensor", status: "Commercial", description: "Integrated CGM sensor" }
    ],
    technology_summary: "Integrated diabetes management with automated insulin delivery",
    clinical_stage: "Commercial",
    website_url: "https://www.medtronic.com/diabetes",
    linkedin_url: "https://www.linkedin.com/company/medtronic",
    data_source: "manual"
  },
  {
    name: "Insulet Corporation",
    description: "Manufacturer of the Omnipod tubeless insulin pump system, revolutionizing insulin delivery with patch pump technology.",
    company_type: "public",
    focus_areas: ["Insulin Delivery", "Automated Insulin Delivery", "Wearable Devices"],
    total_funding_usd: null,
    funding_stage: "Public (PODD)",
    founded_year: 2000,
    headquarters: "Acton, MA",
    country: "United States",
    employee_count: "5000+",
    key_people: [{ name: "Jim Hollingshead", role: "CEO" }],
    products: [
      { name: "Omnipod 5", status: "Commercial", description: "Tubeless automated insulin delivery system" },
      { name: "Omnipod DASH", status: "Commercial", description: "Tubeless insulin management system" }
    ],
    technology_summary: "Tubeless, waterproof insulin delivery with smartphone control",
    clinical_stage: "Commercial",
    website_url: "https://www.omnipod.com",
    linkedin_url: "https://www.linkedin.com/company/insulet-corporation",
    data_source: "manual"
  },
  {
    name: "Tandem Diabetes Care",
    description: "Innovator in insulin pump technology with touchscreen interface and integration with Dexcom CGM.",
    company_type: "public",
    focus_areas: ["Insulin Delivery", "Automated Insulin Delivery", "Digital Health"],
    total_funding_usd: null,
    funding_stage: "Public (TNDM)",
    founded_year: 2006,
    headquarters: "San Diego, CA",
    country: "United States",
    employee_count: "1000-5000",
    key_people: [{ name: "John Sheridan", role: "CEO" }],
    products: [
      { name: "t:slim X2", status: "Commercial", description: "Insulin pump with Control-IQ technology" },
      { name: "Mobi", status: "Commercial", description: "Smallest tubeless pump" }
    ],
    technology_summary: "Advanced insulin pump with predictive low glucose suspend and automated correction boluses",
    clinical_stage: "Commercial",
    website_url: "https://www.tandemdiabetes.com",
    linkedin_url: "https://www.linkedin.com/company/tandem-diabetes-care",
    data_source: "manual"
  },
  // Cure Research Companies
  {
    name: "Vertex Pharmaceuticals",
    description: "Leading the charge in stem cell-derived islet cell therapy for Type 1 diabetes cure. Acquired Semma Therapeutics and ViaCyte.",
    company_type: "public",
    focus_areas: ["Cell Therapy", "Cure Research", "Stem Cells", "Immunology"],
    total_funding_usd: null,
    funding_stage: "Public (VRTX)",
    founded_year: 1989,
    headquarters: "Boston, MA",
    country: "United States",
    employee_count: "5000+",
    key_people: [{ name: "Reshma Kewalramani", role: "CEO" }],
    products: [
      { name: "VX-880", status: "Phase 1/2", description: "Stem cell-derived islet cells requiring immunosuppression" },
      { name: "VX-264", status: "Phase 1/2", description: "Encapsulated islet cells without immunosuppression" }
    ],
    technology_summary: "Pluripotent stem cell-derived islet cell replacement therapy",
    clinical_stage: "Phase 1/2",
    website_url: "https://www.vrtx.com",
    linkedin_url: "https://www.linkedin.com/company/vertex-pharmaceuticals",
    data_source: "manual"
  },
  {
    name: "Provention Bio",
    description: "Developed teplizumab (TZIELD), the first FDA-approved therapy to delay the onset of Stage 3 Type 1 diabetes.",
    company_type: "acquired",
    focus_areas: ["Immunotherapy", "Prevention", "Cure Research"],
    total_funding_usd: 500000000,
    funding_stage: "Acquired by Sanofi",
    founded_year: 2016,
    headquarters: "Red Bank, NJ",
    country: "United States",
    acquired_by: "Sanofi",
    acquisition_date: "2023-04-28",
    key_people: [{ name: "Ashleigh Palmer", role: "Former CEO" }],
    products: [
      { name: "TZIELD (teplizumab)", status: "FDA Approved", description: "Delays Stage 3 T1D onset by 2+ years" }
    ],
    technology_summary: "Anti-CD3 monoclonal antibody that preserves insulin production",
    clinical_stage: "Approved",
    website_url: "https://www.sanofi.com",
    data_source: "manual"
  },
  // High-Funding Startups from Seedtable
  {
    name: "Insitro",
    description: "Using machine learning to transform drug discovery, with applications in metabolic diseases including diabetes.",
    company_type: "startup",
    focus_areas: ["AI Drug Discovery", "Machine Learning", "Metabolic Diseases"],
    total_funding_usd: 743200000,
    funding_rounds: 4,
    funding_stage: "Series C",
    founded_year: 2018,
    headquarters: "South San Francisco, CA",
    country: "United States",
    employee_count: "200-500",
    investors: [
      { name: "Andreessen Horowitz", type: "VC" },
      { name: "Canada Pension Plan Investment Board", type: "Institutional" }
    ],
    key_people: [{ name: "Daphne Koller", role: "CEO" }],
    technology_summary: "AI/ML platform for drug discovery combining biological data with machine learning",
    clinical_stage: "Preclinical",
    website_url: "https://insitro.com",
    linkedin_url: "https://www.linkedin.com/company/insitro",
    crunchbase_url: "https://www.crunchbase.com/organization/insitro",
    data_source: "seedtable"
  },
  {
    name: "Noom",
    description: "Digital health platform using psychology-based approach for diabetes management and weight loss.",
    company_type: "startup",
    focus_areas: ["Digital Health", "Behavior Change", "Weight Management"],
    total_funding_usd: 645700000,
    funding_rounds: 10,
    funding_stage: "Series F",
    founded_year: 2008,
    headquarters: "New York, NY",
    country: "United States",
    employee_count: "1000-5000",
    investors: [
      { name: "Silver Lake", type: "PE" },
      { name: "Sequoia Capital", type: "VC" }
    ],
    products: [
      { name: "Noom Weight", status: "Commercial", description: "Psychology-based weight loss program" },
      { name: "Noom Med", status: "Commercial", description: "Clinical weight loss program" }
    ],
    technology_summary: "Behavioral psychology-based digital therapeutics platform",
    clinical_stage: "Commercial",
    website_url: "https://www.noom.com",
    linkedin_url: "https://www.linkedin.com/company/noom-inc-",
    crunchbase_url: "https://www.crunchbase.com/organization/noom",
    data_source: "seedtable"
  },
  {
    name: "Virta Health",
    description: "Digital clinic that reverses Type 2 diabetes and related metabolic conditions through nutritional ketosis.",
    company_type: "startup",
    focus_areas: ["Digital Health", "Metabolic Health", "Nutritional Therapy"],
    total_funding_usd: 410000000,
    funding_rounds: 6,
    funding_stage: "Series E",
    founded_year: 2014,
    headquarters: "San Francisco, CA",
    country: "United States",
    employee_count: "500-1000",
    investors: [
      { name: "Tiger Global", type: "VC" },
      { name: "a16z", type: "VC" }
    ],
    key_people: [{ name: "Sami Inkinen", role: "CEO" }],
    products: [
      { name: "Virta Treatment", status: "Commercial", description: "Physician-supervised metabolic health program" }
    ],
    technology_summary: "Continuous remote care using nutritional ketosis to reverse insulin resistance",
    clinical_stage: "Commercial",
    website_url: "https://www.virtahealth.com",
    linkedin_url: "https://www.linkedin.com/company/virta-health",
    crunchbase_url: "https://www.crunchbase.com/organization/virta-health",
    data_source: "seedtable"
  },
  {
    name: "Omada Health",
    description: "Digital care program for chronic disease management including diabetes prevention and management.",
    company_type: "startup",
    focus_areas: ["Digital Health", "Diabetes Prevention", "Chronic Disease Management"],
    total_funding_usd: 400500000,
    funding_rounds: 9,
    funding_stage: "Series E",
    founded_year: 2011,
    headquarters: "San Francisco, CA",
    country: "United States",
    employee_count: "500-1000",
    investors: [
      { name: "Cigna", type: "Strategic" },
      { name: "Andreessen Horowitz", type: "VC" }
    ],
    products: [
      { name: "Omada for Diabetes", status: "Commercial", description: "Digital diabetes management program" },
      { name: "Omada for Prevention", status: "Commercial", description: "CDC-recognized DPP program" }
    ],
    technology_summary: "Personalized digital health programs with coaching and connected devices",
    clinical_stage: "Commercial",
    website_url: "https://www.omadahealth.com",
    linkedin_url: "https://www.linkedin.com/company/omada-health",
    crunchbase_url: "https://www.crunchbase.com/organization/omada-health",
    data_source: "seedtable"
  },
  {
    name: "ViaCyte",
    description: "Pioneer in stem cell-derived islet cell replacement therapy. Now part of Vertex Pharmaceuticals.",
    company_type: "acquired",
    focus_areas: ["Cell Therapy", "Cure Research", "Stem Cells", "Encapsulation"],
    total_funding_usd: 328800000,
    funding_rounds: 12,
    funding_stage: "Acquired",
    founded_year: 1999,
    headquarters: "San Diego, CA",
    country: "United States",
    acquired_by: "Vertex Pharmaceuticals",
    acquisition_date: "2022-07-01",
    products: [
      { name: "PEC-Direct", status: "Clinical", description: "Directly vascularized islet cells" },
      { name: "PEC-Encap", status: "Clinical", description: "Encapsulated islet cells" }
    ],
    technology_summary: "Pluripotent stem cell-derived pancreatic cells in protective encapsulation",
    clinical_stage: "Phase 1/2",
    website_url: "https://www.vrtx.com",
    crunchbase_url: "https://www.crunchbase.com/organization/viacyte",
    data_source: "seedtable"
  },
  {
    name: "Livongo Health",
    description: "Digital health company for chronic condition management, including diabetes. Now part of Teladoc Health.",
    company_type: "acquired",
    focus_areas: ["Digital Health", "Remote Monitoring", "Chronic Disease Management"],
    total_funding_usd: 235000000,
    funding_rounds: 7,
    funding_stage: "Acquired",
    founded_year: 2014,
    headquarters: "Mountain View, CA",
    country: "United States",
    acquired_by: "Teladoc Health",
    acquisition_date: "2020-10-30",
    products: [
      { name: "Livongo for Diabetes", status: "Commercial", description: "Connected meter with coaching" }
    ],
    technology_summary: "AI-powered insights from connected glucose meters with health coaching",
    clinical_stage: "Commercial",
    website_url: "https://www.teladochealth.com",
    crunchbase_url: "https://www.crunchbase.com/organization/livongo",
    data_source: "seedtable"
  },
  {
    name: "Diabeloop",
    description: "French medtech developing automated insulin delivery systems with AI-driven algorithms.",
    company_type: "startup",
    focus_areas: ["Automated Insulin Delivery", "AI", "Insulin Delivery"],
    total_funding_usd: 191800000,
    funding_rounds: 5,
    funding_stage: "Series C",
    founded_year: 2015,
    headquarters: "Grenoble",
    country: "France",
    employee_count: "100-200",
    products: [
      { name: "DBLG1", status: "CE Marked", description: "AI-powered automated insulin delivery" }
    ],
    technology_summary: "Self-learning algorithm for automated insulin delivery",
    clinical_stage: "Commercial (EU)",
    website_url: "https://www.diabeloop.com",
    linkedin_url: "https://www.linkedin.com/company/diabeloop",
    crunchbase_url: "https://www.crunchbase.com/organization/diabeloop",
    data_source: "seedtable"
  },
  {
    name: "Beta Bionics",
    description: "Developer of the iLet Bionic Pancreas, the first autonomous insulin delivery system.",
    company_type: "startup",
    focus_areas: ["Automated Insulin Delivery", "Bionic Pancreas", "Insulin Delivery"],
    total_funding_usd: 170000000,
    funding_rounds: 8,
    funding_stage: "Series D",
    founded_year: 2015,
    headquarters: "Concord, MA",
    country: "United States",
    employee_count: "100-200",
    key_people: [{ name: "Ed Damiano", role: "CEO & Founder" }],
    products: [
      { name: "iLet Bionic Pancreas", status: "FDA Approved", description: "Autonomous insulin-only bionic pancreas" }
    ],
    technology_summary: "Fully autonomous insulin delivery requiring only body weight input",
    clinical_stage: "Commercial",
    website_url: "https://www.betabionics.com",
    linkedin_url: "https://www.linkedin.com/company/beta-bionics",
    data_source: "manual"
  },
  {
    name: "Bigfoot Biomedical",
    description: "Developing connected insulin delivery systems with integrated CGM data.",
    company_type: "startup",
    focus_areas: ["Insulin Delivery", "Smart Pens", "Digital Health"],
    total_funding_usd: 170000000,
    funding_rounds: 7,
    funding_stage: "Series C",
    founded_year: 2014,
    headquarters: "Milpitas, CA",
    country: "United States",
    employee_count: "50-100",
    products: [
      { name: "Bigfoot Unity", status: "FDA Cleared", description: "Smart pen caps with CGM integration" }
    ],
    technology_summary: "Smart insulin pen caps that display dose guidance based on CGM data",
    clinical_stage: "Commercial",
    website_url: "https://www.bigfootbiomedical.com",
    linkedin_url: "https://www.linkedin.com/company/bigfoot-biomedical",
    crunchbase_url: "https://www.crunchbase.com/organization/bigfoot-biomedical",
    data_source: "manual"
  },
  {
    name: "Semma Therapeutics",
    description: "Pioneered stem cell-derived beta cell replacement. Acquired by Vertex Pharmaceuticals for $950M.",
    company_type: "acquired",
    focus_areas: ["Cell Therapy", "Cure Research", "Stem Cells"],
    total_funding_usd: 114000000,
    funding_rounds: 3,
    funding_stage: "Acquired",
    founded_year: 2014,
    headquarters: "Cambridge, MA",
    country: "United States",
    acquired_by: "Vertex Pharmaceuticals",
    acquisition_date: "2019-09-03",
    key_people: [{ name: "Doug Melton", role: "Founder" }],
    technology_summary: "Functional human beta cells derived from stem cells",
    clinical_stage: "Preclinical (at acquisition)",
    website_url: "https://www.vrtx.com",
    crunchbase_url: "https://www.crunchbase.com/organization/semma-therapeutics",
    data_source: "seedtable"
  },
  {
    name: "Tidepool",
    description: "Non-profit developing open-source automated insulin delivery and diabetes data platform.",
    company_type: "non-profit",
    focus_areas: ["Open Source", "Automated Insulin Delivery", "Data Platform", "Digital Health"],
    total_funding_usd: 60000000,
    funding_rounds: 5,
    funding_stage: "Non-profit",
    founded_year: 2013,
    headquarters: "Palo Alto, CA",
    country: "United States",
    employee_count: "50-100",
    key_people: [{ name: "Howard Look", role: "CEO" }],
    products: [
      { name: "Tidepool Loop", status: "FDA Cleared", description: "Open-source automated insulin delivery" },
      { name: "Tidepool Platform", status: "Commercial", description: "Unified diabetes data platform" }
    ],
    technology_summary: "Open-source software for interoperable diabetes devices",
    clinical_stage: "Commercial",
    website_url: "https://www.tidepool.org",
    linkedin_url: "https://www.linkedin.com/company/tidepool",
    data_source: "manual"
  },
  {
    name: "Podimetrics",
    description: "Smart mat technology for early detection of diabetic foot ulcers.",
    company_type: "startup",
    focus_areas: ["Diabetic Foot Care", "Remote Monitoring", "Prevention"],
    total_funding_usd: 47500000,
    funding_rounds: 4,
    funding_stage: "Series C",
    founded_year: 2011,
    headquarters: "Somerville, MA",
    country: "United States",
    employee_count: "50-100",
    products: [
      { name: "SmartMat", status: "Commercial", description: "Daily foot temperature monitoring" }
    ],
    technology_summary: "Thermometry-based early detection of foot complications",
    clinical_stage: "Commercial",
    website_url: "https://www.podimetrics.com",
    linkedin_url: "https://www.linkedin.com/company/podimetrics",
    crunchbase_url: "https://www.crunchbase.com/organization/podimetrics",
    data_source: "seedtable"
  },
  {
    name: "CeQur",
    description: "Developer of wearable, on-body insulin delivery devices for Type 2 diabetes.",
    company_type: "startup",
    focus_areas: ["Insulin Delivery", "Wearable Devices", "Type 2 Diabetes"],
    total_funding_usd: 56600000,
    funding_rounds: 6,
    funding_stage: "Series C",
    founded_year: 2008,
    headquarters: "Marlborough, MA",
    country: "United States",
    employee_count: "50-100",
    products: [
      { name: "CeQur Simplicity", status: "Commercial", description: "3-day wearable insulin delivery" }
    ],
    technology_summary: "Simple, discrete on-body insulin delivery without pumps",
    clinical_stage: "Commercial",
    website_url: "https://www.cequr.com",
    linkedin_url: "https://www.linkedin.com/company/cequr",
    crunchbase_url: "https://www.crunchbase.com/organization/cequr",
    data_source: "seedtable"
  },
  {
    name: "Pepex Biomedical",
    description: "Developing next-generation glucose sensing technology.",
    company_type: "startup",
    focus_areas: ["Glucose Monitoring", "Biosensors", "Point of Care"],
    total_funding_usd: 22300000,
    funding_rounds: 5,
    funding_stage: "Series B",
    founded_year: 2010,
    headquarters: "West Palm Beach, FL",
    country: "United States",
    employee_count: "10-50",
    technology_summary: "Advanced electrochemical glucose sensing technology",
    clinical_stage: "Development",
    website_url: "https://www.pepexbiomedical.com",
    crunchbase_url: "https://www.crunchbase.com/organization/pepex-biomedical",
    data_source: "seedtable"
  },
  {
    name: "Imcyse",
    description: "Belgian immunotherapy company developing treatments to prevent and treat Type 1 diabetes.",
    company_type: "startup",
    focus_areas: ["Immunotherapy", "Prevention", "Cure Research"],
    total_funding_usd: 50000000,
    funding_rounds: 4,
    funding_stage: "Series B",
    founded_year: 2010,
    headquarters: "Liège",
    country: "Belgium",
    employee_count: "10-50",
    products: [
      { name: "IMCY-0098", status: "Phase 2", description: "Antigen-specific immunotherapy for T1D" }
    ],
    technology_summary: "Imotope technology for targeted immune tolerance",
    clinical_stage: "Phase 2",
    website_url: "https://www.imcyse.com",
    linkedin_url: "https://www.linkedin.com/company/imcyse",
    data_source: "manual"
  },
  {
    name: "Common Sensing",
    description: "Smart cap for insulin pens that tracks doses and provides reminders.",
    company_type: "startup",
    focus_areas: ["Smart Devices", "Dose Tracking", "Digital Health"],
    total_funding_usd: 6600000,
    funding_rounds: 3,
    funding_stage: "Series A",
    founded_year: 2014,
    headquarters: "Cambridge, MA",
    country: "United States",
    employee_count: "10-50",
    products: [
      { name: "Gocap", status: "Commercial", description: "Smart insulin pen cap" }
    ],
    technology_summary: "Connected insulin pen cap with mobile app for dose tracking",
    clinical_stage: "Commercial",
    website_url: "https://www.common-sensing.com",
    crunchbase_url: "https://www.crunchbase.com/organization/common-sensing",
    data_source: "seedtable"
  },
  {
    name: "Encellin",
    description: "Developing cell encapsulation technology for diabetes cell therapy without immunosuppression.",
    company_type: "startup",
    focus_areas: ["Cell Therapy", "Encapsulation", "Cure Research"],
    total_funding_usd: 5900000,
    funding_rounds: 2,
    funding_stage: "Seed",
    founded_year: 2016,
    headquarters: "San Francisco, CA",
    country: "United States",
    employee_count: "10-50",
    technology_summary: "Biocompatible cell encapsulation device for islet protection",
    clinical_stage: "Preclinical",
    website_url: "https://www.encellin.com",
    linkedin_url: "https://www.linkedin.com/company/encellin",
    crunchbase_url: "https://www.crunchbase.com/organization/encellin",
    data_source: "seedtable"
  },
  {
    name: "Betalin Therapeutics",
    description: "Israeli company developing engineered micro-pancreas for transplantation.",
    company_type: "startup",
    focus_areas: ["Cell Therapy", "Cure Research", "Micro-pancreas"],
    total_funding_usd: 5100000,
    funding_rounds: 2,
    funding_stage: "Series A",
    founded_year: 2012,
    headquarters: "Jerusalem",
    country: "Israel",
    employee_count: "10-50",
    technology_summary: "Biological micro-pancreas grown from patient's own cells",
    clinical_stage: "Preclinical",
    website_url: "https://www.betalintherapeutics.com",
    crunchbase_url: "https://www.crunchbase.com/organization/betalin-therapeutics",
    data_source: "seedtable"
  },
  {
    name: "Bisu",
    description: "At-home urine testing for glucose and other biomarkers using smartphone.",
    company_type: "startup",
    focus_areas: ["Glucose Monitoring", "Home Testing", "Digital Health"],
    total_funding_usd: 3200000,
    funding_rounds: 2,
    funding_stage: "Seed",
    founded_year: 2016,
    headquarters: "San Francisco, CA",
    country: "United States",
    employee_count: "10-50",
    products: [
      { name: "Bisu Body Coach", status: "Commercial", description: "At-home urine analysis device" }
    ],
    technology_summary: "Smartphone-based urinalysis for health tracking",
    clinical_stage: "Commercial",
    website_url: "https://www.bfrnd.com",
    crunchbase_url: "https://www.crunchbase.com/organization/bisu",
    data_source: "seedtable"
  },
  {
    name: "Wellthy Therapeutics",
    description: "Indian digital therapeutics company for diabetes management.",
    company_type: "startup",
    focus_areas: ["Digital Therapeutics", "AI", "Chronic Disease Management"],
    total_funding_usd: 10000000,
    funding_rounds: 3,
    funding_stage: "Series A",
    founded_year: 2015,
    headquarters: "Mumbai",
    country: "India",
    employee_count: "50-100",
    products: [
      { name: "Wellthy Care", status: "Commercial", description: "AI-powered diabetes management" }
    ],
    technology_summary: "AI-driven personalized diabetes care and coaching",
    clinical_stage: "Commercial",
    website_url: "https://www.wellthy.care",
    linkedin_url: "https://www.linkedin.com/company/wellthy-therapeutics",
    data_source: "seedtable"
  },
  {
    name: "Glooko",
    description: "Unified platform for diabetes data management connecting devices and healthcare providers.",
    company_type: "startup",
    focus_areas: ["Data Platform", "Digital Health", "Interoperability"],
    total_funding_usd: 95000000,
    funding_rounds: 6,
    funding_stage: "Series D",
    founded_year: 2010,
    headquarters: "Palo Alto, CA",
    country: "United States",
    employee_count: "100-200",
    products: [
      { name: "Glooko Platform", status: "Commercial", description: "Universal diabetes data platform" }
    ],
    technology_summary: "Unified platform connecting 200+ diabetes devices",
    clinical_stage: "Commercial",
    website_url: "https://www.glooko.com",
    linkedin_url: "https://www.linkedin.com/company/glooko",
    crunchbase_url: "https://www.crunchbase.com/organization/glooko",
    data_source: "manual"
  },
  {
    name: "Onduo",
    description: "Virtual diabetes clinic using CGM and personalized coaching (Verily/Sanofi joint venture).",
    company_type: "subsidiary",
    focus_areas: ["Digital Health", "Virtual Care", "Remote Monitoring"],
    total_funding_usd: null,
    funding_stage: "Joint Venture",
    founded_year: 2016,
    headquarters: "Newton, MA",
    country: "United States",
    parent_company: "Verily Life Sciences",
    employee_count: "100-200",
    products: [
      { name: "Onduo Virtual Diabetes Clinic", status: "Commercial", description: "CGM-based virtual care" }
    ],
    technology_summary: "AI-powered virtual diabetes care with CGM integration",
    clinical_stage: "Commercial",
    website_url: "https://www.onduo.com",
    linkedin_url: "https://www.linkedin.com/company/onduo",
    data_source: "manual"
  },
  {
    name: "Senseonics",
    description: "Developer of Eversense, the first long-term implantable CGM system.",
    company_type: "public",
    focus_areas: ["CGM", "Implantable Devices", "Long-term Monitoring"],
    total_funding_usd: null,
    funding_stage: "Public (SENS)",
    founded_year: 2010,
    headquarters: "Germantown, MD",
    country: "United States",
    employee_count: "100-200",
    products: [
      { name: "Eversense E3", status: "Commercial", description: "6-month implantable CGM" }
    ],
    technology_summary: "Fluorescence-based implantable glucose sensor",
    clinical_stage: "Commercial",
    website_url: "https://www.senseonics.com",
    linkedin_url: "https://www.linkedin.com/company/senseonics",
    data_source: "manual"
  },
  {
    name: "EOFlow",
    description: "Korean company developing disposable wearable insulin patch pumps.",
    company_type: "public",
    focus_areas: ["Insulin Delivery", "Wearable Devices", "Patch Pumps"],
    total_funding_usd: null,
    funding_stage: "Public (KOSDAQ)",
    founded_year: 2011,
    headquarters: "Seoul",
    country: "South Korea",
    employee_count: "100-200",
    products: [
      { name: "EOPatch", status: "Commercial", description: "Disposable patch pump" }
    ],
    technology_summary: "Ultra-thin, flexible insulin patch pump",
    clinical_stage: "Commercial",
    website_url: "https://www.eoflow.com",
    linkedin_url: "https://www.linkedin.com/company/eoflow",
    data_source: "manual"
  },
  {
    name: "Ypsomed",
    description: "Swiss company manufacturing insulin pumps and injection systems.",
    company_type: "public",
    focus_areas: ["Insulin Delivery", "Injection Systems", "Self-Care"],
    total_funding_usd: null,
    funding_stage: "Public (SIX)",
    founded_year: 2003,
    headquarters: "Burgdorf",
    country: "Switzerland",
    employee_count: "1000-5000",
    products: [
      { name: "YpsoPump", status: "Commercial", description: "Intuitive insulin pump system" },
      { name: "mylife Loop", status: "Commercial", description: "Automated insulin delivery" }
    ],
    technology_summary: "Simple, intuitive insulin delivery systems",
    clinical_stage: "Commercial",
    website_url: "https://www.ypsomed.com",
    linkedin_url: "https://www.linkedin.com/company/ypsomed",
    data_source: "manual"
  },
  {
    name: "Cecelia Health",
    description: "Technology-enabled clinical services for diabetes management.",
    company_type: "startup",
    focus_areas: ["Virtual Care", "Clinical Services", "Coaching"],
    total_funding_usd: 28000000,
    funding_rounds: 4,
    funding_stage: "Series B",
    founded_year: 2014,
    headquarters: "New York, NY",
    country: "United States",
    employee_count: "50-100",
    products: [
      { name: "Cecelia Platform", status: "Commercial", description: "Expert diabetes care at scale" }
    ],
    technology_summary: "Certified diabetes educators via technology platform",
    clinical_stage: "Commercial",
    website_url: "https://www.ceceliahealth.com",
    linkedin_url: "https://www.linkedin.com/company/cecelia-health",
    data_source: "manual"
  },
  {
    name: "One Drop",
    description: "Diabetes management platform with AI predictions and connected devices.",
    company_type: "startup",
    focus_areas: ["Digital Health", "AI", "Glucose Monitoring"],
    total_funding_usd: 50000000,
    funding_rounds: 5,
    funding_stage: "Series B",
    founded_year: 2015,
    headquarters: "New York, NY",
    country: "United States",
    employee_count: "50-100",
    products: [
      { name: "One Drop Mobile", status: "Commercial", description: "AI-powered glucose predictions" },
      { name: "One Drop Chrome", status: "Commercial", description: "Bluetooth glucose meter" }
    ],
    technology_summary: "Machine learning for glucose prediction and personalized insights",
    clinical_stage: "Commercial",
    website_url: "https://www.onedrop.today",
    linkedin_url: "https://www.linkedin.com/company/onedrop",
    crunchbase_url: "https://www.crunchbase.com/organization/one-drop",
    data_source: "manual"
  },
  {
    name: "Lark Health",
    description: "AI-powered chronic disease prevention and management platform.",
    company_type: "startup",
    focus_areas: ["AI", "Digital Health", "Prevention"],
    total_funding_usd: 100000000,
    funding_rounds: 5,
    funding_stage: "Series C",
    founded_year: 2011,
    headquarters: "Mountain View, CA",
    country: "United States",
    employee_count: "100-200",
    products: [
      { name: "Lark Diabetes Prevention", status: "Commercial", description: "CDC-recognized DPP" },
      { name: "Lark Diabetes Care", status: "Commercial", description: "24/7 AI coaching" }
    ],
    technology_summary: "Conversational AI for personalized health coaching",
    clinical_stage: "Commercial",
    website_url: "https://www.lark.com",
    linkedin_url: "https://www.linkedin.com/company/lark-health",
    crunchbase_url: "https://www.crunchbase.com/organization/lark-technologies",
    data_source: "manual"
  },
  {
    name: "Companion Medical",
    description: "Smart insulin pen with dose tracking and decision support (acquired by Medtronic).",
    company_type: "acquired",
    focus_areas: ["Smart Pens", "Dose Tracking", "Digital Health"],
    total_funding_usd: 30000000,
    funding_rounds: 4,
    funding_stage: "Acquired",
    founded_year: 2013,
    headquarters: "San Diego, CA",
    country: "United States",
    acquired_by: "Medtronic",
    acquisition_date: "2020-09-01",
    products: [
      { name: "InPen", status: "Commercial", description: "Smart insulin pen with CGM integration" }
    ],
    technology_summary: "Connected insulin pen with mobile app for dose management",
    clinical_stage: "Commercial",
    website_url: "https://www.medtronicdiabetes.com/products/inpen",
    crunchbase_url: "https://www.crunchbase.com/organization/companion-medical",
    data_source: "manual"
  },
  {
    name: "Percusense",
    description: "Developing a non-invasive continuous glucose monitor using interstitial fluid microneedle.",
    company_type: "startup",
    focus_areas: ["CGM", "Non-invasive", "Microneedle"],
    total_funding_usd: 8500000,
    funding_rounds: 2,
    funding_stage: "Series A",
    founded_year: 2018,
    headquarters: "Boston, MA",
    country: "United States",
    employee_count: "10-50",
    technology_summary: "Minimally invasive CGM using microneedle array",
    clinical_stage: "Development",
    website_url: "https://www.percusense.com",
    linkedin_url: "https://www.linkedin.com/company/percusense",
    data_source: "manual"
  },
  {
    name: "Know Labs",
    description: "Developing non-invasive glucose monitoring using radio frequency technology.",
    company_type: "public",
    focus_areas: ["Non-invasive", "Glucose Monitoring", "RF Technology"],
    total_funding_usd: null,
    funding_stage: "Public (KNWN)",
    founded_year: 1998,
    headquarters: "Seattle, WA",
    country: "United States",
    employee_count: "10-50",
    products: [
      { name: "Bio-RFID", status: "Development", description: "Non-invasive glucose sensing" }
    ],
    technology_summary: "Radio frequency-based non-invasive glucose monitoring",
    clinical_stage: "Development",
    website_url: "https://www.knowlabs.co",
    linkedin_url: "https://www.linkedin.com/company/know-labs-inc",
    data_source: "manual"
  },
  {
    name: "Sernova",
    description: "Cell pouch technology for diabetes cell therapy without chronic immunosuppression.",
    company_type: "public",
    focus_areas: ["Cell Therapy", "Encapsulation", "Cure Research"],
    total_funding_usd: null,
    funding_stage: "Public (TSX: SVA)",
    founded_year: 2008,
    headquarters: "London, ON",
    country: "Canada",
    employee_count: "10-50",
    products: [
      { name: "Cell Pouch System", status: "Phase 1/2", description: "Implantable cell containment" }
    ],
    technology_summary: "Pre-vascularized pouch for transplanted therapeutic cells",
    clinical_stage: "Phase 1/2",
    website_url: "https://www.sernova.com",
    linkedin_url: "https://www.linkedin.com/company/sernova-corp",
    data_source: "manual"
  },
  {
    name: "Sigilon Therapeutics",
    description: "Cell encapsulation technology preventing immune rejection (partnership with Eli Lilly).",
    company_type: "startup",
    focus_areas: ["Cell Therapy", "Encapsulation", "Cure Research"],
    total_funding_usd: 180000000,
    funding_rounds: 5,
    funding_stage: "Series C",
    founded_year: 2016,
    headquarters: "Cambridge, MA",
    country: "United States",
    employee_count: "50-100",
    products: [
      { name: "SIG-002", status: "Clinical", description: "Encapsulated islet cell therapy" }
    ],
    technology_summary: "Afibromer sphere technology for cell encapsulation",
    clinical_stage: "Phase 1/2",
    website_url: "https://www.sigilon.com",
    linkedin_url: "https://www.linkedin.com/company/sigilon-therapeutics",
    crunchbase_url: "https://www.crunchbase.com/organization/sigilon-therapeutics",
    data_source: "manual"
  },
  {
    name: "Glucose Biosensor Systems",
    description: "Developing implantable long-term glucose monitoring technology.",
    company_type: "startup",
    focus_areas: ["CGM", "Implantable Devices", "Long-term Monitoring"],
    total_funding_usd: 15000000,
    funding_rounds: 2,
    funding_stage: "Series A",
    founded_year: 2015,
    headquarters: "Hartford, CT",
    country: "United States",
    employee_count: "10-50",
    technology_summary: "Multi-year implantable glucose sensor",
    clinical_stage: "Development",
    website_url: "https://www.glubiosys.com",
    data_source: "manual"
  },
  {
    name: "Medios Technologies",
    description: "AI-powered diabetic retinopathy screening and detection.",
    company_type: "startup",
    focus_areas: ["AI", "Retinopathy", "Screening"],
    total_funding_usd: 5000000,
    funding_rounds: 2,
    funding_stage: "Seed",
    founded_year: 2017,
    headquarters: "Singapore",
    country: "Singapore",
    employee_count: "10-50",
    products: [
      { name: "Selena+", status: "Commercial", description: "AI diabetic retinopathy screening" }
    ],
    technology_summary: "Deep learning for retinal image analysis",
    clinical_stage: "Commercial",
    website_url: "https://www.mediostechnologies.com",
    linkedin_url: "https://www.linkedin.com/company/medios-technologies",
    data_source: "seedtable"
  },
  {
    name: "Acorn Biolabs",
    description: "Preserving young cells for future regenerative medicine including potential diabetes treatments.",
    company_type: "startup",
    focus_areas: ["Cell Preservation", "Regenerative Medicine", "Future Therapies"],
    total_funding_usd: 3300000,
    funding_rounds: 2,
    funding_stage: "Seed",
    founded_year: 2017,
    headquarters: "Toronto",
    country: "Canada",
    employee_count: "10-50",
    technology_summary: "Cryopreservation of young healthy cells for future use",
    clinical_stage: "Commercial (preservation)",
    website_url: "https://www.acorn.me",
    linkedin_url: "https://www.linkedin.com/company/acorn-biolabs",
    crunchbase_url: "https://www.crunchbase.com/organization/acorn-cryotech",
    data_source: "seedtable"
  },
  {
    name: "MicroBiome Therapeutics",
    description: "Developing microbiome-based therapeutics for metabolic health.",
    company_type: "startup",
    focus_areas: ["Microbiome", "Metabolic Health", "Therapeutics"],
    total_funding_usd: 2300000,
    funding_rounds: 2,
    funding_stage: "Seed",
    founded_year: 2015,
    headquarters: "Colorado",
    country: "United States",
    employee_count: "1-10",
    technology_summary: "Microbiome modulation for metabolic disease treatment",
    clinical_stage: "Preclinical",
    website_url: "https://www.microbiometherapeutics.com",
    crunchbase_url: "https://www.crunchbase.com/organization/microbiome-therapeutics",
    data_source: "seedtable"
  },
  {
    name: "Medella Health",
    description: "Developing smart contact lens for non-invasive glucose monitoring.",
    company_type: "startup",
    focus_areas: ["Non-invasive", "Glucose Monitoring", "Smart Lens"],
    total_funding_usd: 1400000,
    funding_rounds: 2,
    funding_stage: "Seed",
    founded_year: 2016,
    headquarters: "Irvine, CA",
    country: "United States",
    employee_count: "1-10",
    technology_summary: "Contact lens with embedded glucose sensor",
    clinical_stage: "Development",
    website_url: "https://www.medellahealth.com",
    crunchbase_url: "https://www.crunchbase.com/organization/medella-health",
    data_source: "seedtable"
  },
  {
    name: "MC10",
    description: "Developed flexible biosensors for continuous health monitoring (now Medidata).",
    company_type: "acquired",
    focus_areas: ["Wearable Sensors", "Flexible Electronics", "Monitoring"],
    total_funding_usd: 101200000,
    funding_rounds: 6,
    funding_stage: "Acquired",
    founded_year: 2008,
    headquarters: "Lexington, MA",
    country: "United States",
    acquired_by: "Medidata Solutions",
    acquisition_date: "2020-02-01",
    technology_summary: "Conformal, stretchable electronic sensors",
    clinical_stage: "Commercial",
    website_url: "https://www.medidata.com",
    crunchbase_url: "https://www.crunchbase.com/organization/mc10",
    data_source: "seedtable"
  },
  {
    name: "PharmaCyte Biotech",
    description: "Cell encapsulation technology for potential diabetes treatment.",
    company_type: "public",
    focus_areas: ["Cell Therapy", "Encapsulation", "Cure Research"],
    total_funding_usd: null,
    funding_stage: "Public (PMCB)",
    founded_year: 2013,
    headquarters: "Laguna Hills, CA",
    country: "United States",
    employee_count: "1-10",
    products: [
      { name: "Cell-in-a-Box", status: "Development", description: "Cellulose-based cell encapsulation" }
    ],
    technology_summary: "Cellulose-based encapsulation for cell therapy",
    clinical_stage: "Preclinical",
    website_url: "https://www.pharmacyte.com",
    linkedin_url: "https://www.linkedin.com/company/pharmacyte-biotech",
    data_source: "manual"
  },
  {
    name: "Thermalin",
    description: "Next-generation insulin formulations with improved stability and rapid action.",
    company_type: "startup",
    focus_areas: ["Insulin", "Drug Formulation", "Stability"],
    total_funding_usd: 20000000,
    funding_rounds: 3,
    funding_stage: "Series A",
    founded_year: 2011,
    headquarters: "Cleveland, OH",
    country: "United States",
    employee_count: "10-50",
    products: [
      { name: "Ultra-Rapid Insulin", status: "Phase 2", description: "Faster-acting insulin analog" }
    ],
    technology_summary: "Novel insulin formulations with enhanced pharmacokinetics",
    clinical_stage: "Phase 2",
    website_url: "https://www.thermalin.com",
    linkedin_url: "https://www.linkedin.com/company/thermalin-inc",
    data_source: "manual"
  },
  {
    name: "Zealand Pharma",
    description: "Peptide therapeutics company developing next-gen diabetes treatments.",
    company_type: "public",
    focus_areas: ["Peptide Therapeutics", "Drug Development", "Metabolic Diseases"],
    total_funding_usd: null,
    funding_stage: "Public (NASDAQ: ZEAL)",
    founded_year: 1998,
    headquarters: "Copenhagen",
    country: "Denmark",
    employee_count: "200-500",
    products: [
      { name: "Zegalogue", status: "FDA Approved", description: "Glucagon for severe hypoglycemia" }
    ],
    technology_summary: "Peptide drug design for metabolic disorders",
    clinical_stage: "Commercial",
    website_url: "https://www.zealandpharma.com",
    linkedin_url: "https://www.linkedin.com/company/zealand-pharma",
    data_source: "manual"
  },
  {
    name: "Xeris Biopharma",
    description: "Developing ready-to-use glucagon and insulin rescue therapies.",
    company_type: "public",
    focus_areas: ["Glucagon", "Rescue Therapies", "Drug Delivery"],
    total_funding_usd: null,
    funding_stage: "Public (XERS)",
    founded_year: 2005,
    headquarters: "Chicago, IL",
    country: "United States",
    employee_count: "100-200",
    products: [
      { name: "Gvoke", status: "FDA Approved", description: "Ready-to-use glucagon rescue" },
      { name: "Recorlev", status: "FDA Approved", description: "For Cushing's syndrome" }
    ],
    technology_summary: "XeriSol formulation technology for stable peptide drugs",
    clinical_stage: "Commercial",
    website_url: "https://www.xerispharma.com",
    linkedin_url: "https://www.linkedin.com/company/xeris-pharmaceuticals",
    data_source: "manual"
  },
  {
    name: "EOPTION",
    description: "Developing breath-based glucose monitoring technology.",
    company_type: "startup",
    focus_areas: ["Non-invasive", "Glucose Monitoring", "Breath Analysis"],
    total_funding_usd: 3000000,
    funding_rounds: 1,
    funding_stage: "Seed",
    founded_year: 2019,
    headquarters: "Boston, MA",
    country: "United States",
    employee_count: "1-10",
    technology_summary: "Exhaled breath analysis for glucose estimation",
    clinical_stage: "Development",
    website_url: "https://www.eoptionhealth.com",
    data_source: "manual"
  },
  {
    name: "Carmot Therapeutics",
    description: "Developing novel GLP-1 and obesity therapies with applications for diabetes.",
    company_type: "acquired",
    focus_areas: ["Drug Discovery", "GLP-1", "Metabolic Diseases"],
    total_funding_usd: 223500000,
    funding_rounds: 4,
    funding_stage: "Acquired",
    founded_year: 2015,
    headquarters: "Berkeley, CA",
    country: "United States",
    acquired_by: "Roche",
    acquisition_date: "2023-12-15",
    technology_summary: "Small molecule GLP-1 receptor agonists",
    clinical_stage: "Phase 1",
    website_url: "https://www.roche.com",
    crunchbase_url: "https://www.crunchbase.com/organization/carmot-therapeutics",
    data_source: "seedtable"
  },
  {
    name: "InsulinCloud",
    description: "Cloud-based insulin delivery management and analytics platform.",
    company_type: "startup",
    focus_areas: ["Digital Health", "Data Analytics", "Insulin Management"],
    total_funding_usd: 2000000,
    funding_rounds: 1,
    funding_stage: "Seed",
    founded_year: 2020,
    headquarters: "San Francisco, CA",
    country: "United States",
    employee_count: "1-10",
    technology_summary: "Cloud analytics for insulin therapy optimization",
    clinical_stage: "Development",
    website_url: "https://www.insulincloud.com",
    data_source: "manual"
  },
  {
    name: "Kencap Therapeutics",
    description: "Islet cell encapsulation for Type 1 diabetes cure.",
    company_type: "startup",
    focus_areas: ["Cell Therapy", "Encapsulation", "Cure Research"],
    total_funding_usd: 8000000,
    funding_rounds: 2,
    funding_stage: "Series A",
    founded_year: 2018,
    headquarters: "Melbourne",
    country: "Australia",
    employee_count: "10-50",
    technology_summary: "Novel encapsulation device for islet transplantation",
    clinical_stage: "Preclinical",
    website_url: "https://www.kencaptherapeutics.com",
    data_source: "manual"
  },
  {
    name: "Arecor",
    description: "Ultra-rapid and ultra-concentrated insulin formulation technology.",
    company_type: "public",
    focus_areas: ["Insulin", "Drug Formulation", "Stability"],
    total_funding_usd: null,
    funding_stage: "Public (AIM: AREC)",
    founded_year: 2007,
    headquarters: "Cambridge",
    country: "United Kingdom",
    employee_count: "50-100",
    products: [
      { name: "AT247", status: "Phase 2", description: "Ultra-rapid insulin" },
      { name: "AT278", status: "Development", description: "Ultra-concentrated insulin" }
    ],
    technology_summary: "Arestat platform for enhanced protein stability",
    clinical_stage: "Phase 2",
    website_url: "https://www.arecor.com",
    linkedin_url: "https://www.linkedin.com/company/arecor",
    data_source: "manual"
  },
  {
    name: "Locemia Solutions",
    description: "Developed intranasal glucagon for hypoglycemia emergencies (acquired by Eli Lilly).",
    company_type: "acquired",
    focus_areas: ["Glucagon", "Nasal Delivery", "Rescue Therapies"],
    total_funding_usd: 35000000,
    funding_rounds: 3,
    funding_stage: "Acquired",
    founded_year: 2006,
    headquarters: "Montreal",
    country: "Canada",
    acquired_by: "Eli Lilly",
    acquisition_date: "2015-06-01",
    products: [
      { name: "Baqsimi", status: "FDA Approved", description: "Nasal glucagon powder" }
    ],
    technology_summary: "Dry powder nasal delivery of glucagon",
    clinical_stage: "Commercial",
    website_url: "https://www.lilly.com",
    data_source: "manual"
  }
];

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }



  const seedGuard = await guardSeedFunction(req);
  if (seedGuard) return seedGuard;
  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log(`Seeding ${t1dCompanies.length} T1D companies...`);

    // Clear existing data first (optional, for fresh seed)
    const { error: deleteError } = await supabase
      .from("t1d_companies")
      .delete()
      .neq("id", "00000000-0000-0000-0000-000000000000"); // Delete all

    if (deleteError) {
      console.error("Error clearing existing companies:", deleteError);
    }

    // Insert companies in batches
    const batchSize = 10;
    let inserted = 0;
    let errors = 0;

    for (let i = 0; i < t1dCompanies.length; i += batchSize) {
      const batch = t1dCompanies.slice(i, i + batchSize);
      
      const { data, error } = await supabase
        .from("t1d_companies")
        .insert(batch)
        .select();

      if (error) {
        console.error(`Error inserting batch ${i / batchSize + 1}:`, error);
        errors += batch.length;
      } else {
        inserted += data?.length || 0;
        console.log(`Inserted batch ${i / batchSize + 1}: ${data?.length} companies`);
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: `Seeded ${inserted} T1D companies successfully`,
        total_attempted: t1dCompanies.length,
        inserted,
        errors
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error seeding T1D companies:", error);
    return new Response(
      JSON.stringify({ success: false, error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
