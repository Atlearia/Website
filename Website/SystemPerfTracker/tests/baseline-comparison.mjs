/**
 * ═══════════════════════════════════════════════════════════════
 *  Baseline Comparison: Raw GPU Name vs Full RAG Pipeline
 * ═══════════════════════════════════════════════════════════════
 *
 *  Question: Does the 5,000-profile KB + hybrid retrieval actually
 *  improve accuracy over just parsing the GPU renderer string?
 *
 *  Baseline = tierHint(parseGpu(gpuString))
 *    - This is essentially what you'd get from WebGL's renderer
 *      string + a hand-coded if/else tree. No KB, no retrieval.
 *
 *  Full System = retrieve() → recommend() pipeline
 *    - The full RAG system with KB lookup, vector scoring, etc.
 *
 *  Both are compared against external benchmarks (PassMark G3D,
 *  Geekbench) as ground truth.
 */

import { retrieve } from '../src/rag/retriever.js';
import { recommend, adjustWithBenchmark } from '../src/rag/recommender.js';
import { parseGpu, profileDocument } from '../src/rag/vectorizer.js';

// ─── Helpers ────────────────────────────────────────────────────────────────

/** Full RAG pipeline — what the system actually does */
function fullPipeline(input) {
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
  return rec.tier;
}

/** 
 * Baseline: just parse the GPU string and use tierHint.
 * This is what you'd get from WebGL renderer + basic regexes.
 * No knowledge base, no retrieval, no vector similarity.
 * 
 * Applies the same constraint logic for fairness (mobile cap, 
 * save-data, software detection, etc.)
 */
function baselineTierHint(input) {
  const gpu = parseGpu(input.gpu || '');
  const hint = gpu.tierHint;
  
  // Handle software renderers
  if (gpu.software) return 0;
  
  // Handle no WebGL
  if ((input.webglVersion ?? 2) <= 0) return 0;
  
  // If we couldn't parse anything (unknown brand), best guess
  if (hint === null) {
    if (gpu.brand === 'unknown') return 1; // conservative fallback
    return 1;
  }
  
  let tier = hint;
  
  // Apply same constraints as the full system for fairness
  if (input.connection?.saveData) tier = Math.min(tier, 1);
  if (input.connection?.effectiveType === '2g' || input.connection?.effectiveType === 'slow-2g') tier = Math.min(tier, 1);
  if (input.deviceType === 'mobile') tier = Math.min(tier, 2);
  if ((input.memory ?? 8) <= 2) tier = Math.min(tier, 1);
  
  return Math.max(0, Math.min(3, tier));
}

/**
 * Even simpler baseline: capabilityTier from profileDocument.
 * This uses tierHint + memory/cores/texture/benchmark signals
 * but still no KB or retrieval.
 */
function baselineCapabilityTier(input) {
  const doc = profileDocument({
    gpu: input.gpu || '',
    memory: input.memory ?? 8,
    cores: input.cores ?? 8,
    deviceType: input.deviceType || 'desktop',
    screenWidth: input.screenWidth || 1920,
    screenHeight: input.screenHeight || 1080,
    pixelRatio: input.pixelRatio || 1,
    webglVersion: input.webglVersion ?? 2,
    benchFps: input.benchFps ?? 0,
    floatTextures: input.floatTextures ?? true,
    maxTextureSize: input.maxTextureSize ?? 16384,
    connection: input.connection || null,
  });
  
  let tier = doc.capabilityTier;
  
  // Apply same constraints
  if (input.connection?.saveData) tier = Math.min(tier, 1);
  if (input.connection?.effectiveType === '2g' || input.connection?.effectiveType === 'slow-2g') tier = Math.min(tier, 1);
  if (input.deviceType === 'mobile') tier = Math.min(tier, 2);
  if (doc.gpu.brand === 'unknown') tier = Math.min(tier, 1);
  
  return Math.max(0, Math.min(3, tier));
}

