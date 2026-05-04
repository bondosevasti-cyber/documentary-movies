-- Create article_categories table
CREATE TABLE IF NOT EXISTS article_categories (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Enable RLS
ALTER TABLE article_categories ENABLE ROW LEVEL SECURITY;

-- Public read access
CREATE POLICY "Allow public read access on categories" ON article_categories
    FOR SELECT USING (true);

-- Authenticated manage access
CREATE POLICY "Allow authenticated users to manage categories" ON article_categories
    FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Insert existing categories from articles table
INSERT INTO article_categories (name)
SELECT DISTINCT category FROM articles
WHERE category IS NOT NULL
ON CONFLICT (name) DO NOTHING;

-- Insert default categories if not exists
INSERT INTO article_categories (name)
VALUES 
    ('დოკუმენტური'),
    ('ისტორია'),
    ('ტექნოლოგია'),
    ('აგრო'),
    ('სიახლე')
ON CONFLICT (name) DO NOTHING;
