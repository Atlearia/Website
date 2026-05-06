import { buildContext } from './retriever.js';
import { tierFromBenchmark } from './vectorizer.js';
import { clamp, PRESETS } from './utils.js';

// PRESETS imported from utils.js (single source of truth)

// clamp imported from utils.js

function nearestTexture(n) {
  const sizes = [512, 1024, 2048, 4096];
  return sizes.reduce((best, size) => Math.abs(size - n) < Math.abs(best - n) ? size : best, sizes[0]);
}

function weightedTier(context) {
  const support = context.support.rankedTiers;
  if (!support.length) return context.query.capabilityTier;
  const retrievedTier = support.reduce((sum, row) => sum + row.tier * row.weight, 0);
  if (context.query.benchmarkTier !== null) {
    if (benchmarkOutlier(context)) {
      return Math.round(retrievedTier * 0.74 + context.query.gpu.tierHint * 0.26);
    }
    return Math.round(context.query.benchmarkTier * 0.76 + retrievedTier * 0.24);
  }
  return Math.round(retrievedTier * 0.68 + context.query.capabilityTier * 0.32);
}

function benchmarkOutlier(context) {
  const q = context.query;
  if (q.benchmarkTier === null || !q.benchFps || q.gpu.software) return false;
  if (context.constraints.noWebGL || context.constraints.dataSaver || context.constraints.slowConnection) return false;
  const hint = q.gpu.tierHint;
  if (hint === null) return false;

  // Downward outlier: benchmark is much worse than GPU hint suggests
  const downward = hint >= 2 && q.benchmarkTier <= hint - 2;

  // Upward outlier: benchmark far exceeds what the known GPU family should produce.
  // E.g. GTX 1050 (hint=2) measuring 300fps (benchmarkTier=3) on the trivial micro-benchmark.
  // The micro-benchmark uses a simple 256px canvas — weak GPUs can score unrealistically high.
  const upward = q.gpu.brand !== 'unknown' && hint <= 2 && q.benchmarkTier >= hint + 1 && q.benchFps > 200;

  if (!downward && !upward) return false;
  return context.retrieved.some((row) => row.tier >= hint && row.scores.lexical >= 0.6);
}

function constrainedTier(tier, context) {
  const c = context.constraints;
  const q = context.query;
  let value = tier;
  if (c.noWebGL) value = 0;
  if (c.softwareRenderer) value = Math.min(value, q.benchFps >= 15 ? 1 : 0);
  if (c.dataSaver || c.slowConnection) value = Math.min(value, 1);
  if (c.lowMemory || c.webgl1) value = Math.min(value, 1);
  if (c.highDprMobile) value = Math.min(value, 2);
  if (c.mobile) value = Math.min(value, 2);
  // When GPU brand is unknown (privacy-blocked browsers), default conservative.
  // The benchmark will upgrade later if the hardware can handle it.
  if (q.gpu.brand === 'unknown') value = Math.min(value, 1);

  if (q.benchmarkTier === null) {
    if (q.gpu.family === 'intel_uhd' || q.gpu.family === 'intel_hd') value = Math.min(value, 1);
    if (q.gpu.family === 'nvidia_rtx30' && q.gpu.model && q.gpu.model <= 3050) value = Math.min(value, 2);
    if (q.gpu.family === 'nvidia_rtx40' && q.gpu.model && q.gpu.model <= 4050) value = Math.min(value, 2);
    if (q.gpu.family === 'nvidia_gt' && !/rtx|gtx/i.test(q.gpu.text)) value = Math.min(value, 1);
    if (q.gpu.family === 'apple_m1' && !/pro|max|ultra/.test(q.gpu.text)) value = Math.min(value, 2);
    if (q.gpu.family === 'apple_a' && q.gpu.model && q.gpu.model <= 15) value = Math.min(value, 1);
    if (q.gpu.family === 'amd_rx5000' || q.gpu.family === 'amd_rx500') value = Math.min(value, 2);
    if (q.gpu.family === 'amd_old') value = Math.min(value, 1);
    if (q.gpu.family === 'mali_g5') value = Math.min(value, 1);
  }
  return Math.max(0, Math.min(3, value));
}

