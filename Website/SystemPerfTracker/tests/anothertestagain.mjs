/**
 * ═══════════════════════════════════════════════════════════════
 *  External Validation: PassMark G3D + Geekbench Ground Truth
 * ═══════════════════════════════════════════════════════════════
 *
 *  Compares the classifier's tier assignments against externally-
 *  sourced benchmark scores (PassMark G3D Mark, Geekbench Metal/
 *  OpenCL) to see whether the custom tiers correlate with real-
 *  world GPU performance data.
 *
 *  Tier boundaries are derived from natural clusters in the
 *  PassMark G3D score distribution:
 *    T0: software / blocked (no real GPU)
 *    T1: < 3,000 G3D   (entry-level / old integrated)
 *    T2: 3,000 – 14,999 G3D   (mid-range / capable)
 *    T3: ≥ 15,000 G3D   (high-end / enthusiast)
 *
 *  For mobile GPUs without PassMark scores, Geekbench Metal/
 *  OpenCL compute scores are used with adjusted boundaries:
 *    T0: software
 *    T1: < 10,000 Geekbench compute
 *    T2: 10,000 – 40,000 Geekbench compute
 *    T3: > 40,000 Geekbench compute
 *
 *  Run:  node --experimental-vm-modules tests/external-validation.mjs
 */

import { retrieve } from '../src/rag/retriever.js';
import { recommend, adjustWithBenchmark } from '../src/rag/recommender.js';
import { KNOWLEDGE_BASE } from '../src/rag/knowledge-base.js';

// ─── Helpers ────────────────────────────────────────────────────────────────

function pipeline(input) {
  const profile = {
    gpu: input.gpu || '', vendor: input.vendor || '',
    memory: input.memory ?? 8, cores: input.cores ?? 8,
    deviceType: input.deviceType || 'desktop',
    screenWidth: input.screenWidth || 1920, screenHeight: input.screenHeight || 1080,
    pixelRatio: input.pixelRatio || 1, webglVersion: input.webglVersion ?? 2,
    benchFps: input.benchFps ?? 0, floatTextures: input.floatTextures ?? true,
    maxTextureSize: input.maxTextureSize ?? 16384,
    connection: input.connection || null,
  };
  const matches = retrieve(profile, 6);
  let rec = recommend(matches, profile);
  if (profile.benchFps > 0) rec = adjustWithBenchmark(rec, profile.benchFps, rec.context);
  return { tier: rec.tier, confidence: rec.confidence, settings: rec.settings, reasoning: rec.reasoning };
}

// ─── EXTERNAL BENCHMARK DATA ───────────────────────────────────────────────
// Sources: PassMark G3D Mark (videocardbenchmark.net), Geekbench 6 (browser.geekbench.com)
// All scores are approximate averages from public databases as of May 2026.

