import { describe, expect, it } from 'vitest';
import { transform } from '../../scripts/transformer/protect-privacy.mjs';
import { validatePuzzles } from '../../scripts/validate.mjs';
import source from '../../src/sites/protect-privacy/puzzles.json' with { type: 'json' };
import prepared from '../../src/generated/protect-privacy.json' with { type: 'json' };

describe('protect-privacy archive data', () => {
  it('keeps the 22 questions, fixed difficulties and three DLC entries', () => {
    expect(() => validatePuzzles(source)).not.toThrow();
    expect(() => validatePuzzles([{ ...source[0], difficulty: 6 }])).toThrow(/Invalid difficulty/);
    expect(source).toHaveLength(22);
    expect(
      source.filter((puzzle) => 'dlc' in puzzle && puzzle.dlc).map((puzzle) => puzzle.id),
    ).toEqual([20, 21, 22]);
    expect(source.every((puzzle) => !('hint' in puzzle))).toBe(true);
    expect(source.map((puzzle) => puzzle.difficulty)).toEqual([
      2, 2, 1, 3, 1, 5, 3, 3, 1, 1, 5, 1, 1, 3, 4, 1, 4, 4, 3, 2, 3, 2,
    ]);
  });

  it('prepares equal-sized glyph layers without modifying the source questions', () => {
    for (const [index, puzzle] of prepared.entries()) {
      expect(puzzle.glyphs.join('')).toBe(source[index].question);
      expect(puzzle.originalGlyphs.join('')).toBe(source[index].original);
      expect(puzzle.glyphs).toHaveLength(puzzle.originalGlyphs.length);
    }
    expect(
      prepared.find((puzzle) => puzzle.id === 20)!.glyphs.filter((glyph) => glyph === '\n'),
    ).toHaveLength(2);
  });

  it('rejects missing originals and unequal redaction slots', () => {
    expect(() => transform([{ id: 1, question: '□□？', original: '', answers: 'a' }])).toThrow(
      /Missing original/,
    );
    expect(() =>
      transform([{ id: 1, question: '□□？', original: '张三是谁？', answers: 'a' }]),
    ).toThrow(/slots differ/);
  });
});
