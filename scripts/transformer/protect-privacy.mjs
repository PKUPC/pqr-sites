/** Prepare matching redacted and original slots before shipping the static page. */
export function transform(puzzles) {
  const segmenter = new Intl.Segmenter('zh-CN', { granularity: 'grapheme' });
  const segment = (text) => Array.from(segmenter.segment(text), (part) => part.segment);
  return puzzles.map((puzzle) => {
    if (typeof puzzle.original !== 'string' || !puzzle.original.trim())
      throw new Error(`Missing original question: ${puzzle.id}`);
    const glyphs = segment(puzzle.question);
    const originalGlyphs = segment(puzzle.original);
    if (glyphs.length !== originalGlyphs.length)
      throw new Error(`Redacted and original slots differ: ${puzzle.id}`);
    return { ...puzzle, glyphs, originalGlyphs };
  });
}
