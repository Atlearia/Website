//idle animation
// ============================================================================
// CUBE BREATHING ANIMATION HOOK
// ============================================================================
// Industry-standard "alive float" motion for the 3D cube, driven entirely
// by values defined in content/cubeDisplayConfig.ts.
//
// Three layers combined every frame:
//   1. Base pose    — constant tiny tilt (from config)
//   2. Breathing    — slow sinusoidal oscillation on rotation + position
//   3. Imperfection — each axis has its own frequency + a secondary
//                     harmonic blended in, plus unique phase offsets,
//                     so no two axes ever sync into a mechanical pattern
//
// The hook smoothly blends the oscillation out while dragging and back in
// when released, so there's no pop.
//
// Integration:
//   - Base tilt is returned as constants (no per-frame cost in the hook).
//   - Oscillation offsets are written to refs every frame.
//   - The consuming component sums them onto rotation/position.
// ============================================================================

import { useRef, useCallback } from 'react';
import { cubeDisplayConfig as cfg } from '@/content/cubeDisplayConfig';

const TWO_PI = Math.PI * 2;

// ── Public interface ────────────────────────────────────────────────────────

export interface CubeBreathingValues {
  /** Constant base-pose tilt on X (radians). */
  baseTiltX: number;
  /** Constant base-pose tilt on Y (radians). */
  baseTiltY: number;

  /** Per-frame oscillation rotation offsets. */
  rotX: React.MutableRefObject<number>;
  rotY: React.MutableRefObject<number>;
  rotZ: React.MutableRefObject<number>;

  /** Per-frame oscillation position offsets. */
  posY: React.MutableRefObject<number>;
  posX: React.MutableRefObject<number>;

  /** Call once per frame. `active` = false while the user is dragging. */
  update: (delta: number, active: boolean) => void;
}

// ── Hook ────────────────────────────────────────────────────────────────────

export function useCubeBreathing(): CubeBreathingValues {
  const time = useRef(0);

  // Output refs — written every frame, read by the consumer.
  const rotX = useRef(0);
  const rotY = useRef(0);
  const rotZ = useRef(0);
  const posY = useRef(0);
  const posX = useRef(0);

  // Smooth blend factor (0 = frozen, 1 = full breathing).
  const blend = useRef(0);
  const BLEND_SPEED = 2; // seconds⁻¹ — how fast the blend ramps

  const update = useCallback((delta: number, active: boolean) => {
    // Always advance the clock so phases don't jump on resume.
    time.current += delta;
    const t = time.current;

    // Smoothly ramp blend toward 1 (active) or 0 (dragging).
    const target = active ? 1 : 0;
    blend.current += (target - blend.current) * Math.min(BLEND_SPEED * delta, 1);
    const b = blend.current;

    // Helper: primary + secondary harmonic blend.
    const wave = (freq1: number, freq2: number, phase: number): number => {
      const primary   = Math.sin(TWO_PI * freq1 * t + phase);
      const secondary = Math.sin(TWO_PI * freq2 * t + phase * 1.7);
      return primary * (1 - cfg.secondaryBlend) + secondary * cfg.secondaryBlend;
    };

    // Rotation oscillation (radians).
    rotX.current = b * cfg.breathRotX * wave(cfg.freqRotX, cfg.freqRotX2, cfg.phaseRotX);
    rotY.current = b * cfg.breathRotY * wave(cfg.freqRotY, cfg.freqRotY2, cfg.phaseRotY);
    rotZ.current = b * cfg.breathRotZ * wave(cfg.freqRotZ, cfg.freqRotZ2, cfg.phaseRotZ);

    // Position oscillation (world units).
    posY.current = b * cfg.breathBobY * wave(cfg.freqBobY, cfg.freqBobY2, cfg.phaseBobY);
    posX.current = b * cfg.breathSwayX * wave(cfg.freqSwayX, cfg.freqSwayX2, cfg.phaseSwayX);
  }, []);

  return {
    baseTiltX: cfg.baseTiltX,
    baseTiltY: cfg.baseTiltY,
    rotX,
    rotY,
    rotZ,
    posY,
    posX,
    update,
  };
}
