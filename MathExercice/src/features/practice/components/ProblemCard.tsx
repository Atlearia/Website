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
  disabled: boolean; // true when 100/100 reached
}

export default function ProblemCard({
  problem,
  onCorrect,
  onIncorrect,
  disabled,
}: ProblemCardProps) {
  const [value, setValue] = useState('');
  const [shake, setShake] = useState(false);
  const [flash, setFlash] = useState(false); // correct flash
  const inputRef = useRef<HTMLInputElement>(null);
  const submittedRef = useRef(false); // prevents double-counting

  // Re-focus input after every new problem or on mount.
  useEffect(() => {
    inputRef.current?.focus();
    submittedRef.current = false;
    setValue('');
  }, [problem]);

  // ── Submit logic ──────────────────────────────────────────────────
  const trySubmit = useCallback(
    (raw: string) => {
      if (disabled || submittedRef.current) return;
      const trimmed = raw.trim();
      if (trimmed === '') return;

      const parsed = parseInt(trimmed, 10);
      if (isNaN(parsed)) return;

      if (parsed === problem.answer) {
        submittedRef.current = true; // lock until next problem
        setFlash(true);
        setTimeout(() => setFlash(false), 350);
        onCorrect();
      } else {
        // Quick shake feedback. We clear the input so the kid can re-type
        // immediately — faster than making them select-all & delete.
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
    // Allow only digits and a leading minus (for future use)
    if (v !== '' && !/^-?\d*$/.test(v)) return;
    setValue(v);

    // Auto-submit when typed length matches answer length.
    // Only fire when the kid has typed enough digits — avoids premature
    // submissions while still feeling instant for correct answers.
    const answerStr = String(problem.answer);
    if (v.length === answerStr.length && v.length > 0) {
      // Use a microtask so React state is settled first.
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
