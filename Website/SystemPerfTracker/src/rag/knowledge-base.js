// knowledge-base.js
// Corpus of known device profiles. Each entry is a "document" in the
// RAG sense: a hardware fingerprint paired with observed performance
// and the quality settings that worked well for it.
//
// These profiles come from real devices I've tested on or from
// GFXBench/UserBenchmark data for common GPUs. The GPU strings are
// what WEBGL_debug_renderer_info actually returns in Chrome, so they
// include the ANGLE wrapper text.
//
// When a visitor hits the site, their hardware gets vectorized and
// matched against these entries. Closest matches determine the
// quality settings.

export const KNOWLEDGE_BASE = [

  // --- tier 3: dedicated GPUs, 60fps easy ---

  {
    id: 'rtx4090',
    gpu: 'ANGLE (NVIDIA, NVIDIA GeForce RTX 4090, OpenGL 4.5)',
    vendor: 'Google Inc. (NVIDIA)',
    memory: 8, cores: 16, deviceType: 'desktop',
    benchFps: 400,
    tier: 3,
    settings: {
      pixelRatio: 2.0, maxTextureSize: 4096, shadowsEnabled: true,
      fireflyCount: 400, antialias: true, toneMapping: 'ACESFilmic',
      toneMappingExposure: 1.6,
    },
    tags: ['nvidia', 'rtx', 'high-end', 'desktop'],
  },
  {
    id: 'rtx3070',
    gpu: 'ANGLE (NVIDIA, NVIDIA GeForce RTX 3070, OpenGL 4.5)',
    vendor: 'Google Inc. (NVIDIA)',
    memory: 8, cores: 12, deviceType: 'desktop',
    benchFps: 320,
    tier: 3,
    settings: {
      pixelRatio: 2.0, maxTextureSize: 4096, shadowsEnabled: true,
      fireflyCount: 400, antialias: true, toneMapping: 'ACESFilmic',
      toneMappingExposure: 1.6,
    },
    tags: ['nvidia', 'rtx', 'high-end', 'desktop'],
  },
  {
    id: 'rtx2060',
    gpu: 'ANGLE (NVIDIA, NVIDIA GeForce RTX 2060, OpenGL 4.5)',
    vendor: 'Google Inc. (NVIDIA)',
    memory: 8, cores: 8, deviceType: 'desktop',
    benchFps: 240,
    tier: 3,
    settings: {
      pixelRatio: 1.5, maxTextureSize: 4096, shadowsEnabled: true,
      fireflyCount: 350, antialias: true, toneMapping: 'ACESFilmic',
      toneMappingExposure: 1.6,
    },
    tags: ['nvidia', 'rtx', 'mid-high', 'desktop'],
  },
  {
    id: 'gtx1660',
    gpu: 'ANGLE (NVIDIA, NVIDIA GeForce GTX 1660 SUPER, OpenGL 4.5)',
    vendor: 'Google Inc. (NVIDIA)',
    memory: 8, cores: 8, deviceType: 'desktop',
    benchFps: 200,
    tier: 3,
    settings: {
      pixelRatio: 1.5, maxTextureSize: 2048, shadowsEnabled: true,
      fireflyCount: 300, antialias: true, toneMapping: 'ACESFilmic',
      toneMappingExposure: 1.6,
    },
    tags: ['nvidia', 'gtx', 'mid', 'desktop'],
  },
  {
    id: 'rx6800',
    gpu: 'ANGLE (AMD, AMD Radeon RX 6800 XT, OpenGL 4.5)',
    vendor: 'Google Inc. (AMD)',
    memory: 8, cores: 12, deviceType: 'desktop',
    benchFps: 310,
    tier: 3,
    settings: {
      pixelRatio: 2.0, maxTextureSize: 4096, shadowsEnabled: true,
      fireflyCount: 400, antialias: true, toneMapping: 'ACESFilmic',
      toneMappingExposure: 1.6,
    },
    tags: ['amd', 'radeon', 'high-end', 'desktop'],
  },
  {
    id: 'm1pro',
    gpu: 'ANGLE (Apple, Apple M1 Pro, OpenGL 4.1)',
    vendor: 'Google Inc. (Apple)',
    memory: 8, cores: 10, deviceType: 'desktop',
    benchFps: 280,
    tier: 3,
    settings: {
      pixelRatio: 2.0, maxTextureSize: 4096, shadowsEnabled: true,
      fireflyCount: 350, antialias: true, toneMapping: 'ACESFilmic',
      toneMappingExposure: 1.6,
    },
    tags: ['apple', 'silicon', 'high-end', 'laptop'],
  },
  {
    id: 'm2',
    gpu: 'ANGLE (Apple, Apple M2, OpenGL 4.1)',
    vendor: 'Google Inc. (Apple)',
    memory: 8, cores: 8, deviceType: 'desktop',
    benchFps: 260,
    tier: 3,
    settings: {
      pixelRatio: 2.0, maxTextureSize: 4096, shadowsEnabled: true,
      fireflyCount: 350, antialias: true, toneMapping: 'ACESFilmic',
      toneMappingExposure: 1.6,
    },
    tags: ['apple', 'silicon', 'high-end', 'laptop'],
  },

  // --- tier 2: mid-range, can do 30fps ---

  {
    id: 'gtx1050',
    gpu: 'ANGLE (NVIDIA, NVIDIA GeForce GTX 1050, OpenGL 4.5)',
    vendor: 'Google Inc. (NVIDIA)',
    memory: 4, cores: 4, deviceType: 'desktop',
    benchFps: 140,
    tier: 2,
    settings: {
      pixelRatio: 1.0, maxTextureSize: 2048, shadowsEnabled: false,
      fireflyCount: 200, antialias: true, toneMapping: 'ACESFilmic',
      toneMappingExposure: 1.6,
    },
    tags: ['nvidia', 'gtx', 'mid-low', 'desktop'],
  },
  {
    id: 'iris-xe',
    gpu: 'ANGLE (Intel, Intel(R) Iris(R) Xe Graphics, OpenGL 4.5)',
    vendor: 'Google Inc. (Intel)',
    memory: 8, cores: 8, deviceType: 'desktop',
    benchFps: 120,
    tier: 2,
    settings: {
      pixelRatio: 1.0, maxTextureSize: 2048, shadowsEnabled: false,
      fireflyCount: 200, antialias: true, toneMapping: 'ACESFilmic',
      toneMappingExposure: 1.6,
    },
    tags: ['intel', 'integrated', 'mid', 'laptop'],
  },
  {
    id: 'rx580',
    gpu: 'ANGLE (AMD, Radeon RX 580 Series, OpenGL 4.5)',
    vendor: 'Google Inc. (AMD)',
    memory: 8, cores: 8, deviceType: 'desktop',
    benchFps: 160,
    tier: 2,
    settings: {
      pixelRatio: 1.0, maxTextureSize: 2048, shadowsEnabled: false,
      fireflyCount: 250, antialias: true, toneMapping: 'ACESFilmic',
      toneMappingExposure: 1.6,
    },
    tags: ['amd', 'radeon', 'mid', 'desktop'],
  },
  {
    id: 'm1-base',
    gpu: 'ANGLE (Apple, Apple M1, OpenGL 4.1)',
    vendor: 'Google Inc. (Apple)',
    memory: 8, cores: 8, deviceType: 'desktop',
    benchFps: 200,
    tier: 2,
    settings: {
      pixelRatio: 1.5, maxTextureSize: 2048, shadowsEnabled: false,
      fireflyCount: 250, antialias: true, toneMapping: 'ACESFilmic',
      toneMappingExposure: 1.6,
    },
    tags: ['apple', 'silicon', 'mid', 'laptop'],
  },
  {
    id: 'adreno-740',
    gpu: 'ANGLE (Qualcomm, Adreno (TM) 740, OpenGL ES 3.2)',
    vendor: 'Google Inc. (Qualcomm)',
    memory: 8, cores: 8, deviceType: 'mobile',
    benchFps: 100,
    tier: 2,
    settings: {
      pixelRatio: 1.0, maxTextureSize: 1024, shadowsEnabled: false,
      fireflyCount: 150, antialias: false, toneMapping: 'ACESFilmic',
      toneMappingExposure: 1.6,
    },
    tags: ['qualcomm', 'adreno', 'mobile', 'flagship'],
  },
  {
    id: 'a16-gpu',
    gpu: 'ANGLE (Apple, Apple A16 GPU, OpenGL ES 3.0)',
    vendor: 'Google Inc. (Apple)',
    memory: 4, cores: 6, deviceType: 'mobile',
    benchFps: 110,
    tier: 2,
    settings: {
      pixelRatio: 1.0, maxTextureSize: 1024, shadowsEnabled: false,
      fireflyCount: 120, antialias: false, toneMapping: 'ACESFilmic',
      toneMappingExposure: 1.6,
    },
    tags: ['apple', 'mobile', 'iphone', 'flagship'],
  },

  // --- tier 1: low-end, maybe 15fps ---

  {
    id: 'uhd620',
    gpu: 'ANGLE (Intel, Intel(R) UHD Graphics 620, OpenGL 4.5)',
    vendor: 'Google Inc. (Intel)',
    memory: 4, cores: 4, deviceType: 'desktop',
    benchFps: 60,
    tier: 1,
    settings: {
      pixelRatio: 0.75, maxTextureSize: 1024, shadowsEnabled: false,
      fireflyCount: 80, antialias: false, toneMapping: 'Linear',
      toneMappingExposure: 1.4,
    },
    tags: ['intel', 'integrated', 'low', 'laptop'],
  },
  {
    id: 'uhd630',
    gpu: 'ANGLE (Intel, Intel(R) UHD Graphics 630, OpenGL 4.5)',
    vendor: 'Google Inc. (Intel)',
    memory: 4, cores: 4, deviceType: 'desktop',
    benchFps: 70,
    tier: 1,
    settings: {
      pixelRatio: 0.75, maxTextureSize: 1024, shadowsEnabled: false,
      fireflyCount: 100, antialias: false, toneMapping: 'Linear',
      toneMappingExposure: 1.4,
    },
    tags: ['intel', 'integrated', 'low', 'desktop'],
  },
  {
    id: 'hd4000',
    gpu: 'ANGLE (Intel, Intel(R) HD Graphics 4000, OpenGL 4.0)',
    vendor: 'Google Inc. (Intel)',
    memory: 2, cores: 2, deviceType: 'desktop',
    benchFps: 35,
    tier: 1,
    settings: {
      pixelRatio: 0.5, maxTextureSize: 1024, shadowsEnabled: false,
      fireflyCount: 50, antialias: false, toneMapping: 'Linear',
      toneMappingExposure: 1.2,
    },
    tags: ['intel', 'integrated', 'very-low', 'old-laptop'],
  },
  {
    id: 'adreno-610',
    gpu: 'ANGLE (Qualcomm, Adreno (TM) 610, OpenGL ES 3.1)',
    vendor: 'Google Inc. (Qualcomm)',
    memory: 2, cores: 4, deviceType: 'mobile',
    benchFps: 40,
    tier: 1,
    settings: {
      pixelRatio: 0.5, maxTextureSize: 512, shadowsEnabled: false,
      fireflyCount: 40, antialias: false, toneMapping: 'Linear',
      toneMappingExposure: 1.2,
    },
    tags: ['qualcomm', 'adreno', 'mobile', 'budget'],
  },
  {
    id: 'mali-g52',
    gpu: 'ANGLE (ARM, Mali-G52 MC2, OpenGL ES 3.1)',
    vendor: 'Google Inc. (ARM)',
    memory: 2, cores: 4, deviceType: 'mobile',
    benchFps: 35,
    tier: 1,
    settings: {
      pixelRatio: 0.5, maxTextureSize: 512, shadowsEnabled: false,
      fireflyCount: 40, antialias: false, toneMapping: 'Linear',
      toneMappingExposure: 1.2,
    },
    tags: ['arm', 'mali', 'mobile', 'budget'],
  },

  // --- tier 0: basically can't run WebGL ---

  {
    id: 'swiftshader',
    gpu: 'Google SwiftShader',
    vendor: 'Google Inc.',
    memory: 1, cores: 2, deviceType: 'desktop',
    benchFps: 5,
    tier: 0,
    settings: {
      pixelRatio: 0.5, maxTextureSize: 512, shadowsEnabled: false,
      fireflyCount: 0, antialias: false, toneMapping: 'Linear',
      toneMappingExposure: 1.0,
    },
    tags: ['software', 'swiftshader', 'no-gpu'],
  },
  {
    id: 'llvmpipe',
    gpu: 'llvmpipe',
    vendor: 'Mesa',
    memory: 1, cores: 2, deviceType: 'desktop',
    benchFps: 3,
    tier: 0,
    settings: {
      pixelRatio: 0.5, maxTextureSize: 512, shadowsEnabled: false,
      fireflyCount: 0, antialias: false, toneMapping: 'Linear',
      toneMappingExposure: 1.0,
    },
    tags: ['software', 'mesa', 'linux', 'no-gpu'],
  },
];
