import { useEffect, useRef } from 'react';
import { PuzzleCard as AnswerCard, type AnswerResult } from '../../src/shared/PuzzleCard';
import { Note } from '../../src/shared/FloatingNote';
import type { QuizCardProps } from '../../src/shared/useQuiz';
import type { Puzzle } from '../../src/shared/types';

function Bulb() {
  return <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18h6m-5 3h4m-5-6c0-1.6-1-2.3-1.8-3.2A6 6 0 1 1 17 11.6c-.9 1.1-2 1.8-2 3.4" /></svg>;
}

export function PuzzleCard({ puzzle, index, solved, hidden, onSolve }: QuizCardProps<Puzzle>) {
  const card = useRef<HTMLElement>(null);
  const animation = useRef<Animation | undefined>(undefined);
  useEffect(() => () => animation.current?.cancel(), []);
  const onAttempt = (result: AnswerResult) => {
    animation.current?.cancel();
    if (result === 'incorrect' && !matchMedia('(prefers-reduced-motion: reduce)').matches && card.current?.animate) {
      animation.current = card.current.animate([{ backgroundColor: '#ffb3b9', borderColor: '#ae1530' }, {}], { duration: 420, easing: 'ease-out' });
    }
  };
  const hints = (Array.isArray(puzzle.hint) ? puzzle.hint : (puzzle.hint ?? '').split(/[；;]/)).map(hint => hint.trim()).filter(Boolean);
  const tools = <>

    {hints.length > 0 && <div className="hint-list">{hints.map((hint, hintIndex) => <Note
      key={hintIndex} id={`hint-${puzzle.id}-${hintIndex}`} className="hint-toggle" text={hint}
      label={`第 ${index + 1} 题的提示${hints.length > 1 ? ` ${hintIndex + 1}` : ''}`}>
      <Bulb />{hints.length > 1 && <span className="hint-index" aria-hidden="true">{hintIndex + 1}</span>}
    </Note>)}</div>}
  </>;
  return <AnswerCard id={puzzle.id} answers={puzzle.answers} solved={solved} onSolve={onSolve} onAttempt={onAttempt}>
    {answer => {
      const error = answer.error === 'empty' ? '请先输入答案。' : answer.error === 'incorrect' ? '答案不正确，请再试一次。' : '';
      const feedback = error || (solved ? '✓ 已解出' : '尚未作答');
      return <article ref={card} className={`card${solved ? ' solved' : ''}`} hidden={hidden} aria-labelledby={`question-${puzzle.id}`} data-puzzle-id={puzzle.id}>
        <div className="card-top">
          <div><div className="question-title"><h2 id={`question-${puzzle.id}`} className={/^[a-z]+$/i.test(puzzle.question) ? 'latin-question' : undefined}>{puzzle.question}</h2><div className="tags">{Object.entries(puzzle.tags ?? {}).map(([tag, text], tagIndex) => <Note key={tag} id={`tag-${puzzle.id}-${tagIndex}`} className="tag" tag={tag} label={tag} text={text}>{tag}</Note>)}</div></div>
            <span className="author">{puzzle.author}</span>
            {puzzle.difficulty !== undefined && <span className="difficulty-label">难度 {puzzle.difficulty}/5</span>}
          </div>
          {tools}
        </div>
        {puzzle.difficulty !== undefined && <div className="difficulty" aria-hidden="true"><strong className="difficulty-value">{puzzle.difficulty}</strong></div>}
        <div className="answer-field"><label className="answer-label" htmlFor={`answer-${puzzle.id}`}>第 {index + 1} 题 · 输入缩略词</label>
          <form onSubmit={answer.onSubmit}>
            <input {...answer.inputProps} ref={answer.inputRef} id={`answer-${puzzle.id}`} type="text"
              placeholder={'输入缩略词'} autoComplete="off" maxLength={100}
              aria-describedby={`feedback-${puzzle.id}`} aria-invalid={Boolean(error)} />
            <button className="submit">提交</button>
          </form>
        </div>
        <div id={`feedback-${puzzle.id}`} className="feedback" role="status" aria-atomic="true" data-state={error ? 'error' : solved ? 'solved' : 'idle'}>{solved && error ? `已解出 · ${feedback}` : feedback}</div>
      </article>;
    }}
  </AnswerCard>;
}
