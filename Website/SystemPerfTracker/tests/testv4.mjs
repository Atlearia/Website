/**
 * V4 Blind Evaluation Suite
 * 
 * the ground rules for this suite:
 * - no cheating. we can't use exact GPU strings from the seed profiles.
 * - no corpus self-retrieval (it only proves our index deduplication works, doesn't actually test the pipeline).
 * - ground truth tiers have to come from real public GPU benchmarks, no reverse engineering them.
 * - we're doing proper stats: confusion matrix, Cohen's kappa, macro-F1, MAE. no cherry-picking the ones that pass.
 * - gotta sanity check the settings on every single case.
 * - throwing some fuzzed inputs at it (stuff the system has never seen) to see if it breaks.
 */

import { retrieve } from '../src/rag/retriever.js';
import { recommend, adjustWithBenchmark } from '../src/rag/recommender.js';
import { KNOWLEDGE_BASE } from '../src/rag/knowledge-base.js';

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

// ── BLIND CASES ─────────────────────────────────────────────────────────────
// none of these GPU strings exist in the seed profiles exactly as written here.
// I pulled the tiers from actual benchmark data (3DMark, GFXBench, Notebookcheck) instead of guessing.

const CASES = [
  // TIER 3 — high-end desktop/laptop
  { gpu: 'ANGLE (NVIDIA, NVIDIA GeForce RTX 4080 SUPER, Direct3D11)', tier: 3, label: 'RTX 4080 SUPER' },
  { gpu: 'ANGLE (NVIDIA, NVIDIA GeForce RTX 3090, Direct3D11)', tier: 3, label: 'RTX 3090' },
  { gpu: 'ANGLE (NVIDIA, NVIDIA GeForce RTX 3080 Ti, OpenGL 4.5)', tier: 3, label: 'RTX 3080 Ti' },
  { gpu: 'ANGLE (NVIDIA, NVIDIA GeForce RTX 2080 Ti, Direct3D11)', tier: 3, label: 'RTX 2080 Ti' },
  { gpu: 'ANGLE (NVIDIA, NVIDIA GeForce RTX 2070 SUPER, OpenGL 4.5)', tier: 3, label: 'RTX 2070 SUPER' },
  { gpu: 'ANGLE (AMD, AMD Radeon RX 7800 XT, Direct3D11)', tier: 3, label: 'RX 7800 XT' },
  { gpu: 'ANGLE (AMD, AMD Radeon RX 6950 XT, Direct3D11)', tier: 3, label: 'RX 6950 XT' },
  { gpu: 'ANGLE (AMD, AMD Radeon RX 6700 XT, OpenGL 4.5)', tier: 3, label: 'RX 6700 XT' },
  { gpu: 'ANGLE (Apple, Apple M2 Pro, Metal)', tier: 3, label: 'M2 Pro', pixelRatio: 2 },
  { gpu: 'ANGLE (Apple, Apple M2 Max, Metal)', tier: 3, label: 'M2 Max', pixelRatio: 2 },
  { gpu: 'ANGLE (Intel, Intel Arc A750 Graphics, Direct3D11)', tier: 3, label: 'Arc A750' },
  { gpu: 'NVIDIA GeForce RTX 3060 Ti', tier: 3, label: 'RTX 3060 Ti raw string' },
  { gpu: 'AMD Radeon RX 6600 XT', tier: 3, label: 'RX 6600 XT raw string' },

  // TIER 2 — mid-range
  { gpu: 'ANGLE (NVIDIA, NVIDIA GeForce GTX 1070, Direct3D11)', tier: 2, label: 'GTX 1070' },
  { gpu: 'ANGLE (NVIDIA, NVIDIA GeForce GTX 1060 6GB, OpenGL 4.5)', tier: 2, label: 'GTX 1060 6GB' },
  { gpu: 'ANGLE (NVIDIA, NVIDIA GeForce RTX 3050, Direct3D11)', memory: 4, tier: 2, label: 'RTX 3050 4GB' },
  { gpu: 'ANGLE (AMD, AMD Radeon RX 5600 XT, Direct3D11)', tier: 2, label: 'RX 5600 XT' },
  { gpu: 'ANGLE (AMD, AMD Radeon RX 570, Direct3D11)', tier: 2, label: 'RX 570' },
  { gpu: 'ANGLE (Apple, Apple M1, OpenGL 4.1)', tier: 2, label: 'M1 base', pixelRatio: 2 },
  { gpu: 'ANGLE (Intel, Intel Arc A580 Graphics, Direct3D11)', tier: 2, label: 'Arc A580' },
  { gpu: 'ANGLE (Qualcomm, Adreno (TM) 730, OpenGL ES 3.2)', tier: 2, label: 'Adreno 730', deviceType: 'mobile', pixelRatio: 3 },
  { gpu: 'ANGLE (Apple, Apple A17 Pro GPU, Metal)', tier: 2, label: 'A17 Pro', deviceType: 'mobile', pixelRatio: 3, screenWidth: 430, screenHeight: 932 },
  { gpu: 'ANGLE (ARM, Mali-G710, OpenGL ES 3.2)', tier: 2, label: 'Mali-G710', deviceType: 'mobile', memory: 6, pixelRatio: 2.5 },
  { gpu: 'Intel(R) Iris(R) Xe Graphics', tier: 2, label: 'Iris Xe raw string' },

  // TIER 1 — low-end / integrated
  { gpu: 'ANGLE (NVIDIA, NVIDIA GeForce GT 730, Direct3D11)', memory: 2, cores: 2, tier: 1, label: 'GT 730' },
  { gpu: 'ANGLE (NVIDIA, NVIDIA GeForce GT 710, OpenGL 4.5)', memory: 2, cores: 2, tier: 1, label: 'GT 710' },
  { gpu: 'ANGLE (AMD, AMD Radeon R5 Graphics, Direct3D11)', memory: 4, tier: 1, label: 'R5 integrated' },
  { gpu: 'ANGLE (AMD, AMD Radeon HD 7850, OpenGL 4.4)', memory: 4, cores: 4, tier: 1, label: 'HD 7850' },
  { gpu: 'ANGLE (Intel, Intel(R) HD Graphics 530, Direct3D11)', memory: 4, cores: 4, tier: 1, label: 'HD 530' },
  { gpu: 'ANGLE (Intel, Intel(R) UHD Graphics, Direct3D11)', memory: 4, cores: 4, tier: 1, label: 'UHD generic' },
  { gpu: 'ANGLE (Qualcomm, Adreno (TM) 510, OpenGL ES 3.1)', memory: 2, cores: 4, tier: 1, label: 'Adreno 510', deviceType: 'mobile', pixelRatio: 2 },
  { gpu: 'ANGLE (ARM, Mali-G51, OpenGL ES 3.1)', memory: 2, cores: 4, tier: 1, label: 'Mali-G51', deviceType: 'mobile', pixelRatio: 2 },
  { gpu: 'ANGLE (Apple, Apple A14 GPU, OpenGL ES 3.0)', tier: 1, label: 'A14', deviceType: 'mobile', memory: 4, cores: 6, pixelRatio: 3 },

  // TIER 0 — software / no GPU
  { gpu: 'Google SwiftShader', memory: 1, cores: 1, webglVersion: 1, tier: 0, label: 'SwiftShader' },
  { gpu: 'llvmpipe (LLVM 15.0.7, 256 bits)', memory: 1, cores: 1, webglVersion: 1, tier: 0, label: 'llvmpipe variant' },
  { gpu: '', webglVersion: 0, memory: 2, cores: 2, tier: 0, label: 'No WebGL' },

  // PRIVACY-BLOCKED — when the browser hides the GPU, we need to play it safe
  { gpu: '', memory: 8, cores: 8, tier: 1, label: 'Privacy 8GB' },
  { gpu: '', memory: 16, cores: 16, tier: 1, label: 'Privacy 16GB' },
  { gpu: '', memory: 2, cores: 2, tier: 1, label: 'Privacy 2GB' },

  // NETWORK-CONSTRAINED — beefy GPU but terrible internet connection
  { gpu: 'ANGLE (NVIDIA, NVIDIA GeForce RTX 4070 Ti, Direct3D11)', connection: { saveData: true }, tier: 1, label: 'RTX 4070 Ti + save-data' },
  { gpu: 'ANGLE (AMD, AMD Radeon RX 7900 XTX, Direct3D11)', connection: { effectiveType: '2g', downlink: 0.1 }, tier: 1, label: 'RX 7900 XTX + 2G' },

  // WEIRD INPUTS — let's see if we can break it
  { gpu: 'XYZZY MAGIC GPU 9001', memory: 4, cores: 4, tier: 1, label: 'Garbage string' },
  { gpu: 'nvidia geforce rtx 4070', tier: 3, label: 'Lowercase nvidia' },

  // BENCHMARK-ASSISTED — combining the static profile with actual measured FPS
  { gpu: '', memory: 8, cores: 8, benchFps: 250, tier: 1, label: 'Unknown + high bench' },
  { gpu: '', memory: 4, cores: 4, benchFps: 30, tier: 1, label: 'Unknown + low bench' },
  { gpu: 'ANGLE (NVIDIA, NVIDIA GeForce GTX 1050, OpenGL 4.5)', memory: 4, cores: 4, benchFps: 300, tier: 2, label: 'GTX 1050 bench outlier' },
];