const EXTERNAL_CASES = [
  // ══════════════════════════════════════════════════════════════
  // DESKTOP GPUs — PassMark G3D Mark scores
  // ══════════════════════════════════════════════════════════════

  // --- NVIDIA High-End (expected T3 by external benchmark) ---
  { gpu: 'ANGLE (NVIDIA, NVIDIA GeForce RTX 4090 D, Direct3D11)',
    g3d: 38250, source: 'PassMark', externalTier: 3, label: 'RTX 4090 D' },
  { gpu: 'ANGLE (NVIDIA, NVIDIA GeForce RTX 4080 SUPER, Direct3D11)',
    g3d: 34270, source: 'PassMark', externalTier: 3, label: 'RTX 4080 SUPER' },
  { gpu: 'ANGLE (NVIDIA, NVIDIA GeForce RTX 3090, Direct3D11)',
    g3d: 27400, source: 'PassMark', externalTier: 3, label: 'RTX 3090' },
  { gpu: 'ANGLE (NVIDIA, NVIDIA GeForce RTX 3080 Ti, OpenGL 4.5)',
    g3d: 26900, source: 'PassMark', externalTier: 3, label: 'RTX 3080 Ti' },
  { gpu: 'ANGLE (NVIDIA, NVIDIA GeForce RTX 2080 Ti, Direct3D11)',
    g3d: 22600, source: 'PassMark', externalTier: 3, label: 'RTX 2080 Ti' },
  { gpu: 'ANGLE (NVIDIA, NVIDIA GeForce RTX 2070 SUPER, OpenGL 4.5)',
    g3d: 17600, source: 'PassMark', externalTier: 3, label: 'RTX 2070 SUPER' },
  { gpu: 'NVIDIA GeForce RTX 3060 Ti',
    g3d: 28500, source: 'PassMark', externalTier: 3, label: 'RTX 3060 Ti raw' },

  // --- AMD High-End (expected T3) ---
  { gpu: 'ANGLE (AMD, AMD Radeon RX 7800 XT, Direct3D11)',
    g3d: 24370, source: 'PassMark', externalTier: 3, label: 'RX 7800 XT' },
  { gpu: 'ANGLE (AMD, AMD Radeon RX 6950 XT, Direct3D11)',
    g3d: 26500, source: 'PassMark', externalTier: 3, label: 'RX 6950 XT' },
  { gpu: 'ANGLE (AMD, AMD Radeon RX 6700 XT, OpenGL 4.5)',
    g3d: 20800, source: 'PassMark', externalTier: 3, label: 'RX 6700 XT' },
  { gpu: 'AMD Radeon RX 6600 XT',
    g3d: 21000, source: 'PassMark', externalTier: 3, label: 'RX 6600 XT raw' },

  // --- Intel High-End (expected T3) ---
  { gpu: 'ANGLE (Intel, Intel Arc A750 Graphics, Direct3D11)',
    g3d: 18500, source: 'PassMark', externalTier: 3, label: 'Intel Arc A750' },

  // --- NVIDIA Mid-Range (expected T2) ---
  { gpu: 'ANGLE (NVIDIA, NVIDIA GeForce GTX 1070, Direct3D11)',
    g3d: 11500, source: 'PassMark', externalTier: 2, label: 'GTX 1070' },
  { gpu: 'ANGLE (NVIDIA, NVIDIA GeForce GTX 1060 6GB, OpenGL 4.5)',
    g3d: 9500, source: 'PassMark', externalTier: 2, label: 'GTX 1060 6GB' },
  { gpu: 'ANGLE (NVIDIA, NVIDIA GeForce RTX 3050, Direct3D11)',
    memory: 4, g3d: 12500, source: 'PassMark', externalTier: 2, label: 'RTX 3050 desktop' },

  // --- AMD Mid-Range (expected T2) ---
  { gpu: 'ANGLE (AMD, AMD Radeon RX 5600 XT, Direct3D11)',
    g3d: 13400, source: 'PassMark', externalTier: 2, label: 'RX 5600 XT' },
  { gpu: 'ANGLE (AMD, AMD Radeon RX 5500 XT, OpenGL 4.5)',
    g3d: 9060, source: 'PassMark', externalTier: 2, label: 'RX 5500 XT' },
  { gpu: 'ANGLE (AMD, AMD Radeon RX 570, Direct3D11)',
    g3d: 7000, source: 'PassMark', externalTier: 2, label: 'RX 570' },

  // --- Intel Mid-Range (expected T2) ---
  { gpu: 'ANGLE (Intel, Intel Arc A580 Graphics, Direct3D11)',
    g3d: 12500, source: 'PassMark', externalTier: 2, label: 'Arc A580' },
  { gpu: 'Intel(R) Iris(R) Xe Graphics',
    g3d: 2750, source: 'PassMark', externalTier: 1, label: 'Iris Xe raw' },
  // NOTE: Iris Xe at ~2,750 G3D is actually T1 by external data, NOT T2
  { gpu: 'ANGLE (Intel, Intel(R) Iris(R) Plus Graphics, Direct3D11)',
    g3d: 1500, source: 'PassMark', externalTier: 1, label: 'Iris Plus' },
  // NOTE: Iris Plus at ~1,500 G3D is T1 by external data

  // --- Low-End Desktop (expected T1) ---
  { gpu: 'ANGLE (NVIDIA, NVIDIA GeForce GT 730, Direct3D11)',
    memory: 2, cores: 2, g3d: 850, source: 'PassMark', externalTier: 1, label: 'GT 730' },
  { gpu: 'ANGLE (NVIDIA, NVIDIA GeForce GT 710, OpenGL 4.5)',
    memory: 2, cores: 2, g3d: 620, source: 'PassMark', externalTier: 1, label: 'GT 710' },
  { gpu: 'ANGLE (AMD, AMD Radeon R7 240, Direct3D11)',
    memory: 2, cores: 2, g3d: 899, source: 'PassMark', externalTier: 1, label: 'R7 240' },
  { gpu: 'ANGLE (AMD, AMD Radeon R5 Graphics, Direct3D11)',
    memory: 4, g3d: 450, source: 'PassMark', externalTier: 1, label: 'R5 integrated' },
  { gpu: 'ANGLE (AMD, AMD Radeon HD 7850, OpenGL 4.4)',
    memory: 4, cores: 4, g3d: 3903, source: 'PassMark', externalTier: 2, label: 'HD 7850' },
  // NOTE: HD 7850 at ~3,903 G3D is right at the T2 boundary — a borderline case
  { gpu: 'ANGLE (Intel, Intel(R) HD Graphics 530, Direct3D11)',
    memory: 4, cores: 4, g3d: 988, source: 'PassMark', externalTier: 1, label: 'HD 530' },
  { gpu: 'ANGLE (Intel, Intel(R) HD Graphics 620, OpenGL 4.5)',
    memory: 4, cores: 4, g3d: 1330, source: 'PassMark', externalTier: 1, label: 'HD 620' },
  { gpu: 'ANGLE (Intel, Intel(R) UHD Graphics, Direct3D11)',
    memory: 4, cores: 4, g3d: 1240, source: 'PassMark', externalTier: 1, label: 'UHD generic' },

  // ══════════════════════════════════════════════════════════════
  // APPLE SILICON — Geekbench 6 Metal compute scores
  // ══════════════════════════════════════════════════════════════

  { gpu: 'ANGLE (Apple, Apple M4, Metal)',
    pixelRatio: 2, geekbench: 55000, source: 'Geekbench Metal', externalTier: 3, label: 'Apple M4' },
  { gpu: 'ANGLE (Apple, Apple M2 Pro, Metal)',
    pixelRatio: 2, geekbench: 52500, source: 'Geekbench Metal', externalTier: 3, label: 'Apple M2 Pro' },
  { gpu: 'ANGLE (Apple, Apple M2 Max, Metal)',
    pixelRatio: 2, geekbench: 118000, source: 'Geekbench Metal', externalTier: 3, label: 'Apple M2 Max' },
  { gpu: 'ANGLE (Apple, Apple M1, OpenGL 4.1)',
    pixelRatio: 2, geekbench: 21500, source: 'Geekbench Metal', externalTier: 2, label: 'Apple M1 base' },

  // ══════════════════════════════════════════════════════════════
  // MOBILE GPUs — Geekbench 6 OpenCL/compute scores
  // ══════════════════════════════════════════════════════════════

  { gpu: 'ANGLE (Qualcomm, Adreno (TM) 730, OpenGL ES 3.2)',
    deviceType: 'mobile', pixelRatio: 3, geekbench: 8000, source: 'Geekbench OpenCL',
    externalTier: 1, label: 'Adreno 730' },
  // NOTE: Adreno 730 scores ~8,000 in Geekbench compute, which is T1 by external data
  { gpu: 'ANGLE (Apple, Apple A17 Pro GPU, Metal)',
    deviceType: 'mobile', pixelRatio: 3, screenWidth: 430, screenHeight: 932,
    geekbench: 27000, source: 'Geekbench Metal', externalTier: 2, label: 'A17 Pro mobile' },
  { gpu: 'ANGLE (ARM, Mali-G710, OpenGL ES 3.2)',
    deviceType: 'mobile', memory: 6, pixelRatio: 2.5,
    geekbench: 5500, source: 'Geekbench OpenCL', externalTier: 1, label: 'Mali-G710' },
  // NOTE: Mali-G710 at ~5,500 is T1 by external data
  { gpu: 'ANGLE (Qualcomm, Adreno (TM) 510, OpenGL ES 3.1)',
    memory: 2, cores: 4, deviceType: 'mobile', pixelRatio: 2,
    geekbench: 1200, source: 'Geekbench OpenCL', externalTier: 1, label: 'Adreno 510' },
  { gpu: 'ANGLE (ARM, Mali-G51, OpenGL ES 3.1)',
    memory: 2, cores: 4, deviceType: 'mobile', pixelRatio: 2,
    geekbench: 800, source: 'Geekbench OpenCL', externalTier: 1, label: 'Mali-G51' },
  { gpu: 'ANGLE (Apple, Apple A14 GPU, OpenGL ES 3.0)',
    deviceType: 'mobile', memory: 4, cores: 6, pixelRatio: 3,
    geekbench: 10000, source: 'Geekbench Metal', externalTier: 1, label: 'A14 mobile' },

  // ══════════════════════════════════════════════════════════════
  // SOFTWARE RENDERERS — always T0
  // ══════════════════════════════════════════════════════════════

  { gpu: 'Google SwiftShader', memory: 1, cores: 1, webglVersion: 1,
    g3d: 0, source: 'N/A (software)', externalTier: 0, label: 'SwiftShader' },
  { gpu: 'llvmpipe (LLVM 15.0.7, 256 bits)', memory: 1, cores: 1, webglVersion: 1,
    g3d: 0, source: 'N/A (software)', externalTier: 0, label: 'llvmpipe' },
  { gpu: 'Mesa DRI Intel(R) HD Graphics (SKL GT2)', memory: 2, cores: 2, webglVersion: 1,
    floatTextures: false, g3d: 0, source: 'N/A (software)', externalTier: 0, label: 'Mesa SW fallback' },
];

