import type { PrivacyPuzzle } from '../../src/sites/protect-privacy/types';

export function transform(
  puzzles: Omit<PrivacyPuzzle, 'glyphs' | 'originalGlyphs'>[],
): PrivacyPuzzle[];
