export function validatePuzzles(puzzles) {
  if (!Array.isArray(puzzles) || puzzles.length === 0) throw new Error('Expected a nonempty puzzle list');
  const ids = new Set();
  for (const puzzle of puzzles) {
    if (!Number.isSafeInteger(puzzle.id) || puzzle.id < 1 || ids.has(puzzle.id)) throw new Error(`Invalid or duplicate ID: ${puzzle.id}`);
    ids.add(puzzle.id);
    if (typeof puzzle.question !== 'string' || !puzzle.question.trim()) throw new Error(`Missing question: ${puzzle.id}`);
    const answers = Array.isArray(puzzle.answers) ? puzzle.answers : [puzzle.answers];
    if (!answers.length || answers.some(answer => typeof answer !== 'string' || !answer.trim())) throw new Error(`Invalid answers: ${puzzle.id}`);
    if (puzzle.author !== undefined && (typeof puzzle.author !== 'string' || !puzzle.author.trim())) throw new Error(`Invalid author: ${puzzle.id}`);
    if (puzzle.difficulty !== undefined && (!Number.isInteger(puzzle.difficulty) || puzzle.difficulty < 1 || puzzle.difficulty > 5)) throw new Error(`Invalid difficulty: ${puzzle.id}`);
    const hints = puzzle.hint === undefined ? [] : Array.isArray(puzzle.hint) ? puzzle.hint : [puzzle.hint];
    if (hints.some(hint => typeof hint !== 'string')) throw new Error(`Invalid hints: ${puzzle.id}`);
    if (puzzle.tags !== undefined && (!puzzle.tags || Array.isArray(puzzle.tags) || typeof puzzle.tags !== 'object' || Object.entries(puzzle.tags).some(([tag, description]) => !tag.trim() || typeof description !== 'string'))) throw new Error(`Invalid tags: ${puzzle.id}`);
  }
}
