// ─── Core domain types for math practice ────────────────────────────

export type Operation = 'add' | 'sub' | 'mul';
export type Mode = Operation | 'mix';

/**
 * Difficulty for addition / subtraction:
 *   '1d'   → single digit (0–9) ± single digit (0–9)
 *   '1d2d' → one operand 0–9, the other 10–99
 *   '2d'   → both operands 10–99
 */
export type Difficulty = '1d' | '1d2d' | '2d';

export interface Problem {
  a: number;
  b: number;
  op: Operation;
  answer: number;
  display: string; // e.g. "47 + 18 = ?"
}
