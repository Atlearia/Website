// perf-tracker.js
// Public API for SystemPerfTracker. This is what ningye.ca imports.
//
// Usage:
//   import { SystemPerfTracker } from './SystemPerfTracker/perf-tracker.js';
//   const tracker = new SystemPerfTracker();
//   const result = await tracker.analyze();
//   // result.tier, result.settings, result.hardware, etc.
//
// The pipeline runs during the loading screen:
//   1. detect hardware signals (GPU string, memory, cores, screen)
//   2. vectorize the hardware profile into a feature vector
//   3. retrieve the closest matches from the knowledge base (RAG)
//   4. generate a quality recommendation from the matches
//   5. optionally run a micro-benchmark to verify
//
// Total time: ~50ms without benchmark, ~600ms with benchmark.

import { detectHardware } from './src/detector.js';
import { runMicroBenchmark } from './src/benchmarker.js';
import { vectorize, flattenDetectorOutput } from './src/rag/vectorizer.js';
import { retrieve, hasStrongMatch } from './src/rag/retriever.js';
import { recommend, adjustWithBenchmark } from './src/rag/recommender.js';

export class SystemPerfTracker {
  constructor(options = {}) {
    // whether to run the micro-benchmark. costs ~500ms but gives
    // ground truth fps. we skip it if the RAG match is confident.
    this.runBenchmark = options.runBenchmark !== false;

    // skip benchmark if RAG confidence is above this threshold
    this.benchmarkThreshold = options.benchmarkThreshold || 0.92;

    // how many knowledge base entries to retrieve
    this.topK = options.topK || 3;

    // internal state
    this._result = null;
    this._analyzed = false;
  }

  async analyze() {
    // step 1: collect hardware signals
    const hardware = await detectHardware();

    // step 2: flatten into the shape the vectorizer expects
    const flat = flattenDetectorOutput(hardware);

    // step 3: vectorize
    const queryVector = vectorize(flat);

    // step 4: retrieve nearest neighbors from knowledge base
    const matches = retrieve(queryVector, this.topK);

    // step 5: generate recommendation from matches
    let recommendation = recommend(matches);

    // step 6: maybe run benchmark for verification
    let benchResult = null;
    const skipBench = !this.runBenchmark || hasStrongMatch(matches);

    if (!skipBench) {
      benchResult = await runMicroBenchmark();
      if (benchResult.fps > 0) {
        // update the flat profile with measured fps and re-run RAG
        flat.benchFps = benchResult.fps;
        const refinedVector = vectorize(flat);
        const refinedMatches = retrieve(refinedVector, this.topK);
        recommendation = recommend(refinedMatches);
        recommendation = adjustWithBenchmark(recommendation, benchResult.fps);
      }
    }

    this._result = {
      tier: recommendation.tier,
      confidence: recommendation.confidence,
      settings: recommendation.settings,
      reasoning: recommendation.reasoning,
      hardware: {
        gpu: hardware.gpu?.renderer || 'unknown',
        vendor: hardware.gpu?.vendor || 'unknown',
        memory: hardware.memory,
        cores: hardware.cores,
        deviceType: hardware.device?.type || 'unknown',
        screen: hardware.screen,
        connection: hardware.connection,
        battery: hardware.battery,
        webglVersion: hardware.gpu?.webglVersion || 0,
      },
      benchmark: benchResult,
      ragMatches: recommendation.matches,
      timestamp: Date.now(),
    };

    this._analyzed = true;
    return this._result;
  }

  // getter for checking if analysis is done
  get isAnalyzed() {
    return this._analyzed;
  }

  // get the last result without re-running
  get result() {
    return this._result;
  }

  // quick check: can this device run WebGL at all?
  static canRunWebGL() {
    try {
      const c = document.createElement('canvas');
      return !!(c.getContext('webgl2') || c.getContext('webgl'));
    } catch {
      return false;
    }
  }

  // format a summary string for debug logging
  formatSummary() {
    if (!this._result) return 'not analyzed yet';
    const r = this._result;
    return [
      `tier: ${r.tier} (${['blocked','low','mid','high'][r.tier] || '?'})`,
      `gpu: ${r.hardware.gpu}`,
      `confidence: ${(r.confidence * 100).toFixed(1)}%`,
      `reasoning: ${r.reasoning}`,
      r.benchmark ? `benchmark: ${r.benchmark.fps} fps` : 'benchmark: skipped',
      `matches: ${r.ragMatches.map(m => `${m.id}(${(m.similarity*100).toFixed(0)}%)`).join(', ')}`,
    ].join('\n');
  }
}

// also export individual pieces for anyone who wants to use them
// separately (testing, or just the detector without the RAG)
export { detectHardware } from './src/detector.js';
export { runMicroBenchmark } from './src/benchmarker.js';
export { vectorize, flattenDetectorOutput } from './src/rag/vectorizer.js';
export { retrieve } from './src/rag/retriever.js';
export { recommend } from './src/rag/recommender.js';
export { adaptForThreeJS, applyToRenderer } from './src/adapter.js';
