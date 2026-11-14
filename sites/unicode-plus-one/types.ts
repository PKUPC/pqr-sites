import type { Puzzle } from '../../src/shared/types';

export interface UnicodePuzzle extends Puzzle {
  glyphs: string[];
  originalGlyphs: string[];
}
