import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const t1dEvents = [
  {
    title: 'JDRF One Walk - New York',
    description: 'Join thousands of walkers to raise funds for T1D research. Family-friendly event with food, activities, and community celebration.',
    event_type: 'walk',
    organizer: 'Breakthrough T1D (JDRF)',
    location_name: 'Central Park',
    city: 'New York',
    state: 'NY',
    country: 'United States',
    start_date: '2026-04-15T09:00:00Z',
    end_date: '2026-04-15T14:00:00Z',
    cost_info: 'Free to participate, fundraising encouraged',
    is_free: true,
    registration_url: 'https://www.breakthrought1d.org/walk',
    website_url: 'https://www.breakthrought1d.org',
    is_virtual: false,
    tags: ['family-friendly', 'fundraising', 'outdoor']
  },
  {
    title: 'Friends for Life Conference 2026',
    description: 'The premier diabetes conference for families. Educational sessions, tech demos, youth programs, and unforgettable connections.',
    event_type: 'conference',
    organizer: 'Children with Diabetes',
    location_name: 'Rosen Shingle Creek',
    city: 'Orlando',
    state: 'FL',
    country: 'United States',
    start_date: '2026-07-08T08:00:00Z',
    end_date: '2026-07-12T17:00:00Z',
    cost_info: '$700-1200 (varies by package)',
    is_free: false,
    registration_url: 'https://childrenwithdiabetes.com/friends-for-life/',
    website_url: 'https://childrenwithdiabetes.com',
    is_virtual: false,
    tags: ['conference', 'family', 'education', 'networking']
  },
  {
    title: 'DiabetesSisters Weekend for Women',
    description: 'A transformative weekend conference designed specifically for women living with all types of diabetes.',
    event_type: 'conference',
    organizer: 'DiabetesSisters',
    location_name: 'The Westin',
    city: 'Charlotte',
    state: 'NC',
    country: 'United States',
    start_date: '2026-05-15T13:00:00Z',
    end_date: '2026-05-17T12:00:00Z',
    cost_info: '$275-375',
    is_free: false,
    registration_url: 'https://diabetessisters.org/weekend-women',
    website_url: 'https://diabetessisters.org',
    is_virtual: false,
    tags: ['women', 'support', 'education']
  },
  {
    title: 'T1D Exchange Virtual Research Update',
    description: 'Monthly virtual webinar featuring the latest T1D research findings and clinical trial updates.',
    event_type: 'virtual',
    organizer: 'T1D Exchange',
    location_name: 'Online',
    city: 'Virtual',
    state: '',
    country: 'United States',
    start_date: '2026-02-20T19:00:00Z',
    end_date: '2026-02-20T20:30:00Z',
    cost_info: 'Free',
    is_free: true,
    registration_url: 'https://t1dexchange.org/events',
    website_url: 'https://t1dexchange.org',
    is_virtual: true,
    tags: ['research', 'virtual', 'educational']
  },
  {
    title: 'Camp Joslin - Summer Session',
    description: 'The oldest and largest camp for children with T1D. Week-long summer camp with full medical staff.',
    event_type: 'camp',
    organizer: 'Joslin Diabetes Center',
    location_name: 'Camp Joslin',
    city: 'Charlton',
    state: 'MA',
    country: 'United States',
    start_date: '2026-07-20T09:00:00Z',
    end_date: '2026-07-27T15:00:00Z',
    cost_info: '$1,200 (scholarships available)',
    is_free: false,
    registration_url: 'https://www.joslin.org/patient-care/camp-joslin',
    website_url: 'https://www.joslin.org',
    is_virtual: false,
    tags: ['kids', 'camp', 'summer', 'outdoor']
  },
  {
    title: 'ADA Scientific Sessions 2026',
    description: 'The world\'s largest scientific meeting focused on diabetes research, prevention, and care.',
    event_type: 'conference',
    organizer: 'American Diabetes Association',
    location_name: 'San Diego Convention Center',
    city: 'San Diego',
    state: 'CA',
    country: 'United States',
    start_date: '2026-06-12T08:00:00Z',
    end_date: '2026-06-16T17:00:00Z',
    cost_info: '$500-900 (early bird discounts)',
    is_free: false,
    registration_url: 'https://professional.diabetes.org/scientific-sessions',
    website_url: 'https://www.diabetes.org',
    is_virtual: false,
    tags: ['professional', 'research', 'medical']
  },
  {
    title: 'Local T1D Parent Support Group - Chicago',
    description: 'Monthly meetup for parents of children with T1D. Share experiences, tips, and support each other.',
    event_type: 'support_group',
    organizer: 'Local T1D Community',
    location_name: 'Community Center',
    city: 'Chicago',
    state: 'IL',
    country: 'United States',
    start_date: '2026-02-10T18:30:00Z',
    end_date: '2026-02-10T20:00:00Z',
    cost_info: 'Free',
    is_free: true,
    registration_url: '#',
    website_url: '#',
    is_virtual: false,
    tags: ['parents', 'support', 'monthly']
  },
  {
    title: 'Beyond Type 1 Virtual Meetup',
    description: 'Connect with the global T1D community in this monthly virtual hangout. All ages welcome.',
    event_type: 'virtual',
    organizer: 'Beyond Type 1',
    location_name: 'Online',
    city: 'Virtual',
    state: '',
    country: 'United States',
    start_date: '2026-02-25T20:00:00Z',
    end_date: '2026-02-25T21:30:00Z',
    cost_info: 'Free',
    is_free: true,
    registration_url: 'https://beyondtype1.org/events',
    website_url: 'https://beyondtype1.org',
    is_virtual: true,
    tags: ['virtual', 'community', 'all-ages']
  },
  {
    title: 'JDRF One Walk - Los Angeles',
    description: 'Annual walk to fund type 1 diabetes research. Bring your team, family, or walk solo!',
    event_type: 'walk',
    organizer: 'Breakthrough T1D (JDRF)',
    location_name: 'Rose Bowl',
    city: 'Pasadena',
    state: 'CA',
    country: 'United States',
    start_date: '2026-05-03T08:00:00Z',
    end_date: '2026-05-03T13:00:00Z',
    cost_info: 'Free to participate',
    is_free: true,
    registration_url: 'https://www.breakthrought1d.org/walk',
    website_url: 'https://www.breakthrought1d.org',
    is_virtual: false,
    tags: ['walk', 'fundraising', 'family-friendly']
  },
  {
    title: 'Diabetes Technology Summit',
    description: 'Annual summit exploring the latest in CGM, insulin pumps, and artificial pancreas technology.',
    event_type: 'conference',
    organizer: 'dQ&A',
    location_name: 'Marriott Marquis',
    city: 'San Francisco',
    state: 'CA',
    country: 'United States',
    start_date: '2026-03-20T09:00:00Z',
    end_date: '2026-03-21T17:00:00Z',
    cost_info: '$350-500',
    is_free: false,
    registration_url: 'https://www.dqa.org/summit',
    website_url: 'https://www.dqa.org',
    is_virtual: false,
    tags: ['technology', 'professional', 'innovation']
  },
  {
    title: 'Camp Sweeney - Session 1',
    description: 'One of the oldest camps for children with diabetes. Traditional summer camp experience with expert diabetes care.',
    event_type: 'camp',
    organizer: 'Camp Sweeney',
    location_name: 'Camp Sweeney',
    city: 'Gainesville',
    state: 'TX',
    country: 'United States',
    start_date: '2026-06-07T14:00:00Z',
    end_date: '2026-06-20T11:00:00Z',
    cost_info: '$2,850 (financial aid available)',
    is_free: false,
    registration_url: 'https://campsweeney.org',
    website_url: 'https://campsweeney.org',
    is_virtual: false,
    tags: ['camp', 'kids', 'summer']
  },
  {
    title: 'TypeOneNation Summit - Boston',
    description: 'Free one-day event with exhibitors, speakers, and activities for the entire T1D community.',
    event_type: 'conference',
    organizer: 'Breakthrough T1D',
    location_name: 'Boston Convention Center',
    city: 'Boston',
    state: 'MA',
    country: 'United States',
    start_date: '2026-04-25T09:00:00Z',
    end_date: '2026-04-25T16:00:00Z',
    cost_info: 'Free',
    is_free: true,
    registration_url: 'https://www.breakthrought1d.org/summit',
    website_url: 'https://www.breakthrought1d.org',
    is_virtual: false,
    tags: ['free', 'family', 'education']
  },
  {
    title: 'Diabetes Research Institute Foundation Gala',
    description: 'Annual black-tie fundraising gala supporting breakthrough diabetes research.',
    event_type: 'fundraiser',
    organizer: 'Diabetes Research Institute Foundation',
    location_name: 'The Breakers',
    city: 'Palm Beach',
    state: 'FL',
    country: 'United States',
    start_date: '2026-02-28T18:00:00Z',
    end_date: '2026-02-28T23:00:00Z',
    cost_info: '$500+ per ticket',
    is_free: false,
    registration_url: 'https://www.diabetesresearch.org/gala',
    website_url: 'https://www.diabetesresearch.org',
    is_virtual: false,
    tags: ['fundraising', 'gala', 'research']
  },
  {
    title: 'College Diabetes Network Summit',
    description: 'Annual gathering for college students with T1D. Networking, workshops, and leadership training.',
    event_type: 'conference',
    organizer: 'College Diabetes Network',
    location_name: 'Georgetown University',
    city: 'Washington',
    state: 'DC',
    country: 'United States',
    start_date: '2026-03-14T09:00:00Z',
    end_date: '2026-03-15T16:00:00Z',
    cost_info: '$75 (scholarships available)',
    is_free: false,
    registration_url: 'https://collegediabetesnetwork.org/summit',
    website_url: 'https://collegediabetesnetwork.org',
    is_virtual: false,
    tags: ['college', 'young-adults', 'networking']
  },
  {
    title: 'World Diabetes Day Virtual Summit',
    description: 'Global virtual event marking World Diabetes Day with speakers from around the world.',
    event_type: 'virtual',
    organizer: 'International Diabetes Federation',
    location_name: 'Online',
    city: 'Virtual',
    state: '',
    country: 'International',
    start_date: '2026-11-14T08:00:00Z',
    end_date: '2026-11-14T20:00:00Z',
    cost_info: 'Free',
    is_free: true,
    registration_url: 'https://worlddiabetesday.org',
    website_url: 'https://idf.org',
    is_virtual: true,
    tags: ['global', 'awareness', 'virtual']
  },
  {
    title: 'PODS Local Meetup - Dallas',
    description: 'Part of DiabetesSisters local community meetup for women with diabetes.',
    event_type: 'support_group',
    organizer: 'DiabetesSisters',
    location_name: 'La Madeleine Café',
    city: 'Dallas',
    state: 'TX',
    country: 'United States',
    start_date: '2026-03-05T11:00:00Z',
    end_date: '2026-03-05T13:00:00Z',
    cost_info: 'Free (pay for own meal)',
    is_free: true,
    registration_url: 'https://diabetessisters.org/pods',
    website_url: 'https://diabetessisters.org',
    is_virtual: false,
    tags: ['women', 'support', 'local']
  },
  {
    title: 'Bike Beyond Tour de Cure',
    description: 'Cycling event to raise funds for diabetes research. Routes from 10 to 100 miles.',
    event_type: 'walk',
    organizer: 'American Diabetes Association',
    location_name: 'Napa Valley',
    city: 'Napa',
    state: 'CA',
    country: 'United States',
    start_date: '2026-05-17T07:00:00Z',
    end_date: '2026-05-17T15:00:00Z',
    cost_info: '$25 registration, fundraising minimum $200',
    is_free: false,
    registration_url: 'https://diabetes.org/tour-de-cure',
    website_url: 'https://diabetes.org',
    is_virtual: false,
    tags: ['cycling', 'fundraising', 'outdoor']
  },
  {
    title: 'Taking Control of Your Diabetes Conference',
    description: 'Educational conference empowering people with diabetes through knowledge and technology.',
    event_type: 'conference',
    organizer: 'TCOYD',
    location_name: 'Hilton Bayfront',
    city: 'San Diego',
    state: 'CA',
    country: 'United States',
    start_date: '2026-10-17T08:00:00Z',
    end_date: '2026-10-18T16:00:00Z',
    cost_info: '$99',
    is_free: false,
    registration_url: 'https://tcoyd.org/conferences',
    website_url: 'https://tcoyd.org',
    is_virtual: false,
    tags: ['education', 'empowerment', 'technology']
  },
  {
    title: 'Diabetes Camp Colorado',
    description: 'Summer camp for children with type 1 diabetes in the beautiful Colorado mountains.',
    event_type: 'camp',
    organizer: 'Rocky Mountain Diabetes Camp',
    location_name: 'Winter Park',
    city: 'Winter Park',
    state: 'CO',
    country: 'United States',
    start_date: '2026-07-12T12:00:00Z',
    end_date: '2026-07-18T12:00:00Z',
    cost_info: '$900 (camperships available)',
    is_free: false,
    registration_url: 'https://rockymountaindiabetescamp.org',
    website_url: 'https://rockymountaindiabetescamp.org',
    is_virtual: false,
    tags: ['camp', 'kids', 'mountains', 'summer']
  },
  {
    title: 'Diabetes Advocacy Day',
    description: 'Join advocates from across the country to meet with lawmakers about diabetes issues.',
    event_type: 'advocacy',
    organizer: 'American Diabetes Association',
    location_name: 'Capitol Hill',
    city: 'Washington',
    state: 'DC',
    country: 'United States',
    start_date: '2026-03-24T08:00:00Z',
    end_date: '2026-03-24T17:00:00Z',
    cost_info: 'Free (travel not included)',
    is_free: true,
    registration_url: 'https://diabetes.org/advocacy',
    website_url: 'https://diabetes.org',
    is_virtual: false,
    tags: ['advocacy', 'policy', 'government']
  },
  {
    title: 'Teen T1D Virtual Game Night',
    description: 'Monthly virtual game night for teens with T1D. Play games and connect with others who get it.',
    event_type: 'virtual',
    organizer: 'Beyond Type 1',
    location_name: 'Online',
    city: 'Virtual',
    state: '',
    country: 'United States',
    start_date: '2026-02-14T19:00:00Z',
    end_date: '2026-02-14T21:00:00Z',
    cost_info: 'Free',
    is_free: true,
    registration_url: 'https://beyondtype1.org/teens',
    website_url: 'https://beyondtype1.org',
    is_virtual: true,
    tags: ['teens', 'virtual', 'social']
  },
  {
    title: 'ISPAD Annual Conference 2026',
    description: 'International Society for Pediatric and Adolescent Diabetes annual scientific meeting.',
    event_type: 'conference',
    organizer: 'ISPAD',
    location_name: 'Convention Centre',
    city: 'Sydney',
    state: 'NSW',
    country: 'Australia',
    start_date: '2026-10-21T08:00:00Z',
    end_date: '2026-10-24T17:00:00Z',
    cost_info: '€450-700',
    is_free: false,
    registration_url: 'https://ispad.org/conference',
    website_url: 'https://ispad.org',
    is_virtual: false,
    tags: ['pediatric', 'research', 'international', 'medical']
  },
  {
    title: 'Diabetes UK Professional Conference',
    description: 'Leading UK conference for healthcare professionals working in diabetes care.',
    event_type: 'conference',
    organizer: 'Diabetes UK',
    location_name: 'ACC Liverpool',
    city: 'Liverpool',
    state: '',
    country: 'United Kingdom',
    start_date: '2026-03-11T09:00:00Z',
    end_date: '2026-03-13T17:00:00Z',
    cost_info: '£200-400',
    is_free: false,
    registration_url: 'https://www.diabetes.org.uk/professionals/conference',
    website_url: 'https://www.diabetes.org.uk',
    is_virtual: false,
    tags: ['professional', 'UK', 'healthcare']
  },
  {
    title: 'ATTD 2026 - Advanced Technologies & Treatments for Diabetes',
    description: 'Premier international conference on diabetes technology and innovation.',
    event_type: 'conference',
    organizer: 'ATTD',
    location_name: 'Convention Center',
    city: 'Florence',
    state: '',
    country: 'Italy',
    start_date: '2026-02-25T08:00:00Z',
    end_date: '2026-02-28T17:00:00Z',
    cost_info: '€400-700',
    is_free: false,
    registration_url: 'https://attd.kenes.com',
    website_url: 'https://attd.kenes.com',
    is_virtual: false,
    tags: ['technology', 'international', 'innovation']
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

    console.log(`Seeding ${t1dEvents.length} T1D events...`);

    let insertedCount = 0;
    let errorCount = 0;

    for (const event of t1dEvents) {
      const { error } = await supabase
        .from('t1d_events')
        .upsert({
          ...event
        }, {
          onConflict: 'title,start_date'
        });

      if (error) {
        console.error(`Error inserting event: ${event.title}`, error);
        errorCount++;
      } else {
        insertedCount++;
      }
    }

    console.log(`Seed complete: ${insertedCount} inserted, ${errorCount} errors`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Seeded ${insertedCount} T1D events`,
        inserted: insertedCount,
        errors: errorCount
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: unknown) {
    console.error('Error in seed-t1d-events:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
