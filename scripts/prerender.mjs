import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';
import React from 'react';
import { renderToString } from 'react-dom/server';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');
const distDir = path.join(rootDir, 'dist');
const ssrDir = path.join(rootDir, 'dist-ssr');

async function prerender() {
  const ssrEntryUrl = pathToFileURL(path.join(ssrDir, 'App.js')).href;
  const { default: App } = await import(ssrEntryUrl);

  const appHtml = renderToString(
    React.createElement(React.StrictMode, null, React.createElement(App))
  );

  const htmlPath = path.join(distDir, 'index.html');
  let html = await fs.readFile(htmlPath, 'utf8');

  // Tanamkan CSS hasil kompilasi langsung ke dalam <head> agar tampilan awal langsung ter-render
  const cssMatch = html.match(/<link rel="stylesheet"[^>]*href="\/assets\/(index-[^"]+\.css)"[^>]*>/);
  if (cssMatch) {
    const cssFile = path.join(distDir, 'assets', cssMatch[1]);
    const cssContent = await fs.readFile(cssFile, 'utf8');
    html = html.replace(cssMatch[0], `<style>${cssContent}</style>`);
  }

  // Jalankan skrip hidrasi React tepat setelah bingkai visual pertama (First Paint)
  const scriptMatch = html.match(/<script type="module"[^>]*src="(\/assets\/index-[^"]+\.js)"[^>]*><\/script>/);
  html = html.replace(/<link rel="modulepreload"[^>]*>/g, '');
  if (scriptMatch) {
    const entrySrc = scriptMatch[1];
    html = html.replace(scriptMatch[0], '');
    const postPaintHydrate = `<script>requestAnimationFrame(function(){setTimeout(function(){var s=document.createElement('script');s.type='module';s.src='${entrySrc}';document.body.appendChild(s)},0)});</script>`;
    html = html.replace('</body>', `${postPaintHydrate}</body>`);
  }

  // Masukkan hasil pra-render HTML ke dalam #root
  html = html.replace('<div id="root"></div>', `<div id="root">${appHtml}</div>`);

  await fs.writeFile(htmlPath, html, 'utf8');
  await fs.rm(ssrDir, { recursive: true, force: true });

  const stat = await fs.stat(htmlPath);
  console.log(`✓ Pra-render halaman statis selesai: dist/index.html (${(stat.size / 1024).toFixed(1)} KB)`);
}

await prerender();
