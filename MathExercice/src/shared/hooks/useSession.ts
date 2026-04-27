import { useEffect, useRef, useCallback } from 'react';
import { startSession, endSession, updateSession } from '../api';

interface SessionStats {
  attempts: number;
  correct: number;
  totalTimeMs: number;
}

// tracks a session lifecycle: start on mount, heartbeat every 15s,
// end on tab close or visibility change.
export function useSession(userId: string | null) {
  const sessionIdRef = useRef<number | null>(null);
  const statsRef = useRef<SessionStats>({ attempts: 0, correct: 0, totalTimeMs: 0 });
  const isInitialized = useRef(false);

  useEffect(() => {
    if (!userId || isInitialized.current) return;

    isInitialized.current = true;

    startSession(userId)
      .then((id) => {
        sessionIdRef.current = id;
      })
      .catch(() => {});

    const updateInterval = setInterval(() => {
      if (sessionIdRef.current && statsRef.current.attempts > 0) {
        updateSession(
          sessionIdRef.current,
          statsRef.current.attempts,
          statsRef.current.correct,
          statsRef.current.totalTimeMs
        );
      }
    }, 15_000);

    const handleUnload = () => {
      if (sessionIdRef.current) {
        endSession(
          sessionIdRef.current,
          statsRef.current.attempts,
          statsRef.current.correct,
          statsRef.current.totalTimeMs
        );
      }
    };

    // mobile browsers don't always fire beforeunload
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden' && sessionIdRef.current) {
        endSession(
          sessionIdRef.current,
          statsRef.current.attempts,
          statsRef.current.correct,
          statsRef.current.totalTimeMs
        );
        sessionIdRef.current = null;
        isInitialized.current = false;
      } else if (document.visibilityState === 'visible' && !sessionIdRef.current && userId) {
        startSession(userId)
          .then((id) => {
            sessionIdRef.current = id;
            statsRef.current = { attempts: 0, correct: 0, totalTimeMs: 0 };
          })
          .catch(() => {});
      }
    };

    window.addEventListener('beforeunload', handleUnload);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      clearInterval(updateInterval);
      window.removeEventListener('beforeunload', handleUnload);
      document.removeEventListener('visibilitychange', handleVisibilityChange);

      if (sessionIdRef.current) {
        endSession(
          sessionIdRef.current,
          statsRef.current.attempts,
          statsRef.current.correct,
          statsRef.current.totalTimeMs
        );
      }
    };
  }, [userId]);

  const recordAttempt = useCallback((isCorrect: boolean, timeMs: number) => {
    statsRef.current.attempts += 1;
    if (isCorrect) {
      statsRef.current.correct += 1;
    }
    statsRef.current.totalTimeMs += timeMs;

    if (sessionIdRef.current) {
      updateSession(
        sessionIdRef.current,
        statsRef.current.attempts,
        statsRef.current.correct,
        statsRef.current.totalTimeMs,
      );
    }
  }, []);

  return { recordAttempt };
}
