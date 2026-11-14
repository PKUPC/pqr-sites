import { mkdir, readFile, readdir, writeFile } from 'node:fs/promises';
import { validatePuzzles } from './validate.mjs';

const root = new URL('../', import.meta.url);
const catalog = JSON.parse(await readFile(new URL('src/sites/catalog.json', root), 'utf8'));
const transformerDirectory = new URL('./transformer/', import.meta.url);
const transformerFiles = new Set(await readdir(transformerDirectory));
await mkdir(new URL('src/generated/', root), { recursive: true });
for (const site of catalog) {
  const puzzles = JSON.parse(await readFile(new URL(`src/sites/${site.id}/puzzles.json`, root), 'utf8'));
  validatePuzzles(puzzles);
  if (puzzles.length !== site.count) throw new Error(`${site.id}: catalog count differs from question count`);
  let prepared = puzzles;
  const transformerFile = `${site.id}.mjs`;
  if (transformerFiles.has(transformerFile)) {
    const { transform } = await import(new URL(transformerFile, transformerDirectory));
    if (typeof transform !== 'function') throw new Error(`${transformerFile}: expected an exported transform function`);
    prepared = await transform(puzzles);
  }
  await writeFile(new URL(`src/generated/${site.id}.json`, root), JSON.stringify(prepared, null, 2) + '\n');
  console.log(`${site.id}: validated and prepared ${puzzles.length} puzzles`);
}
