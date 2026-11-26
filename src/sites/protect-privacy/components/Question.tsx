import { useState } from 'react';
import type { PrivacyPuzzle } from '../types';

const describeMasked = (text: string) => text.replace(/□+/g, '［遮盖］');
const isLatinWordGlyph = (glyph: string) => /^[!-~‘’“”]$/u.test(glyph);

export function Question({ puzzle, solved }: { puzzle: PrivacyPuzzle; solved: boolean }) {
  const [showOriginal, setShowOriginal] = useState(true);
  const maskedLabel = describeMasked(puzzle.question);
  const Surface = solved ? 'button' : 'div';

  function layer(glyphs: string[], original: boolean) {
    function cell(index: number, latin = false) {
      const masked = puzzle.glyphs[index] === '□';
      const classes = [
        masked ? (original ? 'question-restored' : 'question-blank') : '',
        latin ? 'question-letter' : /^[!-~]$/u.test(puzzle.glyphs[index]) ? 'question-narrow' : '',
      ]
        .filter(Boolean)
        .join(' ');
      return (
        <span key={index} className={classes || undefined} data-slot={index}>
          {latin ? (
            <>
              <span className="question-letter-size">{puzzle.originalGlyphs[index]}</span>
              <span className="question-letter-value">{glyphs[index]}</span>
            </>
          ) : (
            glyphs[index]
          )}
        </span>
      );
    }

    const content = [];
    for (let index = 0; index < glyphs.length;) {
      if (glyphs[index] === '\n') {
        content.push(<br key={index++} />);
      } else if (puzzle.latinWords && puzzle.originalGlyphs[index] === ' ') {
        content.push(' ');
        index++;
      } else if (puzzle.latinWords && isLatinWordGlyph(puzzle.originalGlyphs[index])) {
        const start = index;
        const letters = [];
        while (index < glyphs.length && isLatinWordGlyph(puzzle.originalGlyphs[index])) {
          letters.push(cell(index++, true));
        }
        content.push(
          <span key={start} className="question-word">
            {letters}
          </span>,
        );
      } else {
        content.push(cell(index++));
      }
    }

    return (
      <span
        className={`question-text ${original ? 'question-original' : 'question-encoded'}${puzzle.latinWords ? ' question-text-latin' : ''}`}
        aria-hidden="true"
      >
        {content}
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
