import { readdir, readFile, stat } from 'node:fs/promises';
import { extname, join } from 'node:path';

const root = new URL('../dist/', import.meta.url);
const allowed = new Set(['.html', '.js', '.css', '.png', '.ico', '.svg']);
async function check(directory) {
  for (const name of await readdir(directory)) {
    if (name.startsWith('.')) throw new Error(`Hidden public file: ${name}`);
    const path = new URL(name, directory);
    if ((await stat(path)).isDirectory()) await check(new URL(name + '/', directory));
    else if (!allowed.has(extname(name))) throw new Error(`Unexpected public file: ${path}`);
  }
}
await check(root);
for (const slug of ['', 'missing-abbreviations', 'unicode-plus-one']) {
  const html = await readFile(new URL(join(slug, 'index.html'), root), 'utf8');
  if (html.includes('PQR_METADATA') || !html.includes('<title>') || !html.includes('property="og:url"')) throw new Error(`Missing static metadata: ${slug}`);
  const expected = `https://pqr.pkupuzzle.art/${slug ? slug + '/' : ''}`;
  if (!html.includes(`rel="canonical" href="${expected}"`)) throw new Error(`Incorrect canonical: ${slug}`);
  for (const match of html.matchAll(/(?:src|href)="([^"#]+)"/g)) {
    const url = new URL(match[1], `https://pqr.pkupuzzle.art/${slug ? slug + '/' : ''}`);
    if (url.origin !== 'https://pqr.pkupuzzle.art') continue;
    const path = new URL(url.pathname.slice(1), root);
    await stat(path);
  }
}
console.log('Static output, entry metadata and referenced files verified. No upload performed.');
