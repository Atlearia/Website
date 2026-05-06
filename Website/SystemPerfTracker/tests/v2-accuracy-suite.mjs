/**
 * V2 Accuracy Test Suite — Senior Architect Review
 * =================================================
 * Extended from 19 to 52 test cases. Covers:
 *   - Real-world GPU strings scraped from browser UA databases
 *   - Edge cases: privacy-blocked renderers, WebGL 1, unknown brands
 *   - Cross-API variance (D3D11, OpenGL, Vulkan, Metal, raw)
 *   - Mobile/tablet device types with save-data and low-memory constraints
 *   - Deliberately adversarial inputs (empty, garbage, partial strings)
 *   - Tier boundary cases (GPUs that sit right on the edge of 2 vs 3)
 *   - Benchmark outlier scenarios
 */

import { profileDocument, vectorize, parseGpu, tierFromBenchmark, flattenDetectorOutput } from '../src/rag/vectorizer.js';
import { retrieve, buildContext, hasStrongMatch } from '../src/rag/retriever.js';
import { recommend, adjustWithBenchmark } from '../src/rag/recommender.js';
import { KNOWLEDGE_BASE, KNOWLEDGE_BASE_STATS } from '../src/rag/knowledge-base.js';

// ─── Helpers ────────────────────────────────────────────────────────────────

function runCase(name, input, expectedTier, mode = 'cold') {
  const profile = {
    gpu: input.gpu || '',
    vendor: input.vendor || '',
    memory: input.memory ?? 8,
    cores: input.cores ?? 8,
    deviceType: input.deviceType || 'desktop',
    screenWidth: input.screenWidth || 1920,
    screenHeight: input.screenHeight || 1080,
    pixelRatio: input.pixelRatio || 1,
    webglVersion: input.webglVersion ?? 2,
    benchFps: mode === 'bench' ? (input.benchFps ?? 0) : 0,
    floatTextures: input.floatTextures ?? true,
    maxTextureSize: input.maxTextureSize ?? 16384,
    connection: input.connection || null,
  };

  const matches = retrieve(profile, 6);
  const context = buildContext(profile, matches);
  let rec = recommend(matches, context);

  if (mode === 'bench' && profile.benchFps > 0) {
    rec = adjustWithBenchmark(rec, profile.benchFps, context);
  }

  const pass = rec.tier === expectedTier;
  const topMatch = matches[0];
  return {
    name,
    mode,
    pass,
    expected: expectedTier,
    got: rec.tier,
    confidence: rec.confidence,
    topMatch: topMatch ? `${topMatch.entry.source?.exactModel || topMatch.entry.id} (${(topMatch.similarity * 100).toFixed(1)}%)` : 'none',
    exactScore: topMatch?.scores?.exact?.toFixed(3) || 'n/a',
    reasoning: rec.reasoning,
  };
}

// ─── Test Case Definitions ──────────────────────────────────────────────────

