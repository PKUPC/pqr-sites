import { useState } from 'react';
import type { UnicodePuzzle } from '../types';

export function Question({ puzzle, solved }: { puzzle: UnicodePuzzle; solved: boolean }) {
  const [selected, setSelected] = useState(false);
  const [hovered, setHovered] = useState(false);
  const original = puzzle.originalGlyphs;
  const show = selected || hovered;
  const layer = (glyphs: string[], className: string) => <span className={`question-text ${className}`} aria-hidden="true">{glyphs.map((glyph, index) => <span key={index}>{glyph}</span>)}</span>;
  return <h2 id={`question-${puzzle.id}`} aria-label={solved ? undefined : puzzle.question}>
    {solved ? <button type="button" className={`question-toggle${show ? ' show-original' : ''}`}
      aria-label={show ? original.join('') : puzzle.question} aria-describedby={`question-toggle-help-${puzzle.id}`}
      onPointerEnter={event => { if (event.pointerType === 'mouse') setHovered(true); }}
      onPointerLeave={event => { if (event.pointerType === 'mouse') setHovered(false); }}
      onClick={() => { setSelected(!selected); setHovered(false); }}>
      {layer(puzzle.glyphs, 'question-encoded')}{layer(original, 'question-original')}
    </button> : layer(puzzle.glyphs, 'question-encoded')}
    <span id={`question-toggle-help-${puzzle.id}`} className="sr-only">切换题面和原问句</span>
  </h2>;
}
