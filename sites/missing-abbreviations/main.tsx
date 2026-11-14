import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import type { Puzzle } from '../../src/shared/types';
import { App } from './App';
import puzzles from '../../src/generated/missing-abbreviations.json' with { type: 'json' };
import './style.css';
import './accessibility.css';
import '../../src/shared/accessibility.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode><App puzzles={puzzles as Puzzle[]} /></StrictMode>,
);
