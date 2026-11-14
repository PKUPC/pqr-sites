export interface Puzzle {
  id: number;
  question: string;
  answers: string | string[];
  author?: string;
  difficulty?: number;
  hint?: string | string[];
  tags?: Record<string, string>;
}
