# SystemPerfTracker

Hardware detection and adaptive quality system for ningye.ca's 3D scene.

## What this does

GLB models are big. The room scene weighs ~12MB compressed and needs a
decent GPU to render smoothly. Not everyone visiting the portfolio has a
gaming rig, so this system figures out what hardware the visitor is running
during the loading screen, then picks quality settings that won't melt their
laptop.

## Why RAG

WebGL's `WEBGL_debug_renderer_info` extension returns a GPU renderer string,
but browsers increasingly mask or ANGLE-wrap these strings. You'll see stuff
like `"ANGLE (Intel, Intel(R) UHD Graphics 620, OpenGL 4.5)"` instead of a
clean model name. A static lookup table can't cover every variation and
keeps breaking as browsers change their formatting.

The RAG pipeline solves this by treating hardware profiles as documents:
- Each known device profile is an entry in the knowledge base with its GPU
  string, benchmark results, and recommended settings
- When a new visitor arrives, the system builds a "query profile" from their
  hardware signals (GPU string, device memory, core count, screen size)
- It converts that profile into a feature vector and finds the closest
  matches in the knowledge base using cosine similarity
- The matched profiles' quality settings get averaged (weighted by
  similarity) to produce a recommendation

This matters because the alternative is either running a live benchmark
(which wastes the user's loading time and battery) or maintaining an
exhaustive GPU lookup table (which is always out of date). The RAG approach
handles unfamiliar hardware gracefully by finding the nearest known
neighbors.

## Architecture

```
SystemPerfTracker/
  README.md              ← you are here
  perf-tracker.js        ← public API, the one file ningye.ca imports
  src/
    detector.js          ← hardware signal collection (GPU, memory, cores)
    benchmarker.js       ← optional micro-benchmark (quick draw call test)
    rag/
      knowledge-base.js  ← corpus of known device profiles
      vectorizer.js      ← turns hardware profiles into feature vectors
      retriever.js       ← cosine similarity search over the knowledge base
      recommender.js     ← merges retrieved profiles into quality settings
    adapter.js           ← translates quality tier into Three.js settings
```

## Usage from ningye.ca

```html
<script type="module">
  import { SystemPerfTracker } from './SystemPerfTracker/perf-tracker.js';

  const tracker = new SystemPerfTracker();
  const profile = await tracker.analyze();

  // profile.tier → 0 | 1 | 2 | 3
  // profile.settings → { pixelRatio, maxTextureSize, shadowsEnabled, ... }
  // profile.hardware → { gpu, memory, cores, ... }
  // profile.ragMatches → top 3 closest known profiles
```

## Performance tiers

| Tier | Target | What it means |
|------|--------|---------------|
| 0 | < 15 FPS | No WebGL or blocklisted GPU. Show a static fallback. |
| 1 | ~15 FPS | Integrated graphics, old mobile. Cut everything. |
| 2 | ~30 FPS | Mid-range. Reduced textures, no shadows, fewer particles. |
| 3 | ~60 FPS | Dedicated GPU. Full quality. |

## Separability

This folder is self-contained. You can copy it into another project,
import `perf-tracker.js`, and it works. No dependencies on the rest of
ningye.ca. The only coupling is the adapter, which outputs settings that
happen to match what the Three.js scene expects, but even that is generic
enough to reuse.

BETA MODE !!!!