const COLD_CASES = [
  // === NVIDIA Desktop ===
  { name: 'RTX 4090 D3D11', input: { gpu: 'ANGLE (NVIDIA, NVIDIA GeForce RTX 4090, Direct3D11)' }, tier: 3 },
  { name: 'RTX 4080 OpenGL', input: { gpu: 'ANGLE (NVIDIA, NVIDIA GeForce RTX 4080, OpenGL 4.5)' }, tier: 3 },
  { name: 'RTX 4070 Ti D3D11', input: { gpu: 'ANGLE (NVIDIA, NVIDIA GeForce RTX 4070 Ti, Direct3D11)' }, tier: 3 },
  { name: 'RTX 3080 OpenGL', input: { gpu: 'ANGLE (NVIDIA, NVIDIA GeForce RTX 3080, OpenGL 4.5)' }, tier: 3 },
  { name: 'RTX 3060 D3D11', input: { gpu: 'ANGLE (NVIDIA, NVIDIA GeForce RTX 3060, Direct3D11)' }, tier: 3 },
  { name: 'GTX 1660 SUPER', input: { gpu: 'ANGLE (NVIDIA, NVIDIA GeForce GTX 1660 SUPER, OpenGL 4.5)' }, tier: 3 },
  { name: 'GTX 1050 Ti low-spec', input: { gpu: 'ANGLE (NVIDIA, NVIDIA GeForce GTX 1050 Ti, OpenGL 4.5)', memory: 4, cores: 4 }, tier: 2 },
  { name: 'GT 1030 budget', input: { gpu: 'ANGLE (NVIDIA, NVIDIA GeForce GT 1030, Direct3D11)', memory: 4, cores: 2 }, tier: 1 },
  
  // === NVIDIA Laptop ===
  { name: 'RTX 4070 Laptop D3D11', input: { gpu: 'ANGLE (NVIDIA, NVIDIA GeForce RTX 4070 Laptop GPU, Direct3D11)' }, tier: 3 },
  { name: 'RTX 4060 Laptop', input: { gpu: 'ANGLE (NVIDIA, NVIDIA GeForce RTX 4060 Laptop GPU, Direct3D11)' }, tier: 3 },
  { name: 'RTX 3050 Laptop', input: { gpu: 'ANGLE (NVIDIA, NVIDIA GeForce RTX 3050 Laptop GPU, Direct3D11)', memory: 4 }, tier: 2 },
  { name: 'GTX 1650 Mobile', input: { gpu: 'ANGLE (NVIDIA, NVIDIA GeForce GTX 1650, Direct3D11)', memory: 4 }, tier: 2 },

  // === AMD Desktop ===
  { name: 'RX 7900 XTX', input: { gpu: 'ANGLE (AMD, AMD Radeon RX 7900 XTX, Direct3D11)' }, tier: 3 },
  { name: 'RX 6800 XT', input: { gpu: 'ANGLE (AMD, AMD Radeon RX 6800 XT, OpenGL 4.5)' }, tier: 3 },
  { name: 'RX 6600 D3D11', input: { gpu: 'ANGLE (AMD, AMD Radeon RX 6600, Direct3D11)' }, tier: 3 },
  { name: 'RX 580 OpenGL', input: { gpu: 'ANGLE (AMD, Radeon RX 580 Series, OpenGL 4.5)' }, tier: 2 },
  { name: 'RX 550 budget', input: { gpu: 'ANGLE (AMD, Radeon RX 550, Direct3D11)', memory: 4, cores: 4 }, tier: 1 },
  { name: 'Vega 8 integrated', input: { gpu: 'ANGLE (AMD, Radeon Vega 8 Graphics, Direct3D11)', memory: 4 }, tier: 1 },
  { name: 'Radeon 780M APU', input: { gpu: 'ANGLE (AMD, AMD Radeon 780M Graphics, Direct3D11)' }, tier: 2 },

  // === Intel ===
  { name: 'Intel Arc A770', input: { gpu: 'ANGLE (Intel, Intel Arc A770 Graphics, Direct3D11)' }, tier: 3 },
  { name: 'Intel Arc A380', input: { gpu: 'ANGLE (Intel, Intel Arc A380 Graphics, Direct3D11)' }, tier: 2 },
  { name: 'Iris Xe OpenGL', input: { gpu: 'ANGLE (Intel, Intel(R) Iris(R) Xe Graphics, OpenGL 4.5)' }, tier: 2 },
  { name: 'UHD 770 D3D11', input: { gpu: 'ANGLE (Intel, Intel(R) UHD Graphics 770, Direct3D11)' }, tier: 1 },
  { name: 'UHD 630 OpenGL', input: { gpu: 'ANGLE (Intel, Intel(R) UHD Graphics 630, OpenGL 4.5)', memory: 4, cores: 4 }, tier: 1 },
  { name: 'HD 4000 old', input: { gpu: 'ANGLE (Intel, Intel(R) HD Graphics 4000, OpenGL 4.0)', memory: 2, cores: 2, webglVersion: 1 }, tier: 1 },

  // === Apple Silicon ===
  { name: 'Apple M3 Pro Metal', input: { gpu: 'ANGLE (Apple, Apple M3 Pro, Metal)', pixelRatio: 2 }, tier: 3 },
  { name: 'Apple M2 OpenGL', input: { gpu: 'ANGLE (Apple, Apple M2, OpenGL 4.1)', pixelRatio: 2 }, tier: 3 },
  { name: 'Apple M1 base', input: { gpu: 'ANGLE (Apple, Apple M1, OpenGL 4.1)', pixelRatio: 2 }, tier: 2 },
  { name: 'Apple M1 Pro', input: { gpu: 'ANGLE (Apple, Apple M1 Pro, OpenGL 4.1)', pixelRatio: 2 }, tier: 3 },

  // === Mobile GPUs ===
  { name: 'A17 Pro Metal', input: { gpu: 'ANGLE (Apple, Apple A17 Pro GPU, Metal)', deviceType: 'mobile', pixelRatio: 3, screenWidth: 430, screenHeight: 932 }, tier: 2 },
  { name: 'Adreno 750 GLES', input: { gpu: 'ANGLE (Qualcomm, Adreno (TM) 750, OpenGL ES 3.2)', deviceType: 'mobile', pixelRatio: 3 }, tier: 2 },
  { name: 'Adreno 610 budget', input: { gpu: 'ANGLE (Qualcomm, Adreno (TM) 610, OpenGL ES 3.1)', deviceType: 'mobile', memory: 2, cores: 4, pixelRatio: 2 }, tier: 1 },
  { name: 'Mali-G78 mid', input: { gpu: 'ANGLE (ARM, Mali-G78, OpenGL ES 3.1)', deviceType: 'mobile', memory: 6, cores: 8, pixelRatio: 2.5 }, tier: 2 },
  { name: 'Mali-G52 budget', input: { gpu: 'ANGLE (ARM, Mali-G52 MC2, OpenGL ES 3.1)', deviceType: 'mobile', memory: 2, cores: 4, pixelRatio: 2 }, tier: 1 },

  // === Software Renderers ===
  { name: 'SwiftShader', input: { gpu: 'Google SwiftShader', memory: 1, cores: 2, webglVersion: 1 }, tier: 0 },
  { name: 'llvmpipe', input: { gpu: 'llvmpipe', memory: 1, cores: 2, webglVersion: 1 }, tier: 0 },

  // === Edge Cases ===
  { name: 'No GPU (WebGL 0)', input: { gpu: '', webglVersion: 0, memory: 2, cores: 2 }, tier: 0 },
  { name: 'Unknown office device', input: { gpu: '', memory: 4, cores: 4 }, tier: 1 },
  { name: 'Unknown gaming-class', input: { gpu: '', memory: 16, cores: 12 }, tier: 1 },
  { name: 'Privacy Iris Xe', input: { gpu: '', memory: 8, cores: 8 }, tier: 1 },
  { name: 'Privacy M1 (high res)', input: { gpu: '', memory: 8, cores: 8, pixelRatio: 2, screenWidth: 2560, screenHeight: 1600 }, tier: 1 },
  { name: 'Data saver RTX 4090', input: { gpu: 'ANGLE (NVIDIA, NVIDIA GeForce RTX 4090, Direct3D11)', connection: { saveData: true } }, tier: 1 },
  { name: 'Slow 3G connection', input: { gpu: 'ANGLE (NVIDIA, NVIDIA GeForce RTX 3060, Direct3D11)', connection: { effectiveType: '3g', downlink: 0.5 } }, tier: 1 },
  
  // === Adversarial Inputs ===
  { name: 'Garbage string', input: { gpu: 'XYZZY MAGIC GPU 9001', memory: 4, cores: 4 }, tier: 1 },
  { name: 'Partial NVIDIA', input: { gpu: 'NVIDIA GeForce RTX', memory: 8, cores: 8 }, tier: 2 },
  { name: 'Raw Apple string', input: { gpu: 'Apple M2', pixelRatio: 2 }, tier: 3 },
  { name: 'Lowercase nvidia', input: { gpu: 'nvidia geforce rtx 4070' }, tier: 3 },
  
  // === Cross-API Same GPU ===
  { name: 'RTX 3070 D3D11', input: { gpu: 'ANGLE (NVIDIA, NVIDIA GeForce RTX 3070, Direct3D11)' }, tier: 3 },
  { name: 'RTX 3070 Vulkan', input: { gpu: 'ANGLE (NVIDIA, NVIDIA GeForce RTX 3070, Vulkan)' }, tier: 3 },
  { name: 'RTX 3070 raw OpenGL', input: { gpu: 'NVIDIA GeForce RTX 3070' }, tier: 3 },
];

