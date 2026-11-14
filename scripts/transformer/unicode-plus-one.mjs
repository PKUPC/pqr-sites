/** Prepare encoded grapheme slots and original questions during the local build. */
export function transform(puzzles) {
  const segmenter = new Intl.Segmenter('zh-CN', { granularity: 'grapheme' });
  return puzzles.map((puzzle) => {
    // Preserve the source's encoded grapheme slots when deriving the original text.
    const glyphs = Array.from(segmenter.segment(puzzle.question), (part) => part.segment);
    const originalGlyphs = glyphs.map((glyph) =>
      Array.from(glyph, (char) => {
        const code = char.codePointAt(0);
        if (!code) throw new Error(`Invalid encoded character in puzzle ${puzzle.id}`);
        return String.fromCodePoint(code - 1);
      }).join(''),
    );
    return { ...puzzle, glyphs, originalGlyphs };
  });
}
