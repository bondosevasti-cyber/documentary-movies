-- Run in Supabase SQL Editor. Existing movies permissions/RLS remain in force.
alter table public.movies
  add column if not exists content_type text not null default 'movie',
  add column if not exists seasons jsonb not null default '[]'::jsonb;

comment on column public.movies.seasons is 'Array of seasons: {number, title, episodes: [{number, title, video_url, description}]}';
