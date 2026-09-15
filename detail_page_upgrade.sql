-- Studio Prisma detail pages — safe to run more than once in Supabase SQL Editor.

ALTER TABLE public.movies
  ADD COLUMN IF NOT EXISTS title_image_url TEXT,
  ADD COLUMN IF NOT EXISTS hide_hero_title BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS trailer_url TEXT,
  ADD COLUMN IF NOT EXISTS studio_name TEXT,
  ADD COLUMN IF NOT EXISTS studio_website_url TEXT,
  ADD COLUMN IF NOT EXISTS studio_logo_url TEXT,
  ADD COLUMN IF NOT EXISTS cast_members TEXT,
  ADD COLUMN IF NOT EXISTS director_name TEXT,
  ADD COLUMN IF NOT EXISTS writer_names TEXT,
  ADD COLUMN IF NOT EXISTS producer_names TEXT;

ALTER TABLE public.short_videos
  ADD COLUMN IF NOT EXISTS title_image_url TEXT,
  ADD COLUMN IF NOT EXISTS hide_hero_title BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS description TEXT,
  ADD COLUMN IF NOT EXISTS release_year TEXT,
  ADD COLUMN IF NOT EXISTS duration TEXT,
  ADD COLUMN IF NOT EXISTS rating NUMERIC,
  ADD COLUMN IF NOT EXISTS genre TEXT,
  ADD COLUMN IF NOT EXISTS cover_url TEXT,
  ADD COLUMN IF NOT EXISTS is_official BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS trailer_url TEXT,
  ADD COLUMN IF NOT EXISTS studio_name TEXT,
  ADD COLUMN IF NOT EXISTS studio_website_url TEXT,
  ADD COLUMN IF NOT EXISTS studio_logo_url TEXT,
  ADD COLUMN IF NOT EXISTS cast_members TEXT,
  ADD COLUMN IF NOT EXISTS director_name TEXT,
  ADD COLUMN IF NOT EXISTS writer_names TEXT,
  ADD COLUMN IF NOT EXISTS producer_names TEXT;

-- Preserve existing official movie links as the new website field.
UPDATE public.movies
SET studio_website_url = creator_url
WHERE studio_website_url IS NULL AND creator_url IS NOT NULL;

COMMENT ON COLUMN public.movies.trailer_url IS 'Official trailer page or playable video URL';
COMMENT ON COLUMN public.movies.studio_website_url IS 'Official studio or production website';
COMMENT ON COLUMN public.short_videos.trailer_url IS 'Official trailer page or playable video URL';
COMMENT ON COLUMN public.short_videos.studio_website_url IS 'Official studio or creator website';
