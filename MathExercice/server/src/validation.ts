// ── Validation helpers ──────────────────────────────────────────────

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const ALLOWED_PROBLEM_TYPES = new Set(['add', 'sub', 'mul', 'mix']);
const MIN_TIME_MS = 100;
const MAX_TIME_MS = 120_000;
const MIN_DIFFICULTY = 1;
const MAX_DIFFICULTY = 5;

export function isValidUUID(s: unknown): s is string {
  return typeof s === 'string' && UUID_RE.test(s);
}

export interface AttemptPayload {
  userId: string;
  problemType: string;
  difficulty: number;
  timeMs: number;
  correct: boolean;
  clientTs?: string;
}

export interface ValidationError {
  field: string;
  message: string;
}

export function validateAttempt(body: unknown): { data?: AttemptPayload; errors?: ValidationError[] } {
  const errors: ValidationError[] = [];

  if (!body || typeof body !== 'object') {
    return { errors: [{ field: 'body', message: 'Request body must be a JSON object' }] };
  }

  const b = body as Record<string, unknown>;

  // userId
  if (!isValidUUID(b.userId)) {
    errors.push({ field: 'userId', message: 'Must be a valid UUID' });
  }

  // problemType
  if (typeof b.problemType !== 'string' || !ALLOWED_PROBLEM_TYPES.has(b.problemType)) {
    errors.push({ field: 'problemType', message: `Must be one of: ${[...ALLOWED_PROBLEM_TYPES].join(', ')}` });
  }

  // difficulty
  if (
    typeof b.difficulty !== 'number' ||
    !Number.isInteger(b.difficulty) ||
    b.difficulty < MIN_DIFFICULTY ||
    b.difficulty > MAX_DIFFICULTY
  ) {
    errors.push({ field: 'difficulty', message: `Must be integer ${MIN_DIFFICULTY}–${MAX_DIFFICULTY}` });
  }

  // timeMs
  if (
    typeof b.timeMs !== 'number' ||
    !Number.isInteger(b.timeMs) ||
    b.timeMs < MIN_TIME_MS ||
    b.timeMs > MAX_TIME_MS
  ) {
    errors.push({ field: 'timeMs', message: `Must be integer ${MIN_TIME_MS}–${MAX_TIME_MS}` });
  }

  // correct
  if (typeof b.correct !== 'boolean') {
    errors.push({ field: 'correct', message: 'Must be a boolean' });
  }

  // clientTs (optional)
  let clientTs: string | undefined;
  if (b.clientTs !== undefined) {
    if (typeof b.clientTs !== 'string' || isNaN(Date.parse(b.clientTs))) {
      errors.push({ field: 'clientTs', message: 'Must be a valid ISO 8601 timestamp' });
    } else {
      clientTs = b.clientTs;
    }
  }

  if (errors.length > 0) return { errors };

  return {
    data: {
      userId: b.userId as string,
      problemType: b.problemType as string,
      difficulty: b.difficulty as number,
      timeMs: b.timeMs as number,
      correct: b.correct as boolean,
      clientTs,
    },
  };
}
