import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const organizations = [
  {
    name: 'Breakthrough T1D',
    acronym: 'BT1D',
    purpose: 'research',
    mission_statement: 'To accelerate life-changing breakthroughs to cure, prevent, and treat type 1 diabetes and its complications.',
    org_type: 'research',
    founded_year: 1970,
    headquarters: 'New York, NY',
    country: 'United States',
    annual_revenue: 200000000,
    annual_donations: 175000000,
    executive_compensation: { ceo_name: 'Aaron Kowalski, PhD', ceo_salary: 650000 },
    staff_count: 200,
    volunteer_count: 50000,
    current_projects: [
      { name: 'T1D Fund', description: 'Venture philanthropy fund investing in T1D cure research' },
      { name: 'Advocacy Program', description: 'Federal and state policy advocacy for T1D community' }
    ],
    recent_projects: [
      { name: 'Teplizumab Approval Support', year: 2022 },
      { name: 'Artificial Pancreas Project', year: 2020 }
    ],
    future_plans: 'Focusing on cell therapies, immunotherapy approaches, and artificial pancreas technology advancement.',
    history_summary: 'Founded in 1970 by parents of children with T1D. Originally named Juvenile Diabetes Research Foundation (JDRF). Rebranded to Breakthrough T1D in 2024. Has funded over $3 billion in research.',
    notable_achievements: ['Helped develop first CGM', 'Funded teplizumab development', 'Created artificial pancreas roadmap'],
    website_url: 'https://www.breakthrought1d.org',
    donate_url: 'https://www.breakthrought1d.org/donate/',
    logo_url: '',
    charity_navigator_rating: 4
  },
  {
    name: 'American Diabetes Association',
    acronym: 'ADA',
    purpose: 'hybrid',
    mission_statement: 'To prevent and cure diabetes and to improve the lives of all people affected by diabetes.',
    org_type: 'hybrid',
    founded_year: 1940,
    headquarters: 'Arlington, VA',
    country: 'United States',
    annual_revenue: 180000000,
    annual_donations: 130000000,
    executive_compensation: { ceo_name: 'Charles Henderson', ceo_salary: 700000 },
    staff_count: 400,
    volunteer_count: 100000,
    current_projects: [
      { name: 'Standards of Care', description: 'Annual clinical practice guidelines for diabetes care' },
      { name: 'Tour de Cure', description: 'Cycling fundraising events nationwide' }
    ],
    recent_projects: [
      { name: 'COVID-19 Diabetes Resource Center', year: 2020 },
      { name: 'Health Equity Now Initiative', year: 2021 }
    ],
    future_plans: 'Expanding access to insulin and diabetes technology, reducing healthcare disparities.',
    history_summary: 'Founded in 1940, ADA is the leading voluntary health organization fighting to bend the curve on the diabetes epidemic. Publishes Diabetes Care and Diabetes journals.',
    notable_achievements: ['Created first diabetes standards of care', 'Raised over $2B for research', 'Advocacy for insulin price caps'],
    website_url: 'https://www.diabetes.org',
    donate_url: 'https://www.diabetes.org/donate',
    logo_url: '',
    charity_navigator_rating: 3
  },
  {
    name: 'Beyond Type 1',
    acronym: 'BT1',
    purpose: 'support',
    mission_statement: 'To change what it means to live with diabetes.',
    org_type: 'support',
    founded_year: 2015,
    headquarters: 'San Francisco, CA',
    country: 'United States',
    annual_revenue: 8000000,
    annual_donations: 6000000,
    executive_compensation: { ceo_name: 'Thom Scher', ceo_salary: 250000 },
    staff_count: 35,
    volunteer_count: 5000,
    current_projects: [
      { name: 'Beyond Type 1 App', description: 'Social network connecting people with T1D' },
      { name: 'Mental Health Resources', description: 'Diabetes distress and mental health support' }
    ],
    recent_projects: [
      { name: 'Snail Mail Club', year: 2021 },
      { name: 'Type 1 Diabetes Resource Guide', year: 2022 }
    ],
    future_plans: 'Expanding global community reach and mental health resources.',
    history_summary: 'Founded in 2015 by Nick Jonas and others. Focused on connecting the T1D community through technology and resources.',
    notable_achievements: ['Built largest T1D online community', 'Created comprehensive resource guides', 'Mental health awareness campaigns'],
    website_url: 'https://beyondtype1.org',
    donate_url: 'https://beyondtype1.org/donate/',
    logo_url: '',
    charity_navigator_rating: 4
  },
  {
    name: 'DiabetesSisters',
    acronym: 'DS',
    purpose: 'support',
    mission_statement: 'To improve the health and quality of life of women with diabetes.',
    org_type: 'support',
    founded_year: 2008,
    headquarters: 'Durham, NC',
    country: 'United States',
    annual_revenue: 1200000,
    annual_donations: 900000,
    executive_compensation: { ceo_name: 'Anna Norton', ceo_salary: 130000 },
    staff_count: 8,
    volunteer_count: 500,
    current_projects: [
      { name: 'PODS Meetups', description: 'Part of DiabetesSisters local meetup groups' },
      { name: 'Weekend for Women', description: 'Annual conference for women with diabetes' }
    ],
    recent_projects: [
      { name: 'Diabetes and Pregnancy Initiative', year: 2022 },
      { name: 'Menopause and Diabetes Resources', year: 2023 }
    ],
    future_plans: 'Expanding programs addressing women-specific diabetes challenges.',
    history_summary: 'Founded in 2008 to address the unique needs of women living with diabetes. Created grassroots local support network.',
    notable_achievements: ['Created nationwide PODS network', 'Research on diabetes and womens health', 'Annual Weekend for Women conference'],
    website_url: 'https://diabetessisters.org',
    donate_url: 'https://diabetessisters.org/donate',
    logo_url: '',
    charity_navigator_rating: 4
  },
  {
    name: 'The Diabetes Research Institute Foundation',
    acronym: 'DRIF',
    purpose: 'research',
    mission_statement: 'To provide the Diabetes Research Institute with the funding necessary to cure diabetes now.',
    org_type: 'research',
    founded_year: 1971,
    headquarters: 'Hollywood, FL',
    country: 'United States',
    annual_revenue: 25000000,
    annual_donations: 22000000,
    executive_compensation: { ceo_name: 'Sean Doherty', ceo_salary: 350000 },
    staff_count: 45,
    volunteer_count: 3000,
    current_projects: [
      { name: 'BioHub Project', description: 'Mini organ implant to restore insulin production' },
      { name: 'Islet Transplantation', description: 'Improving islet transplant outcomes' }
    ],
    recent_projects: [
      { name: 'BioHub Phase 1 Trials', year: 2023 },
      { name: 'Encapsulation Technology', year: 2022 }
    ],
    future_plans: 'Advancing BioHub technology toward larger clinical trials.',
    history_summary: 'Founded in 1971 to support the Diabetes Research Institute at University of Miami. Pioneered islet transplantation research.',
    notable_achievements: ['Developed Edmonton Protocol improvements', 'BioHub concept development', 'First islet-alone transplants'],
    website_url: 'https://www.diabetesresearch.org',
    donate_url: 'https://www.diabetesresearch.org/donate',
    logo_url: '',
    charity_navigator_rating: 4
  },
  {
    name: 'Children with Diabetes',
    acronym: 'CWD',
    purpose: 'education',
    mission_statement: 'To promote understanding, provide support, and help children with diabetes lead full, happy, and healthy lives.',
    org_type: 'education',
    founded_year: 1995,
    headquarters: 'West Chester, OH',
    country: 'United States',
    annual_revenue: 3500000,
    annual_donations: 2800000,
    executive_compensation: { ceo_name: 'Jeff Hitchcock', ceo_salary: 180000 },
    staff_count: 15,
    volunteer_count: 200,
    current_projects: [
      { name: 'Friends for Life Conference', description: 'Annual family conference for T1D' },
      { name: 'Online Community Forum', description: 'Support forum for families' }
    ],
    recent_projects: [
      { name: 'Virtual Friends for Life', year: 2020 },
      { name: 'Focus on Technology', year: 2023 }
    ],
    future_plans: 'Expanding Friends for Life conferences internationally.',
    history_summary: 'Founded in 1995 as one of the first online diabetes communities. Created the Friends for Life conference which has become the premier family diabetes event.',
    notable_achievements: ['Created Friends for Life conference', 'Pioneer in online diabetes community', 'Focus on Technology program'],
    website_url: 'https://childrenwithdiabetes.com',
    donate_url: 'https://childrenwithdiabetes.com/donate/',
    logo_url: '',
    charity_navigator_rating: 4
  },
  {
    name: 'T1D Exchange',
    acronym: 'T1DX',
    purpose: 'research',
    mission_statement: 'To accelerate the development of therapies and advance the overall care of people living with type 1 diabetes through the power of data.',
    org_type: 'research',
    founded_year: 2016,
    headquarters: 'Boston, MA',
    country: 'United States',
    annual_revenue: 15000000,
    annual_donations: 12000000,
    executive_compensation: { ceo_name: 'David Panzirer', ceo_salary: 300000 },
    staff_count: 50,
    volunteer_count: 1000,
    current_projects: [
      { name: 'Registry', description: 'Largest T1D patient registry for research' },
      { name: 'Quality Improvement Collaborative', description: 'Improving clinical care standards' }
    ],
    recent_projects: [
      { name: 'CGM Outcomes Research', year: 2023 },
      { name: 'Real-World Data Studies', year: 2022 }
    ],
    future_plans: 'Expanding registry to 500,000 participants for larger research studies.',
    history_summary: 'Founded by JDRF and Helmsley Charitable Trust. Operates largest T1D patient registry with 40,000+ participants.',
    notable_achievements: ['Created largest T1D registry', 'Published influential outcomes data', 'Quality improvement in clinics'],
    website_url: 'https://t1dexchange.org',
    donate_url: 'https://t1dexchange.org/donate/',
    logo_url: '',
    charity_navigator_rating: 4
  },
  {
    name: 'International Diabetes Federation',
    acronym: 'IDF',
    purpose: 'advocacy',
    mission_statement: 'To promote diabetes care, prevention and a cure worldwide.',
    org_type: 'advocacy',
    founded_year: 1950,
    headquarters: 'Brussels',
    country: 'Belgium',
    annual_revenue: 12000000,
    annual_donations: 8000000,
    executive_compensation: { ceo_name: 'Andrew Boulton', ceo_salary: 280000 },
    staff_count: 60,
    volunteer_count: 10000,
    current_projects: [
      { name: 'World Diabetes Day', description: 'Global awareness campaign each November 14' },
      { name: 'Diabetes Atlas', description: 'Global diabetes statistics and projections' }
    ],
    recent_projects: [
      { name: 'Diabetes Atlas 10th Edition', year: 2021 },
      { name: 'COVID-19 Response', year: 2020 }
    ],
    future_plans: 'Advocating for universal access to diabetes care and prevention programs.',
    history_summary: 'Founded in 1950, IDF is the umbrella organization for 230+ national diabetes associations in 170+ countries.',
    notable_achievements: ['Created World Diabetes Day', 'Publishes Diabetes Atlas', 'Global advocacy campaigns'],
    website_url: 'https://idf.org',
    donate_url: 'https://idf.org/donate/',
    logo_url: '',
    charity_navigator_rating: 4
  },
  {
    name: 'Joslin Diabetes Center',
    acronym: 'JDC',
    purpose: 'research',
    mission_statement: 'To prevent, treat and cure diabetes through cutting-edge research, innovative therapies and world-class care.',
    org_type: 'research',
    founded_year: 1898,
    headquarters: 'Boston, MA',
    country: 'United States',
    annual_revenue: 85000000,
    annual_donations: 30000000,
    executive_compensation: { ceo_name: 'George King, MD', ceo_salary: 550000 },
    staff_count: 650,
    volunteer_count: 200,
    current_projects: [
      { name: 'Diabetes Complications Research', description: 'Understanding and preventing complications' },
      { name: '50-Year Medalist Study', description: 'Studying people with 50+ years of T1D' }
    ],
    recent_projects: [
      { name: 'Asian American Diabetes Initiative', year: 2021 },
      { name: 'Latino Diabetes Initiative', year: 2020 }
    ],
    future_plans: 'Expanding precision medicine approaches to diabetes care.',
    history_summary: 'Founded by Elliott P. Joslin in 1898, one of the worlds first diabetes treatment centers. Affiliated with Harvard Medical School.',
    notable_achievements: ['Pioneered diabetes treatment', '50-Year Medalist Program', 'World-renowned research'],
    website_url: 'https://www.joslin.org',
    donate_url: 'https://www.joslin.org/give',
    logo_url: '',
    charity_navigator_rating: 4
  },
  {
    name: 'College Diabetes Network',
    acronym: 'CDN',
    purpose: 'support',
    mission_statement: 'To provide young adults with diabetes the peer connections they need to thrive.',
    org_type: 'support',
    founded_year: 2009,
    headquarters: 'Boston, MA',
    country: 'United States',
    annual_revenue: 2000000,
    annual_donations: 1800000,
    executive_compensation: { ceo_name: 'Christina Roth', ceo_salary: 140000 },
    staff_count: 12,
    volunteer_count: 2500,
    current_projects: [
      { name: 'Campus Chapters', description: '200+ student-led chapters at universities' },
      { name: 'Young Professionals Program', description: 'Support for post-college transition' }
    ],
    recent_projects: [
      { name: 'Virtual Peer Support Network', year: 2020 },
      { name: 'Career Development Program', year: 2022 }
    ],
    future_plans: 'Expanding to 500 campus chapters and launching graduate school support.',
    history_summary: 'Founded in 2009 by a college student with T1D who recognized the need for peer support during the college transition.',
    notable_achievements: ['200+ active campus chapters', 'Annual leadership summit', 'Transition resources'],
    website_url: 'https://collegediabetesnetwork.org',
    donate_url: 'https://collegediabetesnetwork.org/donate',
    logo_url: '',
    charity_navigator_rating: 4
  },
  {
    name: 'Diabetes UK',
    acronym: 'DUK',
    purpose: 'hybrid',
    mission_statement: 'To create a world where diabetes can do no harm.',
    org_type: 'hybrid',
    founded_year: 1934,
    headquarters: 'London',
    country: 'United Kingdom',
    annual_revenue: 50000000,
    annual_donations: 40000000,
    executive_compensation: { ceo_name: 'Chris Askew', ceo_salary: 180000 },
    staff_count: 350,
    volunteer_count: 8000,
    current_projects: [
      { name: 'Know Your Risk', description: 'Type 2 prevention campaign' },
      { name: 'Research Grants', description: 'Funding diabetes research across UK' }
    ],
    recent_projects: [
      { name: 'Tech Remission Study', year: 2023 },
      { name: 'Flash Glucose Campaign', year: 2022 }
    ],
    future_plans: 'Campaigning for NHS access to diabetes technology.',
    history_summary: 'Founded in 1934, Diabetes UK is the leading charity for people living with diabetes in the UK.',
    notable_achievements: ['Flash glucose monitoring campaign success', 'Major research funder', 'Policy advocacy'],
    website_url: 'https://www.diabetes.org.uk',
    donate_url: 'https://www.diabetes.org.uk/donate',
    logo_url: '',
    charity_navigator_rating: 4
  },
  {
    name: 'Taking Control of Your Diabetes',
    acronym: 'TCOYD',
    purpose: 'education',
    mission_statement: 'To educate and motivate people with diabetes to take a more active role in their condition.',
    org_type: 'education',
    founded_year: 1995,
    headquarters: 'San Diego, CA',
    country: 'United States',
    annual_revenue: 5000000,
    annual_donations: 4500000,
    executive_compensation: { ceo_name: 'Steven Edelman, MD', ceo_salary: 200000 },
    staff_count: 20,
    volunteer_count: 300,
    current_projects: [
      { name: 'TCOYD Conferences', description: 'Educational conferences across the country' },
      { name: 'TV Programming', description: 'Diabetes education TV show' }
    ],
    recent_projects: [
      { name: 'One Conference', year: 2023 },
      { name: 'Virtual Education Series', year: 2021 }
    ],
    future_plans: 'Expanding virtual programming and reaching underserved communities.',
    history_summary: 'Founded by Dr. Steven Edelman, an endocrinologist with T1D, to empower people through education.',
    notable_achievements: ['Decades of patient education', 'Innovative conference format', 'TV education programming'],
    website_url: 'https://tcoyd.org',
    donate_url: 'https://tcoyd.org/donate',
    logo_url: '',
    charity_navigator_rating: 4
  }
];

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log(`Seeding ${organizations.length} diabetes organizations...`);

    let insertedCount = 0;
    let errorCount = 0;

    for (const org of organizations) {
      // First check if org exists
      const { data: existing } = await supabase
        .from('diabetes_organizations')
        .select('id')
        .eq('name', org.name)
        .maybeSingle();

      if (existing) {
        // Update existing
        const { error } = await supabase
          .from('diabetes_organizations')
          .update({
            ...org,
            updated_at: new Date().toISOString()
          })
          .eq('name', org.name);

        if (error) {
          console.error(`Error updating organization: ${org.name}`, error);
          errorCount++;
        } else {
          insertedCount++;
        }
      } else {
        // Insert new
        const { error } = await supabase
          .from('diabetes_organizations')
          .insert({
            ...org,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });

        if (error) {
          console.error(`Error inserting organization: ${org.name}`, error);
          errorCount++;
        } else {
          insertedCount++;
        }
      }
    }

    console.log(`Seed complete: ${insertedCount} inserted, ${errorCount} errors`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Seeded ${insertedCount} organizations`,
        inserted: insertedCount,
        errors: errorCount
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: unknown) {
    console.error('Error in seed-diabetes-organizations:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
