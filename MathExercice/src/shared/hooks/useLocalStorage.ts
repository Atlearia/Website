import { useState, useEffect } from 'react';

/**
 * A hook that mirrors useState but persists the value in localStorage.
 * Reads the initial value from storage on mount; writes on every change.
 */
export function useLocalStorage<T>(key: string, defaultValue: T) {
  const [value, setValue] = useState<T>(() => {
    try {
      const stored = localStorage.getItem(key);
      return stored !== null ? (JSON.parse(stored) as T) : defaultValue;
    } catch {
      return defaultValue;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // Storage full or unavailable — silently ignore.
    }
  }, [key, value]);

  return [value, setValue] as const;
}

/**
 * Thin helper – plays a short beep via Web Audio API.
 * `type`: 'success' → pleasant high tone, 'error' → low buzz.
 */
export function playSound(type: 'success' | 'error') {
  try {
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    if (type === 'success') {
      osc.frequency.value = 880;
      osc.type = 'sine';
      gain.gain.value = 0.12;
    } else {
      osc.frequency.value = 220;
      osc.type = 'triangle';
      gain.gain.value = 0.10;
    }

    osc.start();
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.18);
    osc.stop(ctx.currentTime + 0.2);
  } catch {
    // Web Audio not available — ignore.
  }
}
