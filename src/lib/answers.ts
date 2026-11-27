export interface AnswerPolicy {
  compatibility?: boolean;
  ignoreWhitespace?: boolean;
  ignoreCase?: boolean;
  ignorePeriods?: boolean;
}

export function normalizeAnswer(value: string, policy: AnswerPolicy = {}) {
  let result = policy.compatibility === false ? value : value.normalize('NFKC');
  result = policy.ignoreWhitespace === false ? result : result.replace(/\s+/g, '');
  if (policy.ignorePeriods) result = result.replace(/[.。]/g, '');
  return policy.ignoreCase === false ? result : result.toLowerCase();
}

export function acceptsAnswer(guess: string, answers: string | string[], policy?: AnswerPolicy) {
  const normalized = normalizeAnswer(guess, policy);
  return (
    Boolean(normalized) &&
    [answers].flat().some((answer) => normalizeAnswer(answer, policy) === normalized)
  );
}
