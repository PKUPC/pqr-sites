import { execFileSync } from 'node:child_process';
import { copyFileSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { expect, it } from 'vitest';

function fixture(run: (root: string) => void) {
  const root = mkdtempSync(join(tmpdir(), 'pqr-transformers-'));
  try {
    mkdirSync(join(root, 'scripts/transformer'), { recursive: true });
    mkdirSync(join(root, 'sites/example'), { recursive: true });
    for (const name of ['prepare.mjs', 'validate.mjs']) copyFileSync(new URL(`../../scripts/${name}`, import.meta.url), join(root, 'scripts', name));
    writeFileSync(join(root, 'sites/catalog.json'), JSON.stringify([{ id: 'example', count: 1 }]));
    writeFileSync(join(root, 'sites/example/puzzles.json'), JSON.stringify([{ id: 1, question: '问', answers: '答' }]));
    run(root);
  } finally { rmSync(root, { recursive: true, force: true }); }
}

const prepare = (root: string) => execFileSync(process.execPath, [join(root, 'scripts/prepare.mjs')], { stdio: 'pipe' });
const output = (root: string) => JSON.parse(readFileSync(join(root, 'src/generated/example.json'), 'utf8'));

it('passes ordinary question data through without a transformer', () => fixture(root => {
  prepare(root);
  expect(output(root)).toEqual([{ id: 1, question: '问', answers: '答' }]);
}));

it('discovers a same-named asynchronous transformer without changing prepare', () => fixture(root => {
  writeFileSync(join(root, 'scripts/transformer/example.mjs'), 'export async function transform(puzzles) { return puzzles.map(puzzle => ({...puzzle, prepared: true})); }');
  prepare(root);
  expect(output(root)).toEqual([{ id: 1, question: '问', answers: '答', prepared: true }]);
  expect(JSON.parse(readFileSync(join(root, 'sites/example/puzzles.json'), 'utf8'))).toEqual([{ id: 1, question: '问', answers: '答' }]);
}));

it('fails instead of silently bypassing an invalid transformer', () => fixture(root => {
  writeFileSync(join(root, 'scripts/transformer/example.mjs'), 'export const other = true;');
  expect(() => prepare(root)).toThrow(/expected an exported transform function/);
  writeFileSync(join(root, 'scripts/transformer/example.mjs'), 'export function transform() { throw new Error("Transformer failed"); }');
  expect(() => prepare(root)).toThrow(/Transformer failed/);
}));
