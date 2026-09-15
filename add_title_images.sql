-- Optional transparent title/logo artwork for the cinematic hero.
ALTER TABLE movies ADD COLUMN IF NOT EXISTS title_image_url TEXT;
ALTER TABLE short_videos ADD COLUMN IF NOT EXISTS title_image_url TEXT;
ALTER TABLE movies ADD COLUMN IF NOT EXISTS hide_hero_title BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE short_videos ADD COLUMN IF NOT EXISTS hide_hero_title BOOLEAN NOT NULL DEFAULT FALSE;
