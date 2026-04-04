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
 * Format view count to K/M
 */
function formatViews(count) {
    if (!count) return '0 ნახვა';
    const num = parseInt(count);
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M ნახვა';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K ნახვა';
    return num + ' ნახვა';
}

/**
 * Format date to relative string
 */
function formatRelativeDate(dateString) {
    if (!dateString) return 'ახალი';
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);
    
    if (diffInSeconds < 60) return 'ახლახანს';
    if (diffInSeconds < 3600) return Math.floor(diffInSeconds / 60) + ' წუთის წინ';
    if (diffInSeconds < 86400) return Math.floor(diffInSeconds / 3600) + ' საათის წინ';
    if (diffInSeconds < 2592000) return Math.floor(diffInSeconds / 86400) + ' დღის წინ';
    if (diffInSeconds < 31536000) return Math.floor(diffInSeconds / 2592000) + ' თვის წინ';
    return Math.floor(diffInSeconds / 31536000) + ' წლის წინ';
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

/**
 * Increment view count for short videos using RPC
 */
async function incrementShortViews(id) {
    try {
        const { error } = await _supabase.rpc('increment_short_views', { video_id: id });
        if (error) throw error;
    } catch (err) {
        console.error('RPC Short View Increment Error:', err.message);
    }
}
