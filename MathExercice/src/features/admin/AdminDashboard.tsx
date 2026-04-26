import { useState, useEffect, useCallback } from 'react';
import {
  fetchAdminStats,
  fetchAdminUsers,
  fetchAdminUsersByIp,
  fetchAdminDaily,
  fetchAdminAttempts,
  fetchAdminSessionsByIp,
  type AdminStats,
  type AdminUser,
  type AdminUserByIp,
  type AdminDaily,
  type AdminAttempt,
  type AdminSessionsByIp,
} from '../../shared/api';

export default function AdminDashboard() {
  const [adminKey, setAdminKey] = useState(() => sessionStorage.getItem('adminKey') ?? '');
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [usersByIp, setUsersByIp] = useState<AdminUserByIp[]>([]);
  const [daily, setDaily] = useState<AdminDaily[]>([]);
  const [attempts, setAttempts] = useState<AdminAttempt[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'byIp' | 'attempts'>('overview');
  
  // IP detail modal state
  const [selectedIp, setSelectedIp] = useState<string | null>(null);
  const [ipDetails, setIpDetails] = useState<AdminSessionsByIp | null>(null);
  const [ipLoading, setIpLoading] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [statsData, usersData, usersByIpData, dailyData, attemptsData] = await Promise.all([
        fetchAdminStats(adminKey || undefined),
        fetchAdminUsers(adminKey || undefined, 50),
        fetchAdminUsersByIp(adminKey || undefined, 50),
        fetchAdminDaily(adminKey || undefined),
        fetchAdminAttempts(adminKey || undefined, 50),
      ]);
      setStats(statsData);
      setUsers(usersData.users);
      setUsersByIp(usersByIpData.usersByIp);
      setDaily(dailyData.daily);
      setAttempts(attemptsData.attempts);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  }, [adminKey]);

  const loadIpDetails = useCallback(async (ip: string) => {
    setSelectedIp(ip);
    setIpLoading(true);
    setIpDetails(null);
    try {
      const data = await fetchAdminSessionsByIp(ip, adminKey || undefined);
      setIpDetails(data);
    } catch (err) {
      console.error('Failed to load IP details:', err);
    } finally {
      setIpLoading(false);
    }
  }, [adminKey]);

  const closeModal = () => {
    setSelectedIp(null);
    setIpDetails(null);
  };

  // Only auto-load when adminKey is set (e.g. from sessionStorage)
  useEffect(() => {
    if (adminKey) loadData();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const formatDate = (iso: string) => {
    return new Date(iso).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatShortDate = (iso: string) => {
    return new Date(iso).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
    });
  };

  const formatTime = (ms: number) => {
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(1)}s`;
  };

  const difficultyLabel = (d: number | string) => {
    const map: Record<string, string> = { '1': '1\u00d71', '2': '1\u00d72', '3': '2\u00d72' };
    return map[String(d)] ?? String(d);
  };

  const typeLabel = (t: string) => {
    const map: Record<string, string> = {
      add: 'Addition', sub: 'Subtraction', mul: 'Multiplication', mix: 'Mixed',
    };
    return map[t] ?? t;
  };

  const formatDuration = (ms: number) => {
    const mins = Math.floor(ms / 60000);
    if (mins < 1) return '<1 min';
    if (mins < 60) return `${mins} min`;
    const hrs = Math.floor(mins / 60);
    return `${hrs}h ${mins % 60}m`;
  };

  return (
    <div className="admin-dashboard">
      <header className="admin-header">
        <h1>📊 Admin Dashboard</h1>
        <div className="admin-controls">
          <input
            type="password"
            placeholder="Enter admin key"
            value={adminKey}
            onChange={(e) => {
              setAdminKey(e.target.value);
              sessionStorage.setItem('adminKey', e.target.value);
            }}
            className="admin-key-input"
          />
          <button onClick={loadData} disabled={loading} className="admin-refresh-btn">
            {loading ? '⏳' : '🔄'} Refresh
          </button>
          <a href="/" className="admin-back-link">← Back to App</a>
        </div>
      </header>

      {error && <div className="admin-error">{error}</div>}

      {stats && (
        <div className="admin-stats-grid">
          <div className="admin-stat-card">
            <span className="admin-stat-value">{stats.totalUsers}</span>
            <span className="admin-stat-label">Total Users</span>
          </div>
          <div className="admin-stat-card accent">
            <span className="admin-stat-value">{stats.uniqueIps}</span>
            <span className="admin-stat-label">Unique Identities</span>
          </div>
          <div className="admin-stat-card">
            <span className="admin-stat-value">{stats.totalAttempts}</span>
            <span className="admin-stat-label">Total Attempts</span>
          </div>
          <div className="admin-stat-card">
            <span className="admin-stat-value">{stats.overallAccuracy}%</span>
            <span className="admin-stat-label">Overall Accuracy</span>
          </div>
          <div className="admin-stat-card highlight">
            <span className="admin-stat-value">{stats.activeIps24h}</span>
            <span className="admin-stat-label">Active Identities (24h)</span>
          </div>
          <div className="admin-stat-card highlight">
            <span className="admin-stat-value">{stats.attempts24h}</span>
            <span className="admin-stat-label">Attempts (24h)</span>
          </div>
        </div>
      )}

      <div className="admin-tabs">
        <button
          className={`admin-tab ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          📈 Daily Trend
        </button>
        <button
          className={`admin-tab ${activeTab === 'byIp' ? 'active' : ''}`}
          onClick={() => setActiveTab('byIp')}
        >
          🌐 By Identity
        </button>
        <button
          className={`admin-tab ${activeTab === 'users' ? 'active' : ''}`}
          onClick={() => setActiveTab('users')}
        >
          👥 All Users
        </button>
        <button
          className={`admin-tab ${activeTab === 'attempts' ? 'active' : ''}`}
          onClick={() => setActiveTab('attempts')}
        >
          📝 Recent Attempts
        </button>
      </div>

      <div className="admin-content">
        {activeTab === 'overview' && (
          <div className="admin-daily-chart">
            <h3>Last 30 Days</h3>
            <div className="admin-chart-container">
              {daily.map((d) => {
                const maxAttempts = Math.max(1, ...daily.map((x) => x.attempts));
                const barH = (d.attempts / maxAttempts) * 100;
                return (
                  <div
                    key={d.date}
                    className="admin-chart-bar"
                    title={`${formatShortDate(d.date)}: ${d.attempts} attempts, ${d.accuracy}% accuracy, ${d.activeUsers} users`}
                  >
                    <div className="admin-bar-fill" style={{ height: `${barH}%` }}>
                      <span className="admin-bar-value">{d.attempts}</span>
                    </div>
                    <span className="admin-bar-label">{formatShortDate(d.date)}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {activeTab === 'byIp' && (
          <div className="admin-table-wrapper">
            <p className="admin-table-hint">
              Click on an identity hash to view session history and improvement over time.
              Hashes are privacy-preserving — raw IPs are never stored.
            </p>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Identity (hash prefix)</th>
                  <th>User IDs</th>
                  <th>Last Seen</th>
                  <th>Attempts</th>
                  <th>Correct</th>
                  <th>Accuracy</th>
                </tr>
              </thead>
              <tbody>
                {usersByIp.map((u) => (
                  <tr 
                    key={u.ipHash} 
                    className="clickable-row"
                    onClick={() => u.ipHash !== 'unknown' && loadIpDetails(u.ipHash)}
                  >
                    <td className="admin-ip-cell">
                      <span className="admin-ip clickable">{u.ipHash === 'unknown' ? '—' : u.ipHash}</span>
                      {u.userCount > 1 && (
                        <span className="admin-badge">{u.userCount} IDs</span>
                      )}
                    </td>
                    <td className="admin-user-ids">
                      {u.userIds.slice(0, 3).map((id) => (
                        <span key={id} className="admin-mini-id" title={id}>{id.slice(0, 6)}</span>
                      ))}
                      {u.userIds.length > 3 && <span className="admin-more">+{u.userIds.length - 3}</span>}
                    </td>
                    <td>{formatDate(u.lastSeen)}</td>
                    <td>{u.totalAttempts}</td>
                    <td>{u.totalCorrect}</td>
                    <td>{u.accuracy}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'users' && (
          <div className="admin-table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>User ID</th>
                  <th>Identity Hash</th>
                  <th>Last Seen</th>
                  <th>Attempts</th>
                  <th>Correct</th>
                  <th>Accuracy</th>
                  <th>Median Time</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id}>
                    <td className="admin-user-id" title={u.id}>{u.id.slice(0, 8)}…</td>
                    <td className="admin-ip-small">{u.ipHash || '—'}</td>
                    <td>{formatDate(u.lastSeen)}</td>
                    <td>{u.attempts}</td>
                    <td>{u.correct}</td>
                    <td>{u.accuracy}%</td>
                    <td>{u.medianTimeMs ? `${u.medianTimeMs}ms` : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'attempts' && (
          <div className="admin-table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Time</th>
                  <th>User</th>
                  <th>Type</th>
                  <th>Difficulty</th>
                  <th>Time (ms)</th>
                  <th>Result</th>
                </tr>
              </thead>
              <tbody>
                {attempts.map((a) => (
                  <tr key={a.id} className={a.correct ? 'correct-row' : 'incorrect-row'}>
                    <td>{formatDate(a.createdAt)}</td>
                    <td className="admin-user-id" title={a.userId}>{a.userId.slice(0, 8)}…</td>
                    <td><span className="admin-type-badge">{typeLabel(a.problemType)}</span></td>
                    <td><span className="admin-diff-badge">{difficultyLabel(a.difficulty)}</span></td>
                    <td>{formatTime(a.timeMs)}</td>
                    <td>{a.correct ? '✅' : '❌'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* IP Detail Modal */}
      {selectedIp && (
        <div className="admin-modal-overlay" onClick={closeModal}>
          <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
            <header className="admin-modal-header">
              <div className="admin-modal-title">
                <span className="admin-modal-ip">{ipDetails?.ipHash ?? selectedIp}</span>
                <span className="admin-modal-subtitle">
                  {ipDetails ? `${ipDetails.aggregate.totalSessions} sessions` : 'Loading...'}
                </span>
              </div>
              <button className="admin-modal-close" onClick={closeModal}>✕</button>
            </header>

            {ipLoading && (
              <div className="admin-modal-loading">
                <div className="admin-spinner" />
                <span>Loading session data...</span>
              </div>
            )}

            {ipDetails && (
              <div className="admin-modal-content">
                {/* Aggregate Stats */}
                <div className="admin-ip-stats">
                  <div className="admin-ip-stat">
                    <span className="admin-ip-stat-icon">📋</span>
                    <span className="admin-ip-stat-value">{ipDetails.aggregate.totalSessions}</span>
                    <span className="admin-ip-stat-label">Sessions</span>
                  </div>
                  <div className="admin-ip-stat">
                    <span className="admin-ip-stat-icon">🎯</span>
                    <span className="admin-ip-stat-value">{ipDetails.aggregate.totalAttempts}</span>
                    <span className="admin-ip-stat-label">Attempts</span>
                  </div>
                  <div className="admin-ip-stat">
                    <span className="admin-ip-stat-icon">✅</span>
                    <span className="admin-ip-stat-value">{ipDetails.aggregate.overallAccuracy}%</span>
                    <span className="admin-ip-stat-label">Accuracy</span>
                  </div>
                  <div className="admin-ip-stat">
                    <span className="admin-ip-stat-icon">⚡</span>
                    <span className="admin-ip-stat-value">{formatTime(ipDetails.aggregate.avgTimePerAttempt)}</span>
                    <span className="admin-ip-stat-label">Avg Speed</span>
                  </div>
                </div>

                {/* Improvement Trend */}
                {ipDetails.improvementTrend && (
                  <div className="admin-improvement-card">
                    <h3>Improvement Analysis</h3>
                    <p className="admin-improvement-hint">Recent sessions vs earlier sessions</p>
                    <div className="admin-improvement-grid">
                      <div className={`admin-improvement-item ${ipDetails.improvementTrend.accuracyChange >= 0 ? 'positive' : 'negative'}`}>
                        <span className="admin-improvement-change">
                          {ipDetails.improvementTrend.accuracyChange >= 0 ? '+' : ''}{ipDetails.improvementTrend.accuracyChange}%
                        </span>
                        <span className="admin-improvement-label">Accuracy</span>
                        <div className="admin-improvement-detail">
                          <span>{ipDetails.improvementTrend.earlierAccuracy}%</span>
                          <span className="admin-arrow">→</span>
                          <span>{ipDetails.improvementTrend.recentAccuracy}%</span>
                        </div>
                      </div>
                      <div className={`admin-improvement-item ${ipDetails.improvementTrend.speedChange >= 0 ? 'positive' : 'negative'}`}>
                        <span className="admin-improvement-change">
                          {ipDetails.improvementTrend.speedChange >= 0 ? '−' : '+'}{formatTime(Math.abs(ipDetails.improvementTrend.speedChange))}
                        </span>
                        <span className="admin-improvement-label">Speed</span>
                        <div className="admin-improvement-detail">
                          <span>{formatTime(ipDetails.improvementTrend.earlierAvgTime)}</span>
                          <span className="admin-arrow">→</span>
                          <span>{formatTime(ipDetails.improvementTrend.recentAvgTime)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Session History Chart */}
                {ipDetails.sessions.length > 0 && (
                  <div className="admin-sessions-chart">
                    <h3>Session Performance</h3>
                    <div className="admin-sessions-bars">
                      {[...ipDetails.sessions].reverse().map((s, i) => {
                        const maxAttempts = Math.max(1, ...ipDetails.sessions.map(x => x.attempts));
                        const barH = Math.max(6, (s.attempts / maxAttempts) * 100);
                        const hue = Math.min(s.accuracy * 1.2, 120);
                        return (
                          <div
                            key={s.id}
                            className="admin-session-bar"
                            title={`Session ${i + 1}: ${s.attempts} attempts, ${s.accuracy}% accuracy, avg ${formatTime(s.avgTimeMs)}`}
                          >
                            <div
                              className="admin-session-bar-fill"
                              style={{
                                height: `${barH}%`,
                                background: `linear-gradient(to top, hsl(${hue}, 65%, 48%), hsl(${hue}, 65%, 62%))`,
                              }}
                            >
                              {s.attempts > 2 && <span className="admin-session-accuracy">{s.accuracy}%</span>}
                            </div>
                            <span className="admin-session-label">#{i + 1}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Session Cards */}
                <div className="admin-sessions-list">
                  <h3>All Sessions</h3>
                  {[...ipDetails.sessions].reverse().map((s, i) => {
                    const durationMs = s.endedAt
                      ? new Date(s.endedAt).getTime() - new Date(s.startedAt).getTime()
                      : 0;
                    const accClass = s.accuracy >= 80 ? 'acc-high' : s.accuracy >= 50 ? 'acc-mid' : 'acc-low';
                    return (
                      <div key={s.id} className="admin-session-card">
                        <div className="admin-session-card-num">#{i + 1}</div>
                        <div className="admin-session-card-body">
                          <div className="admin-session-card-top">
                            <span className="admin-session-date">{formatDate(s.startedAt)}</span>
                            {durationMs > 0 && <span className="admin-session-dur">{formatDuration(durationMs)}</span>}
                          </div>
                          <div className="admin-session-card-stats">
                            <span className="admin-session-stat">
                              <strong>{s.attempts}</strong> attempts
                            </span>
                            <span className="admin-session-stat">
                              <strong>{s.correct}</strong> correct
                            </span>
                            <span className={`admin-session-stat ${accClass}`}>
                              <strong>{s.accuracy}%</strong> accuracy
                            </span>
                            <span className="admin-session-stat">
                              <strong>{formatTime(s.avgTimeMs)}</strong> avg
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
