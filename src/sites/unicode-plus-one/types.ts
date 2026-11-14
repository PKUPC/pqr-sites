import type { Puzzle } from '../../types/puzzle';

export interface UnicodePuzzle extends Puzzle {
  glyphs: string[];
  originalGlyphs: string[];
}
