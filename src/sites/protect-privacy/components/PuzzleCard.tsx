import { useEffect, useRef, useState, type MouseEvent } from 'react';
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
  const feedbackTimeout = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const [recentCorrect, setRecentCorrect] = useState(false);
  const [showOriginal, setShowOriginal] = useState(true);
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
  function toggleQuestion(event: MouseEvent<HTMLElement>) {
    if ((event.target as Element).closest('form, a')) return;
    const selection = window.getSelection();
    if (
      event.detail > 0 &&
      selection &&
      !selection.isCollapsed &&
      (event.currentTarget.contains(selection.anchorNode) ||
        event.currentTarget.contains(selection.focusNode))
    )
      return;
    setShowOriginal((value) => !value);
  }

  function onAttempt(result: AnswerResult) {
    flash.current?.cancel();
    clearTimeout(feedbackTimeout.current);
    setRecentCorrect(result === 'correct');
    if (result === 'correct') {
      feedbackTimeout.current = setTimeout(() => setRecentCorrect(false), 1800);
    }
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    if (result === 'incorrect') {
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
            className={`card${solved ? ' solved' : ''}${recentCorrect ? ' is-newly-solved' : ''}`}
            hidden={hidden}
            data-puzzle-id={puzzle.id}
            aria-labelledby={`puzzle-number-${puzzle.id} question-${puzzle.id}`}
            onClick={solved ? toggleQuestion : undefined}
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
                <Question puzzle={puzzle} solved={solved} showOriginal={showOriginal} />
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
                aria-describedby={
                  error || !solved ? `feedback-${puzzle.id}` : `reference-${puzzle.id}`
                }
              />
              <button className="submit">
                {answer.recentIncorrect
                  ? '错误！'
                  : recentCorrect
                    ? '答对了'
                    : solved
                      ? '已解'
                      : '提交'}
              </button>
            </form>
            {solved && puzzle.explanation && (
              <div
                className={`answer-explanation${showOriginal ? ' is-expanded' : ''}`}
                aria-hidden={!showOriginal}
              >
                <div className="answer-explanation-inner">
                  <h3>解析</h3>
                  <p>{puzzle.explanation}</p>
                </div>
              </div>
            )}
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
