import type { Operation, Mode, Difficulty, Problem } from './types';

// ─── Helpers ─────────────────────────────────────────────────────────

function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

const OP_SYMBOLS: Record<Operation, string> = {
  add: '+',
  sub: '−', // proper minus sign
  mul: '×',
};

// ─── Difficulty ranges ───────────────────────────────────────────────

function difficultyPair(difficulty: Difficulty): [number, number] {
  switch (difficulty) {
    case '1d':   return [randInt(0, 9), randInt(0, 9)];
    case '1d2d': {
      const small = randInt(0, 9);
      const big   = randInt(10, 99);
      // Randomly swap so the bigger number isn't always first
      return Math.random() < 0.5 ? [small, big] : [big, small];
    }
    case '2d':   return [randInt(10, 99), randInt(10, 99)];
  }
}

// ─── Generators per operation ────────────────────────────────────────

function generateAdd(difficulty: Difficulty): Problem {
  const [a, b] = difficultyPair(difficulty);
  return {
    a,
    b,
    op: 'add',
    answer: a + b,
    display: `${a} + ${b} = ?`,
  };
}

function generateSub(difficulty: Difficulty): Problem {
  // Ensure a >= b so result is never negative
  let [a, b] = difficultyPair(difficulty);
  if (b > a) [a, b] = [b, a];
  return {
    a,
    b,
    op: 'sub',
    answer: a - b,
    display: `${a} ${OP_SYMBOLS.sub} ${b} = ?`,
  };
}

function generateMul(focus?: number): Problem {
  // If a focus number is set (e.g. 9), drill (1-9) × 9.
  // Otherwise random 1–9 × 1–9.
  let a: number;
  let b: number;
  if (focus && focus >= 1 && focus <= 9) {
    a = randInt(1, 9);
    b = focus;
    // Randomly swap so the focus number isn't always on the right
    if (Math.random() < 0.5) [a, b] = [b, a];
  } else {
    a = randInt(1, 9);
    b = randInt(1, 9);
  }
  return {
    a,
    b,
    op: 'mul',
    answer: a * b,
    display: `${a} ${OP_SYMBOLS.mul} ${b} = ?`,
  };
}

// ─── Public API ──────────────────────────────────────────────────────

/**
 * Generate a random math problem.
 *
 * @param mulFocus    — optional 1-9 number to lock one factor in multiplication.
 * @param difficulty  — controls digit ranges for add/sub (default '2d').
 *
 * In "mix" mode the weighted distribution is:
 *   add 40 %  ·  sub 40 %  ·  mul 20 %
 */
export function generateProblem(
  mode: Mode,
  mulFocus?: number,
  difficulty: Difficulty = '2d',
): Problem {
  if (mode === 'add') return generateAdd(difficulty);
  if (mode === 'sub') return generateSub(difficulty);
  if (mode === 'mul') return generateMul(mulFocus);

  // mix mode
  const roll = Math.random();
  if (roll < 0.4) return generateAdd(difficulty);
  if (roll < 0.8) return generateSub(difficulty);
  return generateMul(mulFocus);
}
