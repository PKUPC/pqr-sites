import type { CSSProperties } from 'react';

export function Difficulty({ level, decorative = false }: { level: number; decorative?: boolean }) {
  return <span className="difficulty" role={decorative ? undefined : 'img'} aria-label={decorative ? undefined : `难度 ${level}/5`} aria-hidden={decorative || undefined} title={`难度 ${level}/5`}>
    {Array.from({ length: 5 }, (_, step) => <span key={step} className={step < level ? 'filled' : ''} aria-hidden="true" style={{ '--step': step } as CSSProperties} />)}
  </span>;
}
