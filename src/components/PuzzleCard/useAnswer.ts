import {
  useEffect,
  useRef,
  useState,
  type FormEventHandler,
  type InputHTMLAttributes,
  type RefObject,
} from 'react';
import { acceptsAnswer, normalizeAnswer, type AnswerPolicy } from '../../lib/answers';

export type AnswerResult = 'empty' | 'incorrect' | 'correct';

export interface AnswerState {
  error: Exclude<AnswerResult, 'correct'> | null;
  recentIncorrect: boolean;
  referenceAnswer: string;
  inputRef: RefObject<HTMLInputElement | null>;
  inputProps: Pick<
    InputHTMLAttributes<HTMLInputElement>,
    'value' | 'readOnly' | 'onChange' | 'onCompositionStart' | 'onCompositionEnd'
  >;
  onSubmit: FormEventHandler<HTMLFormElement>;
}

export function useAnswer({
  id,
  answers,
  solved,
  onSolve,
  lockWhenSolved = false,
  policy,
  onAttempt,
}: {
  id: number;
  answers: string | string[];
  solved: boolean;
  onSolve: (id: number, input: HTMLInputElement | null) => void;
  lockWhenSolved?: boolean;
  policy?: AnswerPolicy;
  onAttempt?: (result: AnswerResult) => void;
}): AnswerState {
  const [value, setValue] = useState('');
  const [error, setError] = useState<AnswerState['error']>(null);
  const [recentIncorrect, setRecentIncorrect] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const composing = useRef(false);
  const timeout = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  useEffect(() => () => clearTimeout(timeout.current), []);

  const onSubmit: FormEventHandler<HTMLFormElement> = (event) => {
    event.preventDefault();
    if (composing.current || (lockWhenSolved && solved)) return;
    clearTimeout(timeout.current);
    setRecentIncorrect(false);
    if (!normalizeAnswer(value, policy)) {
      setError('empty');
      inputRef.current?.focus();
      onAttempt?.('empty');
      return;
    }
    if (!acceptsAnswer(value, answers, policy)) {
      setError('incorrect');
      setRecentIncorrect(true);
      timeout.current = setTimeout(() => setRecentIncorrect(false), 1000);
      onAttempt?.('incorrect');
      return;
    }
    setError(null);
    setValue('');
    onAttempt?.('correct');
    onSolve(id, inputRef.current);
  };

  return {
    error,
    recentIncorrect,
    referenceAnswer: [answers].flat()[0],
    inputRef,
    onSubmit,
    inputProps: {
      value,
      readOnly: lockWhenSolved && solved,
      onCompositionStart: () => {
        composing.current = true;
      },
      onCompositionEnd: () => {
        composing.current = false;
      },
      onChange: (event) => {
        setValue(event.target.value);
        setError(null);
      },
    },
  };
}
