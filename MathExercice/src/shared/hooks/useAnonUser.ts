import { useState, useEffect } from 'react';
import { registerAnon } from '../api';

const STORAGE_KEY = 'anonUserId';

// manages an anonymous UUID per browser tab.
// only does anything when `enabled` is true (user gave consent).
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
      registerAnon(existing).catch(() => {});
      return;
    }

    const id = crypto.randomUUID();
    localStorage.setItem(STORAGE_KEY, id);
    setUserId(id);

    registerAnon(id).catch(() => {});
  }, [enabled]);

  return userId;
}
