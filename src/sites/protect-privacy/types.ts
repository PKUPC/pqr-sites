import type { Puzzle } from '../../types/puzzle';

export interface PrivacyPuzzle extends Puzzle {
  original: string;
  glyphs: string[];
  originalGlyphs: string[];
  dlc?: boolean;
  wide?: boolean;
  answerPlaceholder?: string;
  explanation?: string;
}