// ─── Tier boundary documentation ────────────────────────────────────────────

const PASSMARK_BOUNDARIES = {
  label: 'PassMark G3D Mark',
  t0: 'Software / no GPU',
  t1: '< 3,000',
  t2: '3,000 – 14,999',
  t3: '≥ 15,000',
  source: 'https://www.videocardbenchmark.net/',
};

const GEEKBENCH_BOUNDARIES = {
  label: 'Geekbench 6 Compute (Metal/OpenCL)',
  t0: 'Software / no GPU',
  t1: '< 10,000',
  t2: '10,000 – 40,000',
  t3: '> 40,000',
  source: 'https://browser.geekbench.com/',
};

// ─── CONFUSION MATRIX ───────────────────────────────────────────────────────

function buildConfusionMatrix(results) {
  const tiers = [0, 1, 2, 3];
  const matrix = {};
  for (const e of tiers) { matrix[e] = {}; for (const g of tiers) matrix[e][g] = 0; }
  for (const r of results) {
    const e = Math.max(0, Math.min(3, r.external));
    const g = Math.max(0, Math.min(3, r.got));
    matrix[e][g]++;
  }
  return matrix;
}

function classMetrics(matrix, tier) {
  const tiers = [0, 1, 2, 3];
  const tp = matrix[tier][tier];
  const fp = tiers.reduce((s, t) => s + (t !== tier ? matrix[t][tier] : 0), 0);
  const fn = tiers.reduce((s, t) => s + (t !== tier ? matrix[tier][t] : 0), 0);
  const precision = tp + fp > 0 ? tp / (tp + fp) : 0;
  const recall = tp + fn > 0 ? tp / (tp + fn) : 0;
  const f1 = precision + recall > 0 ? 2 * precision * recall / (precision + recall) : 0;
  return { tp, fp, fn, precision, recall, f1 };
}

