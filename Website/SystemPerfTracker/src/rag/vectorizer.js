import { clamp, number } from './utils.js';

const BRAND_ID = {
  unknown: 0,
  intel: 1,
  amd: 2,
  nvidia: 3,
  apple: 4,
  qualcomm: 5,
  arm: 6,
  software: 7,
};

const FAMILY_ID = {
  unknown: 0,
  software: 1,
  intel_hd: 2,
  intel_uhd: 3,
  intel_iris: 4,
  intel_arc: 5,
  nvidia_gt: 6,
  nvidia_gtx: 7,
  nvidia_rtx20: 8,
  nvidia_rtx30: 9,
  nvidia_rtx40: 10,
  amd_vega: 11,
  amd_rx500: 12,
  amd_rx6000: 13,
  amd_rx7000: 14,
  apple_a: 15,
  apple_m1: 16,
  apple_m2: 17,
  apple_m3: 18,
  adreno_6: 19,
  adreno_7: 20,
  mali_g5: 21,
  mali_g7: 22,
};

const WEIGHTS = [
  3.2, 3.8, 3.2, 4.0, 1.6, 1.3, 1.6, 1.1, 1.4, 1.1, 0.8, 1.0, 1.0, 1.5, 1.4, 1.2, 0.8, 1.1,
];

// clamp and number imported from utils.js