const BENCH_CASES = [
  { name: 'RTX 4070 Laptop noisy startup', input: { gpu: 'ANGLE (NVIDIA, NVIDIA GeForce RTX 4070 Laptop GPU, Direct3D11)', benchFps: 45 }, tier: 3 },
  { name: 'Unknown device + high bench', input: { gpu: '', memory: 8, cores: 8, benchFps: 250 }, tier: 1 },
  { name: 'Unknown device + low bench', input: { gpu: '', memory: 4, cores: 4, benchFps: 30 }, tier: 1 },
  { name: 'UHD 630 + decent bench', input: { gpu: 'ANGLE (Intel, Intel(R) UHD Graphics 630, OpenGL 4.5)', memory: 4, cores: 4, benchFps: 65 }, tier: 2 },
  { name: 'RTX 3060 + strong bench', input: { gpu: 'ANGLE (NVIDIA, NVIDIA GeForce RTX 3060, Direct3D11)', benchFps: 200 }, tier: 3 },
  { name: 'M1 base + modest bench', input: { gpu: 'ANGLE (Apple, Apple M1, OpenGL 4.1)', pixelRatio: 2, benchFps: 130 }, tier: 2 },
  { name: 'GTX 1050 + benchmark outlier high', input: { gpu: 'ANGLE (NVIDIA, NVIDIA GeForce GTX 1050, OpenGL 4.5)', memory: 4, cores: 4, benchFps: 300 }, tier: 2 },
];

