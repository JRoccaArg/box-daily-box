import {copyFileSync} from 'node:fs';
// Vercel serves this file with HTTP 404 for paths without a static page/rewrite.
// The client router keeps the requested URL and renders its localized fallback.
copyFileSync('dist/es/no-encontrado/index.html', 'dist/404.html');
