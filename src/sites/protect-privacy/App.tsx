import { useRef, useState, type CSSProperties } from 'react';
import { useQuiz } from '../../hooks/useQuiz';
import type { PrivacyPuzzle } from './types';
import { getAuthors, site } from './site';
import { Introduction } from './components/Introduction';
import { PuzzleCard } from './components/PuzzleCard';
import { CompletionFile } from './components/CompletionFile';

const strips = ['87%', '46%', '100%', '67%', '35%'];

export function App({ puzzles }: { puzzles: PrivacyPuzzle[] }) {
  const preview = new URLSearchParams(location.search).get('preview') === 'completion';
  const quiz = useQuiz({ storageId: site.id, puzzles, preview, getAuthors });
  const [fileView, setFileView] = useState<'closed' | 'covered' | 'revealed'>(
    preview ? 'revealed' : 'closed',
  );
  const [titleCovered, setTitleCovered] = useState(false);
  const [titleToggled, setTitleToggled] = useState(false);
  const fileButton = useRef<HTMLButtonElement>(null);
  const fileReturnFocus = useRef<HTMLElement | null>(null);
  const shell = useRef<HTMLDivElement>(null);
  const main = quiz.items.filter(({ puzzle }) => !puzzle.dlc);
  const dlc = quiz.items.filter(({ puzzle }) => puzzle.dlc);
  const dlcTotal = puzzles.filter((puzzle) => puzzle.dlc).length;

  function solve(id: number, input: HTMLInputElement | null) {
    if (preview || quiz.solved.has(id)) return;
    const solvedCount = quiz.solved.size + 1;
    quiz.solve(id, input);
    input?.focus({ preventScroll: true });
    if (solvedCount === quiz.total) {
      fileReturnFocus.current = input;
      setFileView('revealed');
    }
  }

  return (
    <>
      <a href="#puzzles" className="skip-link">
        跳到题目
      </a>
      <div className="shell" ref={shell}>
        <header className="top">
          <div className="cover-titlebox">
            <div className="cover-brand">
              <h1 className="brand-title" data-title-toggled={titleToggled ? '' : undefined}>
                <button
                  id="title-redaction"
                  type="button"
                  aria-pressed={titleCovered}
                  aria-description="切换标题的黑条遮盖"
                  onClick={() => {
                    setTitleCovered((value) => !value);
                    setTitleToggled(true);
                  }}
                >
                  {site.title}
                </button>
              </h1>
              <p className="cover-index">
                <span>P&amp;KU 群聊集萃</span>
                <span className="cover-issue">· 第 {site.edition} 期</span>
              </p>
            </div>
            <button
              ref={fileButton}
              className="cover-file"
              id="completion-open"
              type="button"
              aria-haspopup="dialog"
              onClick={() => {
                fileReturnFocus.current = fileButton.current;
                setFileView('covered');
              }}
            >
              查看文件
            </button>
          </div>
          <div className="cover-sheet file-sheet" aria-hidden="true">
            {strips.map((width, index) => (
              <span
                key={width}
                style={
                  {
                    '--strip-size': width,
                    '--strip-delay': `${index * 60}ms`,
                  } as CSSProperties
                }
              />
            ))}
          </div>
          <div className="progress">
            <div className="progress-summary" aria-hidden="true">
              <span>已解</span>
              <span>
                <strong id="count">{quiz.solved.size}</strong> / {quiz.total}
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
          {preview && <p className="storage-warning">通关效果预览</p>}
          <div className="sort-row">
            <h2 className="section-tab" id="puzzle-title">
              题卷
            </h2>
            <p className="sort-notes">
              <span>答对后，悬停题面查看完整原问句；点按固定，再点取消。</span>
              {quiz.hasDifficulty && <span>难度 1–5 级</span>}
            </p>
            <div className="sort-controls">
              <label>
                作者
                <select
                  id="author-filter"
                  value={quiz.author}
                  onChange={(event) => quiz.setAuthor(event.target.value)}
                >
                  <option value="">全部作者</option>
                  {quiz.authors.map((author) => (
                    <option key={author} value={author}>
                      {author}
                    </option>
                  ))}
                </select>
              </label>
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
          <div className="grid" id="puzzles" aria-labelledby="puzzle-title" tabIndex={-1}>
            {main.map((item) => (
              <PuzzleCard key={item.puzzle.id} {...item} onSolve={solve} />
            ))}
          </div>
          <section
            className="dlc-section"
            aria-labelledby="dlc-title"
            hidden={!dlc.some((item) => !item.hidden)}
          >
            <h2 className="section-tab" id="dlc-title">
              DLC
            </h2>
            <div className="grid" id="dlc-puzzles">
              {dlc.map((item) => (
                <PuzzleCard key={item.puzzle.id} {...item} onSolve={solve} />
              ))}
            </div>
          </section>
          <p className="archive-navigation">
            <a href="/">返回 PQR 存档首页</a>
          </p>
        </main>
      </div>
      <CompletionFile
        open={fileView !== 'closed'}
        covered={!quiz.complete || fileView === 'covered'}
        complete={quiz.complete}
        total={quiz.total}
        dlcTotal={dlcTotal}
        onCoverChange={(covered) => setFileView(covered ? 'covered' : 'revealed')}
        onDismiss={() => setFileView('closed')}
        returnFocus={() =>
          fileReturnFocus.current ??
          shell.current?.querySelector<HTMLInputElement>('.card:not([hidden]) input') ??
          fileButton.current
        }
      />
    </>
  );
}