// ─── Run Everything ─────────────────────────────────────────────────────────

console.log('\n══════════════════════════════════════════════════════════════');
console.log('  SystemPerfTracker V2 Accuracy Suite — Senior Architect Review');
console.log('══════════════════════════════════════════════════════════════\n');
console.log(`Knowledge base: ${KNOWLEDGE_BASE_STATS.corpusSize} profiles (${KNOWLEDGE_BASE_STATS.seedProfiles} seed + ${KNOWLEDGE_BASE_STATS.generatedProfiles} generated)\n`);

// Cold-start tests
console.log('── COLD-START TESTS (' + COLD_CASES.length + ' cases) ──\n');
const coldResults = COLD_CASES.map(c => runCase(c.name, c.input, c.tier, 'cold'));
let coldPass = 0, coldFail = 0;
for (const r of coldResults) {
  const icon = r.pass ? '✅' : '❌';
  console.log(`${icon} ${r.name}`);
  console.log(`   expected: tier ${r.expected} | got: tier ${r.got} | conf: ${(r.confidence * 100).toFixed(1)}%`);
  console.log(`   match: ${r.topMatch} | exact: ${r.exactScore}`);
  if (!r.pass) console.log(`   ⚠ REASON: ${r.reasoning}`);
  r.pass ? coldPass++ : coldFail++;
}

console.log(`\n   Cold-start: ${coldPass}/${coldResults.length} passed (${(coldPass/coldResults.length*100).toFixed(2)}%), ${coldFail} failed\n`);

// Benchmark-assisted tests
console.log('── BENCHMARK-ASSISTED TESTS (' + BENCH_CASES.length + ' cases) ──\n');
const benchResults = BENCH_CASES.map(c => runCase(c.name, c.input, c.tier, 'bench'));
let benchPass = 0, benchFail = 0;
for (const r of benchResults) {
  const icon = r.pass ? '✅' : '❌';
  console.log(`${icon} ${r.name}`);
  console.log(`   expected: tier ${r.expected} | got: tier ${r.got} | conf: ${(r.confidence * 100).toFixed(1)}%`);
  console.log(`   match: ${r.topMatch} | exact: ${r.exactScore}`);
  if (!r.pass) console.log(`   ⚠ REASON: ${r.reasoning}`);
  r.pass ? benchPass++ : benchFail++;
}

console.log(`\n   Benchmark-assisted: ${benchPass}/${benchResults.length} passed (${(benchPass/benchResults.length*100).toFixed(2)}%), ${benchFail} failed\n`);

