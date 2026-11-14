import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import type { Puzzle } from '../../types/puzzle';
import { App } from './App';
import puzzles from '../../generated/missing-abbreviations.json' with { type: 'json' };
import './style.css';
import './accessibility.css';
import '../../styles/accessibility.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App puzzles={puzzles as Puzzle[]} />
  </StrictMode>,
);
