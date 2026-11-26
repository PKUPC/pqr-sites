import { useEffect, useRef, useState } from 'react';
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
  const stamp = useRef<HTMLButtonElement>(null);
  const flash = useRef<Animation | undefined>(undefined);
  const feedbackTimeout = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const [recentCorrect, setRecentCorrect] = useState(false);
  useEffect(
    () => () => {
      flash.current?.cancel();
      clearTimeout(feedbackTimeout.current);
    },
    [],
  );
  const authors = getAuthors(puzzle);
  const acceptedAnswers = [puzzle.answers]
    .flat()
    .flatMap((answer) => [answer, answer.replaceAll('-', '−')]);
  function onAttempt(result: AnswerResult) {
    flash.current?.cancel();
    if (result === 'correct') {
      setRecentCorrect(true);
      clearTimeout(feedbackTimeout.current);
      feedbackTimeout.current = setTimeout(() => setRecentCorrect(false), 1800);
    }
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    if (result === 'correct') {
      flash.current = stamp.current?.animate(
        [
          { transform: 'translateY(-8px) scale(1.16) rotate(-10deg)', opacity: 0 },
          { transform: 'translateY(0) scale(0.96) rotate(-3deg)', opacity: 1, offset: 0.7 },
          { transform: 'rotate(-4deg)', opacity: 1 },
        ],
        { duration: 300, easing: 'ease-out' },
      );
    } else if (result === 'incorrect') {
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
                value={solved ? answer.referenceAnswer : answer.inputProps.value}
                id={`answer-${puzzle.id}`}
                type="text"
                placeholder={puzzle.answerPlaceholder ?? '输入答案'}
                autoComplete="off"
                maxLength={100}
                aria-invalid={Boolean(error)}
                aria-describedby={solved ? `reference-${puzzle.id}` : `feedback-${puzzle.id}`}
              />
              <button ref={stamp} className="submit" disabled={solved}>
                {solved
                  ? recentCorrect
                    ? '答对了'
                    : '已解'
                  : answer.recentIncorrect
                    ? '错误！'
                    : '提交'}
              </button>
            </form>
            <div className="feedback" id={`feedback-${puzzle.id}`} role="status" aria-atomic="true">
              {error || (recentCorrect ? `第 ${puzzle.id} 题答对了。` : '')}
            </div>
            {solved && (
              <span className="sr-only" id={`reference-${puzzle.id}`}>
                参考答案：{answer.referenceAnswer}
              </span>
            )}
          </article>
        );
      }}
    </AnswerCard>
  );
}
