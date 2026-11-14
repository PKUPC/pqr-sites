import { useRef } from 'react';
import catalog from '../catalog.json' with { type: 'json' };
import { FloatingNotes } from '../../components/FloatingNotes';
import { useQuiz } from '../../hooks/useQuiz';
import type { Puzzle } from '../../types/puzzle';
import { Introduction } from './components/Introduction';
import { PuzzleCard } from './components/PuzzleCard';
import { Completion } from '../../components/Completion';

const site = catalog.find((site) => site.id === 'missing-abbreviations')!;

export function App({ puzzles }: { puzzles: Puzzle[] }) {
  const preview = new URLSearchParams(location.search).get('preview') === 'completion';
  const quiz = useQuiz({ storageId: site.id, puzzles, preview });
  const shell = useRef<HTMLDivElement>(null);
  return (
    <FloatingNotes>
      <a href="#puzzles" className="skip-link">
        跳到题目
      </a>
      <div className="shell" ref={shell}>
        <header className="top">
          <div className="brand-block">
            <h1 className="brand">{site.title}</h1>
            <p className="edition">P&amp;KU 群聊集萃 · 第 {site.edition} 期</p>
          </div>
          <div className="progress">
            <div className="progress-meta" aria-hidden="true">
              <span>已解</span>
              <span>
                <span id="count">
                  {quiz.solved.size} / {quiz.total}
                </span>
              </span>
            </div>
            <progress
              id="progress"
              max={quiz.total}
              value={quiz.solved.size}
              aria-label="答题进度"
              aria-valuetext={`已解 ${quiz.solved.size} / ${quiz.total}`}
            />
          </div>
        </header>
        <main>
          <Introduction />
          {quiz.warning && (
            <p className="storage-warning" role="status">
              {quiz.warning}
            </p>
          )}
          {preview && <p className="storage-warning">完成效果预览：不会保存此模式下的答题进度。</p>}
          <div className="sort-row">
            <div className="sort-controls" hidden={!quiz.authors.length && !quiz.hasDifficulty}>
              {quiz.authors.length > 0 && (
                <label>
                  作者
                  <select
                    id="author-filter"
                    value={quiz.author}
                    onChange={(event) => quiz.setAuthor(event.target.value)}
                  >
                    <option value="">全部作者</option>
                    {quiz.authors.map((name) => (
                      <option key={name} value={name}>
                        {name}
                      </option>
                    ))}
                  </select>
                </label>
              )}
              {quiz.hasDifficulty && (
                <label>
                  排序
                  <select
                    id="puzzle-sort"
                    value={quiz.order}
                    onChange={(event) => quiz.setOrder(event.target.value)}
                  >
                    <option value="original">原始题序</option>
                    <option value="easy">难度从低到高</option>
                    <option value="hard">难度从高到低</option>
                  </select>
                </label>
              )}
            </div>
          </div>
          <div className="grid" id="puzzles" tabIndex={-1}>
            {quiz.items.map((item) => (
              <PuzzleCard key={item.puzzle.id} {...item} onSolve={quiz.solve} />
            ))}
          </div>
          <p className="archive-navigation">
            <a href="/">← 返回 PQR 存档首页</a>
          </p>
        </main>
      </div>
      <Completion
        complete={quiz.complete}
        title={site.title}
        edition={site.edition}
        returnFocus={() =>
          quiz.returnFocus.current ??
          shell.current?.querySelector<HTMLInputElement>('.card:not([hidden]) input') ??
          null
        }
      />
    </FloatingNotes>
  );
}