function cohensKappa(results) {
  const n = results.length;
  if (n === 0) return 0;
  const tiers = [0, 1, 2, 3];
  const matrix = buildConfusionMatrix(results);
  const po = results.filter(r => r.got === r.external).length / n;
  let pe = 0;
  for (const t of tiers) {
    const rowSum = tiers.reduce((s, g) => s + matrix[t][g], 0);
    const colSum = tiers.reduce((s, e) => s + matrix[e][t], 0);
    pe += (rowSum / n) * (colSum / n);
  }
  return pe < 1 ? (po - pe) / (1 - pe) : 1;
}

// ─── RUN ────────────────────────────────────────────────────────────────────

console.log('\n═══════════════════════════════════════════════════════════');
console.log('  External Validation: PassMark G3D + Geekbench Ground Truth');
console.log('═══════════════════════════════════════════════════════════\n');
console.log(`Knowledge base: ${KNOWLEDGE_BASE.length} profiles`);
console.log(`External test cases: ${EXTERNAL_CASES.length}`);
console.log(`Date: ${new Date().toISOString()}\n`);

console.log('─── TIER BOUNDARIES (External) ───\n');
console.log(`  ${PASSMARK_BOUNDARIES.label}:`);
console.log(`    T0: ${PASSMARK_BOUNDARIES.t0}`);
console.log(`    T1: ${PASSMARK_BOUNDARIES.t1}`);
console.log(`    T2: ${PASSMARK_BOUNDARIES.t2}`);
console.log(`    T3: ${PASSMARK_BOUNDARIES.t3}`);
console.log(`    Source: ${PASSMARK_BOUNDARIES.source}\n`);
console.log(`  ${GEEKBENCH_BOUNDARIES.label}:`);
console.log(`    T0: ${GEEKBENCH_BOUNDARIES.t0}`);
console.log(`    T1: ${GEEKBENCH_BOUNDARIES.t1}`);
console.log(`    T2: ${GEEKBENCH_BOUNDARIES.t2}`);
console.log(`    T3: ${GEEKBENCH_BOUNDARIES.t3}`);
console.log(`    Source: ${GEEKBENCH_BOUNDARIES.source}\n`);

