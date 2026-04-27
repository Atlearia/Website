import { useState, useCallback, useRef } from 'react';
import { generateProblem } from '../domain/problemGenerator';
import type { Mode, Difficulty, Problem } from '../domain/types';
import { GOAL_OPTIONS, DEFAULT_GOAL, DIFFICULTY_MAP } from '../domain/practiceConfig';
import { useLocalStorage, playSound } from '../../../shared/hooks/useLocalStorage';
import { useAnonUser } from '../../../shared/hooks/useAnonUser';
import { useSession } from '../../../shared/hooks/useSession';
import { submitAttempt } from '../../../shared/api';

export interface PracticeState {
  mode: Mode;
  soundOn: boolean;
  goal: number;
  mulFocus: number | null;
  difficulty: Difficulty;
  correct: number;
  streak: number;
  completed: boolean;
  problem: Problem;
  showConfetti: boolean;
  anonUserId: string | null;
  goalOptions: readonly number[];
  hasConsent: boolean | null;
}

export interface PracticeActions {
  handleCorrect: () => void;
  handleIncorrect: () => void;
  handleReset: () => void;
  handleModeChange: (m: Mode) => void;
  handleRestart: () => void;
  setSoundOn: (v: boolean) => void;
  setGoal: (g: number) => void;
  setMulFocus: (n: number | null) => void;
  setDifficulty: (d: Difficulty) => void;
  grantConsent: () => void;
  revokeConsent: () => void;
}

export function usePracticeState(): PracticeState & PracticeActions {
  // null = user hasn't decided on data consent yet
  const [consent, setConsent] = useState<boolean | null>(() => {
    const stored = localStorage.getItem('dataConsent');
    if (stored === 'true') return true;
    if (stored === 'false') return false;
    return null;
  });

  const anonUserId = useAnonUser(consent === true);
  const { recordAttempt } = useSession(consent === true ? anonUserId : null);

  // preferences (local only, not sent anywhere)
  const [correct, setCorrect] = useLocalStorage('mathCorrect', 0);
  const [mode, setMode] = useLocalStorage<Mode>('mathMode', 'mix');
  const [soundOn, setSoundOn] = useLocalStorage('mathSound', false);
  const [goal, setGoal] = useLocalStorage('mathGoal', DEFAULT_GOAL);
  const [mulFocus, setMulFocus] = useLocalStorage<number | null>('mathMulFocus', null);
  const [difficulty, setDifficulty] = useLocalStorage<Difficulty>('mathDifficulty', '2d');

  const [streak, setStreak] = useState(0);
  const [problem, setProblem] = useState(() => generateProblem(mode, mulFocus ?? undefined, difficulty));
  const [showConfetti, setShowConfetti] = useState(correct >= goal);

  const problemShownAt = useRef<number>(Date.now());

  const sendAttempt = useCallback(
    (wasCorrect: boolean) => {
      if (consent !== true || !anonUserId) return;

      const timeMs = Date.now() - problemShownAt.current;
      const problemType = problem.op;

      recordAttempt(wasCorrect, timeMs);

      submitAttempt({
        userId: anonUserId,
        problemType,
        difficulty: DIFFICULTY_MAP[difficulty] ?? 2,
        timeMs: Math.max(100, Math.min(timeMs, 120_000)),
        correct: wasCorrect,
        clientTs: new Date().toISOString(),
      });
    },
    [anonUserId, problem, difficulty, recordAttempt, consent],
  );

  const completed = correct >= goal;

  const handleCorrect = useCallback(() => {
    sendAttempt(true);
    if (soundOn) playSound('success');
    setStreak((s) => s + 1);
    setCorrect((c: number) => {
      const next = Math.min(c + 1, goal);
      if (next >= goal) setShowConfetti(true);
      return next;
    });
    setProblem(generateProblem(mode, mulFocus ?? undefined, difficulty));
    problemShownAt.current = Date.now();
  }, [mode, soundOn, goal, mulFocus, difficulty, setCorrect, sendAttempt]);

  const handleIncorrect = useCallback(() => {
    sendAttempt(false);
    if (soundOn) playSound('error');
    setStreak(0);
  }, [soundOn, sendAttempt]);

  const handleReset = useCallback(() => {
    setCorrect(0);
    setStreak(0);
    setShowConfetti(false);
    setProblem(generateProblem(mode, mulFocus ?? undefined, difficulty));
    problemShownAt.current = Date.now();
  }, [mode, mulFocus, difficulty, setCorrect]);

  const handleModeChange = useCallback(
    (m: Mode) => {
      setMode(m);
      setProblem(generateProblem(m, mulFocus ?? undefined, difficulty));
    },
    [setMode, mulFocus, difficulty],
  );

  const handleRestart = useCallback(() => {
    handleReset();
  }, [handleReset]);

  const grantConsent = useCallback(() => {
    localStorage.setItem('dataConsent', 'true');
    setConsent(true);
  }, []);

  const revokeConsent = useCallback(() => {
    localStorage.setItem('dataConsent', 'false');
    localStorage.removeItem('anonUserId');
    setConsent(false);
  }, []);

  return {
    mode, soundOn, goal, mulFocus, difficulty,
    correct, streak, completed, problem, showConfetti,
    anonUserId, goalOptions: GOAL_OPTIONS,
    hasConsent: consent,
    handleCorrect, handleIncorrect, handleReset, handleModeChange, handleRestart,
    setSoundOn, setGoal, setMulFocus, setDifficulty,
    grantConsent, revokeConsent,
  };
}
