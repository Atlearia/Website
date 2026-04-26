import { useEffect, useRef, useCallback } from 'react';
import { startSession, endSession, updateSession } from '../api';

interface SessionStats {
  attempts: number;
  correct: number;
  totalTimeMs: number;
}

/**
 * Custom hook to track user sessions.
 * Starts a session when mounted, updates periodically, and ends on page close.
 */
export function useSession(userId: string | null) {
  const sessionIdRef = useRef<number | null>(null);
  const statsRef = useRef<SessionStats>({ attempts: 0, correct: 0, totalTimeMs: 0 });
  const isInitialized = useRef(false);

  // Start session when userId becomes available
  useEffect(() => {
    if (!userId || isInitialized.current) return;

    isInitialized.current = true;

    startSession(userId)
      .then((id) => {
        sessionIdRef.current = id;
        console.log('[Session] Started:', id);
      })
      .catch((err) => {
        console.warn('[Session] Failed to start:', err);
      });

    // Set up periodic updates (every 15 seconds)
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

    // End session on page unload
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

    // Handle visibility change (mobile browsers may not fire beforeunload)
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden' && sessionIdRef.current) {
        endSession(
          sessionIdRef.current,
          statsRef.current.attempts,
          statsRef.current.correct,
          statsRef.current.totalTimeMs
        );
        // Start a new session when they come back
        sessionIdRef.current = null;
        isInitialized.current = false;
      } else if (document.visibilityState === 'visible' && !sessionIdRef.current && userId) {
        // Restart session when page becomes visible again
        startSession(userId)
          .then((id) => {
            sessionIdRef.current = id;
            // Reset stats for new session
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

      // End session on unmount
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

  // Function to record an attempt
  const recordAttempt = useCallback((isCorrect: boolean, timeMs: number) => {
    statsRef.current.attempts += 1;
    if (isCorrect) {
      statsRef.current.correct += 1;
    }
    statsRef.current.totalTimeMs += timeMs;

    // Push update to server immediately so session stats stay current
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
