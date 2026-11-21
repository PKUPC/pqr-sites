import { renderToStaticMarkup } from 'react-dom/server';
import { expect, it } from 'vitest';
import { PuzzleCard } from '../../src/components/PuzzleCard';
import { useQuiz } from '../../src/hooks/useQuiz';

it('lets a caller supply the complete answer UI without a shared card wrapper', () => {
  const html = renderToStaticMarkup(
    <PuzzleCard id={7} answers="answer" solved={false} onSolve={() => {}}>
      {(answer) => (
        <section className="custom-layout">
          <form onSubmit={answer.onSubmit}>
            <input {...answer.inputProps} ref={answer.inputRef} aria-label="Custom answer" />
            <button>Custom submit</button>
          </form>
        </section>
      )}
    </PuzzleCard>,
  );
  expect(html).toMatch(/^<section class="custom-layout">/);
  expect(html).toContain('aria-label="Custom answer"');
  expect(html).toContain('<button>Custom submit</button>');
});

it('supports an unrelated quiz ID and caller-specific data without changing shared code', () => {
  function CustomQuiz() {
    const quiz = useQuiz({
      storageId: 'another-quiz',
      preview: true,
      puzzles: [
        { id: 7, question: 'Custom question', answers: 'answer', illustration: 'drawing.svg' },
      ],
    });
    return (
      <output data-complete={quiz.complete} data-illustration={quiz.items[0].puzzle.illustration}>
        {quiz.solved.size} / {quiz.total}
      </output>
    );
  }
  const html = renderToStaticMarkup(<CustomQuiz />);
  expect(html).toContain('data-complete="true"');
  expect(html).toContain('data-illustration="drawing.svg"');
  expect(html).toContain('1 / 1');
});

it('lets a caller supply individual authors for a jointly credited puzzle', () => {
  function JointQuiz() {
    const quiz = useQuiz({
      storageId: 'joint-authors',
      preview: true,
      puzzles: [{ id: 1, question: 'q', answers: 'a', author: 'A、B' }],
      getAuthors: (puzzle) => puzzle.author.split('、'),
    });
    return <output>{quiz.authors.join(',')}</output>;
  }
  expect(renderToStaticMarkup(<JointQuiz />)).toBe('<output>A,B</output>');
});
