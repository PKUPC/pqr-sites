import { describe, expect, it } from 'vitest';
import { acceptsAnswer, normalizeAnswer } from '../../src/lib/answers';
import { decodeProgress, encodeProgress, progressKey } from '../../src/lib/progress';
import { validatePuzzles } from '../../scripts/validate.mjs';
import abbreviations from '../../src/sites/missing-abbreviations/puzzles.json' with { type: 'json' };
import unicode from '../../src/sites/unicode-plus-one/puzzles.json' with { type: 'json' };
import preparedUnicode from '../../src/generated/unicode-plus-one.json' with { type: 'json' };

describe('answer policy', () => {
  it('accepts compatibility forms, whitespace and mixed case by default', () => {
    expect(acceptsAnswer(' ＦＸ 战士久留美 ', ['fx战士久留美', 'FX戦士くるみちゃん'])).toBe(true);
    expect(acceptsAnswer('附小', ['附中', '附小'])).toBe(true);
    expect(acceptsAnswer('附中/附小', ['附中', '附小'])).toBe(false);
    expect(acceptsAnswer(' \n ', '')).toBe(false);
  });
  it('can preserve significant case, spacing and compatibility forms for future quizzes', () => {
    expect(normalizeAnswer(' Ａ B ', { compatibility: false, ignoreWhitespace: false, ignoreCase: false })).toBe(' Ａ B ');
  });
});

describe('progress storage', () => {
  it('rejects malformed and future-version storage without breaking the quiz', () => {
    for (const raw of ['{', 'null', '[]', '{"version":2,"solved":[1]}']) expect([...decodeProgress(raw, [1])]).toEqual([]);
  });
  it('keeps only known numeric IDs and separates quiz namespaces', () => {
    expect([...decodeProgress('{"version":1,"solved":[1,1,2,999,"1"]}', [1,2])]).toEqual([1,2]);
    expect([...decodeProgress(encodeProgress(new Set([2,1])), [1,2])]).toEqual([1,2]);
    expect(progressKey('missing-abbreviations')).not.toBe(progressKey('unicode-plus-one'));
  });
});

describe('source data and build-time Unicode processing', () => {
  it('validates both complete source datasets', () => {
    expect(() => validatePuzzles(abbreviations)).not.toThrow();
    expect(() => validatePuzzles(unicode)).not.toThrow();
    expect(abbreviations).toHaveLength(91);
    expect(unicode).toHaveLength(20);
    expect(new Set(unicode.map(puzzle => puzzle.author)).size).toBe(3);
  });
  it('rejects duplicate IDs and empty answer lists', () => {
    expect(() => validatePuzzles([{id:1, question:'q', answers:'a'}, {id:1, question:'q', answers:'a'}])).toThrow();
    expect(() => validatePuzzles([{id:1, question:'q', answers:[]}])).toThrow();
  });
  it('preserves encoded grapheme slots including flags and supplementary code points', () => {
    for (const puzzle of preparedUnicode) {
      expect(puzzle.glyphs.join('')).toBe(puzzle.question);
      expect(puzzle.originalGlyphs.length).toBe(puzzle.glyphs.length);
      expect(puzzle.originalGlyphs.join('')).toBe(Array.from(puzzle.question, char => String.fromCodePoint(char.codePointAt(0)! - 1)).join(''));
    }
    expect(preparedUnicode.find(puzzle => puzzle.id === 15)!.glyphs).toContain('🇭🇨');
  });
});
