const fs = require('fs');

const SUPABASE_URL = 'https://azrthnztbdenebqygcmp.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF6cnRobnp0YmRlbmVicXlnY21wIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUxNDYyNjksImV4cCI6MjA5MDcyMjI2OX0.OlY83Zi-9k3rFnlPQyzMiB27nnmgAgETK1jy3tDo0mA';
const SITE_URL = 'https://documentary-movies.vercel.app'; 

async function generateSitemap() {
    console.log('🚀 Generating advanced SEO sitemap...');

    const staticPages = [
        '',
        '/about',
        '/privacy',
        '/terms'
    ];

    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
    xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" \n`;
    xml += `        xmlns:video="http://www.google.com/schemas/sitemap-video/1.1">\n`;

    // 1. Static Pages
    staticPages.forEach(page => {
        xml += `  <url>\n    <loc>${SITE_URL}${page}</loc>\n    <changefreq>weekly</changefreq>\n    <priority>0.8</priority>\n  </url>\n`;
    });

    try {
        // 2. Fetch Movies with Meta for Google Video Search
        const moviesResponse = await fetch(`${SUPABASE_URL}/rest/v1/movies?select=id,title,description,cover_url,created_at`, {
            headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}` }
        });
        const movies = await moviesResponse.json();

        movies.forEach(movie => {
            const lastMod = movie.created_at ? movie.created_at.split('T')[0] : new Date().toISOString().split('T')[0];
            xml += `  <url>\n`;
            // Using the format requested by user: watch_movie?id=[UUID]
            xml += `    <loc>${SITE_URL}/watch_movie?id=${movie.id}</loc>\n`;
            xml += `    <lastmod>${lastMod}</lastmod>\n`;
            xml += `    <changefreq>monthly</changefreq>\n`;
            xml += `    <priority>1.0</priority>\n`;
            
            // Google Video SEO Extension
            xml += `    <video:video>\n`;
            xml += `      <video:thumbnail_loc>${movie.cover_url || ''}</video:thumbnail_loc>\n`;
            xml += `      <video:title>${movie.title || ''}</video:title>\n`;
            xml += `      <video:description>${movie.description ? movie.description.substring(0, 160) : ''}</video:description>\n`;
            xml += `      <video:publication_date>${movie.created_at || ''}</video:publication_date>\n`;
            xml += `      <video:family_friendly>yes</video:family_friendly>\n`;
            xml += `    </video:video>\n`;
            xml += `  </url>\n`;
        });

        // 3. Fetch Clips/Videos
        const videosResponse = await fetch(`${SUPABASE_URL}/rest/v1/videos?select=id,title,description,thumbnail_url,created_at`, {
            headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}` }
        });
        const videos = await videosResponse.json();

        if (Array.isArray(videos)) {
            videos.forEach(video => {
                const lastMod = video.created_at ? video.created_at.split('T')[0] : new Date().toISOString().split('T')[0];
                xml += `  <url>\n`;
                xml += `    <loc>${SITE_URL}/watch_video?id=${video.id}</loc>\n`;
                xml += `    <lastmod>${lastMod}</lastmod>\n`;
                xml += `    <changefreq>monthly</changefreq>\n`;
                xml += `    <priority>0.6</priority>\n`;
                
                // Google Video SEO Extension
                xml += `    <video:video>\n`;
                xml += `      <video:thumbnail_loc>${video.thumbnail_url || ''}</video:thumbnail_loc>\n`;
                xml += `      <video:title>${video.title || ''}</video:title>\n`;
                xml += `      <video:description>${video.description ? video.description.substring(0, 160) : ''}</video:description>\n`;
                xml += `      <video:publication_date>${video.created_at || ''}</video:publication_date>\n`;
                xml += `    </video:video>\n`;
                xml += `  </url>\n`;
            });
        } else {
            console.warn('⚠️ No videos found or improper response format for videos.');
        }

        xml += `</urlset>`;

        fs.writeFileSync('sitemap.xml', xml);
        console.log('✅ Sitemap updated successfully with Video SEO: sitemap.xml');
    } catch (error) {
        console.error('❌ Error generating sitemap:', error);
    }
}

generateSitemap();
