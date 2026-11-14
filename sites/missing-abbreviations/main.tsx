import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import type { Puzzle } from '../../src/shared/types';
import { QuizApp } from '../../src/shared/QuizApp';
import { Introduction } from './Introduction';
import puzzles from '../../src/generated/missing-abbreviations.json' with { type: 'json' };
import './style.css';
import '../../src/shared/accessibility.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode><QuizApp id="missing-abbreviations" puzzles={puzzles as Puzzle[]} introduction={<Introduction />} /></StrictMode>,
);
