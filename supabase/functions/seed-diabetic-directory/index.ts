import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const DIRECTORY_ENTRIES = [
  // JDRF Chapters
  { name: "JDRF Greater New York Chapter", organization_type: "jdrf_chapter", description: "JDRF chapter serving NYC metro area with walks, galas, mentoring, and advocacy events.", city: "New York", state: "NY", region: "Northeast", url: "https://www.jdrf.org/chapter/greater-new-york/", is_national: false },
  { name: "JDRF Greater Bay Area Chapter", organization_type: "jdrf_chapter", description: "San Francisco Bay Area JDRF chapter hosting walks, research updates, and family events.", city: "San Francisco", state: "CA", region: "West", url: "https://www.jdrf.org/chapter/greater-bay-area/", is_national: false },
  { name: "JDRF Greater Chicago Chapter", organization_type: "jdrf_chapter", description: "Chicago-area JDRF chapter with One Walk events, mentoring, and community connections.", city: "Chicago", state: "IL", region: "Midwest", url: "https://www.jdrf.org/chapter/greater-chicago/", is_national: false },
  { name: "JDRF New England Chapter", organization_type: "jdrf_chapter", description: "Covering CT, MA, ME, NH, RI, VT with walks, galas, advocacy, and family retreats.", city: "Boston", state: "MA", region: "Northeast", url: "https://www.jdrf.org/chapter/new-england/", is_national: false },
  { name: "JDRF Greater Dallas Chapter", organization_type: "jdrf_chapter", description: "Dallas/Fort Worth JDRF chapter with Promise Ball gala, walks, and outreach programs.", city: "Dallas", state: "TX", region: "South", url: "https://www.jdrf.org/chapter/greater-dallas/", is_national: false },
  { name: "JDRF Southern California & Desert Chapter", organization_type: "jdrf_chapter", description: "Serving LA, Orange County, and Inland Empire with walks and community events.", city: "Los Angeles", state: "CA", region: "West", url: "https://www.jdrf.org/chapter/southern-california-desert/", is_national: false },
  { name: "JDRF Georgia Chapter", organization_type: "jdrf_chapter", description: "Atlanta-based chapter hosting walks, mentoring, and TypeOneNation summits.", city: "Atlanta", state: "GA", region: "South", url: "https://www.jdrf.org/chapter/georgia/", is_national: false },
  { name: "JDRF Western Pennsylvania Chapter", organization_type: "jdrf_chapter", description: "Pittsburgh-area chapter with community walks and advocacy programs.", city: "Pittsburgh", state: "PA", region: "Northeast", url: "https://www.jdrf.org/chapter/western-pennsylvania/", is_national: false },
  { name: "JDRF Michigan Great Lakes Chapter", organization_type: "jdrf_chapter", description: "Detroit and Michigan-wide events, walks, and research fundraising.", city: "Detroit", state: "MI", region: "Midwest", url: "https://www.jdrf.org/chapter/michigan-great-lakes/", is_national: false },
  { name: "JDRF Rocky Mountain Chapter", organization_type: "jdrf_chapter", description: "Denver and Colorado community with walks and outdoor T1D events.", city: "Denver", state: "CO", region: "West", url: "https://www.jdrf.org/chapter/rocky-mountain/", is_national: false },
  { name: "JDRF Florida Chapter", organization_type: "jdrf_chapter", description: "State-wide chapter with walks in Miami, Tampa, Orlando, and Jacksonville.", city: "Miami", state: "FL", region: "South", url: "https://www.jdrf.org/chapter/south-florida/", is_national: false },
  { name: "JDRF Greater Northwest Chapter", organization_type: "jdrf_chapter", description: "Seattle and Pacific Northwest community with walks and mentoring.", city: "Seattle", state: "WA", region: "West", url: "https://www.jdrf.org/chapter/greater-northwest/", is_national: false },
  { name: "JDRF Carolinas Chapter", organization_type: "jdrf_chapter", description: "North and South Carolina chapter with walks and family programs.", city: "Charlotte", state: "NC", region: "South", url: "https://www.jdrf.org/chapter/carolinas/", is_national: false },
  { name: "JDRF Mid-America Chapter", organization_type: "jdrf_chapter", description: "Kansas City area chapter with community events and fundraising walks.", city: "Kansas City", state: "MO", region: "Midwest", url: "https://www.jdrf.org/chapter/mid-america/", is_national: false },
  { name: "JDRF Desert Southwest Chapter", organization_type: "jdrf_chapter", description: "Phoenix and Arizona T1D community with walks and advocacy.", city: "Phoenix", state: "AZ", region: "West", url: "https://www.jdrf.org/chapter/desert-southwest/", is_national: false },

  // ADA Offices
  { name: "American Diabetes Association", organization_type: "ada_office", description: "National organization fighting for those affected by diabetes through research, advocacy, and programs.", city: null, state: null, region: null, url: "https://diabetes.org/", is_national: true },
  { name: "ADA Community Programs", organization_type: "ada_office", description: "Find local ADA support groups, camps, and community programs near you.", city: null, state: null, region: null, url: "https://diabetes.org/community", is_national: true },
  { name: "ADA Camp Directory", organization_type: "ada_office", description: "Find ADA-recognized diabetes camps for children and teens across the US.", city: null, state: null, region: null, url: "https://diabetes.org/community/diabetes-camps", is_national: true },
  { name: "ADA Step Out Walk", organization_type: "ada_office", description: "Annual walking events in cities nationwide to fight diabetes.", city: null, state: null, region: null, url: "https://diabetes.org/events/step-out-walk", is_national: true },

  // Campus Chapters
  { name: "College Diabetes Network", organization_type: "campus_chapter", description: "National network of college chapters providing peer support for students with T1D.", city: null, state: null, region: null, url: "https://collegediabetesnetwork.org/", is_national: true },
  { name: "CDN Chapter Finder", organization_type: "campus_chapter", description: "Find College Diabetes Network chapters at universities near you.", city: null, state: null, region: null, url: "https://collegediabetesnetwork.org/chapters", is_national: true },
  { name: "CDN - Boston University", organization_type: "campus_chapter", description: "BU chapter of the College Diabetes Network for T1D students.", city: "Boston", state: "MA", region: "Northeast", url: "https://collegediabetesnetwork.org/chapters", is_national: false },
  { name: "CDN - University of Michigan", organization_type: "campus_chapter", description: "UMich chapter for T1D students to connect and support each other.", city: "Ann Arbor", state: "MI", region: "Midwest", url: "https://collegediabetesnetwork.org/chapters", is_national: false },
  { name: "CDN - UCLA", organization_type: "campus_chapter", description: "UCLA College Diabetes Network chapter.", city: "Los Angeles", state: "CA", region: "West", url: "https://collegediabetesnetwork.org/chapters", is_national: false },

  // Camps
  { name: "Diabetes Camps - Find a Camp", organization_type: "camp", description: "Search the comprehensive directory of diabetes camps across the United States.", city: null, state: null, region: null, url: "https://www.diabetescamps.org/", is_national: true },
  { name: "Camp Sweeney", organization_type: "camp", description: "Texas residential camp for children with T1D, operating since 1950.", city: "Gainesville", state: "TX", region: "South", url: "https://www.campsweeney.org/", is_national: false },
  { name: "Camp Joslin", organization_type: "camp", description: "One of the oldest diabetes camps in the world, run by Joslin Diabetes Center.", city: "Charlton", state: "MA", region: "Northeast", url: "https://www.joslin.org/patient-care/camps-kids", is_national: false },
  { name: "Camp Needlepoint", organization_type: "camp", description: "Minnesota diabetes camp offering summer programs for T1D youth.", city: "Hudson", state: "WI", region: "Midwest", url: "https://www.campneedlepoint.org/", is_national: false },
  { name: "Bearskin Meadow Camp", organization_type: "camp", description: "California diabetes camp operated by Diabetic Youth Foundation.", city: "Kings Canyon", state: "CA", region: "West", url: "https://www.dyf.org/", is_national: false },
  { name: "Camp Conrad Chinnock", organization_type: "camp", description: "Southern California diabetes camp for kids ages 7-17.", city: "Angelus Oaks", state: "CA", region: "West", url: "https://www.diabetescamping.org/", is_national: false },

  // Online Communities
  { name: "Beyond Type 1", organization_type: "online_community", description: "Global community and advocacy organization for Type 1 diabetes with online resources and events.", city: null, state: null, region: null, url: "https://beyondtype1.org/", is_national: true },
  { name: "TypeOneNation", organization_type: "online_community", description: "JDRF's community platform for T1D education, connection, and resources.", city: null, state: null, region: null, url: "https://www.jdrf.org/t1d-resources/typeonenation/", is_national: true },
  { name: "TuDiabetes", organization_type: "online_community", description: "Online community powered by Beyond Type 1 for people affected by diabetes.", city: null, state: null, region: null, url: "https://forum.tudiabetes.org/", is_national: true },
  { name: "r/diabetes_t1d (Reddit)", organization_type: "online_community", description: "Reddit's main Type 1 diabetes community with 50,000+ members sharing experiences.", city: null, state: null, region: null, url: "https://www.reddit.com/r/diabetes_t1d/", is_national: true },
  { name: "r/diabetes (Reddit)", organization_type: "online_community", description: "Reddit's general diabetes community covering all types.", city: null, state: null, region: null, url: "https://www.reddit.com/r/diabetes/", is_national: true },
  { name: "Diabetes Daily Forum", organization_type: "online_community", description: "Active forum for diabetes discussion, tips, and peer support.", city: null, state: null, region: null, url: "https://www.diabetesdaily.com/forum/", is_national: true },
  { name: "T1D Exchange", organization_type: "online_community", description: "Nonprofit connecting patients, caregivers, and researchers to improve T1D outcomes.", city: null, state: null, region: null, url: "https://t1dexchange.org/", is_national: true },
  { name: "DiabetesSisters", organization_type: "support_group", description: "Community for women with all types of diabetes, offering meetups and conferences.", city: null, state: null, region: null, url: "https://diabetessisters.org/", is_national: true },
  { name: "Children with Diabetes", organization_type: "support_group", description: "Online community for families of children with T1D, hosts Friends for Life conferences.", city: null, state: null, region: null, url: "https://childrenwithdiabetes.com/", is_national: true },
  { name: "Friends for Life Conference", organization_type: "support_group", description: "Annual T1D family conference in Orlando with education, meetups, and networking.", city: "Orlando", state: "FL", region: "South", url: "https://childrenwithdiabetes.com/friends-for-life/", is_national: false },
];

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Check if already seeded
    const { count } = await supabase
      .from('t1d_community_directory')
      .select('*', { count: 'exact', head: true });

    if (count && count > 0) {
      return new Response(
        JSON.stringify({ message: `Directory already has ${count} entries. Skipping seed.` }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { data, error } = await supabase
      .from('t1d_community_directory')
      .insert(DIRECTORY_ENTRIES)
      .select();

    if (error) throw error;

    return new Response(
      JSON.stringify({ message: `Seeded ${data.length} community directory entries.` }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
