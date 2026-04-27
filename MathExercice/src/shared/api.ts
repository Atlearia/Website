const API_BASE = import.meta.env.VITE_API_URL ?? '/api';

export interface AttemptPayload {
  userId: string;
  problemType: string;
  difficulty: number;
  timeMs: number;
  correct: boolean;
  clientTs: string;
}

export interface ProgressData {
  totals: {
    attempts: number;
    correct: number;
    accuracy: number;
  };
  medianTimeMs: number | null;
  medianCorrectTimeMs: number | null;
  perDay: {
    date: string;
    attempts: number;
    accuracy: number;
    medianTimeMs: number | null;
  }[];
}

export async function registerAnon(userId: string): Promise<string> {
  const res = await fetch(`${API_BASE}/register-anon`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId }),
  });
  if (!res.ok) throw new Error(`register-anon failed: ${res.status}`);
  const data = await res.json();
  return data.userId;
}

export function submitAttempt(payload: AttemptPayload): void {
  fetch(`${API_BASE}/attempt`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  }).catch(() => {});
}

export async function fetchProgress(userId: string): Promise<ProgressData> {
  const res = await fetch(`${API_BASE}/progress?userId=${encodeURIComponent(userId)}`);
  if (!res.ok) throw new Error(`progress fetch failed: ${res.status}`);
  return res.json();
}

export async function startSession(userId: string): Promise<number> {
  const res = await fetch(`${API_BASE}/session/start`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId }),
  });
  if (!res.ok) throw new Error(`session/start failed: ${res.status}`);
  const data = await res.json();
  return data.sessionId;
}

export function endSession(sessionId: number, attempts: number, correct: number, totalTimeMs: number): void {
  const data = JSON.stringify({ sessionId, attempts, correct, totalTimeMs });
  const blob = new Blob([data], { type: 'application/json' });

  if (navigator.sendBeacon) {
    navigator.sendBeacon(`${API_BASE}/session/end`, blob);
  } else {
    fetch(`${API_BASE}/session/end`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: data,
      keepalive: true,
    }).catch(() => {});
  }
}

export function updateSession(sessionId: number, attempts: number, correct: number, totalTimeMs: number): void {
  fetch(`${API_BASE}/session/update`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sessionId, attempts, correct, totalTimeMs }),
  }).catch(() => {});
}

// admin types

export interface AdminStats {
  totalUsers: number;
  uniqueIps: number;
  totalAttempts: number;
  totalCorrect: number;
  overallAccuracy: number;
  activeUsers24h: number;
  activeIps24h: number;
  attempts24h: number;
}

export interface AdminUser {
  id: string;
  ipHash: string | null;
  createdAt: string;
  lastSeen: string;
  attempts: number;
  correct: number;
  accuracy: number;
  medianTimeMs: number | null;
}

export interface AdminUserByIp {
  ipHash: string;
  userCount: number;
  userIds: string[];
  firstSeen: string;
  lastSeen: string;
  totalAttempts: number;
  totalCorrect: number;
  accuracy: number;
}

export interface AdminAttempt {
  id: number;
  userId: string;
  problemType: string;
  difficulty: number;
  timeMs: number;
  correct: boolean;
  createdAt: string;
}

export interface AdminDaily {
  date: string;
  activeUsers: number;
  attempts: number;
  correct: number;
  accuracy: number;
}

export interface AdminSession {
  id: number;
  userId: string;
  startedAt: string;
  endedAt: string | null;
  attempts: number;
  correct: number;
  totalTimeMs: number;
  accuracy: number;
  avgTimeMs: number;
}

export interface AdminImprovementTrend {
  accuracyChange: number;
  speedChange: number;
  recentAccuracy: number;
  earlierAccuracy: number;
  recentAvgTime: number;
  earlierAvgTime: number;
}

export interface AdminSessionsByIp {
  ipHash: string;
  aggregate: {
    totalSessions: number;
    totalAttempts: number;
    totalCorrect: number;
    totalTimeMs: number;
    overallAccuracy: number;
    avgTimePerAttempt: number;
    firstSeen: string;
    lastSeen: string;
  };
  improvementTrend: AdminImprovementTrend | null;
  sessions: AdminSession[];
}

function adminHeaders(key?: string): HeadersInit {
  const h: Record<string, string> = {};
  if (key) h['Authorization'] = `Bearer ${key}`;
  return h;
}

export async function fetchAdminStats(key?: string): Promise<AdminStats> {
  const res = await fetch(`${API_BASE}/admin/stats`, { headers: adminHeaders(key) });
  if (!res.ok) throw new Error(`admin/stats failed: ${res.status}`);
  return res.json();
}

export async function fetchAdminUsers(key?: string, limit = 100, offset = 0): Promise<{ users: AdminUser[]; total: number; uniqueIps: number }> {
  const params = new URLSearchParams({ limit: String(limit), offset: String(offset) });
  const res = await fetch(`${API_BASE}/admin/users?${params}`, { headers: adminHeaders(key) });
  if (!res.ok) throw new Error(`admin/users failed: ${res.status}`);
  return res.json();
}

export async function fetchAdminUsersByIp(key?: string, limit = 100, offset = 0): Promise<{ usersByIp: AdminUserByIp[]; total: number }> {
  const params = new URLSearchParams({ limit: String(limit), offset: String(offset) });
  const res = await fetch(`${API_BASE}/admin/users-by-ip?${params}`, { headers: adminHeaders(key) });
  if (!res.ok) throw new Error(`admin/users-by-ip failed: ${res.status}`);
  return res.json();
}

export async function fetchAdminAttempts(key?: string, limit = 100, offset = 0): Promise<{ attempts: AdminAttempt[]; total: number }> {
  const params = new URLSearchParams({ limit: String(limit), offset: String(offset) });
  const res = await fetch(`${API_BASE}/admin/attempts?${params}`, { headers: adminHeaders(key) });
  if (!res.ok) throw new Error(`admin/attempts failed: ${res.status}`);
  return res.json();
}

export async function fetchAdminDaily(key?: string): Promise<{ daily: AdminDaily[] }> {
  const res = await fetch(`${API_BASE}/admin/daily`, { headers: adminHeaders(key) });
  if (!res.ok) throw new Error(`admin/daily failed: ${res.status}`);
  return res.json();
}

export async function fetchAdminSessionsByIp(ipHash: string, key?: string): Promise<AdminSessionsByIp> {
  const params = new URLSearchParams({ ip: ipHash });
  const res = await fetch(`${API_BASE}/admin/sessions-by-ip?${params}`, { headers: adminHeaders(key) });
  if (!res.ok) throw new Error(`admin/sessions-by-ip failed: ${res.status}`);
  return res.json();
}

export async function deleteAdminUser(userId: string, key?: string): Promise<{ ok: boolean }> {
  const res = await fetch(`${API_BASE}/admin/user/${encodeURIComponent(userId)}`, {
    method: 'DELETE',
    headers: adminHeaders(key),
  });
  if (!res.ok) throw new Error(`admin/delete-user failed: ${res.status}`);
  return res.json();
}
