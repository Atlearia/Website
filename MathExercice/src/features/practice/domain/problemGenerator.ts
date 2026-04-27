import type { Operation, Mode, Difficulty, Problem } from './types';

function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

const OP_SYMBOLS: Record<Operation, string> = {
  add: '+',
  sub: '−',
  mul: '×',
};

function difficultyPair(difficulty: Difficulty): [number, number] {
  switch (difficulty) {
    case '1d':   return [randInt(0, 9), randInt(0, 9)];
    case '1d2d': {
      const small = randInt(0, 9);
      const big   = randInt(10, 99);
      return Math.random() < 0.5 ? [small, big] : [big, small];
    }
    case '2d':   return [randInt(10, 99), randInt(10, 99)];
  }
}

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
  // keep a >= b so the answer is never negative
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
  let a: number;
  let b: number;
  if (focus && focus >= 1 && focus <= 9) {
    a = randInt(1, 9);
    b = focus;
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

// in mix mode the split is 40% add, 40% sub, 20% mul
export function generateProblem(
  mode: Mode,
  mulFocus?: number,
  difficulty: Difficulty = '2d',
): Problem {
  if (mode === 'add') return generateAdd(difficulty);
  if (mode === 'sub') return generateSub(difficulty);
  if (mode === 'mul') return generateMul(mulFocus);

  const roll = Math.random();
  if (roll < 0.4) return generateAdd(difficulty);
  if (roll < 0.8) return generateSub(difficulty);
  return generateMul(mulFocus);
}
