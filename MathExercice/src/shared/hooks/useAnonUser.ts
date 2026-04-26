import { useState, useEffect } from 'react';
import { registerAnon } from '../api';

const STORAGE_KEY = 'anonUserId';

/**
 * Manages an anonymous user UUID.
 * Only activates if `enabled` is true (consent given).
 * When disabled, returns null and doesnt touch localStorage or the backend.
 */
export function useAnonUser(enabled: boolean): string | null {
  const [userId, setUserId] = useState<string | null>(() => {
    if (!enabled) return null;
    return localStorage.getItem(STORAGE_KEY);
  });

  useEffect(() => {
    if (!enabled) {
      setUserId(null);
      return;
    }

    const existing = localStorage.getItem(STORAGE_KEY);

    if (existing) {
      setUserId(existing);
      // update last_seen in the background
      registerAnon(existing).catch(() => {});
      return;
    }

    // generate new UUID and register
    const id = crypto.randomUUID();
    localStorage.setItem(STORAGE_KEY, id);
    setUserId(id);

    registerAnon(id).catch((err) => {
      console.warn('[useAnonUser] registration failed, will retry:', err);
    });
  }, [enabled]);

  return userId;
}
