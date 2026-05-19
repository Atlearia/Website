import { describe, it, expect } from 'vitest';
import { isValidUUID, validateAttempt } from './validation.js';

const VALID_UUID = '123e4567-e89b-12d3-a456-426614174000';

function happyPath(overrides: Record<string, unknown> = {}) {
  return {
    userId: VALID_UUID,
    problemType: 'add',
    difficulty: 3,
    timeMs: 1500,
    correct: true,
    ...overrides,
  };
}

describe('isValidUUID', () => {
  it('accepts a canonical lower-case UUID', () => {
    expect(isValidUUID(VALID_UUID)).toBe(true);
  });

  it('accepts upper-case hex digits', () => {
    expect(isValidUUID(VALID_UUID.toUpperCase())).toBe(true);
  });

  it('rejects non-string inputs', () => {
    expect(isValidUUID(undefined)).toBe(false);
    expect(isValidUUID(null)).toBe(false);
    expect(isValidUUID(123)).toBe(false);
    expect(isValidUUID({})).toBe(false);
  });

  it('rejects malformed UUIDs', () => {
    expect(isValidUUID('not-a-uuid')).toBe(false);
    expect(isValidUUID('123e4567-e89b-12d3-a456')).toBe(false);
    expect(isValidUUID('123e4567e89b12d3a456426614174000')).toBe(false);
    expect(isValidUUID('')).toBe(false);
  });
});

describe('validateAttempt - happy path', () => {
  it('returns parsed data with no errors for a valid payload', () => {
    const result = validateAttempt(happyPath());
    expect(result.errors).toBeUndefined();
    expect(result.data).toEqual({
      userId: VALID_UUID,
      problemType: 'add',
      difficulty: 3,
      timeMs: 1500,
      correct: true,
      clientTs: undefined,
    });
  });

  it('accepts an optional ISO 8601 clientTs', () => {
    const result = validateAttempt(happyPath({ clientTs: '2025-01-15T12:00:00Z' }));
    expect(result.errors).toBeUndefined();
    expect(result.data?.clientTs).toBe('2025-01-15T12:00:00Z');
  });

  it('accepts every allowed problem type', () => {
    for (const t of ['add', 'sub', 'mul', 'mix']) {
      const result = validateAttempt(happyPath({ problemType: t }));
      expect(result.errors).toBeUndefined();
    }
  });
});

describe('validateAttempt - body shape', () => {
  it('rejects non-object bodies', () => {
    expect(validateAttempt(null).errors).toBeTruthy();
    expect(validateAttempt(undefined).errors).toBeTruthy();
    expect(validateAttempt('hello').errors).toBeTruthy();
    expect(validateAttempt(42).errors).toBeTruthy();
  });
});

describe('validateAttempt - userId', () => {
  it('rejects a missing userId', () => {
    const { errors } = validateAttempt(happyPath({ userId: undefined }));
    expect(errors?.some((e) => e.field === 'userId')).toBe(true);
  });

  it('rejects a malformed userId', () => {
    const { errors } = validateAttempt(happyPath({ userId: 'not-a-uuid' }));
    expect(errors?.some((e) => e.field === 'userId')).toBe(true);
  });
});

describe('validateAttempt - problemType', () => {
  it('rejects an unknown problem type', () => {
    const { errors } = validateAttempt(happyPath({ problemType: 'div' }));
    expect(errors?.some((e) => e.field === 'problemType')).toBe(true);
  });

  it('rejects a non-string problem type', () => {
    const { errors } = validateAttempt(happyPath({ problemType: 7 }));
    expect(errors?.some((e) => e.field === 'problemType')).toBe(true);
  });
});

describe('validateAttempt - difficulty', () => {
  it('rejects difficulty below the allowed range', () => {
    const { errors } = validateAttempt(happyPath({ difficulty: 0 }));
    expect(errors?.some((e) => e.field === 'difficulty')).toBe(true);
  });

  it('rejects difficulty above the allowed range', () => {
    const { errors } = validateAttempt(happyPath({ difficulty: 6 }));
    expect(errors?.some((e) => e.field === 'difficulty')).toBe(true);
  });

  it('rejects non-integer difficulty', () => {
    const { errors } = validateAttempt(happyPath({ difficulty: 2.5 }));
    expect(errors?.some((e) => e.field === 'difficulty')).toBe(true);
  });

  it('accepts both ends of the inclusive range', () => {
    expect(validateAttempt(happyPath({ difficulty: 1 })).errors).toBeUndefined();
    expect(validateAttempt(happyPath({ difficulty: 5 })).errors).toBeUndefined();
  });
});

describe('validateAttempt - timeMs', () => {
  it('rejects values below MIN_TIME_MS', () => {
    const { errors } = validateAttempt(happyPath({ timeMs: 50 }));
    expect(errors?.some((e) => e.field === 'timeMs')).toBe(true);
  });

  it('rejects values above MAX_TIME_MS', () => {
    const { errors } = validateAttempt(happyPath({ timeMs: 200_000 }));
    expect(errors?.some((e) => e.field === 'timeMs')).toBe(true);
  });

  it('rejects non-integer timeMs', () => {
    const { errors } = validateAttempt(happyPath({ timeMs: 100.5 }));
    expect(errors?.some((e) => e.field === 'timeMs')).toBe(true);
  });

  it('accepts both ends of the inclusive range', () => {
    expect(validateAttempt(happyPath({ timeMs: 100 })).errors).toBeUndefined();
    expect(validateAttempt(happyPath({ timeMs: 120_000 })).errors).toBeUndefined();
  });
});

describe('validateAttempt - correct', () => {
  it('rejects non-boolean correct values', () => {
    const { errors } = validateAttempt(happyPath({ correct: 'true' }));
    expect(errors?.some((e) => e.field === 'correct')).toBe(true);
  });
});

describe('validateAttempt - clientTs', () => {
  it('rejects a malformed clientTs', () => {
    const { errors } = validateAttempt(happyPath({ clientTs: 'not a date' }));
    expect(errors?.some((e) => e.field === 'clientTs')).toBe(true);
  });

  it('rejects a non-string clientTs', () => {
    const { errors } = validateAttempt(happyPath({ clientTs: 1700000000 }));
    expect(errors?.some((e) => e.field === 'clientTs')).toBe(true);
  });
});

describe('validateAttempt - aggregated errors', () => {
  it('reports all invalid fields at once', () => {
    const { errors } = validateAttempt({
      userId: 'bad',
      problemType: 'div',
      difficulty: 99,
      timeMs: 1,
      correct: 'nope',
    });
    const fields = new Set(errors?.map((e) => e.field));
    expect(fields.has('userId')).toBe(true);
    expect(fields.has('problemType')).toBe(true);
    expect(fields.has('difficulty')).toBe(true);
    expect(fields.has('timeMs')).toBe(true);
    expect(fields.has('correct')).toBe(true);
  });
});
