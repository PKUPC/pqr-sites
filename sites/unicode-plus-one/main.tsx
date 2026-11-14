import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';
import puzzles from '../../src/generated/unicode-plus-one.json' with { type: 'json' };
import './style.css';
import './accessibility.css';
import '../../src/styles/accessibility.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode><App puzzles={puzzles} /></StrictMode>,
);
