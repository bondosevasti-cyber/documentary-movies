-- Create Articles Table
CREATE TABLE IF NOT EXISTS articles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    thumbnail_url TEXT,
    excerpt TEXT,
    content TEXT NOT NULL, -- Supports Markdown or HTML
    category TEXT DEFAULT 'Articles' CHECK (category IN ('Articles', 'Films', 'Videos')),
    is_published BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Enable Row Level Security (RLS)
ALTER TABLE articles ENABLE ROW LEVEL SECURITY;

-- Allow public read access
CREATE POLICY "Allow public read access" ON articles
    FOR SELECT USING (true);

-- Allow authenticated users to perform all actions (Manage Articles)
-- Note: You should ensure your existing Supabase auth is set up.
CREATE POLICY "Allow authenticated users to manage articles" ON articles
    FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Create a function to update the updated_at column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create a trigger to call the function
CREATE TRIGGER update_articles_updated_at
    BEFORE UPDATE ON articles
    FOR EACH ROW
    EXECUTE PROCEDURE update_updated_at_column();
