import { KNOWLEDGE_BASE, KNOWLEDGE_BASE_STATS } from './knowledge-base.js';
import { profileDocument, vectorize, vectorizeKBEntry } from './vectorizer.js';
import { clamp } from './utils.js';

function cosine(a, b) {
  let dot = 0;
  let magA = 0;
  let magB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    magA += a[i] * a[i];
    magB += b[i] * b[i];
  }
  if (!magA || !magB) return 0;
  return dot / (Math.sqrt(magA) * Math.sqrt(magB));
}

function overlap(a, b) {
  if (!a.length || !b.length) return 0;
  const setB = new Set(b);
  let hits = 0;
  for (const token of a) if (setB.has(token)) hits++;
  return hits / Math.sqrt(a.length * b.length);
}

function capability(query, doc) {
  const memory = 1 - Math.min(Math.abs(query.memory - doc.memory) / 8, 1);
  const cores = 1 - Math.min(Math.abs(query.cores - doc.cores) / 16, 1);
  const tex = 1 - Math.min(Math.abs(query.maxTextureSize - doc.maxTextureSize) / 16384, 1);
  const webgl = query.webglVersion === doc.webglVersion ? 1 : 0.55;
  const device = query.deviceType === doc.deviceType ? 1 : query.deviceType === 'tablet' || doc.deviceType === 'tablet' ? 0.7 : 0.25;
  return clamp(memory * 0.24 + cores * 0.2 + tex * 0.22 + webgl * 0.14 + device * 0.2);
}

function benchmark(query, doc) {
  if (!query.benchFps) return 0.5;
  const diff = Math.abs(query.benchFps - doc.benchFps);
  const fpsScore = clamp(1 - diff / 260);
  const tierScore = query.benchmarkTier === doc.benchmarkTier ? 1 : Math.max(0, 1 - Math.abs((query.benchmarkTier ?? 1) - (doc.benchmarkTier ?? 1)) / 3);
  return clamp(fpsScore * 0.65 + tierScore * 0.35);
}

function lexical(query, doc, entry) {
  const tagScore = overlap(query.tokens, [...doc.tokens, ...(entry.tags || [])]);
  const brandScore = query.gpu.brand !== 'unknown' && query.gpu.brand === doc.gpu.brand ? 1 : 0;
  const familyScore = query.gpu.family !== 'unknown' && query.gpu.family === doc.gpu.family ? 1 : 0;
  const modelScore = query.gpu.model && doc.gpu.model
    ? clamp(1 - Math.abs(query.gpu.model - doc.gpu.model) / Math.max(query.gpu.model, doc.gpu.model, 1))
    : 0;
  return clamp(tagScore * 0.35 + brandScore * 0.2 + familyScore * 0.3 + modelScore * 0.15);
}

function exactModel(query, doc) {
  if (query.gpu.brand === 'unknown' || doc.gpu.brand === 'unknown') return 0;
  if (query.gpu.exactKey === doc.gpu.exactKey) return 1;
  if (query.gpu.brand === doc.gpu.brand && query.gpu.family === doc.gpu.family && query.gpu.model && query.gpu.model === doc.gpu.model) {
    const qLaptop = query.gpu.variant.includes('laptop');
    const dLaptop = doc.gpu.variant.includes('laptop');
    if (query.gpu.variant === doc.gpu.variant) return 0.94;
    if (qLaptop !== dLaptop) return 0.82;
    return 0.68;
  }
  if (query.gpu.brand === doc.gpu.brand && query.gpu.family === doc.gpu.family) return 0.54;
  return 0;
}

function constraintFit(query, doc) {
  if (query.webglVersion <= 0) return doc.gpu.software ? 1 : 0;
  if (query.gpu.software) return doc.gpu.software ? 1 : 0.1;
  if (query.saveData && doc.tier > 1) return query.gpu.exactKey === doc.gpu.exactKey ? 0.82 : 0.4;
  if (query.memory <= 2 && doc.tier > 1) return 0.45;
  if (query.deviceType === 'mobile' && doc.deviceType !== 'mobile') return 0.25;
  return 1;
}

function evidence(query, doc, entry, scores) {
  const items = [];
  if (scores.exact >= 0.94) items.push(`exact:${entry.source?.exactModel || entry.id}`);
  else if (scores.exact >= 0.8) items.push(`model-near:${entry.source?.exactModel || entry.id}`);
  if (query.gpu.brand !== 'unknown' && query.gpu.brand === doc.gpu.brand) items.push(`brand:${doc.gpu.brand}`);
  if (query.gpu.family !== 'unknown' && query.gpu.family === doc.gpu.family) items.push(`family:${doc.gpu.family}`);
  if (query.benchFps) items.push(`fps:${query.benchFps}/${doc.benchFps}`);
  if (query.deviceType === doc.deviceType) items.push(`device:${doc.deviceType}`);
  if (scores.capability >= 0.8) items.push('capability:close');
  if (entry.source?.type) items.push(`source:${entry.source.type}`);
  if (entry.tags?.length) items.push(`tags:${entry.tags.slice(0, 3).join(',')}`);
  return items;
}

