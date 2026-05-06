# SystemPerfTracker

SystemPerfTracker chooses a WebGL quality profile for the 3D room scene from live browser hardware signals.

It is a client-side retrieval-augmented hardware recommender. The visitor device becomes the query, the hardware index supplies retrieved context, and the generator turns that augmented context into a Three.js render profile.

## Pipeline

1. The detector collects GPU renderer, WebGL capability limits, memory, CPU cores, screen cost, connection hints, device class, and battery availability.
2. The hardware index expands curated GPU series into 5,000 searchable GPU/API/capability profiles.
3. The retriever ranks profiles with hybrid retrieval: exact model match, vector similarity, GPU-token overlap, capability distance, benchmark distance, and device constraints.
4. The augmentation step builds a compact context from the retrieved profiles, including source evidence, tier support, conflict, evidence coverage, and safety constraints.
5. The generator produces a tier and render settings from the augmented context, then caps the output for mobile, low memory, WebGL 1, software renderers, slow connections, and data saver mode.
6. When retrieval confidence is not strong enough, the micro-benchmark runs and the pipeline re-ranks with measured FPS.

## Evaluation

The current 19-case evaluation suite includes NVIDIA RTX, AMD Radeon, Intel integrated, Apple Silicon, iPhone, Qualcomm Adreno, ARM Mali, software renderers, hidden memory/core privacy cases, unknown devices, data saver, WebGL 1, and a noisy RTX 4070 startup benchmark.

| System | Cold accuracy | Cold MAE | Benchmark accuracy | Benchmark MAE |
| --- | ---: | ---: | ---: | ---: |
| Rules baseline | 73.68% | 0.26 | 84.21% | 0.21 |
| RAG recommender | 100% | 0.00 | 100% | 0.00 |

## Public API

```js
import { SystemPerfTracker } from './SystemPerfTracker/perf-tracker.js';

const tracker = new SystemPerfTracker({ runBenchmark: true });
const profile = await tracker.analyze();

console.log(profile.tier);
console.log(profile.settings);
console.log(profile.ragMatches);
```

## Output

- `tier`: `0 | 1 | 2 | 3`
- `confidence`: normalized retrieval and generation confidence
- `settings`: Three.js-ready quality settings
- `renderProfile`: generated render profile with retrieved model, source, settings, and reason
- `reasoning`: compact decision summary
- `hardware`: detected browser/device signals
- `benchmark`: measured FPS result when a benchmark was needed
- `ragMatches`: retrieved corpus profiles with evidence
- `ragContext`: tier support, constraints, and retrieved profile details
- `ragStats`: corpus size and retrieval surface

## Files

```text
SystemPerfTracker/
  perf-tracker.js
  src/
    detector.js
    benchmarker.js
    adapter.js
    rag/
      knowledge-base.js
      vectorizer.js
      retriever.js
      recommender.js
```
