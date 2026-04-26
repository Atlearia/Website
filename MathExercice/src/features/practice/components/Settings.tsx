import type { Mode, Difficulty } from '../domain/types';
import { MODES, DIFFICULTIES } from '../domain/practiceConfig';

interface SettingsProps {
  mode: Mode;
  setMode: (m: Mode) => void;
  soundOn: boolean;
  setSoundOn: (v: boolean) => void;
  onReset: () => void;
  goal: number;
  setGoal: (g: number) => void;
  goalOptions: readonly number[];
  mulFocus: number | null;
  setMulFocus: (n: number | null) => void;
  difficulty: Difficulty;
  setDifficulty: (d: Difficulty) => void;
}

export default function Settings({
  mode,
  setMode,
  soundOn,
  setSoundOn,
  onReset,
  goal,
  setGoal,
  goalOptions,
  mulFocus,
  setMulFocus,
  difficulty,
  setDifficulty,
}: SettingsProps) {
  return (
    <div className="settings-bar">
      {/* Mode buttons */}
      <div className="mode-group">
        {MODES.map((m) => (
          <button
            key={m.value}
            className={`mode-btn ${mode === m.value ? 'active' : ''}`}
            onClick={() => setMode(m.value)}
            type="button"
          >
            {m.label}
          </button>
        ))}
      </div>

      {/* Digit difficulty */}
      <div className="goal-group">
        <span className="goal-label">Digits</span>
        <select
          className="goal-select"
          value={difficulty}
          onChange={(e) => setDifficulty(e.target.value as Difficulty)}
        >
          {DIFFICULTIES.map((d) => (
            <option key={d.value} value={d.value}>{d.label}</option>
          ))}
        </select>
      </div>

      {/* Goal */}
      <div className="goal-group">
        <span className="goal-label">Goal</span>
        <select
          className="goal-select"
          value={goal}
          onChange={(e) => setGoal(Number(e.target.value))}
        >
          {goalOptions.map((g) => (
            <option key={g} value={g}>{g}</option>
          ))}
        </select>
      </div>

      {/* Multiply focus */}
      <div className="goal-group">
        <span className="goal-label">Focus</span>
        <select
          className="goal-select"
          value={mulFocus ?? 'all'}
          onChange={(e) => {
            const v = e.target.value;
            setMulFocus(v === 'all' ? null : Number(v));
          }}
        >
          <option value="all">All</option>
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
            <option key={n} value={n}>{n}x</option>
          ))}
        </select>
      </div>

      <div className="settings-right">
        <button
          className="icon-btn"
          onClick={() => setSoundOn(!soundOn)}
          type="button"
          title={soundOn ? 'Sound on' : 'Sound off'}
          aria-label="Toggle sound"
        >
          {soundOn ? 'On' : 'Off'}
        </button>

        <ResetButton onReset={onReset} />
      </div>
    </div>
  );
}

// reset w/ confirmation so ppl don't wipe progress on accident
function ResetButton({ onReset }: { onReset: () => void }) {
  const handleReset = () => {
    if (window.confirm('Reset all progress? This cannot be undone.')) {
      onReset();
    }
  };

  return (
    <button
      className="icon-btn reset-btn"
      onClick={handleReset}
      type="button"
      title="Reset progress"
      aria-label="Reset progress"
    >
      ↺
    </button>
  );
}
