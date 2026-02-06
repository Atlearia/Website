// ============================================================================
// CUBE IDLE FLOAT ANIMATION HOOK
// ============================================================================
// Produces subtle, organic "alive" motion when the cube is at rest.
// Uses layered sine waves at different frequencies and amplitudes to create
// a floating, breathing feeling — position bobbing + very gentle rotation
// oscillation. All values are tiny so the effect is felt, not distracting.
//
// Integration: the consuming component adds the returned offsets on top of
//   the cube's current position & rotation every frame.
// ============================================================================

import { useRef, useCallback } from 'react';

export interface CubeIdleFloatValues {
  /** Small Y-position offset (bobbing up/down). */
  positionY: React.MutableRefObject<number>;
  /** Small X-position offset (gentle sway left/right). */
  positionX: React.MutableRefObject<number>;
  /** Small rotation-X offset. */
  rotationX: React.MutableRefObject<number>;
  /** Small rotation-Y offset. */
  rotationY: React.MutableRefObject<number>;
  /** Small rotation-Z offset (subtle roll). */
  rotationZ: React.MutableRefObject<number>;
  /** Call once per frame with delta (seconds). Active is false while dragging. */
  update: (delta: number, active: boolean) => void;
}

export interface CubeIdleFloatOptions {
  /** Max Y bob amplitude (default 0.06). */
  bobAmplitude?: number;
  /** Max X sway amplitude (default 0.03). */
  swayAmplitude?: number;
  /** Max rotation amplitude in radians (default 0.012). */
  rotAmplitude?: number;
  /** Base oscillation speed multiplier (default 1). */
  speed?: number;
}

export function useCubeIdleFloat(options: CubeIdleFloatOptions = {}): CubeIdleFloatValues {
  const {
    bobAmplitude = 0.06,
    swayAmplitude = 0.03,
    rotAmplitude = 0.012,
    speed = 1,
  } = options;

  const time = useRef(0);

  // Current values — written every frame, read by the consumer.
  const positionY = useRef(0);
  const positionX = useRef(0);
  const rotationX = useRef(0);
  const rotationY = useRef(0);
  const rotationZ = useRef(0);

  // Blend factor so the idle motion fades in/out smoothly when
  // the user starts or stops dragging.
  const blend = useRef(0);
  const BLEND_SPEED = 2.5; // per-second approach speed

  const update = useCallback(
    (delta: number, active: boolean) => {
      // Always advance time so the wave phase doesn't jump.
      time.current += delta * speed;

      // Smoothly ramp blend 0→1 (active) or 1→0 (dragging).
      const target = active ? 1 : 0;
      blend.current += (target - blend.current) * Math.min(BLEND_SPEED * delta, 1);

      const t = time.current;
      const b = blend.current;

      // Layered sine waves for organic motion.
      positionY.current = b * bobAmplitude * (
        Math.sin(t * 0.8) * 0.6 +
        Math.sin(t * 1.3 + 1.2) * 0.4
      );

      positionX.current = b * swayAmplitude * (
        Math.sin(t * 0.6 + 0.5) * 0.7 +
        Math.sin(t * 1.1 + 2.0) * 0.3
      );

      rotationX.current = b * rotAmplitude * (
        Math.sin(t * 0.7 + 0.3) * 0.5 +
        Math.sin(t * 1.4 + 1.0) * 0.5
      );

      rotationY.current = b * rotAmplitude * (
        Math.sin(t * 0.5 + 1.8) * 0.6 +
        Math.sin(t * 1.2 + 0.7) * 0.4
      );

      rotationZ.current = b * rotAmplitude * 0.5 * (
        Math.sin(t * 0.9 + 2.5) * 0.5 +
        Math.sin(t * 1.5 + 0.2) * 0.5
      );
    },
    [bobAmplitude, swayAmplitude, rotAmplitude, speed],
  );

  return { positionY, positionX, rotationX, rotationY, rotationZ, update };
}