// ── Phase 1: Per-case comparison ────────────────────────────────────────────

console.log('─── PHASE 1: CLASSIFIER vs EXTERNAL BENCHMARK ───\n');

const results = [];
for (const c of EXTERNAL_CASES) {
  const result = pipeline(c);
  const pass = result.tier === c.externalTier;
  const score = c.g3d || c.geekbench || 0;
  const offBy = Math.abs(result.tier - c.externalTier);
  results.push({
    name: c.label,
    external: c.externalTier,
    got: result.tier,
    pass,
    offBy,
    score,
    source: c.source,
    confidence: result.confidence,
  });
  const icon = pass ? '✅' : offBy === 1 ? '⚠️' : '❌';
  const scoreLabel = c.g3d ? `G3D:${c.g3d}` : `GB:${c.geekbench}`;
  console.log(`${icon} [Ext:T${c.externalTier}→Cls:T${result.tier}] ${c.label.padEnd(20)} ${scoreLabel.padEnd(14)} (${c.source})`);
}

const exactMatch = results.filter(r => r.pass).length;
const off1 = results.filter(r => r.offBy === 1).length;
const off2plus = results.filter(r => r.offBy >= 2).length;

console.log(`\n   Exact match:   ${exactMatch}/${results.length} (${(exactMatch / results.length * 100).toFixed(1)}%)`);
console.log(`   Off by 1:      ${off1}`);
console.log(`   Off by 2+:     ${off2plus}\n`);

// ── Phase 2: Confusion Matrix ───────────────────────────────────────────────

console.log('─── PHASE 2: CONFUSION MATRIX (vs external benchmarks) ───\n');

const matrix = buildConfusionMatrix(results);
console.log('             Predicted (Classifier)');
console.log('             T0   T1   T2   T3');
for (const e of [0, 1, 2, 3]) {
  const row = [0, 1, 2, 3].map(g => String(matrix[e][g]).padStart(4));
  console.log(`  ExtBench T${e} ${row.join(' ')}`);
}

