// Supabase Configuration
const SUPABASE_URL = 'https://azrthnztbdenebqygcmp.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF6cnRobnp0YmRlbmVicXlnY21wIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUxNDYyNjksImV4cCI6MjA5MDcyMjI2OX0.OlY83Zi-9k3rFnlPQyzMiB27nnmgAgETK1jy3tDo0mA';

// Initialize Client
const _supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

/**
 * Upload a file to 'movie-images' bucket
 */
async function uploadFile(file) {
    try {
        if (!file) throw new Error("ფაილი არ არის შერჩეული.");
        const fileName = `${Date.now()}_${file.name}`;
        
        const { data, error } = await _supabase.storage
            .from('movie-images')
            .upload(fileName, file);

        if (error) throw new Error(`ატვირთვის შეცდომა: ${error.message}`);

        const { data: publicData } = _supabase.storage
            .from('movie-images')
            .getPublicUrl(fileName);

        return publicData.publicUrl;
    } catch (err) {
        console.error("Storage Error:", err.message);
        return null;
    }
}

/**
 * Fetch all movies from database
 */
async function fetchMovies() {
    try {
        const { data, error } = await _supabase
            .from('movies')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw new Error(`მონაცემთა წამოღების შეცდომა: ${error.message}`);
        return data;
    } catch (err) {
        console.error("Database Error:", err.message);
        return [];
    }
}
