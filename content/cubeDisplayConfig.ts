// ============================================================================
// CUBE DISPLAY CONFIGURATION
// ============================================================================
// Visual presentation settings for the interactive 3D cube.
// All angle values are in DEGREES for readability — converted to radians
// at export time.
//
// Three-layer "alive float" approach (industry standard):
//   1. Base pose  — tiny static tilt so it's never perfectly orthographic
//   2. Breathing  — very slow oscillation (±0.5°–2°) + small position bob
//   3. Imperfection — each axis uses a different frequency to avoid a
//      mechanical metronome feel
// ============================================================================

const DEG_TO_RAD = Math.PI / 180;

// ═══════════════════════════════════════════════════════════════════════════
// 1. BASE POSE — small static tilt (degrees)
// ═══════════════════════════════════════════════════════════════════════════
// Positive X tilts the top toward the viewer.
// Positive Y rotates the right side toward the viewer.

const BASE_TILT_X_DEG = 3;
const BASE_TILT_Y_DEG = -5;

// ═══════════════════════════════════════════════════════════════════════════
// 2. BREATHING OSCILLATION — slow back-and-forth (degrees & world units)
// ═══════════════════════════════════════════════════════════════════════════
// Rotation amplitude per axis — how far the breathing rocks the cube.
// Position amplitude — how far the cube bobs / sways (Three.js world units).

const BREATHING_ROT_X_DEG = 1.2;   // ±1.2° pitch oscillation
const BREATHING_ROT_Y_DEG = 1.5;   // ±1.5° yaw oscillation
const BREATHING_ROT_Z_DEG = 0.6;   // ±0.6° roll oscillation

const BREATHING_BOB_Y = 0.04;      // vertical bob amplitude (world units)
const BREATHING_SWAY_X = 0.02;     // horizontal sway amplitude (world units)

// ═══════════════════════════════════════════════════════════════════════════
// 3. IMPERFECTION — per-axis frequencies (the magic sauce)
// ═══════════════════════════════════════════════════════════════════════════
// Each axis oscillates at a *different* frequency so the motion never
// repeats in a noticeable cycle. Values are in Hz (cycles per second).
// Keeping them irrational-ish relative to each other avoids patterns.

const FREQ_ROT_X = 0.13;     // slow pitch
const FREQ_ROT_Y = 0.09;     // slower yaw
const FREQ_ROT_Z = 0.17;     // slightly faster roll
const FREQ_BOB_Y = 0.11;     // vertical bob
const FREQ_SWAY_X = 0.07;    // horizontal sway

// Secondary harmonic layer — small additional wave at a different rate.
// Blend controls how much of the secondary wave is mixed in (0–1).
const SECONDARY_BLEND = 0.3;
const FREQ_ROT_X_2 = 0.29;
const FREQ_ROT_Y_2 = 0.23;
const FREQ_ROT_Z_2 = 0.37;
const FREQ_BOB_Y_2 = 0.31;
const FREQ_SWAY_X_2 = 0.19;

// Phase offsets so axes don't all start at sin(0) together (radians).
const PHASE_ROT_X = 0.0;
const PHASE_ROT_Y = 1.8;
const PHASE_ROT_Z = 3.7;
const PHASE_BOB_Y = 0.9;
const PHASE_SWAY_X = 2.5;

// ═══════════════════════════════════════════════════════════════════════════
// EXPORTED CONFIG (all in radians / world units, ready for the render loop)
// ═══════════════════════════════════════════════════════════════════════════

export const cubeDisplayConfig = {
  // -- Base pose --
  baseTiltX: BASE_TILT_X_DEG * DEG_TO_RAD,
  baseTiltY: BASE_TILT_Y_DEG * DEG_TO_RAD,

  // -- Breathing amplitudes --
  breathRotX: BREATHING_ROT_X_DEG * DEG_TO_RAD,
  breathRotY: BREATHING_ROT_Y_DEG * DEG_TO_RAD,
  breathRotZ: BREATHING_ROT_Z_DEG * DEG_TO_RAD,
  breathBobY: BREATHING_BOB_Y,
  breathSwayX: BREATHING_SWAY_X,

  // -- Frequencies (Hz) --
  freqRotX: FREQ_ROT_X,
  freqRotY: FREQ_ROT_Y,
  freqRotZ: FREQ_ROT_Z,
  freqBobY: FREQ_BOB_Y,
  freqSwayX: FREQ_SWAY_X,

  // -- Secondary harmonics --
  secondaryBlend: SECONDARY_BLEND,
  freqRotX2: FREQ_ROT_X_2,
  freqRotY2: FREQ_ROT_Y_2,
  freqRotZ2: FREQ_ROT_Z_2,
  freqBobY2: FREQ_BOB_Y_2,
  freqSwayX2: FREQ_SWAY_X_2,

  // -- Phase offsets --
  phaseRotX: PHASE_ROT_X,
  phaseRotY: PHASE_ROT_Y,
  phaseRotZ: PHASE_ROT_Z,
  phaseBobY: PHASE_BOB_Y,
  phaseSwayX: PHASE_SWAY_X,
} as const;