// ─── Corpus Retrieval Regression ────────────────────────────────────────────

console.log('── CORPUS RETRIEVAL REGRESSION ──\n');

let corpusHits = 0;
let corpusFails = 0;
let tierMismatches = 0;
let totalRetrievalTime = 0;
const failedIds = [];

const t0 = performance.now();
for (const entry of KNOWLEDGE_BASE) {
  const queryProfile = {
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
    maxTextureSize: entry.maxTextureSize || 2048,
  };

  const start = performance.now();
  const matches = retrieve(queryProfile, 6);
  const elapsed = performance.now() - start;
  totalRetrievalTime += elapsed;

  const top = matches[0];
  if (top && top.entry.id === entry.id) {
    corpusHits++;
    if (top.entry.tier !== entry.tier) tierMismatches++;
  } else {
    corpusFails++;
    if (failedIds.length < 10) failedIds.push(entry.id);
  }
}
const totalCorpus = performance.now() - t0;

console.log(`   Corpus size: ${KNOWLEDGE_BASE.length}`);
console.log(`   Exact self-retrieval: ${corpusHits}/${KNOWLEDGE_BASE.length} (${(corpusHits/KNOWLEDGE_BASE.length*100).toFixed(2)}%)`);
console.log(`   Tier mismatches: ${tierMismatches}`);
console.log(`   Failures: ${corpusFails}`);
if (failedIds.length) console.log(`   Sample failures: ${failedIds.join(', ')}`);
console.log(`   Avg retrieval: ${(totalRetrievalTime / KNOWLEDGE_BASE.length).toFixed(3)} ms`);
console.log(`   Total sweep: ${totalCorpus.toFixed(1)} ms\n`);

// ─── Latency Distribution ───────────────────────────────────────────────────

console.log('── LATENCY DISTRIBUTION (500 iterations) ──\n');

const latencies = [];
const sampleProfile = {
  gpu: 'ANGLE (NVIDIA, NVIDIA GeForce RTX 4070 Laptop GPU, Direct3D11)',
  memory: 8, cores: 14, deviceType: 'desktop', benchFps: 0,
  webglVersion: 2, floatTextures: true, maxTextureSize: 16384,
};

for (let i = 0; i < 500; i++) {
  const s = performance.now();
  retrieve(sampleProfile, 6);
  latencies.push(performance.now() - s);
}
latencies.sort((a, b) => a - b);

const p50 = latencies[Math.floor(latencies.length * 0.5)];
const p90 = latencies[Math.floor(latencies.length * 0.9)];
const p95 = latencies[Math.floor(latencies.length * 0.95)];
const p99 = latencies[Math.floor(latencies.length * 0.99)];
const max = latencies[latencies.length - 1];
const avg = latencies.reduce((a, b) => a + b, 0) / latencies.length;

console.log(`   p50: ${p50.toFixed(3)} ms`);
console.log(`   p90: ${p90.toFixed(3)} ms`);
console.log(`   p95: ${p95.toFixed(3)} ms`);
console.log(`   p99: ${p99.toFixed(3)} ms`);
console.log(`   max: ${max.toFixed(3)} ms`);
console.log(`   avg: ${avg.toFixed(3)} ms\n`);

// ─── Vectorizer Unit Tests ──────────────────────────────────────────────────

console.log('── VECTORIZER UNIT TESTS ──\n');

const vecTests = [
  { input: 'ANGLE (NVIDIA, NVIDIA GeForce RTX 4090, Direct3D11)', brand: 'nvidia', family: 'nvidia_rtx40', model: 4090 },
  { input: 'ANGLE (AMD, AMD Radeon RX 7900 XTX, Direct3D11)', brand: 'amd', family: 'amd_rx7000', model: 7900 },
  { input: 'ANGLE (Intel, Intel(R) Iris(R) Xe Graphics, OpenGL 4.5)', brand: 'intel', family: 'intel_iris', model: null },
  { input: 'ANGLE (Apple, Apple M3, Metal)', brand: 'apple', family: 'apple_m3', model: null },
  { input: 'ANGLE (Qualcomm, Adreno (TM) 750, OpenGL ES 3.2)', brand: 'qualcomm', family: 'adreno_7', model: 750 },
  { input: 'ANGLE (ARM, Mali-G78, OpenGL ES 3.1)', brand: 'arm', family: 'mali_g7', model: 78 },
  { input: 'Google SwiftShader', brand: 'software', family: 'software', model: null },
  { input: '', brand: 'unknown', family: 'unknown', model: null },
  { input: 'nvidia geforce rtx 4070', brand: 'nvidia', family: 'nvidia_rtx40', model: 4070 },
  { input: 'AMD Radeon RX 580', brand: 'amd', family: 'amd_rx500', model: 580 },
];

