import type { ReactNode } from 'react';
import { useAnswer, type AnswerState } from './hooks/useAnswer';

export type { AnswerResult, AnswerState } from './hooks/useAnswer';

/** Answer state and events only; the caller owns all markup and presentation. */
export function PuzzleCard({ children, ...options }: Parameters<typeof useAnswer>[0] & {
  children: (state: AnswerState) => ReactNode;
}) {
  const state = useAnswer(options);
  return children(state);
}
