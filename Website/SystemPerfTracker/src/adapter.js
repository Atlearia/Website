// adapter.js
// Translates quality settings from the RAG pipeline into concrete
// Three.js renderer/scene parameters.
//
// This is the bridge between SystemPerfTracker and the actual scene.
// It returns an object that index.html can apply directly to the
// renderer, camera, and particle system.
//
// We use the raw numeric constants for Three.js tone mapping values
// so this module doesn't need to import Three.js directly. Keeps
// the dependency chain clean and makes the module portable.

// Three.js tone mapping constants (from three/src/constants.js)
// using raw numbers means we don't need `import * as THREE` here,
// which avoids issues with the import map only being in scope for
// the parent script
const TONE_MAPPING = {
  'Linear': 1,       // THREE.LinearToneMapping
  'Reinhard': 2,     // THREE.ReinhardToneMapping
  'Cineon': 3,       // THREE.CineonToneMapping
  'ACESFilmic': 4,   // THREE.ACESFilmicToneMapping
};

// takes the recommendation from the RAG pipeline and returns
// ready-to-apply settings
export function adaptForThreeJS(recommendation) {
  const s = recommendation.settings;
  const tier = recommendation.tier;

  return {
    // renderer settings
    renderer: {
      pixelRatio: Math.min(s.pixelRatio, window.devicePixelRatio),
      antialias: s.antialias,
      powerPreference: tier >= 2 ? 'high-performance' : 'default',
      toneMapping: TONE_MAPPING[s.toneMapping] || TONE_MAPPING['ACESFilmic'],
      toneMappingExposure: s.toneMappingExposure,
      shadowMapEnabled: s.shadowsEnabled,
    },

    // texture limits
    textures: {
      maxSize: s.maxTextureSize,
    },

    // particle count for fireflies
    particles: {
      fireflyCount: s.fireflyCount,
    },

    // if tier 0, we might want to skip loading the 3D scene entirely
    // and show a static image fallback
    shouldLoadModel: tier > 0,

    // raw tier for anything else the scene wants to branch on
    tier,
  };
}

// apply the adapted settings to an existing renderer.
// renderer is a THREE.WebGLRenderer instance.
export function applyToRenderer(renderer, adapted) {
  const r = adapted.renderer;
  renderer.setPixelRatio(r.pixelRatio);
  renderer.toneMapping = r.toneMapping;
  renderer.toneMappingExposure = r.toneMappingExposure;
  renderer.shadowMap.enabled = r.shadowMapEnabled;
}
