import { useState } from 'react';
import type { PrivacyPuzzle } from '../types';

const describeMasked = (text: string) => text.replace(/□+/g, '［遮盖］');
const isLatinLetter = (glyph: string) => /[A-Za-z]/u.test(glyph);
// Keep mixed-script handles such as ClashのRPC together.
const isLatinWordGlyph = (glyph: string) =>
  /^[!-~‘’“”\p{Script=Hiragana}\p{Script=Katakana}]$/u.test(glyph);
const isWordEnding = (glyph: string) => /^[，、。；：！？）】》」』]$/u.test(glyph);

export function Question({ puzzle, solved }: { puzzle: PrivacyPuzzle; solved: boolean }) {
  const [showOriginal, setShowOriginal] = useState(true);
  const maskedLabel = describeMasked(puzzle.question);
  const latinWords = isLatinLetter(puzzle.original);
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
      } else if (latinWords && puzzle.originalGlyphs[index] === ' ') {
        content.push(' ');
        index++;
      } else if (latinWords && isLatinWordGlyph(puzzle.originalGlyphs[index])) {
        const start = index;
        let hasLatinLetter = false;
        while (index < glyphs.length && isLatinWordGlyph(puzzle.originalGlyphs[index])) {
          hasLatinLetter ||= isLatinLetter(puzzle.originalGlyphs[index]);
          index++;
        }
        if (hasLatinLetter) {
          while (index < glyphs.length && isWordEnding(puzzle.originalGlyphs[index])) index++;
        }
        const letters = [];
        for (let slot = start; slot < index; slot++) {
          letters.push(cell(slot, hasLatinLetter));
        }
        if (hasLatinLetter) {
          content.push(
            <span key={start} className="question-word">
              {letters}
            </span>,
          );
        } else {
          content.push(...letters);
        }
      } else {
        content.push(cell(index++));
      }
    }

    return (
      <span
        className={`question-text ${original ? 'question-original' : 'question-encoded'}${latinWords ? ' question-text-latin' : ''}`}
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