// ─── EXTERNAL TEST DATA ────────────────────────────────────────────────────
// Same external benchmark data as the validation suite

const EXTERNAL_CASES = [
  // HIGH-END (T3 by external benchmarks)
  { gpu: 'ANGLE (NVIDIA, NVIDIA GeForce RTX 4090 D, Direct3D11)', g3d: 38250, externalTier: 3, label: 'RTX 4090 D' },
  { gpu: 'ANGLE (NVIDIA, NVIDIA GeForce RTX 4080 SUPER, Direct3D11)', g3d: 34270, externalTier: 3, label: 'RTX 4080 SUPER' },
  { gpu: 'ANGLE (NVIDIA, NVIDIA GeForce RTX 3090, Direct3D11)', g3d: 27400, externalTier: 3, label: 'RTX 3090' },
  { gpu: 'ANGLE (NVIDIA, NVIDIA GeForce RTX 3080 Ti, OpenGL 4.5)', g3d: 26900, externalTier: 3, label: 'RTX 3080 Ti' },
  { gpu: 'ANGLE (NVIDIA, NVIDIA GeForce RTX 2080 Ti, Direct3D11)', g3d: 22600, externalTier: 3, label: 'RTX 2080 Ti' },
  { gpu: 'ANGLE (NVIDIA, NVIDIA GeForce RTX 2070 SUPER, OpenGL 4.5)', g3d: 17600, externalTier: 3, label: 'RTX 2070 SUPER' },
  { gpu: 'NVIDIA GeForce RTX 3060 Ti', g3d: 28500, externalTier: 3, label: 'RTX 3060 Ti raw' },
  { gpu: 'ANGLE (AMD, AMD Radeon RX 7800 XT, Direct3D11)', g3d: 24370, externalTier: 3, label: 'RX 7800 XT' },
  { gpu: 'ANGLE (AMD, AMD Radeon RX 6950 XT, Direct3D11)', g3d: 26500, externalTier: 3, label: 'RX 6950 XT' },
  { gpu: 'ANGLE (AMD, AMD Radeon RX 6700 XT, OpenGL 4.5)', g3d: 20800, externalTier: 3, label: 'RX 6700 XT' },
  { gpu: 'AMD Radeon RX 6600 XT', g3d: 21000, externalTier: 3, label: 'RX 6600 XT raw' },
  { gpu: 'ANGLE (Intel, Intel Arc A750 Graphics, Direct3D11)', g3d: 18500, externalTier: 3, label: 'Intel Arc A750' },

  // MID-RANGE (T2 by external benchmarks)
  { gpu: 'ANGLE (NVIDIA, NVIDIA GeForce GTX 1070, Direct3D11)', g3d: 11500, externalTier: 2, label: 'GTX 1070' },
  { gpu: 'ANGLE (NVIDIA, NVIDIA GeForce GTX 1060 6GB, OpenGL 4.5)', g3d: 9500, externalTier: 2, label: 'GTX 1060 6GB' },
  { gpu: 'ANGLE (NVIDIA, NVIDIA GeForce RTX 3050, Direct3D11)', memory: 4, g3d: 12500, externalTier: 2, label: 'RTX 3050 desktop' },
  { gpu: 'ANGLE (AMD, AMD Radeon RX 5600 XT, Direct3D11)', g3d: 13400, externalTier: 2, label: 'RX 5600 XT' },
  { gpu: 'ANGLE (AMD, AMD Radeon RX 5500 XT, OpenGL 4.5)', g3d: 9060, externalTier: 2, label: 'RX 5500 XT' },
  { gpu: 'ANGLE (AMD, AMD Radeon RX 570, Direct3D11)', g3d: 7000, externalTier: 2, label: 'RX 570' },
  { gpu: 'ANGLE (Intel, Intel Arc A580 Graphics, Direct3D11)', g3d: 12500, externalTier: 2, label: 'Arc A580' },
  { gpu: 'ANGLE (AMD, AMD Radeon HD 7850, OpenGL 4.4)', memory: 4, cores: 4, g3d: 3903, externalTier: 2, label: 'HD 7850' },

  // LOW-END (T1 by external benchmarks)  
  { gpu: 'Intel(R) Iris(R) Xe Graphics', g3d: 2750, externalTier: 1, label: 'Iris Xe raw' },
  { gpu: 'ANGLE (Intel, Intel(R) Iris(R) Plus Graphics, Direct3D11)', g3d: 1500, externalTier: 1, label: 'Iris Plus' },
  { gpu: 'ANGLE (NVIDIA, NVIDIA GeForce GT 730, Direct3D11)', memory: 2, cores: 2, g3d: 850, externalTier: 1, label: 'GT 730' },
  { gpu: 'ANGLE (NVIDIA, NVIDIA GeForce GT 710, OpenGL 4.5)', memory: 2, cores: 2, g3d: 620, externalTier: 1, label: 'GT 710' },
  { gpu: 'ANGLE (AMD, AMD Radeon R7 240, Direct3D11)', memory: 2, cores: 2, g3d: 899, externalTier: 1, label: 'R7 240' },
  { gpu: 'ANGLE (AMD, AMD Radeon R5 Graphics, Direct3D11)', memory: 4, g3d: 450, externalTier: 1, label: 'R5 integrated' },
  { gpu: 'ANGLE (Intel, Intel(R) HD Graphics 530, Direct3D11)', memory: 4, cores: 4, g3d: 988, externalTier: 1, label: 'HD 530' },
  { gpu: 'ANGLE (Intel, Intel(R) HD Graphics 620, OpenGL 4.5)', memory: 4, cores: 4, g3d: 1330, externalTier: 1, label: 'HD 620' },
  { gpu: 'ANGLE (Intel, Intel(R) UHD Graphics, Direct3D11)', memory: 4, cores: 4, g3d: 1240, externalTier: 1, label: 'UHD generic' },

  // APPLE SILICON (Geekbench Metal)
  { gpu: 'ANGLE (Apple, Apple M4, Metal)', pixelRatio: 2, externalTier: 3, label: 'Apple M4' },
  { gpu: 'ANGLE (Apple, Apple M2 Pro, Metal)', pixelRatio: 2, externalTier: 3, label: 'Apple M2 Pro' },
  { gpu: 'ANGLE (Apple, Apple M2 Max, Metal)', pixelRatio: 2, externalTier: 3, label: 'Apple M2 Max' },
  { gpu: 'ANGLE (Apple, Apple M1, OpenGL 4.1)', pixelRatio: 2, externalTier: 2, label: 'Apple M1 base' },

  // MOBILE
  { gpu: 'ANGLE (Qualcomm, Adreno (TM) 730, OpenGL ES 3.2)',
    deviceType: 'mobile', pixelRatio: 3, externalTier: 1, label: 'Adreno 730' },
  { gpu: 'ANGLE (Apple, Apple A17 Pro GPU, Metal)',
    deviceType: 'mobile', pixelRatio: 3, screenWidth: 430, screenHeight: 932,
    externalTier: 2, label: 'A17 Pro mobile' },
  { gpu: 'ANGLE (ARM, Mali-G710, OpenGL ES 3.2)',
    deviceType: 'mobile', memory: 6, pixelRatio: 2.5, externalTier: 1, label: 'Mali-G710' },
  { gpu: 'ANGLE (Qualcomm, Adreno (TM) 510, OpenGL ES 3.1)',
    memory: 2, cores: 4, deviceType: 'mobile', pixelRatio: 2, externalTier: 1, label: 'Adreno 510' },
  { gpu: 'ANGLE (ARM, Mali-G51, OpenGL ES 3.1)',
    memory: 2, cores: 4, deviceType: 'mobile', pixelRatio: 2, externalTier: 1, label: 'Mali-G51' },
  { gpu: 'ANGLE (Apple, Apple A14 GPU, OpenGL ES 3.0)',
    deviceType: 'mobile', memory: 4, cores: 6, pixelRatio: 3, externalTier: 1, label: 'A14 mobile' },

  // SOFTWARE (T0)
  { gpu: 'Google SwiftShader', memory: 1, cores: 1, webglVersion: 1, externalTier: 0, label: 'SwiftShader' },
  { gpu: 'llvmpipe (LLVM 15.0.7, 256 bits)', memory: 1, cores: 1, webglVersion: 1, externalTier: 0, label: 'llvmpipe' },
  { gpu: 'Mesa DRI Intel(R) HD Graphics (SKL GT2)', memory: 2, cores: 2, webglVersion: 1,
    floatTextures: false, externalTier: 0, label: 'Mesa SW fallback' },

  // PRIVACY-BLOCKED (no GPU string — the hard cases)
  { gpu: '', memory: 8, cores: 8, externalTier: 1, label: 'Empty GPU 8GB' },
  { gpu: '', memory: 16, cores: 16, externalTier: 1, label: 'Empty GPU 16GB' },
  { gpu: '', memory: 4, cores: 4, externalTier: 1, label: 'Empty GPU 4GB' },
  { gpu: '', memory: 2, cores: 2, externalTier: 1, label: 'Empty GPU 2GB' },

  // NETWORK CONSTRAINED
  { gpu: 'ANGLE (NVIDIA, NVIDIA GeForce RTX 4070 Ti, Direct3D11)',
    connection: { saveData: true }, externalTier: 1, label: 'RTX 4070 Ti + save-data' },
  { gpu: 'ANGLE (AMD, AMD Radeon RX 7900 XTX, Direct3D11)',
    connection: { effectiveType: '2g', downlink: 0.1 }, externalTier: 1, label: 'RX 7900 XTX + 2G' },
];

