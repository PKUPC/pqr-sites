import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Toast } from '@base-ui/react/toast';
import puzzles from '../../generated/protect-privacy.json' with { type: 'json' };
import { App } from './App';
import { SolveFeedback } from './components/SolveFeedback';
import './style.css';
import './accessibility.css';
import '../../styles/accessibility.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Toast.Provider timeout={3000} limit={1}>
      <App puzzles={puzzles} />
      <SolveFeedback />
    </Toast.Provider>
  </StrictMode>,
);
