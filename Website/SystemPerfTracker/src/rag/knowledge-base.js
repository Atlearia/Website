import { PRESETS } from './utils.js';

function settings(tier, overrides = {}) {
  return { ...PRESETS[tier], ...overrides };
}

function entry(id, gpu, tier, benchFps, memory, cores, deviceType, tags, overrides = {}) {
  return {
    id,
    gpu,
    vendor: overrides.vendor || '',
    memory,
    cores,
    deviceType,
    benchFps,
    tier,
    screenWidth: overrides.screenWidth || 1920,
    screenHeight: overrides.screenHeight || 1080,
    pixelRatio: overrides.pixelRatio || 1,
    webglVersion: overrides.webglVersion || 2,
    maxTextureSize: overrides.maxTextureSize || settings(tier).maxTextureSize,
    floatTextures: overrides.floatTextures ?? tier > 0,
    settings: settings(tier, overrides.settings),
    tags,
  };
}

const SEED_PROFILES = [
  entry('rtx4090', 'ANGLE (NVIDIA, NVIDIA GeForce RTX 4090, Direct3D11)', 3, 420, 8, 16, 'desktop', ['nvidia', 'rtx40', 'high-end', 'desktop'], { maxTextureSize: 16384, settings: { pixelRatio: 2.0, fireflyCount: 460 } }),
  entry('rtx4080-laptop', 'ANGLE (NVIDIA, NVIDIA GeForce RTX 4080 Laptop GPU, Direct3D11)', 3, 340, 8, 16, 'desktop', ['nvidia', 'rtx40', 'laptop', 'high-end'], { maxTextureSize: 16384, settings: { pixelRatio: 1.75, fireflyCount: 420 } }),
  entry('rtx4070-laptop', 'ANGLE (NVIDIA, NVIDIA GeForce RTX 4070 Laptop GPU, Direct3D11)', 3, 290, 8, 14, 'desktop', ['nvidia', 'rtx40', 'laptop', 'high-end'], { maxTextureSize: 16384, settings: { pixelRatio: 1.5, fireflyCount: 400 } }),
  entry('rtx4060-laptop', 'ANGLE (NVIDIA, NVIDIA GeForce RTX 4060 Laptop GPU, Direct3D11)', 3, 245, 8, 12, 'desktop', ['nvidia', 'rtx40', 'laptop', 'mid-high'], { maxTextureSize: 8192, settings: { fireflyCount: 360 } }),
  entry('rtx3060-laptop', 'ANGLE (NVIDIA, NVIDIA GeForce RTX 3060 Laptop GPU, Direct3D11)', 3, 205, 8, 12, 'desktop', ['nvidia', 'rtx30', 'laptop', 'mid-high'], { maxTextureSize: 8192, settings: { fireflyCount: 340 } }),
  entry('rtx3050-laptop', 'ANGLE (NVIDIA, NVIDIA GeForce RTX 3050 Laptop GPU, Direct3D11)', 2, 125, 4, 8, 'desktop', ['nvidia', 'rtx30', 'laptop', 'mid'], { maxTextureSize: 8192, settings: { fireflyCount: 220 } }),
  entry('rtx3070', 'ANGLE (NVIDIA, NVIDIA GeForce RTX 3070, OpenGL 4.5)', 3, 320, 8, 12, 'desktop', ['nvidia', 'rtx30', 'high-end', 'desktop'], { maxTextureSize: 16384, settings: { pixelRatio: 2.0, fireflyCount: 420 } }),
  entry('rtx2060', 'ANGLE (NVIDIA, NVIDIA GeForce RTX 2060, OpenGL 4.5)', 3, 235, 8, 8, 'desktop', ['nvidia', 'rtx20', 'desktop'], { maxTextureSize: 8192, settings: { fireflyCount: 350 } }),
  entry('gtx1660', 'ANGLE (NVIDIA, NVIDIA GeForce GTX 1660 SUPER, OpenGL 4.5)', 3, 185, 8, 8, 'desktop', ['nvidia', 'gtx', 'desktop'], { settings: { fireflyCount: 300 } }),
  entry('gtx1650-mobile', 'ANGLE (NVIDIA, NVIDIA GeForce GTX 1650, Direct3D11)', 2, 135, 4, 8, 'desktop', ['nvidia', 'gtx', 'laptop', 'mid'], { settings: { fireflyCount: 220 } }),
  entry('gtx1050', 'ANGLE (NVIDIA, NVIDIA GeForce GTX 1050, OpenGL 4.5)', 2, 110, 4, 4, 'desktop', ['nvidia', 'gtx', 'low-mid'], { settings: { fireflyCount: 180 } }),
  entry('rx7900xt', 'ANGLE (AMD, AMD Radeon RX 7900 XT, Direct3D11)', 3, 365, 8, 16, 'desktop', ['amd', 'rx7000', 'high-end'], { maxTextureSize: 16384, settings: { pixelRatio: 2.0, fireflyCount: 440 } }),
  entry('rx6800', 'ANGLE (AMD, AMD Radeon RX 6800 XT, OpenGL 4.5)', 3, 310, 8, 12, 'desktop', ['amd', 'rx6000', 'high-end'], { maxTextureSize: 16384, settings: { pixelRatio: 2.0, fireflyCount: 420 } }),
  entry('rx6600', 'ANGLE (AMD, AMD Radeon RX 6600, Direct3D11)', 3, 190, 8, 8, 'desktop', ['amd', 'rx6000', 'desktop'], { settings: { fireflyCount: 320 } }),
  entry('rx580', 'ANGLE (AMD, Radeon RX 580 Series, OpenGL 4.5)', 2, 145, 8, 8, 'desktop', ['amd', 'rx500', 'desktop'], { settings: { fireflyCount: 250 } }),
  entry('vega8', 'ANGLE (AMD, Radeon Vega 8 Graphics, Direct3D11)', 1, 55, 4, 8, 'desktop', ['amd', 'vega', 'integrated'], { settings: { fireflyCount: 90 } }),
  entry('intel-arc-a770', 'ANGLE (Intel, Intel Arc A770 Graphics, Direct3D11)', 3, 190, 8, 12, 'desktop', ['intel', 'arc', 'desktop'], { settings: { fireflyCount: 330 } }),
  entry('intel-arc-a370m', 'ANGLE (Intel, Intel Arc A370M Graphics, Direct3D11)', 2, 115, 8, 8, 'desktop', ['intel', 'arc', 'laptop'], { settings: { fireflyCount: 210 } }),
  entry('iris-xe', 'ANGLE (Intel, Intel(R) Iris(R) Xe Graphics, OpenGL 4.5)', 2, 105, 8, 8, 'desktop', ['intel', 'iris', 'integrated'], { settings: { fireflyCount: 190 } }),
  entry('intel-uhd770', 'ANGLE (Intel, Intel(R) UHD Graphics 770, Direct3D11)', 1, 80, 8, 8, 'desktop', ['intel', 'uhd', 'integrated'], { settings: { fireflyCount: 110 } }),
  entry('uhd630', 'ANGLE (Intel, Intel(R) UHD Graphics 630, OpenGL 4.5)', 1, 68, 4, 4, 'desktop', ['intel', 'uhd', 'integrated'], { settings: { fireflyCount: 95 } }),
  entry('uhd620', 'ANGLE (Intel, Intel(R) UHD Graphics 620, OpenGL 4.5)', 1, 54, 4, 4, 'desktop', ['intel', 'uhd', 'integrated'], { settings: { fireflyCount: 80 } }),
  entry('hd4000', 'ANGLE (Intel, Intel(R) HD Graphics 4000, OpenGL 4.0)', 1, 32, 2, 2, 'desktop', ['intel', 'hd', 'old'], { webglVersion: 1, maxTextureSize: 2048, settings: { maxTextureSize: 1024, fireflyCount: 45, toneMappingExposure: 1.2 } }),
  entry('apple-m3-pro', 'ANGLE (Apple, Apple M3 Pro, Metal)', 3, 330, 8, 12, 'desktop', ['apple', 'm3', 'laptop'], { maxTextureSize: 16384, pixelRatio: 2, settings: { pixelRatio: 1.75, fireflyCount: 420 } }),
  entry('apple-m3', 'ANGLE (Apple, Apple M3, Metal)', 3, 280, 8, 8, 'desktop', ['apple', 'm3', 'laptop'], { maxTextureSize: 16384, pixelRatio: 2, settings: { pixelRatio: 1.5, fireflyCount: 380 } }),
  entry('m2', 'ANGLE (Apple, Apple M2, OpenGL 4.1)', 3, 230, 8, 8, 'desktop', ['apple', 'm2', 'laptop'], { pixelRatio: 2, settings: { pixelRatio: 1.5, fireflyCount: 340 } }),
  entry('m1pro', 'ANGLE (Apple, Apple M1 Pro, OpenGL 4.1)', 3, 260, 8, 10, 'desktop', ['apple', 'm1', 'pro', 'laptop'], { pixelRatio: 2, settings: { pixelRatio: 1.5, fireflyCount: 360 } }),
  entry('m1-base', 'ANGLE (Apple, Apple M1, OpenGL 4.1)', 2, 140, 8, 8, 'desktop', ['apple', 'm1', 'laptop'], { pixelRatio: 2, settings: { pixelRatio: 1.25, fireflyCount: 240 } }),
  entry('a17-pro', 'ANGLE (Apple, Apple A17 Pro GPU, Metal)', 2, 135, 8, 6, 'mobile', ['apple', 'a17', 'mobile'], { screenWidth: 430, screenHeight: 932, pixelRatio: 3, settings: { maxTextureSize: 1024, fireflyCount: 130, antialias: false } }),
  entry('a16-gpu', 'ANGLE (Apple, Apple A16 GPU, OpenGL ES 3.0)', 2, 100, 4, 6, 'mobile', ['apple', 'a16', 'mobile'], { screenWidth: 390, screenHeight: 844, pixelRatio: 3, settings: { maxTextureSize: 1024, fireflyCount: 110, antialias: false } }),
  entry('a15-gpu', 'ANGLE (Apple, Apple A15 GPU, OpenGL ES 3.0)', 1, 58, 4, 6, 'mobile', ['apple', 'a15', 'mobile'], { screenWidth: 390, screenHeight: 844, pixelRatio: 3, settings: { maxTextureSize: 1024, fireflyCount: 70, antialias: false } }),
  entry('adreno-750', 'ANGLE (Qualcomm, Adreno (TM) 750, OpenGL ES 3.2)', 2, 140, 8, 8, 'mobile', ['qualcomm', 'adreno7', 'mobile'], { screenWidth: 412, screenHeight: 915, pixelRatio: 3, settings: { maxTextureSize: 1024, fireflyCount: 150, antialias: false } }),
  entry('adreno-740', 'ANGLE (Qualcomm, Adreno (TM) 740, OpenGL ES 3.2)', 2, 115, 8, 8, 'mobile', ['qualcomm', 'adreno7', 'mobile'], { screenWidth: 412, screenHeight: 915, pixelRatio: 3, settings: { maxTextureSize: 1024, fireflyCount: 140, antialias: false } }),
  entry('adreno-650', 'ANGLE (Qualcomm, Adreno (TM) 650, OpenGL ES 3.2)', 1, 58, 6, 8, 'mobile', ['qualcomm', 'adreno6', 'mobile'], { screenWidth: 412, screenHeight: 915, pixelRatio: 3, settings: { maxTextureSize: 1024, fireflyCount: 75, antialias: false } }),
  entry('adreno-610', 'ANGLE (Qualcomm, Adreno (TM) 610, OpenGL ES 3.1)', 1, 34, 2, 4, 'mobile', ['qualcomm', 'adreno6', 'mobile', 'budget'], { screenWidth: 360, screenHeight: 760, pixelRatio: 2, settings: { maxTextureSize: 512, fireflyCount: 40, antialias: false } }),
  entry('mali-g78', 'ANGLE (ARM, Mali-G78, OpenGL ES 3.1)', 2, 82, 6, 8, 'mobile', ['arm', 'mali', 'g78', 'mobile'], { screenWidth: 412, screenHeight: 915, pixelRatio: 2.5, settings: { maxTextureSize: 1024, fireflyCount: 100, antialias: false } }),
  entry('mali-g76', 'ANGLE (ARM, Mali-G76, OpenGL ES 3.1)', 1, 48, 4, 8, 'mobile', ['arm', 'mali', 'g76', 'mobile'], { screenWidth: 412, screenHeight: 915, pixelRatio: 2.5, settings: { maxTextureSize: 1024, fireflyCount: 65, antialias: false } }),
  entry('mali-g52', 'ANGLE (ARM, Mali-G52 MC2, OpenGL ES 3.1)', 1, 32, 2, 4, 'mobile', ['arm', 'mali', 'g52', 'mobile', 'budget'], { screenWidth: 360, screenHeight: 760, pixelRatio: 2, settings: { maxTextureSize: 512, fireflyCount: 40, antialias: false } }),
  entry('swiftshader', 'Google SwiftShader', 0, 6, 1, 2, 'desktop', ['software', 'swiftshader'], { webglVersion: 1, maxTextureSize: 2048, floatTextures: false }),
  entry('llvmpipe', 'llvmpipe', 0, 4, 1, 2, 'desktop', ['software', 'llvmpipe'], { webglVersion: 1, maxTextureSize: 1024, floatTextures: false }),
  // V3 additions — fill gaps exposed by blind testing
  entry('rx5600xt', 'ANGLE (AMD, AMD Radeon RX 5600 XT, Direct3D11)', 2, 155, 8, 8, 'desktop', ['amd', 'rx5000', 'desktop'], { settings: { fireflyCount: 230 } }),
  entry('rx5500xt', 'ANGLE (AMD, AMD Radeon RX 5500 XT, OpenGL 4.5)', 2, 120, 4, 8, 'desktop', ['amd', 'rx5000', 'desktop'], { settings: { fireflyCount: 200 } }),
  entry('radeon-r5', 'ANGLE (AMD, AMD Radeon R5 Graphics, Direct3D11)', 1, 28, 4, 4, 'desktop', ['amd', 'radeon', 'integrated', 'old'], { settings: { fireflyCount: 50 } }),
  entry('radeon-hd7850', 'ANGLE (AMD, AMD Radeon HD 7850, OpenGL 4.4)', 1, 55, 4, 4, 'desktop', ['amd', 'radeon', 'old', 'hd7000'], { settings: { fireflyCount: 75 } }),
  entry('mali-g710', 'ANGLE (ARM, Mali-G710, OpenGL ES 3.2)', 2, 90, 6, 8, 'mobile', ['arm', 'mali', 'g710', 'mobile'], { screenWidth: 412, screenHeight: 915, pixelRatio: 2.5, settings: { maxTextureSize: 1024, fireflyCount: 120, antialias: false } }),
  entry('gt730', 'ANGLE (NVIDIA, NVIDIA GeForce GT 730, Direct3D11)', 1, 40, 2, 2, 'desktop', ['nvidia', 'gt', 'budget'], { settings: { fireflyCount: 60 } }),
  entry('gt710', 'ANGLE (NVIDIA, NVIDIA GeForce GT 710, OpenGL 4.5)', 1, 25, 2, 2, 'desktop', ['nvidia', 'gt', 'budget'], { settings: { fireflyCount: 40 } }),
];