// ─── Run ────────────────────────────────────────────────────────────────────

console.log('\n═══════════════════════════════════════════════════════════');
console.log('  Baseline Comparison: Raw GPU Name vs Full RAG Pipeline');
console.log('═══════════════════════════════════════════════════════════\n');
console.log(`Test cases: ${EXTERNAL_CASES.length}`);
console.log(`Date: ${new Date().toISOString()}\n`);

console.log('Systems compared:');
console.log('  A) tierHint baseline  — parse GPU string → if/else tree → tier');
console.log('  B) capabilityTier     — tierHint + memory/cores/texture averaging');
console.log('  C) Full RAG pipeline  — KB retrieval + vector + lexical + constraints');
console.log('');

console.log('─── PER-CASE RESULTS ───\n');
console.log('Label'.padEnd(24) + 'Ext  Hint  Cap  Full  Hint✓  Cap✓  Full✓');
console.log('─'.repeat(80));

let hintCorrect = 0, capCorrect = 0, fullCorrect = 0;
let hintOff1 = 0, capOff1 = 0, fullOff1 = 0;
let hintMAE = 0, capMAE = 0, fullMAE = 0;

const detailed = [];

for (const c of EXTERNAL_CASES) {
  const hint = baselineTierHint(c);
  const cap = baselineCapabilityTier(c);
  const full = fullPipeline(c);
  const ext = c.externalTier;
  
  const hintOk = hint === ext;
  const capOk = cap === ext;
  const fullOk = full === ext;
  
  if (hintOk) hintCorrect++;
  if (capOk) capCorrect++;
  if (fullOk) fullCorrect++;
  
  if (Math.abs(hint - ext) === 1) hintOff1++;
  if (Math.abs(cap - ext) === 1) capOff1++;
  if (Math.abs(full - ext) === 1) fullOff1++;
  
  hintMAE += Math.abs(hint - ext);
  capMAE += Math.abs(cap - ext);
  fullMAE += Math.abs(full - ext);
  
  const hIcon = hintOk ? '✅' : '❌';
  const cIcon = capOk ? '✅' : '❌';
  const fIcon = fullOk ? '✅' : '❌';
  
  console.log(`${c.label.padEnd(24)} T${ext}   T${hint}    T${cap}   T${full}    ${hIcon}     ${cIcon}     ${fIcon}`);
  
  detailed.push({ label: c.label, ext, hint, cap, full, hintOk, capOk, fullOk });
}

