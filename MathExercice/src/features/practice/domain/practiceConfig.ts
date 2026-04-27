import type { Mode, Difficulty } from './types';

export const GOAL_OPTIONS = [1, 20, 50, 100, 200, 1000] as const;
export const DEFAULT_GOAL = 100;

// maps the app's difficulty labels to numeric values for the API
export const DIFFICULTY_MAP: Record<Difficulty, number> = { '1d': 1, '1d2d': 2, '2d': 3 };

export const DIFFICULTIES: { value: Difficulty; label: string }[] = [
  { value: '1d',   label: '1 ✕ 1' },
  { value: '1d2d', label: '1 ✕ 2' },
  { value: '2d',   label: '2 ✕ 2' },
];

export const MODES: { value: Mode; label: string }[] = [
  { value: 'mix', label: 'Mix' },
  { value: 'add', label: 'Add' },
  { value: 'sub', label: 'Sub' },
  { value: 'mul', label: 'Mul' },
];
