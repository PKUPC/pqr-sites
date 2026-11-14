import { useRef, useState } from 'react';
import { useProgress } from './useProgress';
import type { Puzzle } from '../types/puzzle';

export interface QuizCardProps<T extends Puzzle> {
  puzzle: T;
  index: number;
  solved: boolean;
  hidden: boolean;
  onSolve: (id: number, input: HTMLInputElement | null) => void;
}

/** Progress and filtering are independent of a site's layout or question renderer. */
export function useQuiz<T extends Puzzle>({
  storageId,
  puzzles,
  preview = false,
}: {
  storageId: string;
  puzzles: T[];
  preview?: boolean;
}) {
  const progress = useProgress(storageId, puzzles, preview);
  const [author, setAuthor] = useState('');
  const [order, setOrder] = useState('original');
  const returnFocus = useRef<HTMLInputElement | null>(null);
  const authors = [
    ...new Set(
      puzzles.map((puzzle) => puzzle.author).filter((name): name is string => Boolean(name)),
    ),
  ].sort((a, b) => a.localeCompare(b, 'zh-CN'));
  const hasDifficulty = puzzles.some((puzzle) => puzzle.difficulty !== undefined);
  const sorted = puzzles.map((puzzle, index) => ({ puzzle, index }));
  if (order !== 'original')
    sorted.sort((a, b) => {
      const level = (puzzle: T) =>
        puzzle.difficulty === undefined
          ? Infinity
          : order === 'hard'
            ? -puzzle.difficulty
            : puzzle.difficulty;
      return level(a.puzzle) - level(b.puzzle) || a.index - b.index;
    });
  const solve = (id: number, input: HTMLInputElement | null) => {
    returnFocus.current = input;
    progress.solve(id);
  };
  return {
    ...progress,
    solve,
    authors,
    hasDifficulty,
    author,
    setAuthor,
    order,
    setOrder,
    returnFocus,
    total: puzzles.length,
    complete: progress.solved.size === puzzles.length,
    items: sorted.map((item) => ({
      ...item,
      solved: progress.solved.has(item.puzzle.id),
      hidden: Boolean(author) && item.puzzle.author !== author,
    })),
  };
}