export function normalizeGpuText(value = '') {
  return String(value || '')
    .toLowerCase()
    .replace(/[()]/g, ' ')
    .replace(/[^a-z0-9.+-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function extractModel(text, patterns) {
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) return Number(match[1]);
  }
  return null;
}

function familyFromGpu(text, brand, model) {
  if (brand === 'software') return 'software';
  if (brand === 'nvidia') {
    if (text.includes('rtx') && model >= 4000) return 'nvidia_rtx40';
    if (text.includes('rtx') && model >= 3000) return 'nvidia_rtx30';
    if (text.includes('rtx') && model >= 2000) return 'nvidia_rtx20';
    if (text.includes('gtx')) return 'nvidia_gtx';
    return 'nvidia_gt';
  }
  if (brand === 'amd') {
    if (/rx\s*7|rx7|7900|7800|7700|7600/.test(text)) return 'amd_rx7000';
    if (/rx\s*6|rx6|6950|6900|6800|6700|6600|6500/.test(text)) return 'amd_rx6000';
    if (/rx\s*5[0-9]{3}|5600|5500|5700/.test(text)) return 'amd_rx5000';
    if (/rx\s*5|rx5|580|570|560|550/.test(text)) return 'amd_rx500';
    if (text.includes('vega')) return 'amd_vega';
    if (/radeon.*780m|radeon.*680m/.test(text)) return 'amd_apuhi';
    return 'amd_old';
  }
  if (brand === 'intel') {
    if (text.includes('arc')) return 'intel_arc';
    if (text.includes('iris')) return 'intel_iris';
    if (text.includes('uhd')) return 'intel_uhd';
    if (text.includes('hd')) return 'intel_hd';
  }
  if (brand === 'apple') {
    if (/\bm4\b|m4 pro|m4 max/.test(text)) return 'apple_m4';
    if (/\bm3\b|m3 pro|m3 max/.test(text)) return 'apple_m3';
    if (/\bm2\b|m2 pro|m2 max/.test(text)) return 'apple_m2';
    if (/\bm1\b|m1 pro|m1 max|m1 ultra/.test(text)) return 'apple_m1';
    if (/\ba\d{2}\b/.test(text)) return 'apple_a';
  }
  if (brand === 'qualcomm') {
    if (model >= 700) return 'adreno_7';
    return 'adreno_6';
  }
  if (brand === 'arm') {
    if (/g7[0-9]|g8|g9/.test(text)) return 'mali_g7';
    return 'mali_g5';
  }
  return 'unknown';
}

function brandFromGpu(text) {
  if (/swiftshader|llvmpipe|softpipe|software rasterizer|mesa dri|mesa\/.+llvm/.test(text)) return 'software';
  if (/nvidia|geforce|rtx|gtx|\bgt\s*\d{3,4}\b/.test(text)) return 'nvidia';
  if (/amd|radeon|rx\s*\d|vega/.test(text)) return 'amd';
  if (/apple|metal|m1|m2|m3|\ba\d{2}\b/.test(text)) return 'apple';
  if (/qualcomm|adreno/.test(text)) return 'qualcomm';
  if (/\barm\b|mali/.test(text)) return 'arm';
  if (/intel|iris|uhd|hd graphics|arc/.test(text)) return 'intel';
  return 'unknown';
}

function tierHint(text, brand, family, model) {
  if (brand === 'software') return 0;
  if (brand === 'nvidia') {
    if (family === 'nvidia_rtx40') return model && model <= 4050 ? 2 : 3;
    if (family === 'nvidia_rtx30') return model && model <= 3050 ? 2 : 3;
    if (family === 'nvidia_rtx20') return 3;
    if (/1660|1650|1080|1070|1060/.test(text)) return 2;
    if (/1050|960|950|750/.test(text)) return 1;
    return 2;
  }
  if (brand === 'amd') {
    if (family === 'amd_rx7000' || family === 'amd_rx6000') return 3;
    if (family === 'amd_rx5000' || family === 'amd_rx500' || family === 'amd_vega' || family === 'amd_apuhi') return 2;
    return 1;
  }
  if (brand === 'intel') {
    if (family === 'intel_arc' || family === 'intel_iris') return 2;
    return 1;
  }
  if (brand === 'apple') {
    if (/m1 pro|m1 max|m1 ultra|m2|m3|m4/.test(text)) return 3;
    if (/\bm1\b|a16|a17|a18/.test(text)) return 2;
    return 1;
  }
  if (brand === 'qualcomm') return model >= 700 ? 2 : 1;
  if (brand === 'arm') return /g7[89]|g8|g9/.test(text) ? 2 : 1;
  return null;
}

function tokensFrom(text, brand, family) {
  const base = text.split(' ').filter((token) => token.length > 1);
  return [...new Set([brand, family, ...base].filter(Boolean))];
}

function variantFromGpu(text) {
  const parts = [];
  if (text.includes('laptop')) parts.push('laptop');
  if (/\bti\b/.test(text)) parts.push('ti');
  if (text.includes('super')) parts.push('super');
  if (/\bxtx\b/.test(text)) parts.push('xtx');
  else if (/\bxt\b/.test(text)) parts.push('xt');
  if (/\bpro\b/.test(text)) parts.push('pro');
  if (/\bmax\b/.test(text)) parts.push('max');
  if (/\bultra\b/.test(text)) parts.push('ultra');
  if (!parts.length) parts.push('base');
  return parts.join('-');
}

export function parseGpu(value = '') {
  const text = normalizeGpuText(value);
  const brand = brandFromGpu(text);
  const model = extractModel(text, [
    /\brtx\s*(\d{4})\b/,
    /\bgtx\s*(\d{3,4})\b/,
    /\bgt\s*(\d{3,4})\b/,
    /\brx\s*(\d{3,4})\b/,
    /\barc\s*a\s*(\d{3,4})m?\b/,
    /\bvega\s*(\d{1,2})\b/,
    /\badreno\s*(?:tm\s*)?(\d{3})\b/,
    /\bmali[- ]g(\d{2})\b/,
    /\buhd\s*(\d{3})\b/,
    /\bhd\s*graphics\s*(\d{3,4})\b/,
    /\ba(\d{2})\b/,
  ]);
  const family = familyFromGpu(text, brand, model);
  const hint = tierHint(text, brand, family, model);
  const variant = variantFromGpu(text);
  return {
    raw: value || '',
    text,
    brand,
    family,
    model,
    variant,
    exactKey: `${brand}:${family}:${model ?? family}:${variant}`,
    tierHint: hint,
    software: brand === 'software',
    tokens: tokensFrom(text, brand, family),
  };
}

export function tierFromBenchmark(fps) {
  const value = number(fps, 0);
  if (value <= 0) return null;
  if (value < 15) return 0;
  if (value < 60) return 1;
  if (value < 150) return 2;
  return 3;
}

export function connectionScore(conn) {
  if (!conn) return 0.65;
  if (conn.saveData) return 0.1;
  if (conn.effectiveType === 'slow-2g' || conn.effectiveType === '2g') return 0.15;
  if (conn.effectiveType === '3g') return 0.45;
  if (conn.effectiveType === '4g') return 1;
  const downlink = number(conn.downlink, 0);
  if (downlink >= 10) return 1;
  if (downlink >= 3) return 0.7;
  if (downlink > 0) return 0.35;
  return 0.65;
}

export function profileDocument(profile = {}) {
  const gpu = parseGpu(profile.gpu || profile.renderer || '');
  const memory = clamp(number(profile.memory, 4), 0, 16);
  const cores = clamp(number(profile.cores, 4), 0, 32);
  const deviceType = profile.deviceType || profile.device?.type || 'desktop';
  const screenWidth = number(profile.screenWidth ?? profile.screen?.width, 1920);
  const screenHeight = number(profile.screenHeight ?? profile.screen?.height, 1080);
  const pixelRatio = clamp(number(profile.pixelRatio ?? profile.screen?.pixelRatio, 1), 0.5, 4);
  const webglVersion = number(profile.webglVersion ?? profile.gpu?.webglVersion, 0);
  const benchFps = number(profile.benchFps, 0);
  const maxTextureSize = number(profile.maxTextureSize ?? profile.gpu?.maxTextureSize, webglVersion ? 2048 : 0);
  const floatTextures = Boolean(profile.floatTextures ?? profile.gpu?.floatTextures);
  const conn = profile.connection || null;
  const pixels = screenWidth * screenHeight * pixelRatio * pixelRatio;
  const benchmarkTier = tierFromBenchmark(benchFps);
  const memoryTier = memory >= 8 ? 3 : memory >= 4 ? 2 : memory >= 2 ? 1 : 0;
  const coreTier = cores >= 12 ? 3 : cores >= 6 ? 2 : cores >= 2 ? 1 : 0;
  const textureTier = maxTextureSize >= 8192 ? 3 : maxTextureSize >= 4096 ? 2 : maxTextureSize >= 2048 ? 1 : 0;
  const inferredTier = Math.round((memoryTier + coreTier + textureTier + (gpu.tierHint ?? 1)) / 4);
  const capabilityTier = webglVersion <= 0 ? 0 : benchmarkTier ?? clamp(inferredTier, 0, 3);
  const saveData = Boolean(conn?.saveData);
  return {
    gpu,
    memory,
    cores,
    deviceType,
    screenWidth,
    screenHeight,
    pixelRatio,
    pixels,
    webglVersion,
    benchFps,
    benchmarkTier,
    maxTextureSize,
    floatTextures,
    connectionScore: connectionScore(conn),
    saveData,
    capabilityTier,
    tokens: gpu.tokens,
  };
}

export function vectorize(profile) {
  const doc = profileDocument(profile);
  const brand = BRAND_ID[doc.gpu.brand] ?? 0;
  const family = FAMILY_ID[doc.gpu.family] ?? 0;
  const gpuHint = doc.gpu.tierHint ?? doc.capabilityTier;
  const bench = doc.benchFps > 0 ? clamp(doc.benchFps / 360) : 0;
  const vec = new Float32Array([
    brand / 7,
    family / 22,
    clamp(gpuHint / 3),
    bench,
    clamp(doc.memory / 8),
    clamp(doc.cores / 16),
    doc.deviceType === 'mobile' ? 1 : doc.deviceType === 'tablet' ? 0.65 : 0,
    clamp(doc.pixels / (3840 * 2160 * 4)),
    clamp(doc.webglVersion / 2),
    doc.floatTextures ? 1 : 0,
    clamp((doc.maxTextureSize - 512) / (16384 - 512)),
    doc.connectionScore,
    doc.saveData ? 1 : 0,
    doc.gpu.software ? 1 : 0,
    clamp(doc.capabilityTier / 3),
    clamp((doc.gpu.model || 0) / 4090),
    doc.pixelRatio >= 2 ? 1 : clamp(doc.pixelRatio / 2),
    doc.benchFps > 0 ? 1 : 0,
  ]);
  for (let i = 0; i < vec.length; i++) vec[i] *= WEIGHTS[i];
  return vec;
}

export function vectorizeKBEntry(entry) {
  return vectorize({
    gpu: entry.gpu,
    memory: entry.memory,
    cores: entry.cores,
    deviceType: entry.deviceType,
    screenWidth: entry.screenWidth || 1920,
    screenHeight: entry.screenHeight || 1080,
    pixelRatio: entry.pixelRatio || 1,
    webglVersion: entry.webglVersion || 2,
    benchFps: entry.benchFps,
    floatTextures: entry.floatTextures ?? true,
    maxTextureSize: entry.maxTextureSize || entry.settings?.maxTextureSize || 2048,
    connection: entry.connection || null,
  });
}

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
    benchFps: 0,
    floatTextures: hw.gpu?.floatTextures || false,
    maxTextureSize: hw.gpu?.maxTextureSize || 0,
    connection: hw.connection,
  };
}
