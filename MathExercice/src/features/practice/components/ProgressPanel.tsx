import { useState, useEffect, useCallback } from 'react';
import { fetchProgress, type ProgressData } from '../../../shared/api';

interface ProgressPanelProps {
  userId: string | null;
}

export default function ProgressPanel({ userId }: ProgressPanelProps) {
  const [open, setOpen] = useState(false);
  const [data, setData] = useState<ProgressData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    setError(null);
    try {
      const d = await fetchProgress(userId);
      setData(d);
    } catch (err) {
      setError('Could not load progress');
    } finally {
      setLoading(false);
    }
  }, [userId]);


  useEffect(() => {
    if (open) load();
  }, [open, load]);

  if (!userId) return null;

  return (
    <div className="progress-wrapper">
      <button
        className="progress-toggle"
        onClick={() => setOpen((o) => !o)}
        type="button"
        title="View progress"
        aria-label="Toggle progress panel"
      >
        {open ? 'Hide Progress' : 'Show Progress'}
        <span className={`progress-toggle-arrow ${open ? 'open' : ''}`}>▼</span>
      </button>

      {open && (
        <div className="progress-panel slide-down">
          {loading && <p className="progress-loading">Loading...</p>}
          {error && <p className="progress-error">{error}</p>}
          {data && !loading && <ProgressContent data={data} />}
        </div>
      )}
    </div>
  );
}

function ProgressContent({ data }: { data: ProgressData }) {
  const { totals, medianTimeMs, medianCorrectTimeMs, perDay } = data;
  const maxAttempts = Math.max(1, ...perDay.map((d) => d.attempts));

  return (
    <>
      <div className="progress-stats">
        <StatBox label="Attempts" value={totals.attempts} />
        <StatBox label="Correct" value={totals.correct} />
        <StatBox label="Accuracy" value={`${totals.accuracy}%`} />
        <StatBox label="Median ms" value={medianTimeMs ?? '—'} />
        <StatBox label="Median (correct)" value={medianCorrectTimeMs ?? '—'} />
      </div>

      <h3 className="trend-title">Last 14 days</h3>
      <div className="trend-chart">
        {perDay.map((day) => {
          const barH = day.attempts > 0 ? (day.attempts / maxAttempts) * 100 : 0;
          const lbl = new Date(day.date).toLocaleDateString(undefined, {
            month: 'short',
            day: 'numeric',
          });

          return (
            <div className="trend-bar-col" key={day.date} title={`${lbl}: ${day.attempts} attempts, ${day.accuracy}% accuracy`}>
              <div className="trend-bar-track">
                <div
                  className="trend-bar-fill"
                  style={{ height: `${barH}%` }}
                />
              </div>
              <span className="trend-bar-label">{lbl}</span>
            </div>
          );
        })}
      </div>
    </>
  );
}

function StatBox({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="stat-box">
      <span className="stat-value">{value}</span>
      <span className="stat-label">{label}</span>
    </div>
  );
}
