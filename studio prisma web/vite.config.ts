import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {readFileSync, readdirSync} from 'node:fs';
import {defineConfig, type Plugin} from 'vite';

// Keep the existing players, article reader and local images available in dev and builds.
function legacyAssets(): Plugin {
  const root = path.resolve(__dirname, '..');
  const files = ['watch_movie.html', 'watch_video.html', 'watch_article.html', 'admin.html', 'admin_articles.html', 'style.css', 'detail-page.css', 'detail-page.js', 'supabase-config.js', 'about.html', 'privacy.html', 'terms.html'];
  function images(directory = 'images'): string[] {
    return readdirSync(path.join(root, directory), {withFileTypes: true}).flatMap(entry =>
      entry.isDirectory() ? images(`${directory}/${entry.name}`) : [`${directory}/${entry.name}`]);
  }
  const allowed = new Set([...files, ...images()]);
  const read = (file: string) => {
    const data = readFileSync(path.join(root, file));
    return file.endsWith('.html') ? Buffer.from(data.toString().replaceAll('href="articles.html"', 'href="/?section=Articles"').replaceAll('href="index.html#videos"', 'href="/?section=Videos"').replaceAll('href="index.html?type=videos"', 'href="/?section=Videos"')) : data;
  };
  return {
    name: 'senaki-legacy-assets',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        let file: string;
        try { file = decodeURIComponent((req.url || '').split('?')[0]).replace(/^\//, ''); } catch { return next(); }
        if (!allowed.has(file)) return next();
        const types: Record<string, string> = {'.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.png': 'image/png', '.webp': 'image/webp', '.jpeg': 'image/jpeg'};
        res.setHeader('Content-Type', types[path.extname(file)] || 'application/octet-stream');
        res.end(read(file));
      });
    },
    generateBundle() { for (const fileName of allowed) this.emitFile({type: 'asset', fileName, source: read(fileName)}); },
  };
}

export default defineConfig(() => {
  return {
    plugins: [legacyAssets(), react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
