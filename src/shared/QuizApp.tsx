import { useRef, useState, type ReactNode } from 'react';
import catalog from '../../catalog.json' with { type: 'json' };
import { Completion } from './Completion';
import { FloatingNotes } from './FloatingNote';
import { Difficulty, PuzzleCard } from './PuzzleCard';
import { useProgress } from './useProgress';
import type { Puzzle, QuizId } from './types';

export function QuizApp({ id, puzzles, introduction }: { id: QuizId; puzzles: Puzzle[]; introduction: ReactNode }) {
  const site = catalog.find(site => site.id === id)!;
  const unicode = id === 'unicode-plus-one';
  const preview = new URLSearchParams(location.search).get('preview') === 'completion';
  const { solved, solve, warning } = useProgress(id, puzzles, preview);
  const [author, setAuthor] = useState('');
  const [order, setOrder] = useState('original');
  const returnFocus = useRef<HTMLInputElement | null>(null);
  const authors = [...new Set(puzzles.map(puzzle => puzzle.author).filter((name): name is string => Boolean(name)))].sort((a, b) => a.localeCompare(b, 'zh-CN'));
  const hasDifficulty = puzzles.some(puzzle => puzzle.difficulty !== undefined);
  const sorted = puzzles.map((puzzle, index) => ({ puzzle, index }));
  if (order !== 'original') sorted.sort((a, b) => {
    const level = (puzzle: Puzzle) => puzzle.difficulty === undefined ? Infinity : (order === 'hard' ? -puzzle.difficulty : puzzle.difficulty);
    return level(a.puzzle) - level(b.puzzle) || a.index - b.index;
  });
  return <FloatingNotes>
    <a href="#puzzles" className="skip-link">跳到题目</a>
    <div className="shell">
      <header className="top">
        <div className={unicode ? 'brand' : 'brand-block'}>
          <h1 className={unicode ? 'brand-title' : 'brand'}>{unicode ? <>unicode<span className="brand-shift">+1</span></> : site.title}</h1>
          <p className={unicode ? 'brand-meta' : 'edition'}>P&amp;KU 群聊集萃 · 第 {site.edition} 期</p>
        </div>
        <div className="progress">
          <div className={unicode ? 'progress-summary' : 'progress-meta'} aria-hidden="true"><span>已解</span><span>{unicode ? <><strong id="count">{solved.size}</strong> / {puzzles.length}</> : <span id="count">{solved.size} / {puzzles.length}</span>}</span></div>
          <progress id="progress" max={puzzles.length} value={solved.size} aria-label="答题进度" aria-valuetext={`已解 ${solved.size} / ${puzzles.length}`} />
        </div>
      </header>
      <main>
        {introduction}
        {warning && <p className="storage-warning" role="status">{warning}</p>}
        {preview && <p className="storage-warning">完成效果预览：不会保存此模式下的答题进度。</p>}
        <div className="sort-row">
          {unicode && <p className="sort-notes"><span>答对后，悬停预览原问句，点按切换</span>{hasDifficulty && <span className="difficulty-note"><Difficulty level={3} decorative />电波强度表示难度！~</span>}</p>}
          <div className="sort-controls" hidden={!authors.length && !hasDifficulty}>
            {authors.length > 0 && <label>作者<select id="author-filter" value={author} onChange={event => setAuthor(event.target.value)}><option value="">全部作者</option>{authors.map(name => <option key={name} value={name}>{name}</option>)}</select></label>}
            {hasDifficulty && <label>排序<select id="puzzle-sort" value={order} onChange={event => setOrder(event.target.value)}><option value="original">原始题序</option><option value="easy">难度从低到高</option><option value="hard">难度从高到低</option></select></label>}
          </div>
        </div>
        <div className="grid" id="puzzles" tabIndex={-1}>{sorted.map(({ puzzle, index }) => <PuzzleCard key={puzzle.id} puzzle={puzzle} index={index} unicode={unicode} solved={solved.has(puzzle.id)} hidden={Boolean(author) && puzzle.author !== author} onSolve={solve} returnFocus={returnFocus} />)}</div>
        <p className="archive-navigation"><a href="/">← 返回 PQR 存档首页</a></p>
      </main>
    </div>
    <Completion complete={solved.size === puzzles.length} id={id} title={site.title} edition={site.edition} returnFocus={returnFocus} />
  </FloatingNotes>;
}
