export function progressKey(id: string) { return `pqr:${id}:progress:v1`; }

export function decodeProgress(raw: string | null, validIds: number[]): Set<number> {
  if (!raw) return new Set();
  try {
    const data: unknown = JSON.parse(raw);
    if (!data || typeof data !== 'object' || !('version' in data) || data.version !== 1 || !('solved' in data) || !Array.isArray(data.solved)) return new Set();
    const valid = new Set(validIds);
    return new Set(data.solved.filter((id): id is number => typeof id === 'number' && valid.has(id)));
  } catch { return new Set(); }
}

export function encodeProgress(solved: Set<number>) {
  return JSON.stringify({ version: 1, solved: [...solved].sort((a, b) => a - b) });
}
