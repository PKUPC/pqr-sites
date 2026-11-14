import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { validatePuzzles } from './validate.mjs';

const root = new URL('../', import.meta.url);
const catalog = JSON.parse(await readFile(new URL('catalog.json', root), 'utf8'));
const segmenter = new Intl.Segmenter('zh-CN', { granularity: 'grapheme' });
await mkdir(new URL('src/generated/', root), { recursive: true });
for (const site of catalog) {
  const puzzles = JSON.parse(await readFile(new URL(`sites/${site.id}/puzzles.json`, root), 'utf8'));
  validatePuzzles(puzzles);
  if (puzzles.length !== site.count) throw new Error(`${site.id}: catalog count differs from question count`);
  const prepared = puzzles.map(puzzle => {
    if (site.id !== 'unicode-plus-one') return puzzle;
    // Preserve the source's encoded grapheme slots when deriving the original text.
    const glyphs = Array.from(segmenter.segment(puzzle.question), part => part.segment);
    const originalGlyphs = glyphs.map(glyph => Array.from(glyph, char => {
      const code = char.codePointAt(0);
      if (!code) throw new Error(`Invalid encoded character in puzzle ${puzzle.id}`);
      return String.fromCodePoint(code - 1);
    }).join(''));
    return { ...puzzle, glyphs, originalGlyphs };
  });
  await writeFile(new URL(`src/generated/${site.id}.json`, root), JSON.stringify(prepared, null, 2) + '\n');
  console.log(`${site.id}: validated and prepared ${puzzles.length} puzzles`);
}
