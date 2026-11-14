import { useEffect, useRef, useState, type RefObject } from 'react';
import { acceptsAnswer, normalizeAnswer } from './answers';
import { Note } from './FloatingNote';
import type { Puzzle } from './types';

export function Difficulty({ level, decorative = false }: { level: number; decorative?: boolean }) {
  return <span className="difficulty" role={decorative ? undefined : 'img'} aria-label={decorative ? undefined : `难度 ${level}/5`} aria-hidden={decorative || undefined} title={`难度 ${level}/5`}>
    {Array.from({ length: 5 }, (_, step) => <span key={step} className={step < level ? 'filled' : ''} aria-hidden="true" style={{ '--step': step } as React.CSSProperties} />)}
  </span>;
}

function Question({ puzzle, solved }: { puzzle: Puzzle; solved: boolean }) {
  const [selected, setSelected] = useState(false);
  const [hovered, setHovered] = useState(false);
  if (!puzzle.glyphs || !puzzle.originalGlyphs) return <h2 id={`question-${puzzle.id}`} className={/^[a-z]+$/i.test(puzzle.question) ? 'latin-question' : undefined}>{puzzle.question}</h2>;
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

function Bulb() {
  return <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18h6m-5 3h4m-5-6c0-1.6-1-2.3-1.8-3.2A6 6 0 1 1 17 11.6c-.9 1.1-2 1.8-2 3.4" /></svg>;
}

export function PuzzleCard({ puzzle, index, unicode, solved, hidden, onSolve, returnFocus }: {
  puzzle: Puzzle; index: number; unicode: boolean; solved: boolean; hidden: boolean;
  onSolve: (id: number) => void; returnFocus: RefObject<HTMLInputElement | null>;
}) {
  const [value, setValue] = useState('');
  const [error, setError] = useState('');
  const [flashingLabel, setFlashingLabel] = useState(false);
  const input = useRef<HTMLInputElement>(null);
  const card = useRef<HTMLElement>(null);
  const composing = useRef(false);
  const timeout = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const animation = useRef<Animation | undefined>(undefined);
  useEffect(() => () => { clearTimeout(timeout.current); animation.current?.cancel(); }, []);
  const hints = (Array.isArray(puzzle.hint) ? puzzle.hint : (puzzle.hint ?? '').split(/[；;]/)).map(hint => hint.trim()).filter(Boolean);
  const answer = [puzzle.answers].flat()[0];
  const feedback = error || (solved ? (unicode ? `✓ 已解出 · 参考答案：${answer}` : '✓ 已解出') : '尚未作答');
  const tools = <>
    {unicode && puzzle.difficulty !== undefined && <Difficulty level={puzzle.difficulty} />}
    {hints.length > 0 && <div className="hint-list">{hints.map((hint, hintIndex) => <Note
      key={hintIndex} id={`hint-${puzzle.id}-${hintIndex}`} className="hint-toggle" text={hint}
      label={`第 ${index + 1} 题的提示${hints.length > 1 ? ` ${hintIndex + 1}` : ''}`}>
      <Bulb />{hints.length > 1 && <span className="hint-index" aria-hidden="true">{hintIndex + 1}</span>}
    </Note>)}</div>}
  </>;
  return <article ref={card} className={`card${solved ? ' solved' : ''}`} hidden={hidden} aria-labelledby={`question-${puzzle.id}`} data-puzzle-id={puzzle.id}>
    <div className="card-top">
      <div><div className="question-title"><Question puzzle={puzzle} solved={solved} /><div className="tags">{Object.entries(puzzle.tags ?? {}).map(([tag, text], tagIndex) => <Note key={tag} id={`tag-${puzzle.id}-${tagIndex}`} className="tag" tag={tag} label={tag} text={text}>{tag}</Note>)}</div></div>
        {unicode ? puzzle.author && <p className="author">{puzzle.author}</p> : <span className="author">{puzzle.author}</span>}
        {!unicode && puzzle.difficulty !== undefined && <span className="difficulty-label">难度 {puzzle.difficulty}/5</span>}
      </div>
      {unicode ? <div className="card-tools">{tools}</div> : tools}
    </div>
    {!unicode && puzzle.difficulty !== undefined && <div className="difficulty" aria-hidden="true"><strong className="difficulty-value">{puzzle.difficulty}</strong></div>}
    <div className="answer-field"><label className="answer-label" htmlFor={`answer-${puzzle.id}`}>第 {index + 1} 题 · {unicode ? '输入答案' : '输入缩略词'}</label>
      <form onSubmit={event => {
        event.preventDefault();
        if (composing.current || (unicode && solved)) return;
        animation.current?.cancel(); clearTimeout(timeout.current); setFlashingLabel(false);
        if (!normalizeAnswer(value)) { setError('请先输入答案。'); input.current?.focus(); return; }
        if (!acceptsAnswer(value, puzzle.answers)) {
          setError('答案不正确，请再试一次。');
          setFlashingLabel(true);
          timeout.current = setTimeout(() => setFlashingLabel(false), 1000);
          if (!matchMedia('(prefers-reduced-motion: reduce)').matches && card.current?.animate) {
            animation.current = card.current.animate([{ backgroundColor: '#ff808a', borderColor: '#ae1530' }, {}], { duration: 420, easing: 'ease-out' });
          }
          return;
        }
        setError(''); setValue(''); returnFocus.current = input.current; onSolve(puzzle.id);
      }}>
        <input ref={input} id={`answer-${puzzle.id}`} type="text" value={value} readOnly={unicode && solved}
          placeholder={unicode && solved ? answer : unicode ? '输入答案' : '输入缩略词'} autoComplete="off" maxLength={100}
          aria-describedby={`feedback-${puzzle.id}`} aria-invalid={Boolean(error)}
          onCompositionStart={() => { composing.current = true; }} onCompositionEnd={() => { composing.current = false; }}
          onChange={event => { setValue(event.target.value); setError(''); }} />
        <button className="submit" disabled={unicode && solved}>{unicode && solved ? '正确！' : unicode && flashingLabel ? '错误！' : '提交'}</button>
      </form>
    </div>
    <div id={`feedback-${puzzle.id}`} className="feedback" role="status" aria-atomic="true" data-state={error ? 'error' : solved ? 'solved' : 'idle'}>{solved && error ? `已解出 · ${feedback}` : feedback}</div>
  </article>;
}
