import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { dirname, resolve } from 'node:path';
import { execFileSync } from 'node:child_process';
import catalog from './src/sites/catalog.json' with { type: 'json' };

const escape = (value: string) => value.replace(/[&<>"']/g, char => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
})[char]!);

export default defineConfig({
  plugins: [react(), {
    name: 'pqr-pages',
    configureServer(server) {
      // Public URLs stay independent of the source directory layout.
      server.middlewares.use((request, response, next) => {
        const url = new URL(request.url ?? '/', 'http://localhost');
        const site = catalog.find(site => [
          `/${site.id}`, `/${site.id}/`, `/${site.id}/index.html`,
        ].includes(url.pathname));
        if (['/', '/index.html'].includes(url.pathname)) {
          request.url = `/src/home/index.html${url.search}`;
          return next();
        }
        if (!site) return next();
        if (url.pathname === `/${site.id}`) {
          response.writeHead(308, { Location: `/${site.id}/${url.search}` });
          response.end();
          return;
        }
        request.url = `/src/sites/${site.id}/index.html${url.search}`;
        next();
      });
      const sourceFiles = catalog.map(site => resolve(import.meta.dirname, 'src', 'sites', site.id, 'puzzles.json'));
      const transformerDirectory = resolve(import.meta.dirname, 'scripts', 'transformer');
      server.watcher.add([...sourceFiles, transformerDirectory]);
      const refreshData = (file: string) => {
        const isTransformer = dirname(file) === transformerDirectory && file.endsWith('.mjs');
        if (!sourceFiles.includes(file) && !isTransformer) return;
        try {
          execFileSync(process.execPath, ['scripts/prepare.mjs'], { cwd: import.meta.dirname, stdio: 'pipe' });
          server.ws.send({ type: 'full-reload' });
        } catch (error) {
          server.config.logger.error(String(error));
        }
      };
      for (const event of ['add', 'change', 'unlink'] as const) server.watcher.on(event, refreshData);
    },
    generateBundle: {
      order: 'post',
      handler(_options, bundle) {
        const entries = [
          { source: 'src/home/index.html', destination: 'index.html' },
          ...catalog.map(site => ({ source: `src/sites/${site.id}/index.html`, destination: `${site.id}/index.html` })),
        ];
        for (const { source, destination } of entries) {
          const page = bundle[source];
          if (!page || page.type !== 'asset') this.error(`Missing HTML entry: ${source}`);
          if (bundle[destination]) this.error(`Duplicate HTML output: ${destination}`);
          delete bundle[source];
          this.emitFile({ type: 'asset', fileName: destination, source: page.source });
        }
      },
    },
    transformIndexHtml: {
      order: 'pre',
      handler(html, ctx) {
        const site = catalog.find(site => ctx.filename === resolve(import.meta.dirname, 'src', 'sites', site.id, 'index.html'));
        const title = site ? `${site.title}｜P&KU 群聊集萃 · 第 ${site.edition} 期` : 'PQR｜P&KU Quiz Research';
        const description = site?.description ?? '欢迎来到 PQR！P&KU 群每周五晚 22:00 的 Quiz/微型谜题企划。浏览各期线上存档，随时开始解谜。';
        const url = `https://pqr.pkupuzzle.art/${site ? `${site.id}/` : ''}`;
        const assetPath = `/${site?.id ?? 'missing-abbreviations'}/`;
        const image = `https://pqr.pkupuzzle.art${assetPath}og-image.png`;
        const metadata = `
  <title>${escape(title)}</title>
  <meta name="description" content="${escape(description)}">
  <meta name="theme-color" content="${site?.themeColor ?? '#263cff'}">
  <link rel="canonical" href="${url}">
  <link rel="icon" href="${assetPath}favicon.ico" sizes="16x16 32x32 48x48 64x64">
  <link rel="icon" type="image/png" href="${assetPath}favicon.png" sizes="32x32">
  <link rel="apple-touch-icon" href="${assetPath}apple-touch-icon.png">
  ${site?.id === 'unicode-plus-one' ? `<link rel="icon" type="image/svg+xml" href="${assetPath}favicon.svg">` : ''}
  <meta property="og:type" content="website">
  <meta property="og:locale" content="zh_CN">
  <meta property="og:site_name" content="PQR · P&KU 群聊集萃">
  <meta property="og:title" content="${escape(title)}">
  <meta property="og:description" content="${escape(description)}">
  <meta property="og:url" content="${url}">
  <meta property="og:image" content="${image}">
  <meta property="og:image:type" content="image/png">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:image:alt" content="${escape(site ? `${site.title} · 第 ${site.edition} 期 · ${site.count} 道谜题` : 'PQR 线上存档：缩略文字谜题分享卡')}">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${escape(title)}">
  <meta name="twitter:description" content="${escape(description)}">
  <meta name="twitter:image" content="${image}">
  <meta name="twitter:image:alt" content="${escape(site ? `${site.title} 分享卡` : 'PQR 线上存档：缩略文字谜题分享卡')}">`;
        return html.replace('<!-- PQR_METADATA -->', metadata);
      },
    },
  }],
  appType: 'mpa',
  build: {
    target: ['chrome90', 'safari15', 'firefox90'],
    sourcemap: false,
    rolldownOptions: {
      input: {
        home: resolve(import.meta.dirname, 'src', 'home', 'index.html'),
        ...Object.fromEntries(catalog.map(site => [site.id, resolve(import.meta.dirname, 'src', 'sites', site.id, 'index.html')])),
      },
    },
  },
});
