export function clamp(n, min = 0, max = 1) {
  return Math.min(max, Math.max(min, n));
}

export function number(value, fallback = 0) {
  if (value === null || value === undefined || value === '') return fallback;
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

// Canonical render presets per tier — single source of truth.
// knowledge-base.js and recommender.js both import from here.
export const PRESETS = {
  0: {
    pixelRatio: 0.5,
    maxTextureSize: 512,
    shadowsEnabled: false,
    fireflyCount: 0,
    antialias: false,
    toneMapping: 'Linear',
    toneMappingExposure: 1.0,
  },
  1: {
    pixelRatio: 0.75,
    maxTextureSize: 1024,
    shadowsEnabled: false,
    fireflyCount: 80,
    antialias: false,
    toneMapping: 'Linear',
    toneMappingExposure: 1.35,
  },
  2: {
    pixelRatio: 1.0,
    maxTextureSize: 2048,
    shadowsEnabled: false,
    fireflyCount: 200,
    antialias: true,
    toneMapping: 'ACESFilmic',
    toneMappingExposure: 1.55,
  },
  3: {
    pixelRatio: 1.5,
    maxTextureSize: 4096,
    shadowsEnabled: true,
    fireflyCount: 380,
    antialias: true,
    toneMapping: 'ACESFilmic',
    toneMappingExposure: 1.6,
  },
};
