// ============================================================================
// CUBE ENTRANCE ANIMATION HOOK
// ============================================================================
// Drives a smooth "fly-in from distance with spin" intro when the cube page
// first loads. Returns mutable refs that the render-loop can read every frame
// without causing React re-renders.
//
// Integration: the consuming component applies the returned values as
//   <group position-z={positionZ} scale={scale}>
// and adds `rotationOffset` on top of the regular cube rotation each frame.
// ============================================================================

import { useRef, useCallback } from 'react';

/** Eased progress curve — fast start, gentle ease-out. */
function easeOutExpo(t: number): number {
  return t >= 1 ? 1 : 1 - Math.pow(2, -10 * t);
}

export interface CubeEntranceValues {
  /** Current Z-position offset (starts far, ends at 0). */
  positionZ: React.MutableRefObject<number>;
  /** Current uniform scale (starts at 0, ends at 1). */
  scale: React.MutableRefObject<number>;
  /** Extra rotation-Y offset from the entrance spin (ends at 0). */
  rotationYOffset: React.MutableRefObject<number>;
  /** Extra rotation-X offset from the entrance tilt (ends at 0). */
  rotationXOffset: React.MutableRefObject<number>;
  /** Whether the entrance animation has completed. */
  isComplete: React.MutableRefObject<boolean>;
  /** Call once per frame with the elapsed delta (seconds). */
  update: (delta: number) => void;
}

export interface CubeEntranceOptions {
  /** Total duration of the entrance in seconds (default 1.8). */
  duration?: number;
  /** Starting Z position — how far "behind" the cube begins (default -18). */
  startZ?: number;
  /** Total Y-axis spin during approach in radians (default 2π = one full turn). */
  spinY?: number;
  /** Total X-axis tilt during approach in radians (default π/3). */
  spinX?: number;
  /** Initial delay before animation starts, in seconds (default 0.3). */
  delay?: number;
}

export function useCubeEntrance(options: CubeEntranceOptions = {}): CubeEntranceValues {
  const {
    duration = 1.8,
    startZ = -18,
    spinY = Math.PI * 2,
    spinX = Math.PI / 3,
    delay = 0.3,
  } = options;

  const elapsed = useRef(0);
  const positionZ = useRef(startZ);
  const scale = useRef(0);
  const rotationYOffset = useRef(spinY);
  const rotationXOffset = useRef(spinX);
  const isComplete = useRef(false);

  const update = useCallback(
    (delta: number) => {
      if (isComplete.current) return;

      elapsed.current += delta;

      // Respect delay
      const active = elapsed.current - delay;
      if (active < 0) {
        positionZ.current = startZ;
        scale.current = 0;
        rotationYOffset.current = spinY;
        rotationXOffset.current = spinX;
        return;
      }

      const t = Math.min(active / duration, 1);
      const eased = easeOutExpo(t);

      positionZ.current = startZ * (1 - eased); // startZ → 0
      scale.current = eased;                      // 0 → 1
      rotationYOffset.current = spinY * (1 - eased); // spinY → 0
      rotationXOffset.current = spinX * (1 - eased); // spinX → 0

      if (t >= 1) {
        positionZ.current = 0;
        scale.current = 1;
        rotationYOffset.current = 0;
        rotationXOffset.current = 0;
        isComplete.current = true;
      }
    },
    [duration, startZ, spinY, spinX, delay],
  );

  return { positionZ, scale, rotationYOffset, rotationXOffset, isComplete, update };
}