const n = EXTERNAL_CASES.length;
hintMAE /= n; capMAE /= n; fullMAE /= n;

console.log('\n─── SUMMARY ───\n');

console.log('Metric'.padEnd(28) + 'tierHint    capTier    Full RAG');
console.log('─'.repeat(65));
console.log(`Exact accuracy`.padEnd(28) + 
  `${hintCorrect}/${n} (${(hintCorrect/n*100).toFixed(1)}%)`.padEnd(12) +
  `${capCorrect}/${n} (${(capCorrect/n*100).toFixed(1)}%)`.padEnd(12) +
  `${fullCorrect}/${n} (${(fullCorrect/n*100).toFixed(1)}%)`);
console.log(`Within ±1 tier`.padEnd(28) + 
  `${hintCorrect + hintOff1}/${n} (${((hintCorrect+hintOff1)/n*100).toFixed(1)}%)`.padEnd(12) +
  `${capCorrect + capOff1}/${n} (${((capCorrect+capOff1)/n*100).toFixed(1)}%)`.padEnd(12) +
  `${fullCorrect + fullOff1}/${n} (${((fullCorrect+fullOff1)/n*100).toFixed(1)}%)`);
console.log(`MAE`.padEnd(28) + 
  `${hintMAE.toFixed(3)}`.padEnd(12) +
  `${capMAE.toFixed(3)}`.padEnd(12) +
  `${fullMAE.toFixed(3)}`);

