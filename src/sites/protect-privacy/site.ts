import catalog from '../catalog.json' with { type: 'json' };
import type { PrivacyPuzzle } from './types';

export const site = catalog.find((entry) => entry.id === 'protect-privacy')!;

export function getAuthors(puzzle: Pick<PrivacyPuzzle, 'author'>) {
  return (
    puzzle.author
      ?.split('、')
      .map((author) => author.trim())
      .filter(Boolean) ?? []
  );
}
