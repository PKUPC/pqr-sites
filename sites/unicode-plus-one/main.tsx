import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { QuizApp } from '../../src/shared/QuizApp';
import { Introduction } from './Introduction';
import puzzles from '../../src/generated/unicode-plus-one.json' with { type: 'json' };
import './style.css';
import '../../src/shared/accessibility.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode><QuizApp id="unicode-plus-one" puzzles={puzzles} introduction={<Introduction />} /></StrictMode>,
);
