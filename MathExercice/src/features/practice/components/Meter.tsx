import { memo } from 'react';

interface MeterProps {
  correct: number;
  total: number;
}


const Meter = memo(function Meter({ correct, total }: MeterProps) {
  const pct = Math.min((correct / total) * 100, 100);
  const done = pct >= 100;


  const size = 84;
  const sw = 7;
  const r = (size - sw) / 2;
  const circ = r * 2 * Math.PI;
  const offset = circ - (pct / 100) * circ;

  return (
    <div className={`meter-ring-wrapper ${done ? 'meter-complete' : ''}`}>
      <svg
        className="meter-ring"
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
      >
        <circle
          className="meter-ring-track"
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          strokeWidth={sw}
        />
        <circle
          className="meter-ring-progress"
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          strokeWidth={sw}
          strokeDasharray={circ}
          strokeDashoffset={offset}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </svg>
      <div className="meter-ring-content">
        <span className="meter-ring-value">{correct}</span>
        <span className="meter-ring-divider">/</span>
        <span className="meter-ring-total">{total}</span>
      </div>
      {done && <span className="meter-done-dot" />}
    </div>
  );
});

export default Meter;
