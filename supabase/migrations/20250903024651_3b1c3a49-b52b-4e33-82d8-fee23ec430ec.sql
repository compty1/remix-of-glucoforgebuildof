-- Fix function search path security issue
create or replace function public.discovery_cards_search_vector_trigger()
  returns trigger 
  language plpgsql
  security definer set search_path = public
as $$
begin
  new.search_vector := to_tsvector('english', coalesce(new.title,'') || ' ' || coalesce(new.snippet,''));
  return new;
end;
$$;