function blendSettings(matches, tier) {
  const preset = { ...PRESETS[tier] };
  const pool = (matches || []).filter((match) => Math.abs(match.entry.tier - tier) <= 1);
  const total = pool.reduce((sum, match) => sum + match.similarity, 0);
  if (!total) return preset;

  let pixelRatio = 0;
  let maxTextureSize = 0;
  let fireflyCount = 0;
  let exposure = 0;
  let antialias = 0;
  let shadows = 0;

  for (const match of pool) {
    const weight = match.similarity / total;
    const settings = match.entry.settings;
    pixelRatio += settings.pixelRatio * weight;
    maxTextureSize += settings.maxTextureSize * weight;
    fireflyCount += settings.fireflyCount * weight;
    exposure += settings.toneMappingExposure * weight;
    antialias += settings.antialias ? weight : 0;
    shadows += settings.shadowsEnabled ? weight : 0;
  }

  return {
    ...preset,
    pixelRatio: Math.round((pixelRatio || preset.pixelRatio) * 4) / 4,
    maxTextureSize: nearestTexture(maxTextureSize || preset.maxTextureSize),
    fireflyCount: Math.round((fireflyCount || preset.fireflyCount) / 10) * 10,
    antialias: antialias >= 0.48,
    shadowsEnabled: shadows >= 0.55 && tier >= 3,
    toneMappingExposure: Math.round((exposure || preset.toneMappingExposure) * 10) / 10,
    toneMapping: tier >= 2 ? 'ACESFilmic' : 'Linear',
  };
}

function applyCaps(settings, tier, context) {
  const q = context.query;
  const c = context.constraints;
  const capped = { ...settings };
  capped.pixelRatio = Math.min(capped.pixelRatio, q.pixelRatio || capped.pixelRatio);
  if (c.mobile) capped.pixelRatio = Math.min(capped.pixelRatio, 1);
  if (c.dataSaver || c.slowConnection) capped.pixelRatio = Math.min(capped.pixelRatio, 0.75);
  if (q.memory <= 4) capped.pixelRatio = Math.min(capped.pixelRatio, 1);
  if (q.maxTextureSize > 0) capped.maxTextureSize = Math.min(capped.maxTextureSize, q.maxTextureSize);
  if (q.memory <= 2 || c.dataSaver || c.slowConnection) capped.maxTextureSize = Math.min(capped.maxTextureSize, 1024);
  if (c.mobile) capped.maxTextureSize = Math.min(capped.maxTextureSize, 1024);
  if (tier <= 1) capped.maxTextureSize = Math.min(capped.maxTextureSize, 1024);
  if (c.noWebGL) capped.maxTextureSize = 512;
  if (c.dataSaver || c.slowConnection) capped.fireflyCount = Math.min(capped.fireflyCount, 70);
  if (c.mobile) capped.fireflyCount = Math.min(capped.fireflyCount, tier >= 2 ? 150 : 75);
  if (tier === 0) capped.fireflyCount = 0;
  capped.shadowsEnabled = capped.shadowsEnabled && tier >= 3 && !c.mobile && !c.dataSaver && !c.slowConnection;
  capped.antialias = capped.antialias && !c.highDprMobile && !c.dataSaver && tier >= 2;
  return capped;
}

function confidence(context, matches, tier) {
  const support = context.support;
  const top = matches?.[0]?.similarity || 0;
  const tierSupport = support.rankedTiers.find((row) => row.tier === tier)?.weight || 0;
  const bench = context.query.benchmarkTier !== null && !benchmarkOutlier(context) ? 0.18 : 0;
  const constraintPenalty = Object.values(context.constraints).some(Boolean) ? 0.06 : 0;
  const value = top * 0.42 + tierSupport * 0.26 + support.evidenceCoverage * 0.14 + bench + (1 - support.conflict) * 0.12 - constraintPenalty;
  return clamp(value, 0, 0.99);
}

