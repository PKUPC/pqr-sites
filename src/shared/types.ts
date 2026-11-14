export interface Puzzle {
  id: number;
  question: string;
  answers: string | string[];
  author?: string;
  difficulty?: number;
  hint?: string | string[];
  tags?: Record<string, string>;
  glyphs?: string[];
  originalGlyphs?: string[];
}

export type QuizId = 'missing-abbreviations' | 'unicode-plus-one';
