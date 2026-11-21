import { useEffect, useRef } from 'react';
import { PuzzleCard as AnswerCard, type AnswerResult } from '../../../components/PuzzleCard';
import type { QuizCardProps } from '../../../hooks/useQuiz';
import type { PrivacyPuzzle } from '../types';
import { getAuthors, site } from '../site';
import { Difficulty } from './Difficulty';
import { Question } from './Question';

export function PuzzleCard({
  puzzle,
  index,
  solved,
  hidden,
  onSolve,
}: QuizCardProps<PrivacyPuzzle>) {
  const card = useRef<HTMLElement>(null);
  const flash = useRef<Animation | undefined>(undefined);
  useEffect(() => () => flash.current?.cancel(), []);
  const authors = getAuthors(puzzle);
  const acceptedAnswers = [puzzle.answers]
    .flat()
    .flatMap((answer) => [answer, answer.replaceAll('-', '−')]);
  function onAttempt(result: AnswerResult) {
    flash.current?.cancel();
    if (result === 'incorrect' && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
      flash.current = card.current?.animate(
        [{ backgroundColor: '#ff808a', borderColor: '#ae1530' }, {}],
        { duration: 420, easing: 'ease-out' },
      );
    }
  }
  return (
    <AnswerCard
      id={puzzle.id}
      answers={acceptedAnswers}
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
              ? '答案错误，请再试一次。'
              : '';
        return (
          <article
            ref={card}
            className={`card${puzzle.wide ? ' card-wide' : ''}${solved ? ' solved' : ''}`}
            hidden={hidden}
            data-puzzle-id={puzzle.id}
            aria-labelledby={`puzzle-number-${puzzle.id} question-${puzzle.id}`}
          >
            <header className="card-meta">
              <span className="card-number" id={`puzzle-number-${puzzle.id}`}>
                PQR-{String(site.edition).padStart(2, '0')}-{String(puzzle.id).padStart(2, '0')}
              </span>
              {puzzle.difficulty !== undefined && <Difficulty level={puzzle.difficulty} />}
              {authors.length > 0 && (
                <span className="author">
                  {authors.map((author, index) => (
                    <span className="author-name" key={author}>
                      {author}
                      {index < authors.length - 1 && '、'}
                    </span>
                  ))}
                </span>
              )}
            </header>
            <div className="card-top">
              <div className="question-title">
                <Question puzzle={puzzle} solved={solved} />
              </div>
            </div>
            <form onSubmit={answer.onSubmit}>
              <label className="sr-only" htmlFor={`answer-${puzzle.id}`}>
                第 {index + 1} 题的答案
              </label>
              <input
                {...answer.inputProps}
                ref={answer.inputRef}
                id={`answer-${puzzle.id}`}
                type="text"
                placeholder={
                  solved ? answer.referenceAnswer : (puzzle.answerPlaceholder ?? '输入答案')
                }
                autoComplete="off"
                maxLength={100}
                aria-invalid={Boolean(error)}
                aria-describedby={`feedback-${puzzle.id}`}
              />
              <button className="submit" disabled={solved}>
                {solved ? '已解' : answer.recentIncorrect ? '错误！' : '提交'}
              </button>
            </form>
            <div className="feedback" id={`feedback-${puzzle.id}`} role="status" aria-atomic="true">
              {error || (solved ? `已解出，参考答案：${answer.referenceAnswer}` : '')}
            </div>
          </article>
        );
      }}
    </AnswerCard>
  );
}
