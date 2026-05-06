const TONE_MAPPING = {
  Linear: 1,
  Reinhard: 2,
  Cineon: 3,
  ACESFilmic: 4,
};

export function adaptForThreeJS(recommendation) {
  const s = recommendation.settings;
  const tier = recommendation.tier;
  const devicePixelRatio = typeof window === 'undefined' ? 1 : window.devicePixelRatio || 1;

  return {
    renderer: {
      pixelRatio: Math.min(s.pixelRatio, devicePixelRatio),
      antialias: s.antialias,
      powerPreference: tier >= 2 ? 'high-performance' : 'default',
      toneMapping: TONE_MAPPING[s.toneMapping] || TONE_MAPPING.ACESFilmic,
      toneMappingExposure: s.toneMappingExposure,
      shadowMapEnabled: s.shadowsEnabled,
    },
    textures: {
      maxSize: s.maxTextureSize,
    },
    particles: {
      fireflyCount: s.fireflyCount,
    },
    shouldLoadModel: tier > 0,
    tier,
  };
}

export function applyToRenderer(renderer, adapted) {
  const r = adapted.renderer;
  renderer.setPixelRatio(r.pixelRatio);
  renderer.toneMapping = r.toneMapping;
  renderer.toneMappingExposure = r.toneMappingExposure;
  renderer.shadowMap.enabled = r.shadowMapEnabled;
}