let vecPass = 0;
for (const t of vecTests) {
  const parsed = parseGpu(t.input);
  const brandOk = parsed.brand === t.brand;
  const familyOk = parsed.family === t.family;
  const modelOk = parsed.model === t.model;
  const ok = brandOk && familyOk && modelOk;
  const icon = ok ? '✅' : '❌';
  if (ok) vecPass++;
  console.log(`${icon} parseGpu("${t.input.substring(0, 50)}...")`);
  if (!ok) {
    if (!brandOk) console.log(`   brand: expected ${t.brand}, got ${parsed.brand}`);
    if (!familyOk) console.log(`   family: expected ${t.family}, got ${parsed.family}`);
    if (!modelOk) console.log(`   model: expected ${t.model}, got ${parsed.model}`);
  }
}
console.log(`\n   Vectorizer: ${vecPass}/${vecTests.length} passed\n`);

// ─── tierFromBenchmark Tests ────────────────────────────────────────────────

console.log('── TIER-FROM-BENCHMARK TESTS ──\n');

const benchTierTests = [
  { fps: 0, tier: null },
  { fps: 5, tier: 0 },
  { fps: 14, tier: 0 },
  { fps: 15, tier: 1 },
  { fps: 59, tier: 1 },
  { fps: 60, tier: 2 },
  { fps: 149, tier: 2 },
  { fps: 150, tier: 3 },
  { fps: 400, tier: 3 },
];

let btPass = 0;
for (const t of benchTierTests) {
  const got = tierFromBenchmark(t.fps);
  const ok = got === t.tier;
  if (ok) btPass++;
  const icon = ok ? '✅' : '❌';
  console.log(`${icon} tierFromBenchmark(${t.fps}) = ${got} (expected ${t.tier})`);
}
console.log(`\n   Benchmark tier: ${btPass}/${benchTierTests.length} passed\n`);

// ─── Summary ────────────────────────────────────────────────────────────────

const totalTests = coldResults.length + benchResults.length + vecTests.length + benchTierTests.length;
const totalPassed = coldPass + benchPass + vecPass + btPass;
const allCold = coldPass === coldResults.length;
const allBench = benchPass === benchResults.length;

console.log('══════════════════════════════════════════════════════════════');
console.log('  SUMMARY');
console.log('══════════════════════════════════════════════════════════════');
console.log(`  Cold-start accuracy:       ${coldPass}/${coldResults.length} (${(coldPass/coldResults.length*100).toFixed(2)}%)`);
console.log(`  Benchmark-assisted:        ${benchPass}/${benchResults.length} (${(benchPass/benchResults.length*100).toFixed(2)}%)`);
console.log(`  Vectorizer parsing:        ${vecPass}/${vecTests.length}`);
console.log(`  Tier-from-benchmark:       ${btPass}/${benchTierTests.length}`);
console.log(`  Corpus self-retrieval:     ${corpusHits}/${KNOWLEDGE_BASE.length} (${(corpusHits/KNOWLEDGE_BASE.length*100).toFixed(2)}%)`);
console.log(`  Total unit tests:          ${totalPassed}/${totalTests} passed`);
console.log(`  Latency p95:              ${p95.toFixed(3)} ms`);
console.log('══════════════════════════════════════════════════════════════\n');

// Exit with code reflecting test results
if (totalPassed < totalTests || corpusFails > 0) {
  console.log('⚠ SOME TESTS FAILED — see details above\n');
  process.exit(1);
} else {
  console.log('✅ ALL TESTS PASSED\n');
  process.exit(0);
}
