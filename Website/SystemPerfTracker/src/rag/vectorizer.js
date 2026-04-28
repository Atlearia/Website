// vectorizer.js
// Turns a hardware profile into a numeric feature vector so we can do
// cosine similarity against the knowledge base.
//
// This is the "embedding" step of the RAG pipeline. We're not using a
// neural embedder here because the feature space is small and structured.
// A hand-crafted vector works better for this problem than throwing a
// transformer at it, and it runs in <1ms with zero dependencies.
//
// Feature vector layout (11 dimensions):
//   [0] gpu_brand        0=unknown, 1=intel, 2=amd, 3=nvidia, 4=apple, 5=qualcomm, 6=arm
//   [1] gpu_tier_hint    extracted from GPU string parsing (0-3 rough guess)
//   [2] memory           normalized device memory (0-1 scale, 8GB=1.0)
//   [3] cores            normalized core count (0-1, 16=1.0)
//   [4] device_type      0=desktop, 0.5=tablet, 1=mobile
//   [5] screen_pixels    normalized (width*height*dpr^2, capped at 4K)
//   [6] webgl_version    0=none, 0.5=webgl1, 1=webgl2
//   [7] bench_fps        normalized benchmark fps (0-1, 400=1.0)
//   [8] float_textures   0 or 1
//   [9] max_tex_size     normalized (512=0, 16384=1)
//  [10] connection_score 0=bad, 0.5=ok, 1=good

// weights for each dimension. gpu brand and tier matter most,
// benchmark fps matters a lot, device memory matters some,
// connection speed barely matters for quality but we keep it for
// the full picture
const WEIGHTS = [
  3.0,  // gpu brand
  4.0,  // gpu tier hint
  2.0,  // memory
  1.5,  // cores
  2.5,  // device type
  1.0,  // screen pixels
  1.0,  // webgl version
  3.5,  // bench fps
  0.5,  // float textures
  1.0,  // max texture size
  0.3,  // connection
];

export function vectorize(profile) {
  const vec = new Float32Array(11);

  // [0] gpu brand
  const gpu = (profile.gpu || '').toLowerCase();
  if (gpu.includes('nvidia')) vec[0] = 3;
  else if (gpu.includes('apple')) vec[0] = 4;
  else if (gpu.includes('amd') || gpu.includes('radeon')) vec[0] = 2;
  else if (gpu.includes('qualcomm') || gpu.includes('adreno')) vec[0] = 5;
  else if (gpu.includes('arm') || gpu.includes('mali')) vec[0] = 6;
  else if (gpu.includes('intel')) vec[0] = 1;
  else vec[0] = 0;
  vec[0] /= 6; // normalize to 0-1

  // [1] gpu tier hint from the model name
  vec[1] = extractGpuTierHint(gpu) / 3;

  // [2] memory (bucket: 0.25 to 8)
  vec[2] = Math.min((profile.memory || 2) / 8, 1.0);

  // [3] cores
  vec[3] = Math.min((profile.cores || 2) / 16, 1.0);

  // [4] device type
  const dt = profile.deviceType || 'desktop';
  vec[4] = dt === 'mobile' ? 1.0 : dt === 'tablet' ? 0.5 : 0.0;

  // [5] screen pixels (normalized)
  const sw = profile.screenWidth || 1920;
  const sh = profile.screenHeight || 1080;
  const dpr = profile.pixelRatio || 1;
  const pixels = sw * sh * dpr * dpr;
  const maxPixels = 3840 * 2160 * 4; // 4K at 2x
  vec[5] = Math.min(pixels / maxPixels, 1.0);

  // [6] webgl version
  vec[6] = (profile.webglVersion || 0) / 2;

  // [7] benchmark fps
  vec[7] = Math.min((profile.benchFps || 0) / 400, 1.0);

  // [8] float textures
  vec[8] = profile.floatTextures ? 1 : 0;

  // [9] max texture size
  const maxTex = profile.maxTextureSize || 2048;
  vec[9] = Math.min(Math.max((maxTex - 512) / (16384 - 512), 0), 1);

  // [10] connection quality
  vec[10] = connectionScore(profile.connection);

  // apply weights
  for (let i = 0; i < vec.length; i++) {
    vec[i] *= WEIGHTS[i];
  }

  return vec;
}

