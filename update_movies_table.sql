-- Step 1: SQL Commands for Supabase

-- Add is_official column
ALTER TABLE movies 
ADD COLUMN is_official BOOLEAN DEFAULT false;

-- Add creator_url column
ALTER TABLE movies 
ADD COLUMN creator_url TEXT;

-- Recommended: Comment describing the columns
COMMENT ON COLUMN movies.is_official IS 'Whether the movie has official authorization from creators';
COMMENT ON COLUMN movies.creator_url IS 'Official source link for the movie (like movingart.com)';
