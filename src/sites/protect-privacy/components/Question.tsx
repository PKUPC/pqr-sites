import { useState } from 'react';
import type { PrivacyPuzzle } from '../types';

const describeMasked = (text: string) => text.replace(/□+/g, '［遮盖］');

export function Question({ puzzle, solved }: { puzzle: PrivacyPuzzle; solved: boolean }) {
  const [selected, setSelected] = useState(false);
  const [hovered, setHovered] = useState(false);
  const showOriginal = selected || hovered;
  const maskedLabel = describeMasked(puzzle.question);

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
      {solved ? (
        <button
          type="button"
          className={`question-toggle${showOriginal ? ' show-original' : ''}`}
          aria-label={showOriginal ? puzzle.original : puzzle.question}
          aria-pressed={selected}
          aria-describedby={`question-help-${puzzle.id}`}
          onPointerEnter={(event) => {
            if (event.pointerType === 'mouse') setHovered(true);
          }}
          onPointerLeave={() => setHovered(false)}
          onPointerCancel={() => setHovered(false)}
          onClick={() => setSelected((value) => !value)}
        >
          {layer(puzzle.glyphs, false)}
          {layer(puzzle.originalGlyphs, true)}
        </button>
      ) : (
        layer(puzzle.glyphs, false)
      )}
      {solved && (
        <span className="sr-only" id={`question-help-${puzzle.id}`}>
          方框表示被遮盖的字。鼠标悬停题面可查看完整原问句。点按或按
          Enter、空格固定原问句，再次操作取消固定。
        </span>
      )}
    </h2>
  );
}
