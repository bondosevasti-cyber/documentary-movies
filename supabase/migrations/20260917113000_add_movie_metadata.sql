alter table public.movies
  add column if not exists tmdb_id integer,
  add column if not exists imdb_id text,
  add column if not exists original_title text,
  add column if not exists original_language text,
  add column if not exists tagline text,
  add column if not exists content_rating text,
  add column if not exists vote_count integer,
  add column if not exists production_companies text,
  add column if not exists production_countries text,
  add column if not exists spoken_languages text,
  add column if not exists budget bigint,
  add column if not exists revenue bigint,
  add column if not exists tmdb_url text,
  add column if not exists imdb_url text;

create unique index if not exists movies_tmdb_id_key on public.movies (tmdb_id) where tmdb_id is not null;
