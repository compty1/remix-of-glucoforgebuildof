-- Create discovery_cards table with full-text search
create table if not exists public.discovery_cards (
  id             uuid        primary key default gen_random_uuid(),
  title          text        not null,
  snippet        text        not null,
  icon_url       text        not null,
  credibility    text        not null check (credibility in ('High','Medium','Low')),
  mechanism      text        not null,
  sources        jsonb       not null,
  created_at     timestamptz not null default now(),
  search_vector  tsvector
);

-- Create user profiles table
create table if not exists public.profiles (
  id            uuid        primary key default gen_random_uuid(),
  user_id       uuid        not null unique references auth.users(id),
  display_name  text,
  bio           text,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- Create saved_insights table for user bookmarks
create table if not exists public.saved_insights (
  user_id uuid references auth.users(id),
  card_id uuid references public.discovery_cards(id),
  saved_at timestamptz default now(),
  primary key (user_id, card_id)
);

-- Create uploads table for user data
create table if not exists public.uploads (
  id            uuid        primary key default gen_random_uuid(),
  user_id       uuid        references auth.users(id),
  filename      text,
  status        text        not null default 'Pending' check (status in ('Pending','Valid','Invalid')),
  errors_json   jsonb,
  uploaded_at   timestamptz default now()
);

-- Function to update search vectors
create or replace function public.discovery_cards_search_vector_trigger()
  returns trigger as $$
begin
  new.search_vector := to_tsvector('english', coalesce(new.title,'') || ' ' || coalesce(new.snippet,''));
  return new;
end;
$$ language plpgsql;

-- Trigger for search vector updates
create trigger trg_discovery_cards_vector_update
  before insert or update on public.discovery_cards
  for each row execute procedure public.discovery_cards_search_vector_trigger();

-- Index for full-text search
create index if not exists idx_disc_cards_search on public.discovery_cards using gin(search_vector);

-- Enable Row Level Security
alter table public.discovery_cards enable row level security;
alter table public.profiles enable row level security;
alter table public.saved_insights enable row level security;
alter table public.uploads enable row level security;

-- RLS Policies
create policy "Discovery cards are viewable by everyone" 
on public.discovery_cards for select using (true);

create policy "Users can view their own profile" 
on public.profiles for select using (auth.uid() = user_id);

create policy "Users can update their own profile" 
on public.profiles for update using (auth.uid() = user_id);

create policy "Users can insert their own profile" 
on public.profiles for insert with check (auth.uid() = user_id);

create policy "Users can view their saved insights" 
on public.saved_insights for select using (auth.uid() = user_id);

create policy "Users can manage their saved insights" 
on public.saved_insights for all using (auth.uid() = user_id);

create policy "Users can view their uploads" 
on public.uploads for select using (auth.uid() = user_id);

create policy "Users can create uploads" 
on public.uploads for insert with check (auth.uid() = user_id);

-- Insert sample discovery cards
insert into public.discovery_cards (title, snippet, icon_url, credibility, mechanism, sources) values
('Dawn Phenomenon Management', 'Morning glucose spikes can be reduced by adjusting basal insulin rates 2-3 hours before dawn. Studies show 40-60% improvement in morning BG levels.', 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=100&h=100&fit=crop', 'High', 'Circadian rhythm optimization through timed insulin delivery', '[{"title": "Journal of Diabetes Science", "url": "https://example.com/study1"}]'),
('Exercise Timing Strategy', 'Post-meal walking for 10-15 minutes can reduce glucose spikes by 30%. Most effective when started within 30 minutes of eating.', 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=100&h=100&fit=crop', 'High', 'Enhanced glucose uptake through muscle contraction', '[{"title": "Diabetes Care Journal", "url": "https://example.com/study2"}]'),
('Low-Carb Breakfast Impact', 'Protein-rich breakfasts show 25% better glucose stability throughout the day compared to carb-heavy meals.', 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=100&h=100&fit=crop', 'Medium', 'Reduced glucose excursion via macronutrient timing', '[{"title": "Nutrition Research", "url": "https://example.com/study3"}]'),
('CGM Calibration Timing', 'Calibrating CGM during flat glucose periods improves accuracy by up to 15%. Avoid calibration during rapid changes.', 'https://images.unsplash.com/photo-1559757175-0eb30cd8c063?w=100&h=100&fit=crop', 'High', 'Sensor accuracy optimization through timing strategy', '[{"title": "Diabetes Technology", "url": "https://example.com/study4"}]');