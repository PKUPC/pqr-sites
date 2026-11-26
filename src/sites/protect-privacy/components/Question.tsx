import { useState } from 'react';
import type { PrivacyPuzzle } from '../types';

const describeMasked = (text: string) => text.replace(/□+/g, '［遮盖］');

export function Question({ puzzle, solved }: { puzzle: PrivacyPuzzle; solved: boolean }) {
  const [showOriginal, setShowOriginal] = useState(true);
  const maskedLabel = describeMasked(puzzle.question);
  const Surface = solved ? 'button' : 'div';

  function layer(glyphs: string[], original: boolean) {
    return (
      <span
        className={`question-text ${original ? 'question-original' : 'question-encoded'}`}
        aria-hidden="true"
      >
        {glyphs.map((glyph, index) => {
          if (glyph === '\n') return <br key={index} />;
          const masked = puzzle.glyphs[index] === '□';
          const classes = [
            masked ? (original ? 'question-restored' : 'question-blank') : '',
            /^[!-~]$/u.test(puzzle.glyphs[index]) ? 'question-narrow' : '',
          ]
            .filter(Boolean)
            .join(' ');
          return (
            <span key={index} className={classes || undefined} data-slot={index}>
              {glyph}
            </span>
          );
        })}
      </span>
    );
  }

  return (
    <h2 id={`question-${puzzle.id}`} aria-label={solved ? undefined : maskedLabel}>
      <Surface
        type={solved ? 'button' : undefined}
        className={`question-toggle${solved && showOriginal ? ' show-original' : ''}`}
        aria-label={solved ? (showOriginal ? puzzle.original : puzzle.question) : undefined}
        aria-pressed={solved ? showOriginal : undefined}
        aria-describedby={solved ? `question-help-${puzzle.id}` : undefined}
        onClick={solved ? () => setShowOriginal((value) => !value) : undefined}
      >
        {layer(puzzle.glyphs, false)}
        {solved && layer(puzzle.originalGlyphs, true)}
      </Surface>
      {solved && (
        <span className="sr-only" id={`question-help-${puzzle.id}`}>
          方框表示被遮盖的字。点按或按 Enter、空格，在完整原问句和黑块题面之间切换。
        </span>
      )}
    </h2>
  );
}
