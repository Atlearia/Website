import { describe, it, expect } from 'vitest';
import { generateProblem } from './problemGenerator';
import type { Difficulty } from './types';

// Run each invariant many times so randomized branches are exercised
const N = 500;

function times(n: number, fn: (i: number) => void): void {
  for (let i = 0; i < n; i++) fn(i);
}

describe('generateProblem - addition', () => {
  it('returns the correct sum for every generated add problem', () => {
    times(N, () => {
      const p = generateProblem('add');
      expect(p.op).toBe('add');
      expect(p.answer).toBe(p.a + p.b);
      expect(p.display).toBe(`${p.a} + ${p.b} = ?`);
    });
  });

  it('respects difficulty bands', () => {
    const bands: Record<Difficulty, [number, number]> = {
      '1d':   [0, 9],
      '1d2d': [0, 99],
      '2d':   [10, 99],
    };
    (Object.keys(bands) as Difficulty[]).forEach((d) => {
      const [lo, hi] = bands[d];
      times(N, () => {
        const p = generateProblem('add', undefined, d);
        expect(p.a).toBeGreaterThanOrEqual(lo);
        expect(p.a).toBeLessThanOrEqual(hi);
        expect(p.b).toBeGreaterThanOrEqual(lo);
        expect(p.b).toBeLessThanOrEqual(hi);
      });
    });
  });
});

describe('generateProblem - subtraction', () => {
  it('never produces a negative answer', () => {
    times(N, () => {
      const p = generateProblem('sub');
      expect(p.op).toBe('sub');
      expect(p.answer).toBeGreaterThanOrEqual(0);
      expect(p.answer).toBe(p.a - p.b);
    });
  });

  it('keeps a >= b', () => {
    times(N, () => {
      const p = generateProblem('sub');
      expect(p.a).toBeGreaterThanOrEqual(p.b);
    });
  });
});

describe('generateProblem - multiplication', () => {
  it('returns the correct product', () => {
    times(N, () => {
      const p = generateProblem('mul');
      expect(p.op).toBe('mul');
      expect(p.answer).toBe(p.a * p.b);
    });
  });

  it('uses operands in 1..9', () => {
    times(N, () => {
      const p = generateProblem('mul');
      expect(p.a).toBeGreaterThanOrEqual(1);
      expect(p.a).toBeLessThanOrEqual(9);
      expect(p.b).toBeGreaterThanOrEqual(1);
      expect(p.b).toBeLessThanOrEqual(9);
    });
  });

  it('honors a focus number by always including it as one of the operands', () => {
    for (let focus = 1; focus <= 9; focus++) {
      times(100, () => {
        const p = generateProblem('mul', focus);
        expect(p.a === focus || p.b === focus).toBe(true);
      });
    }
  });

  it('ignores out-of-range focus values', () => {
    times(N, () => {
      const p = generateProblem('mul', 42);
      expect(p.a).toBeGreaterThanOrEqual(1);
      expect(p.a).toBeLessThanOrEqual(9);
      expect(p.b).toBeGreaterThanOrEqual(1);
      expect(p.b).toBeLessThanOrEqual(9);
    });
  });
});

describe('generateProblem - mix mode', () => {
  it('only produces known operations', () => {
    times(N, () => {
      const p = generateProblem('mix');
      expect(['add', 'sub', 'mul']).toContain(p.op);
    });
  });

  it('answer is always consistent with the operation', () => {
    times(N, () => {
      const p = generateProblem('mix');
      if (p.op === 'add') expect(p.answer).toBe(p.a + p.b);
      if (p.op === 'sub') expect(p.answer).toBe(p.a - p.b);
      if (p.op === 'mul') expect(p.answer).toBe(p.a * p.b);
    });
  });

  it('produces all three operations across many runs', () => {
    const seen = new Set<string>();
    times(2000, () => {
      seen.add(generateProblem('mix').op);
    });
    expect(seen.has('add')).toBe(true);
    expect(seen.has('sub')).toBe(true);
    expect(seen.has('mul')).toBe(true);
  });
});
