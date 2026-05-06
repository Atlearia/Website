import { detectHardware } from './src/detector.js';
import { runMicroBenchmark } from './src/benchmarker.js';
import { flattenDetectorOutput, vectorize } from './src/rag/vectorizer.js';
import { buildContext, hasStrongMatch, retrieve } from './src/rag/retriever.js';
import { adjustWithBenchmark, recommend } from './src/rag/recommender.js';

export class SystemPerfTracker {
  constructor(options = {}) {
    this.runBenchmark = options.runBenchmark !== false;
    this.benchmarkThreshold = options.benchmarkThreshold || 0.82;
    this.topK = options.topK || 6;
    this._result = null;
    this._analyzed = false;
  }

  async analyze() {
    const hardware = await detectHardware();
    const profile = flattenDetectorOutput(hardware);
    let matches = retrieve(profile, this.topK);
    let context = buildContext(profile, matches);
    let recommendation = recommend(matches, context);
    let benchResult = null;
    const skipBench = !this.runBenchmark || (
      hasStrongMatch(matches, context) &&
      recommendation.confidence >= this.benchmarkThreshold &&
      !context.constraints.noWebGL &&
      !context.constraints.softwareRenderer
    );

    if (!skipBench) {
      benchResult = await runMicroBenchmark();
      profile.benchFps = benchResult?.fps || 0;
      matches = retrieve(profile, this.topK);
      context = buildContext(profile, matches);
      recommendation = recommend(matches, context);
      if (profile.benchFps > 0) recommendation = adjustWithBenchmark(recommendation, profile.benchFps, context);
    }

    this._result = {
      tier: recommendation.tier,
      confidence: recommendation.confidence,
      settings: recommendation.settings,
      renderProfile: recommendation.renderProfile,
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
      benchmark: benchResult?.fps > 0 ? benchResult : null,
      ragMatches: recommendation.matches,
      ragContext: {
        corpus: context.corpus,
        support: context.support,
        constraints: context.constraints,
        retrieved: context.retrieved,
      },
      ragStats: context.corpus,
      timestamp: Date.now(),
    };

    this._analyzed = true;
    return this._result;
  }

  get isAnalyzed() {
    return this._analyzed;
  }

  get result() {
    return this._result;
  }

  static canRunWebGL() {
    try {
      const c = document.createElement('canvas');
      return Boolean(c.getContext('webgl2') || c.getContext('webgl'));
    } catch {
      return false;
    }
  }

  formatSummary() {
    if (!this._result) return 'not analyzed yet';
    const r = this._result;
    return [
      `tier: ${r.tier} (${['blocked', 'low', 'mid', 'high'][r.tier] || '?'})`,
      `gpu: ${r.hardware.gpu}`,
      `confidence: ${(r.confidence * 100).toFixed(1)}%`,
      `reasoning: ${r.reasoning}`,
      r.benchmark ? `benchmark: ${r.benchmark.fps} fps` : 'benchmark: skipped',
      `matches: ${r.ragMatches.map((m) => `${m.id}(${(m.similarity * 100).toFixed(0)}%)`).join(', ')}`,
    ].join('\n');
  }
}

export { detectHardware } from './src/detector.js';
export { runMicroBenchmark } from './src/benchmarker.js';
export { flattenDetectorOutput, profileDocument, vectorize } from './src/rag/vectorizer.js';
export { buildContext, retrieve } from './src/rag/retriever.js';
export { adjustWithBenchmark, recommend } from './src/rag/recommender.js';
export { KNOWLEDGE_BASE_STATS } from './src/rag/knowledge-base.js';
export { adaptForThreeJS, applyToRenderer } from './src/adapter.js';
