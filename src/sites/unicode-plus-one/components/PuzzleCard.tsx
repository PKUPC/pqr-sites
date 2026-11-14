import { useEffect, useRef } from 'react';
import { BulbIcon } from '../../../components/BulbIcon';
import { PuzzleCard as AnswerCard, type AnswerResult } from '../../../components/PuzzleCard';
import { Note } from '../../../components/Note';
import type { QuizCardProps } from '../../../hooks/useQuiz';
import type { UnicodePuzzle } from '../types';
import { Question } from './Question';
import { Difficulty } from './Difficulty';

export function PuzzleCard({
  puzzle,
  index,
  solved,
  hidden,
  onSolve,
}: QuizCardProps<UnicodePuzzle>) {
  const card = useRef<HTMLElement>(null);
  const animation = useRef<Animation | undefined>(undefined);
  useEffect(() => () => animation.current?.cancel(), []);
  const onAttempt = (result: AnswerResult) => {
    animation.current?.cancel();
    if (
      result === 'incorrect' &&
      !matchMedia('(prefers-reduced-motion: reduce)').matches &&
      card.current?.animate
    ) {
      animation.current = card.current.animate(
        [{ backgroundColor: '#ffb3b9', borderColor: '#ae1530' }, {}],
        { duration: 420, easing: 'ease-out' },
      );
    }
  };
  const hints = (Array.isArray(puzzle.hint) ? puzzle.hint : (puzzle.hint ?? '').split(/[；;]/))
    .map((hint) => hint.trim())
    .filter(Boolean);
  const tools = (
    <>
      {puzzle.difficulty !== undefined && <Difficulty level={puzzle.difficulty} />}
      {hints.length > 0 && (
        <div className="hint-list">
          {hints.map((hint, hintIndex) => (
            <Note
              key={hintIndex}
              id={`hint-${puzzle.id}-${hintIndex}`}
              className="hint-toggle"
              text={hint}
              label={`第 ${index + 1} 题的提示${hints.length > 1 ? ` ${hintIndex + 1}` : ''}`}
            >
              <BulbIcon />
              {hints.length > 1 && (
                <span className="hint-index" aria-hidden="true">
                  {hintIndex + 1}
                </span>
              )}
            </Note>
          ))}
        </div>
      )}
    </>
  );
  return (
    <AnswerCard
      id={puzzle.id}
      answers={puzzle.answers}
      solved={solved}
      onSolve={onSolve}
      onAttempt={onAttempt}
      lockWhenSolved
    >
      {(answer) => {
        const error =
          answer.error === 'empty'
            ? '请先输入答案。'
            : answer.error === 'incorrect'
              ? '答案不正确，请再试一次。'
              : '';
        const feedback =
          error || (solved ? `✓ 已解出 · 参考答案：${answer.referenceAnswer}` : '尚未作答');
        return (
          <article
            ref={card}
            className={`card${solved ? ' solved' : ''}`}
            hidden={hidden}
            aria-labelledby={`question-${puzzle.id}`}
            data-puzzle-id={puzzle.id}
          >
            <div className="card-top">
              <div>
                <div className="question-title">
                  <Question puzzle={puzzle} solved={solved} />
                  <div className="tags">
                    {Object.entries(puzzle.tags ?? {}).map(([tag, text], tagIndex) => (
                      <Note
                        key={tag}
                        id={`tag-${puzzle.id}-${tagIndex}`}
                        className="tag"
                        tag={tag}
                        label={tag}
                        text={text}
                      >
                        {tag}
                      </Note>
                    ))}
                  </div>
                </div>
                {puzzle.author && <p className="author">{puzzle.author}</p>}
              </div>
              <div className="card-tools">{tools}</div>
            </div>

            <div className="answer-field">
              <label className="answer-label" htmlFor={`answer-${puzzle.id}`}>
                第 {index + 1} 题 · 输入答案
              </label>
              <form onSubmit={answer.onSubmit}>
                <input
                  {...answer.inputProps}
                  ref={answer.inputRef}
                  id={`answer-${puzzle.id}`}
                  type="text"
                  placeholder={solved ? answer.referenceAnswer : '输入答案'}
                  autoComplete="off"
                  maxLength={100}
                  aria-describedby={`feedback-${puzzle.id}`}
                  aria-invalid={Boolean(error)}
                />
                <button className="submit" disabled={solved}>
                  {solved ? '正确！' : answer.recentIncorrect ? '错误！' : '提交'}
                </button>
              </form>
            </div>
            <div
              id={`feedback-${puzzle.id}`}
              className="feedback"
              role="status"
              aria-atomic="true"
              data-state={error ? 'error' : solved ? 'solved' : 'idle'}
            >
              {solved && error ? `已解出 · ${feedback}` : feedback}
            </div>
          </article>
        );
      }}
    </AnswerCard>
  );
}