// ── Where does each system win? ─────────────────────────────────────────────

console.log('\n─── WHERE FULL RAG WINS OVER BASELINE ───\n');

let raWins = 0, raLoses = 0, raSame = 0;
for (const d of detailed) {
  if (d.fullOk && !d.hintOk) {
    console.log(`  ✅ ${d.label}: baseline T${d.hint} → RAG T${d.full} (correct: T${d.ext})`);
    raWins++;
  } else if (!d.fullOk && d.hintOk) {
    console.log(`  ❌ ${d.label}: baseline T${d.hint} correct, RAG T${d.full} wrong (correct: T${d.ext})`);
    raLoses++;
  } else {
    raSame++;
  }
}
console.log(`\n  RAG wins: ${raWins} | RAG loses: ${raLoses} | Same: ${raSame}`);

console.log('\n─── WHERE FULL RAG LOSES TO BASELINE ───\n');
const losses = detailed.filter(d => !d.fullOk && d.hintOk);
if (losses.length === 0) console.log('  (none)');
for (const d of losses) {
  console.log(`  ${d.label}: baseline T${d.hint} ✅, RAG T${d.full} ❌ (correct: T${d.ext})`);
}

// ── Improvement calculation ─────────────────────────────────────────────────

console.log('\n═══════════════════════════════════════════════════════════');
console.log('  VERDICT');
console.log('═══════════════════════════════════════════════════════════');

const hintAcc = (hintCorrect / n * 100);
const fullAcc = (fullCorrect / n * 100);
const improvement = fullAcc - hintAcc;

console.log(`  Baseline (just GPU name):  ${hintAcc.toFixed(1)}%`);
console.log(`  Full RAG system:           ${fullAcc.toFixed(1)}%`);
console.log(`  Improvement:               ${improvement >= 0 ? '+' : ''}${improvement.toFixed(1)} pp`);
console.log(`  MAE reduction:             ${((hintMAE - fullMAE) / hintMAE * 100).toFixed(1)}%`);
console.log('═══════════════════════════════════════════════════════════\n');
