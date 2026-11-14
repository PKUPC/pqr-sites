import { useState } from 'react';
import { decodeProgress, encodeProgress, progressKey } from './progress';
import type { Puzzle } from './types';

export function useProgress(id: string, puzzles: Puzzle[], preview: boolean) {
  const [snapshot, setSnapshot] = useState(() => {
    if (preview) return { solved: new Set(puzzles.map(puzzle => puzzle.id)), warning: '' };
    try { return { solved: decodeProgress(localStorage.getItem(progressKey(id)), puzzles.map(p => p.id)), warning: '' }; }
    catch { return { solved: new Set<number>(), warning: '当前浏览器无法读取本地进度；仍可正常答题。' }; }
  });
  function solve(puzzleId: number) {
    if (preview || snapshot.solved.has(puzzleId)) return;
    const solved = new Set(snapshot.solved).add(puzzleId);
    let warning = snapshot.warning;
    try { localStorage.setItem(progressKey(id), encodeProgress(solved)); }
    catch { warning = '当前浏览器无法保存进度；关闭或刷新后，本次新增进度可能丢失。'; }
    setSnapshot({ solved, warning });
  }
  return { ...snapshot, solve };
}
