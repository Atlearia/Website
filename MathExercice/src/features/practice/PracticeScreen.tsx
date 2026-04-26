import { usePracticeState } from './state/usePracticeState';
import ProblemCard from './components/ProblemCard';
import Meter from './components/Meter';
import Settings from './components/Settings';
import Confetti from './components/Confetti';
import ConsentGate from './components/ConsentGate';
import { useState } from 'react';

export default function PracticeScreen() {
  const {
    mode, soundOn, goal, mulFocus, difficulty,
    correct, streak, completed, problem, showConfetti,
    anonUserId, goalOptions, hasConsent,
    handleCorrect, handleIncorrect, handleReset, handleModeChange, handleRestart,
    setSoundOn, setGoal, setMulFocus, setDifficulty, grantConsent, revokeConsent,
  } = usePracticeState();

  // null = hasn't decided yet, true/false = decided
  const [consentShown, setConsentShown] = useState(!hasConsent && hasConsent !== false);

  // show consent gate if user hasnt made a choice yet
  // hasConsent is null on first visit
  if (hasConsent === null) {
    return (
      <main className="app-container fade-in">
        <h1 className="app-title">Math Practice</h1>
        <ConsentGate
          onAccept={() => {
            grantConsent();
            setConsentShown(false);
          }}
          onDecline={() => {
            revokeConsent();
            setConsentShown(false);
          }}
        />
      </main>
    );
  }

  return (
    <>
      <Confetti active={showConfetti} />

      <main className="app-container fade-in">
        <h1 className="app-title">Math Practice</h1>

        <Settings
          mode={mode}
          setMode={handleModeChange}
          soundOn={soundOn}
          setSoundOn={setSoundOn}
          onReset={handleReset}
          goal={goal}
          setGoal={setGoal}
          goalOptions={goalOptions}
          mulFocus={mulFocus}
          setMulFocus={setMulFocus}
          difficulty={difficulty}
          setDifficulty={setDifficulty}
        />

        <div className="main-layout">
          <div className="game-area">
            {/* equation + input */}
            <div className="card-side">
              {completed ? (
                <div className="celebration">
                  <div className="celebration-icon">Done!</div>
                  <h2>{goal} / {goal}</h2>
                  <p>Nice work.</p>
                  <button className="restart-btn" onClick={handleRestart}>
                    Play Again
                  </button>
                </div>
              ) : (
                <ProblemCard
                  problem={problem}
                  onCorrect={handleCorrect}
                  onIncorrect={handleIncorrect}
                  disabled={completed}
                />
              )}
              <div className="streak">
                Streak: <strong>{streak}</strong>
              </div>
            </div>

            {/* progress ring */}
            <Meter correct={correct} total={goal} />
          </div>
        </div>
      </main>

      <footer className="app-footer">
        <p>
          {hasConsent
            ? <>Anonymized usage data is collected. <a href="#privacy">Data collection notice</a> &middot; <a href="#" onClick={(e) => { e.preventDefault(); revokeConsent(); }}>Withdraw consent</a></>
            : <>No data is being collected. <a href="#" onClick={(e) => { e.preventDefault(); grantConsent(); window.location.reload(); }}>Enable tracking</a> &middot; <a href="#privacy">Data collection notice</a></>
          }
        </p>
      </footer>
    </>
  );
}
