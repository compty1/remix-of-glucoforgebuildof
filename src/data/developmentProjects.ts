export interface DevelopmentProject {
  id: string;
  title: string;
  description: string;
  category: 'AI Intelligence' | 'User Tools' | 'Device/Goals Management' | 'Community Support';
  status: 'open' | 'in progress';
  tags: string[];
  progress?: number;
  // Extended fields for detail pages
  fullDescription?: string;
  purpose?: string;
  goals?: string[];
  outcomes?: string[];
  useCases?: string[];
  technicalRequirements?: string[];
  estimatedEffort?: 'small' | 'medium' | 'large';
  tasks?: {
    id: string;
    title: string;
    description: string;
    status: 'todo' | 'in_progress' | 'done';
    priority: 'low' | 'medium' | 'high';
    skills: string[];
  }[];
  resources?: { title: string; url: string; type: string }[];
  startedDate?: string;
  targetCompletionDate?: string;
}

export const developmentProjects: DevelopmentProject[] = [
  // User Tools
  {
    id: "photo-carb-estimator",
    title: "Photo-Based Carb Estimator",
    description: "Computer vision app to estimate carbohydrates from meal photos",
    category: "User Tools",
    status: "open",
    tags: ["AI", "Mobile", "Computer Vision"],
    progress: 10,
    fullDescription: "Build a mobile-first application that uses computer vision and machine learning to estimate carbohydrate content from meal photos. The system will identify food items, estimate portions, and calculate total carbs to assist with insulin dosing decisions.",
    purpose: "Reduce the cognitive burden of carb counting, one of the most challenging aspects of T1D management, by providing instant AI-powered estimates.",
    goals: ["Achieve 85%+ accuracy on common foods", "Sub-3 second response time", "Offline capability for core features", "Integration with major diabetes apps"],
    outcomes: ["Reduced time spent on carb counting", "Improved bolus accuracy", "Lower post-meal glucose variability"],
    useCases: ["Quick meal estimation at restaurants", "Learning tool for newly diagnosed", "Double-checking manual carb counts", "Logging meals with photos"],
    technicalRequirements: ["React Native", "TensorFlow Lite", "Computer Vision APIs", "Food database integration"],
    estimatedEffort: "large",
    tasks: [
      { id: "pce-1", title: "Food detection model training", description: "Train YOLOv8 model on diabetes-relevant food dataset", status: "todo", priority: "high", skills: ["Python", "ML"] },
      { id: "pce-2", title: "Portion estimation algorithm", description: "Develop depth-based portion size estimation", status: "todo", priority: "high", skills: ["Computer Vision"] },
      { id: "pce-3", title: "Mobile UI implementation", description: "Build React Native camera and results interface", status: "todo", priority: "medium", skills: ["React Native"] }
    ],
    resources: [{ title: "Food-101 Dataset", url: "https://data.vision.ee.ethz.ch/cvl/food-101/", type: "dataset" }]
  },
  {
    id: "cgm-integration-api",
    title: "CGM Data Integration API",
    description: "Build a unified API to integrate data from multiple CGM manufacturers",
    category: "User Tools",
    status: "open",
    tags: ["API", "Integration", "Data"],
    progress: 15,
    purpose: "Create a single, standardized API that normalizes CGM data from Dexcom, Abbott, Medtronic, and other manufacturers.",
    goals: ["Support 5+ CGM platforms", "Real-time data streaming", "HIPAA-compliant architecture"],
    outcomes: ["Unified data format for analysis", "Simplified app development", "Cross-platform data portability"],
    technicalRequirements: ["Node.js", "OAuth 2.0", "HL7 FHIR", "WebSocket"],
    estimatedEffort: "large"
  },
  {
    id: "clinical-trial-matching",
    title: "Clinical Trial Matching Service",
    description: "Platform matching T1D patients with relevant clinical trials",
    category: "User Tools",
    status: "open",
    tags: ["Healthcare", "Research", "Matching"],
    purpose: "Connect T1D patients with clinical trials they qualify for, accelerating research recruitment.",
    goals: ["Integrate with ClinicalTrials.gov API", "Location-based matching", "Eligibility pre-screening"],
    outcomes: ["Faster trial enrollment", "Increased patient access to cutting-edge treatments"],
    technicalRequirements: ["React", "ClinicalTrials.gov API", "Geolocation", "Supabase"],
    estimatedEffort: "medium"
  },
  {
    id: "cgm-visualization",
    title: "CGM Data Visualization",
    description: "Interactive charts for glucose patterns",
    category: "User Tools",
    status: "in progress",
    tags: ["Frontend"],
    progress: 25,
    purpose: "Create beautiful, insightful visualizations that help users understand their glucose patterns.",
    goals: ["AGP-standard charts", "Pattern detection overlays", "Export capabilities"],
    technicalRequirements: ["React", "Recharts", "D3.js"],
    estimatedEffort: "medium"
  },
  {
    id: "realtime-glucose-alerts",
    title: "Real-Time Glucose Alerts",
    description: "Intelligent alert system that learns from user patterns",
    category: "User Tools",
    status: "open",
    tags: ["Mobile", "ML"],
    purpose: "Reduce alert fatigue while maintaining safety through personalized, context-aware notifications.",
    goals: ["Reduce false alarms by 50%", "Predictive alerts", "Context-aware notifications"],
    technicalRequirements: ["React Native", "Push Notifications", "ML"],
    estimatedEffort: "large"
  },
  {
    id: "food-database-integration",
    title: "Food Database Integration",
    description: "Connect to food databases for carb counting",
    category: "User Tools",
    status: "open",
    tags: ["API", "Data"],
    purpose: "Provide comprehensive nutritional data for accurate carb counting.",
    goals: ["500k+ food items", "Barcode scanning", "Restaurant menus"],
    technicalRequirements: ["API Integration", "Database", "Mobile"],
    estimatedEffort: "medium"
  },
  {
    id: "insulin-supply-tracker",
    title: "Insulin Supply & Pricing Tracker",
    description: "Real-time tracking of insulin prices and availability",
    category: "User Tools",
    status: "open",
    tags: ["Data", "Tracking"],
    progress: 5,
    purpose: "Help patients find the best prices and ensure they never run out of supplies.",
    goals: ["Price comparison across pharmacies", "Supply alerts", "Coupon integration"],
    technicalRequirements: ["Web Scraping", "Database", "Notifications"],
    estimatedEffort: "medium"
  },
  {
    id: "control-chaos-journal",
    title: "Control to Chaos Impact Journal",
    description: "Journal that ties actions to outcomes with AI summaries",
    category: "User Tools",
    status: "open",
    tags: ["Frontend", "AI", "Analytics"],
    purpose: "Help users understand how their daily decisions impact glucose control.",
    goals: ["Voice journaling", "AI pattern recognition", "Actionable insights"],
    technicalRequirements: ["React", "NLP", "Data Visualization"],
    estimatedEffort: "large"
  },
  {
    id: "personal-science-lab",
    title: "Personal Science Lab (T-Stud.io)",
    description: "Guided experiment builder for testing health hypotheses",
    category: "User Tools",
    status: "open",
    tags: ["Frontend", "UX", "Data"],
    purpose: "Enable n-of-1 experiments to discover personal patterns and optimal strategies.",
    goals: ["Experiment templates", "Statistical analysis", "Shareable results"],
    technicalRequirements: ["React", "Statistics", "Data Viz"],
    estimatedEffort: "large"
  },

  // AI Intelligence
  {
    id: "ai-insulin-calculator",
    title: "AI-Powered Insulin Dose Calculator",
    description: "Machine learning model to suggest optimal insulin doses based on multiple factors",
    category: "AI Intelligence",
    status: "open",
    tags: ["AI", "Machine Learning", "Healthcare"],
    purpose: "Provide personalized insulin dose suggestions based on comprehensive analysis of individual patterns.",
    goals: ["Personalized recommendations", "Safety guardrails", "Continuous learning"],
    outcomes: ["Improved time in range", "Reduced hypoglycemia", "Less decision fatigue"],
    technicalRequirements: ["Python", "TensorFlow", "API Development"],
    estimatedEffort: "large"
  },
  {
    id: "centralized-intelligence-engine",
    title: "Centralized Intelligence Engine",
    description: "Unified knowledge base that auto-connects information across tools and exposes it via API and search",
    category: "AI Intelligence",
    status: "open",
    tags: ["Backend", "Search", "DevOps"],
    purpose: "Create a single source of truth for all diabetes-related information.",
    goals: ["Semantic search", "Auto-categorization", "API access"],
    technicalRequirements: ["Elasticsearch", "NLP", "GraphQL"],
    estimatedEffort: "large"
  },
  {
    id: "glycemic-volatility-index",
    title: "Glycemic Volatility Index (GVI)",
    description: "Real-time glucose volatility index with rolling windows and personalized baselines",
    category: "AI Intelligence",
    status: "open",
    tags: ["Data Science", "Backend", "API"],
    progress: 15,
    purpose: "Provide a single metric that captures glucose stability beyond simple averages.",
    goals: ["Real-time calculation", "Historical trending", "Correlation analysis"],
    technicalRequirements: ["Python", "Time Series Analysis", "API"],
    estimatedEffort: "medium"
  },
  {
    id: "shadow-log-anomaly-detector",
    title: "Shadow Log Anomaly Detector",
    description: "ML-powered system to flag unusual device log patterns and known errors",
    category: "AI Intelligence",
    status: "open",
    tags: ["Data Science", "ML", "Backend"],
    purpose: "Automatically detect device issues before they cause problems.",
    goals: ["Real-time monitoring", "Pattern library", "Alert system"],
    technicalRequirements: ["Python", "Anomaly Detection", "Streaming"],
    estimatedEffort: "large"
  },
  {
    id: "mega-discoveries-search",
    title: "Mega Discoveries Search Engine",
    description: "Fast discovery across curated research sources with scoring and facets",
    category: "AI Intelligence",
    status: "open",
    tags: ["Search", "Data", "Backend"],
    purpose: "Make cutting-edge diabetes research accessible and searchable.",
    goals: ["Sub-second search", "Relevance scoring", "Citation tracking"],
    technicalRequirements: ["Elasticsearch", "NLP", "React"],
    estimatedEffort: "large"
  },
  {
    id: "open-diabetes-data-commons",
    title: "Open Diabetes Research Data Commons",
    description: "Centralized repository for anonymized diabetes research data",
    category: "AI Intelligence",
    status: "open",
    tags: ["Data", "Research", "Privacy"],
    purpose: "Enable research by providing access to anonymized, standardized datasets.",
    goals: ["Privacy-preserving sharing", "Standardized formats", "Research API"],
    technicalRequirements: ["Data Engineering", "Privacy Tech", "Cloud"],
    estimatedEffort: "large"
  },
  {
    id: "exercise-impact-prediction",
    title: "Exercise Impact Prediction Model",
    description: "Predict glucose response to different types of exercise",
    category: "AI Intelligence",
    status: "open",
    tags: ["AI", "Exercise", "Predictive"],
    purpose: "Help users plan exercise with confidence by predicting glucose impact.",
    goals: ["Activity type recognition", "Duration-based predictions", "Personalized models"],
    technicalRequirements: ["ML", "Wearable Integration", "Mobile"],
    estimatedEffort: "large"
  },
  {
    id: "insulin-dose-calculator-api",
    title: "Insulin Dose Calculator API",
    description: "Backend API for safe insulin dose calculations",
    category: "AI Intelligence",
    status: "open",
    tags: ["Backend", "API"],
    purpose: "Provide a robust, tested API for insulin calculations that other apps can use.",
    goals: ["Safety-first design", "Comprehensive logging", "Multi-factor support"],
    technicalRequirements: ["Node.js", "API Design", "Testing"],
    estimatedEffort: "medium"
  },

  // Device/Goals Management
  {
    id: "open-source-cgm-firmware",
    title: "Open Source CGM Firmware",
    description: "Community-developed firmware for affordable DIY CGM sensors",
    category: "Device/Goals Management",
    status: "in progress",
    tags: ["Hardware", "Firmware", "Open Source"],
    progress: 40,
    purpose: "Make CGM technology accessible to those who cannot afford commercial options.",
    goals: ["Safety-certified design", "Open documentation", "Community support"],
    technicalRequirements: ["Embedded C", "BLE", "Hardware Design"],
    estimatedEffort: "large"
  },
  {
    id: "pump-pocket-wearable-guide",
    title: "Pump & Pocket Wearable Guide",
    description: "Practical guide for wearing devices comfortably in daily life",
    category: "Device/Goals Management",
    status: "open",
    tags: ["Content", "UX", "Frontend"],
    purpose: "Help people find comfortable, practical ways to wear their devices.",
    goals: ["User-submitted solutions", "Outfit galleries", "Product recommendations"],
    technicalRequirements: ["React", "CMS", "User Submissions"],
    estimatedEffort: "small"
  },
  {
    id: "lost-devices-protocol",
    title: "Lost Devices Protocol",
    description: "Privacy-preserving device lookup, claim, and return flows",
    category: "Device/Goals Management",
    status: "open",
    tags: ["Backend", "Security", "Ops"],
    purpose: "Help reunite people with lost diabetes devices quickly and securely.",
    goals: ["Anonymous listing", "Verification system", "Manufacturer coordination"],
    technicalRequirements: ["Backend", "Security", "Notifications"],
    estimatedEffort: "medium"
  },

  // Community Support
  {
    id: "parent-guardian-network",
    title: "Parent/Guardian Support Network",
    description: "Mobile app connecting parents of T1D children",
    category: "Community Support",
    status: "open",
    tags: ["Mobile", "Community", "Support"],
    progress: 20,
    purpose: "Connect parents of T1D children for mutual support and knowledge sharing.",
    goals: ["Local matching", "Expert AMAs", "Resource library"],
    technicalRequirements: ["React Native", "Real-time Chat", "Moderation"],
    estimatedEffort: "large"
  },
  {
    id: "diabetes-education-platform",
    title: "Interactive Diabetes Education Platform",
    description: "Gamified learning platform for newly diagnosed Type 1 diabetics",
    category: "Community Support",
    status: "open",
    tags: ["Education", "UX", "Content"],
    progress: 5,
    purpose: "Make learning about T1D management engaging and effective.",
    goals: ["Progressive curriculum", "Achievement system", "Multi-language support"],
    technicalRequirements: ["React", "Gamification", "Content CMS"],
    estimatedEffort: "large"
  },
  {
    id: "school-accommodation-toolkit",
    title: "School Accommodation Toolkit",
    description: "Templates and resources for T1D school accommodations",
    category: "Community Support",
    status: "in progress",
    tags: ["Education", "Legal", "Templates"],
    progress: 60,
    purpose: "Help families navigate school accommodations for T1D students.",
    goals: ["State-specific templates", "Legal guidance", "Teacher training materials"],
    technicalRequirements: ["Document Generation", "CMS", "Legal Review"],
    estimatedEffort: "medium"
  },
  {
    id: "community-qa-platform",
    title: "Community Q&A Platform",
    description: "Q&A system for T1D questions",
    category: "Community Support",
    status: "open",
    tags: ["Fullstack"],
    purpose: "Create a trusted, searchable knowledge base from community Q&A.",
    goals: ["Expert verification", "Search optimization", "Moderation tools"],
    technicalRequirements: ["React", "Node.js", "Search"],
    estimatedEffort: "large"
  },
  {
    id: "community-quality-control",
    title: "Community Quality Control (CQC)",
    description: "Automated and human moderation pipelines for quality content",
    category: "Community Support",
    status: "open",
    tags: ["Backend", "ML", "Moderation"],
    purpose: "Ensure community content is accurate, helpful, and safe.",
    goals: ["Automated flagging", "Expert review queue", "Quality scores"],
    technicalRequirements: ["NLP", "Moderation Tools", "Workflows"],
    estimatedEffort: "medium"
  },
  {
    id: "community-beacons",
    title: "Community Beacons & Local Legends",
    description: "Host network and event system for local T1D support",
    category: "Community Support",
    status: "open",
    tags: ["Frontend", "Backend", "CMS"],
    purpose: "Connect people with local T1D community leaders and events.",
    goals: ["Event calendar", "Host profiles", "Meetup coordination"],
    technicalRequirements: ["React", "Calendar Integration", "Geolocation"],
    estimatedEffort: "medium"
  },
];