function reason(context, tier) {
  const top = context.retrieved[0];
  if (context.constraints.noWebGL) return 'WebGL is unavailable, static-safe profile selected';
  if (context.constraints.softwareRenderer) return 'Software renderer detected, lowest safe WebGL profile selected';
  const parts = [];
  if (top) {
    const exact = top.scores.exact >= 0.94 ? 'exact' : top.scores.exact >= 0.8 ? 'near-exact' : 'nearest';
    parts.push(`${exact} retrieval ${top.exactModel || top.id}`);
  }
  if (context.query.benchFps) parts.push(`${context.query.benchFps}fps benchmark`);
  if (context.constraints.dataSaver) parts.push('data saver cap');
  if (context.constraints.mobile) parts.push('mobile cap');
  if (context.support.conflict > 0.4) parts.push(`tier conflict ${(context.support.conflict * 100).toFixed(0)}%`);
  parts.push(`tier ${tier}`);
  return parts.join(' | ');
}

function formatMatch(match) {
  return {
    id: match.entry.id,
    gpu: match.entry.gpu,
    exactModel: match.entry.source?.exactModel || match.entry.id,
    source: match.entry.source || null,
    tier: match.entry.tier,
    similarity: Number(match.similarity.toFixed(3)),
    scores: Object.fromEntries(Object.entries(match.scores).map(([key, value]) => [key, Number(value.toFixed(3))])),
    evidence: match.evidence || [],
  };
}

function renderProfile(tier, settings, context, reasoning) {
  const top = context.retrieved[0] || null;
  return {
    tier,
    label: ['blocked', 'low', 'mid', 'high'][tier] || 'unknown',
    pixelRatio: settings.pixelRatio,
    maxTextureSize: settings.maxTextureSize,
    antialias: settings.antialias,
    shadowsEnabled: settings.shadowsEnabled,
    fireflyCount: settings.fireflyCount,
    toneMapping: settings.toneMapping,
    toneMappingExposure: settings.toneMappingExposure,
    retrievedModel: top?.exactModel || top?.id || null,
    source: top?.source || null,
    confidenceBasis: top?.scores || null,
    why: reasoning,
  };
}

export function recommend(matches, contextOrProfile = null) {
  const context = contextOrProfile?.support ? contextOrProfile : buildContext(contextOrProfile || {}, matches || []);
  if (!matches?.length) {
    const tier = constrainedTier(context.query.capabilityTier || 1, context);
    const settings = applyCaps({ ...PRESETS[tier] }, tier, context);
    const reasoning = reason(context, tier);
    return {
      tier,
      confidence: 0.25,
      settings,
      reasoning,
      matches: [],
      renderProfile: renderProfile(tier, settings, context, reasoning),
      context,
    };
  }

  const tier = constrainedTier(weightedTier(context), context);
  const settings = applyCaps(blendSettings(matches, tier), tier, context);
  const reasoning = reason(context, tier);
  return {
    tier,
    confidence: confidence(context, matches, tier),
    settings,
    reasoning,
    matches: matches.map(formatMatch),
    renderProfile: renderProfile(tier, settings, context, reasoning),
    context,
  };
}

export function adjustWithBenchmark(recommendation, benchFps, context = recommendation.context) {
  const measured = tierFromBenchmark(benchFps);
  if (measured === null) return recommendation;
  if (context && benchmarkOutlier(context)) return recommendation;
  const adjustedTier = constrainedTier(measured, context || { constraints: {}, query: { benchmarkTier: measured } });
  if (adjustedTier === recommendation.tier) return recommendation;
  const settings = applyCaps({ ...PRESETS[adjustedTier] }, adjustedTier, context || { constraints: {}, query: {} });
  return {
    ...recommendation,
    tier: adjustedTier,
    confidence: Math.max(recommendation.confidence, 0.82),
    settings,
    reasoning: `${recommendation.reasoning} | benchmark adjusted tier ${adjustedTier}`,
    renderProfile: renderProfile(adjustedTier, settings, context || recommendation.context, `${recommendation.reasoning} | benchmark adjusted tier ${adjustedTier}`),
  };
}
