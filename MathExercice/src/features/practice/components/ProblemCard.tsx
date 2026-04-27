import {
  useState,
  useRef,
  useEffect,
  useCallback,
  type FormEvent,
  type ChangeEvent,
} from 'react';
import type { Problem } from '../domain/types';

interface ProblemCardProps {
  problem: Problem;
  onCorrect: () => void;
  onIncorrect: () => void;
  disabled: boolean;
}

export default function ProblemCard({
  problem,
  onCorrect,
  onIncorrect,
  disabled,
}: ProblemCardProps) {
  const [value, setValue] = useState('');
  const [shake, setShake] = useState(false);
  const [flash, setFlash] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const submittedRef = useRef(false);


  useEffect(() => {
    inputRef.current?.focus();
    submittedRef.current = false;
    setValue('');
  }, [problem]);

  const trySubmit = useCallback(
    (raw: string) => {
      if (disabled || submittedRef.current) return;
      const trimmed = raw.trim();
      if (trimmed === '') return;

      const parsed = parseInt(trimmed, 10);
      if (isNaN(parsed)) return;

      if (parsed === problem.answer) {
        submittedRef.current = true;
        setFlash(true);
        setTimeout(() => setFlash(false), 350);
        onCorrect();
      } else {
        // clear input so the kid can retype immediately
        setShake(true);
        setValue('');
        setTimeout(() => setShake(false), 300);
        onIncorrect();
      }
    },
    [problem, onCorrect, onIncorrect, disabled],
  );

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    trySubmit(value);
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value;
    // digits and optional leading minus only
    if (v !== '' && !/^-?\d*$/.test(v)) return;
    setValue(v);

    // auto-submit once typed length matches answer length
    const answerStr = String(problem.answer);
    if (v.length === answerStr.length && v.length > 0) {
      setTimeout(() => trySubmit(v), 0);
    }
  };

  return (
    <form className="problem-card" onSubmit={handleSubmit}>
      <span className="equation">{problem.display.replace('?', '')}</span>
      <div className={`input-group ${shake ? 'shake' : ''} ${flash ? 'flash-correct' : ''}`}>
        <input
          ref={inputRef}
          type="text"
          inputMode="numeric"
          autoComplete="off"
          className="answer-input"
          value={value}
          onChange={handleChange}
          disabled={disabled}
          placeholder="?"
          aria-label="Your answer"
        />
        {flash && <span className="check-mark">✓</span>}
      </div>
    </form>
  );
}