// guesses a rough tier from the GPU model string.
// this is fuzzy on purpose. the RAG retrieval corrects mistakes.
function extractGpuTierHint(gpu) {
  if (!gpu) return 1;

  // software renderers = tier 0
  if (gpu.includes('swiftshader') || gpu.includes('llvmpipe')) return 0;

  // nvidia hierarchy
  if (gpu.includes('rtx 40') || gpu.includes('rtx 30')) return 3;
  if (gpu.includes('rtx 20') || gpu.includes('gtx 16')) return 3;
  if (gpu.includes('gtx 10')) return 2;
  if (gpu.includes('gtx 9') || gpu.includes('gtx 7')) return 1;

  // amd hierarchy
  if (gpu.includes('rx 6') || gpu.includes('rx 7')) return 3;
  if (gpu.includes('rx 5')) return 2;
  if (gpu.includes('vega')) return 2;

  // apple silicon
  if (gpu.includes('m1 pro') || gpu.includes('m1 max') || gpu.includes('m2') || gpu.includes('m3')) return 3;
  if (gpu.includes('m1')) return 2;
  if (gpu.includes('a16') || gpu.includes('a17')) return 2;
  if (gpu.includes('a15') || gpu.includes('a14')) return 1;

  // intel integrated
  if (gpu.includes('iris xe') || gpu.includes('arc')) return 2;
  if (gpu.includes('iris')) return 1;
  if (gpu.includes('uhd') || gpu.includes('hd graphics')) return 1;

  // mobile
  if (gpu.includes('adreno 7') || gpu.includes('adreno 6')) return 2;
  if (gpu.includes('adreno')) return 1;
  if (gpu.includes('mali-g7')) return 2;
  if (gpu.includes('mali')) return 1;

  return 1; // unknown defaults to low-mid
}

function connectionScore(conn) {
  if (!conn) return 0.5; // unknown = assume ok
  if (conn.saveData) return 0.1;
  const type = conn.effectiveType;
  if (type === '4g') return 1.0;
  if (type === '3g') return 0.4;
  if (type === '2g') return 0.1;
  return 0.7;
}

// also export a version for knowledge base entries, which have
// a different shape (flatter, fewer nested objects)
export function vectorizeKBEntry(entry) {
  return vectorize({
    gpu: entry.gpu,
    memory: entry.memory,
    cores: entry.cores,
    deviceType: entry.deviceType,
    screenWidth: 1920,
    screenHeight: 1080,
    pixelRatio: 1,
    webglVersion: 2,
    benchFps: entry.benchFps,
    floatTextures: true,
    maxTextureSize: entry.settings?.maxTextureSize || 2048,
    connection: null,
  });
}

// converts raw detector output into the flat shape vectorize() expects
export function flattenDetectorOutput(hw) {
  return {
    gpu: hw.gpu?.renderer || '',
    vendor: hw.gpu?.vendor || '',
    memory: hw.memory,
    cores: hw.cores,
    deviceType: hw.device?.type || 'desktop',
    screenWidth: hw.screen?.width || 1920,
    screenHeight: hw.screen?.height || 1080,
    pixelRatio: hw.screen?.pixelRatio || 1,
    webglVersion: hw.gpu?.webglVersion || 0,
    benchFps: 0, // filled in later if we run the benchmark
    floatTextures: hw.gpu?.floatTextures || false,
    maxTextureSize: hw.gpu?.maxTextureSize || 2048,
    connection: hw.connection,
  };
}