function slug(value) {
  return String(value).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

function generatedEntry(spec, variant) {
  const id = `${slug(spec.vendor)}-${slug(spec.name)}-${variant.kind}-${variant.api}-${variant.mem}gb-${variant.cores}c-${String(variant.pixel).replace('.', 'p')}`;
  const name = variant.kind === 'laptop' && !/laptop/i.test(spec.name) ? `${spec.name} Laptop GPU` : spec.name;
  const gpu = variant.raw ? name : `ANGLE (${spec.vendor}, ${spec.vendorName || spec.vendor} ${name}, ${variant.apiLabel})`;
  const tier = variant.saveData ? Math.min(spec.tier, 1) : spec.tier;
  const benchScale = variant.kind === 'laptop' ? 0.82 : 1;
  const benchFps = Math.round(spec.benchFps * benchScale * variant.benchScale);
  const profile = entry(
    id,
    gpu,
    tier,
    benchFps,
    variant.mem,
    variant.cores,
    spec.deviceType || 'desktop',
    [...spec.tags, variant.kind, variant.api, `${variant.mem}gb`, `${variant.cores}c`],
    {
      maxTextureSize: spec.maxTextureSize || (tier >= 3 ? 16384 : tier === 2 ? 8192 : 4096),
      pixelRatio: variant.pixel,
      webglVersion: variant.webglVersion,
      floatTextures: tier > 0,
      screenWidth: spec.deviceType === 'mobile' ? 390 : 1920,
      screenHeight: spec.deviceType === 'mobile' ? 844 : 1080,
      settings: {
        pixelRatio: Math.min(settings(tier).pixelRatio, variant.pixel),
        fireflyCount: Math.round(settings(tier).fireflyCount * variant.benchScale),
        maxTextureSize: Math.min(settings(tier).maxTextureSize, spec.maxTextureSize || settings(tier).maxTextureSize),
      },
    }
  );
  profile.source = {
    type: 'generated-hardware-index',
    basis: spec.basis,
    series: spec.series,
    exactModel: name,
  };
  return profile;
}

function expandSpecs(specs, variants) {
  const rows = [];
  for (const spec of specs) {
    for (const variant of variants) rows.push(generatedEntry(spec, variant));
  }
  return rows;
}

function desktopVariantGrid() {
  const apis = [
    ['d3d11', 'Direct3D11', false, 1],
    ['opengl', 'OpenGL 4.5', false, 0.94],
    ['vulkan', 'Vulkan', false, 1.03],
    ['raw', 'OpenGL 4.5', true, 0.98],
  ];
  const configs = [
    [4, 4, 1, 0.78],
    [4, 8, 1, 0.84],
    [8, 8, 1, 0.95],
    [8, 12, 1.25, 1],
    [16, 12, 1.25, 1.06],
    [16, 16, 1.5, 1.12],
    [32, 24, 1.5, 1.18],
  ];
  const rows = [];
  for (const [api, apiLabel, raw, apiScale] of apis) {
    for (const [mem, cores, pixel, scale] of configs) {
      rows.push({ kind: 'desktop', api, apiLabel, mem, cores, pixel, webglVersion: 2, benchScale: scale * apiScale, raw });
      rows.push({ kind: 'laptop', api, apiLabel, mem: Math.min(mem, 16), cores: Math.min(cores, 16), pixel, webglVersion: 2, benchScale: scale * apiScale * 0.82, raw });
    }
  }
  return rows;
}

function mobileVariantGrid() {
  const apis = [
    ['gles32', 'OpenGL ES 3.2', false, 1],
    ['gles31', 'OpenGL ES 3.1', false, 0.9],
    ['metal', 'Metal', false, 1.08],
    ['raw', 'OpenGL ES 3.2', true, 0.96],
  ];
  const configs = [
    [2, 4, 2, 0.72],
    [4, 6, 2, 0.84],
    [4, 8, 2.5, 0.9],
    [8, 8, 3, 1],
    [12, 8, 3, 1.08],
  ];
  const rows = [];
  for (const [api, apiLabel, raw, apiScale] of apis) {
    for (const [mem, cores, pixel, scale] of configs) {
      rows.push({ kind: 'mobile', api, apiLabel, mem, cores, pixel, webglVersion: 2, benchScale: scale * apiScale, raw });
    }
  }
  return rows;
}

const desktopVariants = desktopVariantGrid();
const mobileVariants = mobileVariantGrid();

const nvidiaSpecs = [
  ['RTX 4090', 3, 420, 'rtx40'], ['RTX 4080', 3, 360, 'rtx40'], ['RTX 4070 Ti', 3, 330, 'rtx40'], ['RTX 4070', 3, 290, 'rtx40'], ['RTX 4060 Ti', 3, 255, 'rtx40'], ['RTX 4060', 3, 225, 'rtx40'], ['RTX 4050', 2, 145, 'rtx40'],
  ['RTX 3090 Ti', 3, 390, 'rtx30'], ['RTX 3090', 3, 370, 'rtx30'], ['RTX 3080 Ti', 3, 345, 'rtx30'], ['RTX 3080', 3, 320, 'rtx30'], ['RTX 3070 Ti', 3, 285, 'rtx30'], ['RTX 3070', 3, 260, 'rtx30'], ['RTX 3060 Ti', 3, 225, 'rtx30'], ['RTX 3060', 3, 190, 'rtx30'], ['RTX 3050', 2, 118, 'rtx30'],
  ['RTX 2080 Ti', 3, 290, 'rtx20'], ['RTX 2080', 3, 260, 'rtx20'], ['RTX 2070 Super', 3, 235, 'rtx20'], ['RTX 2070', 3, 215, 'rtx20'], ['RTX 2060 Super', 3, 205, 'rtx20'], ['RTX 2060', 3, 185, 'rtx20'],
  ['GTX 1660 Ti', 3, 165, 'gtx16'], ['GTX 1660 SUPER', 3, 160, 'gtx16'], ['GTX 1660', 2, 138, 'gtx16'], ['GTX 1650 SUPER', 2, 125, 'gtx16'], ['GTX 1650', 2, 105, 'gtx16'],
  ['GTX 1080 Ti', 3, 230, 'gtx10'], ['GTX 1080', 3, 205, 'gtx10'], ['GTX 1070 Ti', 3, 180, 'gtx10'], ['GTX 1070', 2, 165, 'gtx10'], ['GTX 1060', 2, 125, 'gtx10'], ['GTX 1050 Ti', 2, 88, 'gtx10'], ['GTX 1050', 2, 82, 'gtx10'],
  ['GT 1030', 1, 42, 'gt'], ['GTX 980 Ti', 2, 145, 'gtx900'], ['GTX 980', 2, 130, 'gtx900'], ['GTX 970', 2, 112, 'gtx900'], ['GTX 960', 1, 74, 'gtx900'], ['GTX 750 Ti', 1, 52, 'gtx700'],
].map(([name, tier, benchFps, series]) => ({ vendor: 'NVIDIA', vendorName: 'NVIDIA GeForce', name, tier, benchFps, series, basis: 'curated nvidia series throughput bands', tags: ['nvidia', series] }));

const amdSpecs = [
  ['Radeon RX 7900 XTX', 3, 390, 'rx7000'], ['Radeon RX 7900 XT', 3, 365, 'rx7000'], ['Radeon RX 7800 XT', 3, 320, 'rx7000'], ['Radeon RX 7700 XT', 3, 275, 'rx7000'], ['Radeon RX 7600', 3, 190, 'rx7000'],
  ['Radeon RX 6950 XT', 3, 350, 'rx6000'], ['Radeon RX 6900 XT', 3, 335, 'rx6000'], ['Radeon RX 6800 XT', 3, 310, 'rx6000'], ['Radeon RX 6800', 3, 285, 'rx6000'], ['Radeon RX 6750 XT', 3, 250, 'rx6000'], ['Radeon RX 6700 XT', 3, 230, 'rx6000'], ['Radeon RX 6650 XT', 3, 190, 'rx6000'], ['Radeon RX 6600 XT', 3, 175, 'rx6000'], ['Radeon RX 6600', 3, 165, 'rx6000'], ['Radeon RX 6500 XT', 2, 95, 'rx6000'],
  ['Radeon RX 590', 2, 145, 'rx500'], ['Radeon RX 580', 2, 135, 'rx500'], ['Radeon RX 570', 2, 115, 'rx500'], ['Radeon RX 560', 1, 72, 'rx500'], ['Radeon RX 550', 1, 45, 'rx500'],
  ['Radeon Vega 11 Graphics', 1, 68, 'vega'], ['Radeon Vega 8 Graphics', 1, 54, 'vega'], ['Radeon 780M Graphics', 2, 115, 'rdna3-apu'], ['Radeon 680M Graphics', 2, 95, 'rdna2-apu'],
].map(([name, tier, benchFps, series]) => ({ vendor: 'AMD', vendorName: 'AMD', name, tier, benchFps, series, basis: 'curated amd series throughput bands', tags: ['amd', series] }));

const intelSpecs = [
  ['Arc A770 Graphics', 3, 195, 'arc'], ['Arc A750 Graphics', 3, 175, 'arc'], ['Arc A580 Graphics', 2, 135, 'arc'], ['Arc A380 Graphics', 2, 105, 'arc'], ['Arc A370M Graphics', 2, 95, 'arc'], ['Arc A350M Graphics', 1, 70, 'arc'],
  ['Iris Xe Graphics', 2, 92, 'iris'], ['Iris Plus Graphics', 1, 70, 'iris'], ['UHD Graphics 770', 1, 78, 'uhd'], ['UHD Graphics 750', 1, 72, 'uhd'], ['UHD Graphics 730', 1, 66, 'uhd'], ['UHD Graphics 630', 1, 58, 'uhd'], ['UHD Graphics 620', 1, 48, 'uhd'], ['HD Graphics 630', 1, 48, 'hd'], ['HD Graphics 520', 1, 36, 'hd'], ['HD Graphics 4000', 1, 28, 'hd'],
].map(([name, tier, benchFps, series]) => ({ vendor: 'Intel', vendorName: 'Intel', name, tier, benchFps, series, basis: 'curated intel integrated and arc throughput bands', tags: ['intel', series] }));

const appleSpecs = [
  ['Apple M3 Max', 3, 340, 'm3'], ['Apple M3 Pro', 3, 300, 'm3'], ['Apple M3', 3, 245, 'm3'], ['Apple M2 Max', 3, 310, 'm2'], ['Apple M2 Pro', 3, 260, 'm2'], ['Apple M2', 3, 205, 'm2'], ['Apple M1 Ultra', 3, 320, 'm1'], ['Apple M1 Max', 3, 275, 'm1'], ['Apple M1 Pro', 3, 230, 'm1'], ['Apple M1', 2, 135, 'm1'],
].map(([name, tier, benchFps, series]) => ({ vendor: 'Apple', vendorName: 'Apple', name, tier, benchFps, series, basis: 'curated apple silicon throughput bands', tags: ['apple', series], maxTextureSize: 16384 }));

const mobileSpecs = [
  ['Adreno (TM) 750', 2, 132, 'adreno7', 'Qualcomm'], ['Adreno (TM) 740', 2, 118, 'adreno7', 'Qualcomm'], ['Adreno (TM) 730', 2, 102, 'adreno7', 'Qualcomm'], ['Adreno (TM) 660', 2, 86, 'adreno6', 'Qualcomm'], ['Adreno (TM) 650', 1, 58, 'adreno6', 'Qualcomm'], ['Adreno (TM) 640', 1, 48, 'adreno6', 'Qualcomm'], ['Adreno (TM) 630', 1, 42, 'adreno6', 'Qualcomm'], ['Adreno (TM) 610', 1, 32, 'adreno6', 'Qualcomm'],
  ['Mali-G78', 2, 78, 'mali-g7', 'ARM'], ['Mali-G76', 1, 48, 'mali-g7', 'ARM'], ['Mali-G72', 1, 40, 'mali-g7', 'ARM'], ['Mali-G68', 1, 58, 'mali-g6', 'ARM'], ['Mali-G57', 1, 34, 'mali-g5', 'ARM'], ['Mali-G52', 1, 28, 'mali-g5', 'ARM'],
].map(([name, tier, benchFps, series, vendor]) => ({ vendor, vendorName: vendor, name, tier, benchFps, series, basis: 'curated mobile gpu throughput bands', tags: [vendor.toLowerCase(), series], deviceType: 'mobile', maxTextureSize: 8192 }));

const generatedProfiles = [
  ...expandSpecs(nvidiaSpecs, desktopVariants),
  ...expandSpecs(amdSpecs, desktopVariants),
  ...expandSpecs(intelSpecs, desktopVariants),
  ...expandSpecs(appleSpecs, desktopVariants),
  ...expandSpecs(mobileSpecs, mobileVariants),
];

const byId = new Map();
for (const row of [...SEED_PROFILES, ...generatedProfiles]) byId.set(row.id, row);

export const KNOWLEDGE_BASE = [...byId.values()];
export const KNOWLEDGE_BASE_STATS = {
  corpusSize: KNOWLEDGE_BASE.length,
  seedProfiles: SEED_PROFILES.length,
  generatedProfiles: KNOWLEDGE_BASE.length - SEED_PROFILES.length,
  retrievalSurface: ['exact-model', 'vector', 'lexical', 'capability', 'benchmark', 'constraints'],
};
