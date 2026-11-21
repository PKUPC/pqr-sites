import { useRef, useState, type PointerEvent } from 'react';
import type { PrivacyPuzzle } from '../types';

const describeMasked = (text: string) => text.replace(/□+/g, '［遮盖］');

export function Question({ puzzle, solved }: { puzzle: PrivacyPuzzle; solved: boolean }) {
  const [selected, setSelected] = useState(false);
  const [previewed, setPreviewed] = useState(() => new Set<number>());
  const encoded = useRef<HTMLSpanElement>(null);
  const maskedLabel = describeMasked(puzzle.question);

  function clearPreview() {
    if (previewed.size) setPreviewed(new Set());
  }

  function previewRun(event: PointerEvent<HTMLSpanElement>) {
    if (!solved || selected || event.pointerType !== 'mouse') return;
    if (!(event.target instanceof Element)) return;
    const cell = event.target.closest<HTMLElement>('.question-blank');
    if (!cell || !encoded.current?.contains(cell)) {
      clearPreview();
      return;
    }
    const slot = Number(cell.dataset.slot);
    if (previewed.has(slot)) return;
    const row = cell.offsetTop;
    const sameRow = (node: Element | null): node is HTMLElement =>
      node instanceof HTMLElement &&
      node.classList.contains('question-blank') &&
      node.offsetTop === row;
    const cells = [cell];
    for (
      let previous = cell.previousElementSibling;
      sameRow(previous);
      previous = previous.previousElementSibling
    )
      cells.push(previous);
    for (let next = cell.nextElementSibling; sameRow(next); next = next.nextElementSibling)
      cells.push(next);
    setPreviewed(new Set(cells.map((item) => Number(item.dataset.slot))));
  }

  function layer(glyphs: string[], original: boolean) {
    return (
      <span
        className={`question-text ${original ? 'question-original' : 'question-encoded'}`}
        ref={original ? undefined : encoded}
        aria-hidden="true"
        onPointerOver={original ? undefined : previewRun}
        onPointerLeave={original ? undefined : clearPreview}
      >
        {glyphs.map((glyph, index) => {
          if (glyph === '\n') return <br key={index} />;
          const masked = puzzle.glyphs[index] === '□';
          const classes = [
            masked ? (original ? 'question-restored' : 'question-blank') : '',
            /^[!-~]$/u.test(puzzle.glyphs[index]) ? 'question-narrow' : '',
            !original && previewed.has(index) ? 'is-previewed' : '',
          ]
            .filter(Boolean)
            .join(' ');
          return (
            <span key={index} className={classes || undefined} data-slot={index}>
              {glyph}
              {solved && masked && !original && (
                <span className="redaction-preview">{puzzle.originalGlyphs[index]}</span>
              )}
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
          className={`question-toggle${selected ? ' show-original' : ''}`}
          aria-label={selected ? puzzle.original : maskedLabel}
          aria-describedby={`question-help-${puzzle.id}`}
          onClick={() => {
            setSelected((value) => !value);
            clearPreview();
          }}
        >
          {layer(puzzle.glyphs, false)}
          {layer(puzzle.originalGlyphs, true)}
        </button>
      ) : (
        layer(puzzle.glyphs, false)
      )}
      {solved && (
        <span className="sr-only" id={`question-help-${puzzle.id}`}>
          点按切换题面和原问句，鼠标悬停黑条可预览这一段。
        </span>
      )}
    </h2>
  );
}
