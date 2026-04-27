import { useState } from 'react';

interface ConsentGateProps {
  onAccept: () => void;
  onDecline: () => void;
}


export default function ConsentGate({ onAccept, onDecline }: ConsentGateProps) {
  const [checked, setChecked] = useState(false);

  return (
    <div className="consent-gate fade-in">
      <div className="consent-card">
        <h2>Before you start</h2>
        <p>
          This app can track your practice sessions anonymously to show you
          how you're improving over time. No personal info is collected — just
          which problems you try, whether you got them right, and how long
          each one took.
        </p>
        <p>
          If you'd rather not have any data collected, that's fine — the app
          works the same either way. Nothing will be stored.
        </p>

        <div className="consent-checkbox-row">
          <input
            type="checkbox"
            id="consent-check"
            checked={checked}
            onChange={(e) => setChecked(e.target.checked)}
          />
          <label htmlFor="consent-check">
            I consent to the collection of anonymous usage data as described
            in the{' '}
            <a href="#privacy" className="consent-link" style={{ margin: 0, display: 'inline' }}>
              data collection notice
            </a>.
          </label>
        </div>

        <div className="consent-actions">
          <button
            className="consent-btn consent-btn-accept"
            disabled={!checked}
            onClick={onAccept}
          >
            Accept
          </button>
          <button
            className="consent-btn consent-btn-decline"
            onClick={onDecline}
          >
            Decline
          </button>
        </div>

        <div className="consent-declined-note">
          You can change this anytime from the footer of the app.
        </div>
      </div>
    </div>
  );
}