console.log('\n   Per-class metrics:');
console.log('   Tier  Prec   Rec    F1     TP  FP  FN');
let macroF1 = 0;
for (const t of [0, 1, 2, 3]) {
  const m = classMetrics(matrix, t);
  console.log(`   T${t}    ${m.precision.toFixed(3)}  ${m.recall.toFixed(3)}  ${m.f1.toFixed(3)}   ${String(m.tp).padStart(3)} ${String(m.fp).padStart(3)} ${String(m.fn).padStart(3)}`);
  macroF1 += m.f1;
}
macroF1 /= 4;

const mae = results.reduce((s, r) => s + Math.abs(r.external - r.got), 0) / results.length;
const kappa = cohensKappa(results);
const acc = exactMatch / results.length;

console.log(`\n   Macro-F1:        ${macroF1.toFixed(3)}`);
console.log(`   MAE:             ${mae.toFixed(3)}`);
console.log(`   Cohen's κ:       ${kappa.toFixed(3)}`);
console.log(`   Accuracy:        ${(acc * 100).toFixed(1)}%\n`);

// ── Phase 3: Disagree analysis ──────────────────────────────────────────────

console.log('─── PHASE 3: DISAGREEMENT ANALYSIS ───\n');

const disagrees = results.filter(r => !r.pass);
if (disagrees.length === 0) {
  console.log('   No disagreements — classifier perfectly matches external benchmarks.\n');
} else {
  console.log(`   ${disagrees.length} disagreement(s):\n`);
  for (const d of disagrees) {
    const direction = d.got > d.external ? 'OVER-ESTIMATE' : 'UNDER-ESTIMATE';
    console.log(`   • ${d.name}: external T${d.external} → classifier T${d.got} (${direction})`);
    console.log(`     Benchmark: ${d.score} (${d.source})`);
    console.log(`     Off by ${d.offBy} tier(s)\n`);
  }

  const overcount = disagrees.filter(d => d.got > d.external).length;
  const undercount = disagrees.filter(d => d.got < d.external).length;
  console.log(`   Direction: ${overcount} over-estimates, ${undercount} under-estimates`);
  console.log(`   (Under-estimates are the safe failure mode for a renderer)\n`);
}

// ── Phase 4: Within-1-tier accuracy ─────────────────────────────────────────

console.log('─── PHASE 4: RELAXED ACCURACY (±1 tier tolerance) ───\n');

const within1 = results.filter(r => r.offBy <= 1).length;
console.log(`   Within ±1 tier: ${within1}/${results.length} (${(within1 / results.length * 100).toFixed(1)}%)`);
console.log(`   Exact match:    ${exactMatch}/${results.length} (${(acc * 100).toFixed(1)}%)\n`);

// ── Final Summary ───────────────────────────────────────────────────────────

console.log('═══════════════════════════════════════════════════════════');
console.log('  EXTERNAL VALIDATION SUMMARY');
console.log('═══════════════════════════════════════════════════════════');
console.log(`  Test cases:          ${results.length}`);
console.log(`  Exact accuracy:      ${exactMatch}/${results.length} (${(acc * 100).toFixed(1)}%)`);
console.log(`  Within ±1 tier:      ${within1}/${results.length} (${(within1 / results.length * 100).toFixed(1)}%)`);
console.log(`  Macro-F1:            ${macroF1.toFixed(3)}`);
console.log(`  Cohen's κ:           ${kappa.toFixed(3)}`);
console.log(`  MAE:                 ${mae.toFixed(3)}`);
console.log(`  Over-estimates:      ${disagrees.filter(d => d.got > d.external).length}`);
console.log(`  Under-estimates:     ${disagrees.filter(d => d.got < d.external).length}`);
console.log('═══════════════════════════════════════════════════════════');
console.log(`  External sources: PassMark G3D Mark, Geekbench 6 Metal/OpenCL`);
console.log('═══════════════════════════════════════════════════════════\n');
