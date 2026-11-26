import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import puzzles from '../../generated/protect-privacy.json' with { type: 'json' };
import { App } from './App';
import './style.css';
import './accessibility.css';
import '../../styles/accessibility.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App puzzles={puzzles} />
  </StrictMode>,
);
