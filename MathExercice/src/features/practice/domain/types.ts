export type Operation = 'add' | 'sub' | 'mul';
export type Mode = Operation | 'mix';

// 1d = single digit, 1d2d = mixed, 2d = both double digit
export type Difficulty = '1d' | '1d2d' | '2d';

export interface Problem {
  a: number;
  b: number;
  op: Operation;
  answer: number;
  display: string;
}