// ── SETTINGS BOUNDS ─────────────────────────────────────────────────────────

const BOUNDS = {
  0: { maxPR: 0.5, maxTex: 512, aa: false, shad: false, maxFF: 0 },
  1: { maxPR: 1.0, maxTex: 1024, aa: false, shad: false, maxFF: 160 },
  2: { maxPR: 1.25, maxTex: 2048, aa: null, shad: false, maxFF: 300 },
  3: { maxPR: 2.0, maxTex: 4096, aa: null, shad: null, maxFF: 500 },
};

function checkSettings(tier, s) {
  const b = BOUNDS[tier];
  if (!b) return [];
  const e = [];
  if (s.pixelRatio > b.maxPR) e.push(`dpr ${s.pixelRatio}>${b.maxPR}`);
  if (s.maxTextureSize > b.maxTex) e.push(`tex ${s.maxTextureSize}>${b.maxTex}`);
  if (b.aa === false && s.antialias) e.push('AA on');
  if (b.shad === false && s.shadowsEnabled) e.push('shadows on');
  if (s.fireflyCount > b.maxFF) e.push(`ff ${s.fireflyCount}>${b.maxFF}`);
  return e;
}

// ── CONFUSION MATRIX & STATS ────────────────────────────────────────────────

function confMatrix(results) {
  const m = {};
  for (const t of [0,1,2,3]) { m[t] = {}; for (const g of [0,1,2,3]) m[t][g] = 0; }
  for (const r of results) m[r.expected][r.got]++;
  return m;
}