const CORPUS = KNOWLEDGE_BASE.map((entry) => {
  const doc = profileDocument(entry);
  return {
    entry,
    doc: { ...doc, tier: entry.tier },
    vector: vectorizeKBEntry(entry),
  };
});

export function retrieve(query, k = 5) {
  const vectorOnly = query instanceof Float32Array;
  const queryDoc = vectorOnly ? null : profileDocument(query);
  const queryVector = vectorOnly ? query : vectorize(query);
  const knownGpu = queryDoc?.gpu?.brand && queryDoc.gpu.brand !== 'unknown';
  const weights = queryDoc?.benchFps
    ? knownGpu
      ? { exact: 0.23, vector: 0.22, lexical: 0.25, capability: 0.18, benchmark: 0.06, constraints: 0.06 }
      : { exact: 0, vector: 0.34, lexical: 0.2, capability: 0.14, benchmark: 0.25, constraints: 0.07 }
    : knownGpu
      ? { exact: 0.25, vector: 0.31, lexical: 0.23, capability: 0.15, benchmark: 0.02, constraints: 0.04 }
      : { exact: 0, vector: 0.42, lexical: 0.26, capability: 0.22, benchmark: 0.03, constraints: 0.07 };

  const scored = CORPUS.map(({ entry, doc, vector }) => {
    const scores = {
      exact: queryDoc ? exactModel(queryDoc, doc) : 0,
      vector: cosine(queryVector, vector),
      lexical: queryDoc ? lexical(queryDoc, doc, entry) : 0,
      capability: queryDoc ? capability(queryDoc, doc) : 0.5,
      benchmark: queryDoc ? benchmark(queryDoc, doc) : 0.5,
      constraints: queryDoc ? constraintFit(queryDoc, doc) : 1,
    };
    const raw =
      scores.vector * weights.vector +
      scores.exact * weights.exact +
      scores.lexical * weights.lexical +
      scores.capability * weights.capability +
      scores.benchmark * weights.benchmark +
      scores.constraints * weights.constraints;
    const exactBoost = scores.exact >= 1 ? 0.45 : scores.exact >= 0.94 ? 0.18 : scores.exact >= 0.8 ? 0.1 : 0;
    const similarity = clamp(raw * scores.constraints + exactBoost);
    return {
      entry,
      similarity,
      scores,
      evidence: queryDoc ? evidence(queryDoc, doc, entry, scores) : [],
    };
  });

  scored.sort((a, b) =>
    b.similarity - a.similarity ||
    b.scores.exact - a.scores.exact ||
    b.scores.lexical - a.scores.lexical ||
    b.scores.capability - a.scores.capability
  );
  return scored.slice(0, k);
}

export function buildContext(profile, matches) {
  const query = profileDocument(profile || {});
  const byTier = { 0: 0, 1: 0, 2: 0, 3: 0 };
  let total = 0;
  let evidenceHits = 0;

  for (const match of matches || []) {
    const weight = Math.max(0.001, match.similarity);
    byTier[match.entry.tier] += weight;
    total += weight;
    evidenceHits += match.evidence?.length ? 1 : 0;
  }

  const tiers = Object.entries(byTier)
    .map(([tier, weight]) => ({ tier: Number(tier), weight: total ? weight / total : 0 }))
    .sort((a, b) => b.weight - a.weight);

  const top = tiers[0] || { tier: query.capabilityTier, weight: 0 };
  const next = tiers[1] || { tier: query.capabilityTier, weight: 0 };
  const conflict = clamp(next.weight / Math.max(top.weight, 0.001));
  const constraints = {
    noWebGL: query.webglVersion <= 0,
    softwareRenderer: query.gpu.software,
    dataSaver: query.saveData,
    lowMemory: query.memory <= 2,
    mobile: query.deviceType === 'mobile',
    highDprMobile: query.deviceType === 'mobile' && query.pixelRatio >= 2.5,
    webgl1: query.webglVersion === 1,
    slowConnection: query.connectionScore < 0.5,
  };

  return {
    query,
    corpus: KNOWLEDGE_BASE_STATS,
    support: {
      byTier,
      rankedTiers: tiers,
      topTier: top.tier,
      topWeight: top.weight,
      conflict,
      evidenceCoverage: matches?.length ? evidenceHits / matches.length : 0,
    },
    constraints,
    retrieved: (matches || []).map((match) => ({
      id: match.entry.id,
      gpu: match.entry.gpu,
      exactModel: match.entry.source?.exactModel || match.entry.id,
      source: match.entry.source || null,
      tier: match.entry.tier,
      benchFps: match.entry.benchFps,
      similarity: Number(match.similarity.toFixed(3)),
      scores: Object.fromEntries(Object.entries(match.scores).map(([key, value]) => [key, Number(value.toFixed(3))])),
      evidence: match.evidence,
    })),
  };
}

export function hasStrongMatch(matches, context = null) {
  if (!matches?.length) return false;
  const top = matches[0];
  const second = matches[1];
  const gap = top.similarity - (second?.similarity || 0);
  const support = context?.support?.topWeight ?? 0;
  const evidence = top.scores?.lexical >= 0.6 || top.scores?.benchmark >= 0.9;
  return top.similarity >= 0.94 && gap >= 0.045 && evidence && support >= 0.5;
}
