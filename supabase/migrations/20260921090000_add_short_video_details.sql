-- Safe to run repeatedly in Supabase SQL Editor.
alter table public.short_videos
  add column if not exists description text,
  add column if not exists original_link text,
  add column if not exists release_year text,
  add column if not exists duration text,
  add column if not exists rating numeric,
  add column if not exists genre text,
  add column if not exists cover_url text,
  add column if not exists trailer_url text,
  add column if not exists studio_name text,
  add column if not exists studio_website_url text,
  add column if not exists studio_logo_url text,
  add column if not exists cast_members text,
  add column if not exists director_name text,
  add column if not exists writer_names text,
  add column if not exists producer_names text,
  add column if not exists is_official boolean not null default false;