function classStats(m, t) {
  const tp = m[t][t];
  const fp = [0,1,2,3].reduce((s, e) => s + (e !== t ? m[e][t] : 0), 0);
  const fn = [0,1,2,3].reduce((s, g) => s + (g !== t ? m[t][g] : 0), 0);
  const p = tp + fp > 0 ? tp / (tp + fp) : 0;
  const r = tp + fn > 0 ? tp / (tp + fn) : 0;
  const f1 = p + r > 0 ? 2 * p * r / (p + r) : 0;
  return { tp, fp, fn, p, r, f1 };
}

function kappa(results) {
  const n = results.length;
  const m = confMatrix(results);
  const po = results.filter(r => r.got === r.expected).length / n;
  let pe = 0;
  for (const t of [0,1,2,3]) {
    const row = [0,1,2,3].reduce((s, g) => s + m[t][g], 0);
    const col = [0,1,2,3].reduce((s, e) => s + m[e][t], 0);
    pe += (row / n) * (col / n);
  }
  return pe < 1 ? (po - pe) / (1 - pe) : 1;
}

// ── FUZZ ─────────────────────────────────────────────────────────────────────

const MUTATIONS = [
  s => s.toLowerCase(),
  s => s.toUpperCase(),
  s => s.replace(/ANGLE \(/, 'ANGLE('),
  s => s.replace(/, /g, ','),
  s => s.replace(/Direct3D11/, 'D3D11 vs_5_0 ps_5_0'),
  s => s + ' ',
  s => ' ' + s,
  s => s.replace(/NVIDIA /g, ''),
  s => s.replace(/AMD /g, ''),
  s => s.replace(/\)/g, '').replace(/\(/g, ''),
];

// ── RUN ─────────────────────────────────────────────────────────────────────

console.log('\n══════════════════════════════════════════════════');
console.log('  V4 Blind Evaluation — Honest Results Only');
console.log('══════════════════════════════════════════════════\n');
console.log(`Corpus: ${KNOWLEDGE_BASE.length} profiles`);
console.log(`Blind cases: ${CASES.length}`);
console.log(`Date: ${new Date().toISOString()}\n`);

// Phase 1: let's see how accurate the tier predictions actually are
console.log('── PHASE 1: BLIND TIER ACCURACY ──\n');
const results = [];
for (const c of CASES) {
  const r = pipeline(c);
  const pass = r.tier === c.tier;
  results.push({ name: c.label, expected: c.tier, got: r.tier, pass, confidence: r.confidence, settings: r.settings, reasoning: r.reasoning });
  console.log(`${pass ? '✅' : '❌'} [T${c.tier}→T${r.tier}] ${c.label}  (${(r.confidence * 100).toFixed(0)}%)`);
  if (!pass) console.log(`   ⚠ ${r.reasoning}`);
}
const acc = results.filter(r => r.pass).length;
console.log(`\n   Accuracy: ${acc}/${results.length} (${(acc / results.length * 100).toFixed(1)}%)\n`);

// Phase 2: confusion matrix (where is it getting things wrong?)
console.log('── PHASE 2: CONFUSION MATRIX ──\n');
const cm = confMatrix(results);
console.log('             Predicted');
console.log('             T0   T1   T2   T3');
for (const e of [0,1,2,3]) {
  console.log(`  Actual T${e} ${[0,1,2,3].map(g => String(cm[e][g]).padStart(4)).join(' ')}`);
}
console.log('\n   Tier  Prec   Rec    F1     TP  FP  FN');
let mf1 = 0;
for (const t of [0,1,2,3]) {
  const s = classStats(cm, t);
  console.log(`   T${t}    ${s.p.toFixed(3)}  ${s.r.toFixed(3)}  ${s.f1.toFixed(3)}   ${String(s.tp).padStart(3)} ${String(s.fp).padStart(3)} ${String(s.fn).padStart(3)}`);
  mf1 += s.f1;
}
mf1 /= 4;
const mae = results.reduce((s, r) => s + Math.abs(r.expected - r.got), 0) / results.length;
const k = kappa(results);
console.log(`\n   Macro-F1:     ${mf1.toFixed(3)}`);
console.log(`   MAE:          ${mae.toFixed(3)}`);
console.log(`   Cohen's κ:    ${k.toFixed(3)}`);
console.log(`   Accuracy:     ${(acc / results.length * 100).toFixed(1)}%\n`);

// Phase 3: checking if the generated settings actually make sense for the assigned tier
console.log('── PHASE 3: SETTINGS VALIDATION ──\n');
let sPass = 0, sFail = 0;
for (const r of results) {
  const errs = checkSettings(r.got, r.settings);
  if (errs.length) { sFail++; console.log(`❌ ${r.name} (T${r.got}): ${errs.join(', ')}`); }
  else sPass++;
}
console.log(`   Valid: ${sPass}/${results.length}${sFail === 0 ? ' ✅' : ''}\n`);

// Phase 4: throwing garbage data at it to see if it crashes
console.log('── PHASE 4: FUZZ ROBUSTNESS (80 mutations) ──\n');
const fuzzSrc = CASES.filter(c => c.gpu && c.gpu.length > 10);
let fCrash = 0, fMatch = 0;
for (let i = 0; i < 80; i++) {
  const src = fuzzSrc[i % fuzzSrc.length];
  const mutated = MUTATIONS[i % MUTATIONS.length](src.gpu);
  try {
    const r = pipeline({ ...src, gpu: mutated });
    if (r.tier === src.tier) fMatch++;
  } catch (e) {
    fCrash++;
    console.log(`   💥 CRASH: "${mutated.substring(0, 50)}": ${e.message}`);
  }
}
console.log(`   Crashes:       ${fCrash}/80`);
console.log(`   Tier stable:   ${fMatch}/80 (${(fMatch / 80 * 100).toFixed(0)}%)`);
console.log(`   ${fCrash === 0 ? '✅ No crashes' : '❌ Crashes detected'}\n`);

// Phase 5: latency check (is this thing too slow?)
console.log('── PHASE 5: LATENCY (200 queries) ──\n');
const lats = [];
for (let i = 0; i < 200; i++) {
  const c = CASES[i % CASES.length];
  const s = performance.now();
  pipeline(c);
  lats.push(performance.now() - s);
}
lats.sort((a, b) => a - b);
console.log(`   p50: ${lats[Math.floor(100)].toFixed(2)} ms`);
console.log(`   p95: ${lats[Math.floor(190)].toFixed(2)} ms`);
console.log(`   p99: ${lats[Math.floor(198)].toFixed(2)} ms`);
console.log(`   avg: ${(lats.reduce((a, b) => a + b, 0) / 200).toFixed(2)} ms\n`);

// print out the final summary
console.log('══════════════════════════════════════════════════');
console.log('  V4 SUMMARY');
console.log('══════════════════════════════════════════════════');
console.log(`  Blind accuracy:    ${acc}/${results.length} (${(acc / results.length * 100).toFixed(1)}%)`);
console.log(`  Macro-F1:          ${mf1.toFixed(3)}`);
console.log(`  Cohen's kappa:     ${k.toFixed(3)}`);
console.log(`  MAE:               ${mae.toFixed(3)}`);
console.log(`  Settings valid:    ${sPass}/${results.length}`);
console.log(`  Fuzz crashes:      ${fCrash}/80`);
console.log(`  Fuzz tier-stable:  ${fMatch}/80`);
console.log(`  Latency p95:       ${lats[190].toFixed(2)} ms`);
console.log('══════════════════════════════════════════════════\n');

const ok = acc === results.length && sFail === 0 && fCrash === 0;
console.log(ok ? '✅ ALL PHASES PASSED\n' : '⚠ ISSUES DETECTED\n');
process.exit(ok ? 0 : 1);
