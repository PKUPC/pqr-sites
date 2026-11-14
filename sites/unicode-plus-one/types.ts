import type { Puzzle } from '../../src/types/puzzle';

export interface UnicodePuzzle extends Puzzle {
  glyphs: string[];
  originalGlyphs: string[];
}
