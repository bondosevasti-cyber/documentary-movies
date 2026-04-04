const fs = require('fs');

const SUPABASE_URL = 'https://azrthnztbdenebqygcmp.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF6cnRobnp0YmRlbmVicXlnY21wIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUxNDYyNjksImV4cCI6MjA5MDcyMjI2OX0.OlY83Zi-9k3rFnlPQyzMiB27nnmgAgETK1jy3tDo0mA';
const SITE_URL = 'https://documentary-movies.vercel.app'; // შეცვალეთ თქვენი საიტის მისამართით

async function generateSitemap() {
    console.log('Generating sitemap...');

    const staticPages = [
        '',
        '/about.html',
        '/privacy.html',
        '/terms.html'
    ];

    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
    xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

    // Static Pages
    staticPages.forEach(page => {
        xml += `  <url>\n    <loc>${SITE_URL}${page}</loc>\n    <changefreq>weekly</changefreq>\n    <priority>0.8</priority>\n  </url>\n`;
    });

    try {
        // Fetch Movies
        const moviesResponse = await fetch(`${SUPABASE_URL}/rest/v1/movies?select=id,created_at`, {
            headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}` }
        });
        const movies = await moviesResponse.json();

        movies.forEach(movie => {
            xml += `  <url>\n    <loc>${SITE_URL}/watch_movie.html?id=${movie.id}</loc>\n    <lastmod>${movie.created_at.split('T')[0]}</lastmod>\n    <changefreq>monthly</changefreq>\n    <priority>1.0</priority>\n  </url>\n`;
        });

        // Fetch Videos
        const videosResponse = await fetch(`${SUPABASE_URL}/rest/v1/videos?select=id,created_at`, {
            headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}` }
        });
        const videos = await videosResponse.json();

        videos.forEach(video => {
            xml += `  <url>\n    <loc>${SITE_URL}/watch_video.html?id=${video.id}</loc>\n    <lastmod>${video.created_at.split('T')[0]}</lastmod>\n    <changefreq>monthly</changefreq>\n    <priority>0.6</priority>\n  </url>\n`;
        });

        xml += `</urlset>`;

        fs.writeFileSync('sitemap.xml', xml);
        console.log('Sitemap generated successfully: sitemap.xml');
    } catch (error) {
        console.error('Error generating sitemap:', error);
    }
}

generateSitemap();
