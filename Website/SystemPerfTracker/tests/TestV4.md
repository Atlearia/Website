# SystemPerfTracker — V4 Blind Evaluation

To run this, just do: `node tests/testv4.mjs` (make sure you have `{"type":"module"}` in your package.json).

## How I tested this

- **46 blind cases** — I made sure none of the GPU strings here are exact matches from the seed profiles. That would be cheating.
- **No corpus self-retrieval** — I took this out. It really only proves that our index deduplication works, it doesn't actually test if the pipeline is doing its job.
- **No seed-data echo tests** — I gutted these too. In v2, it was just feeding exact seed strings back into itself, so obviously it hit 100%. 
- I pulled the ground truth tiers from actual public GPU benchmark data instead of just guessing.
- Spread the test cases across all 4 tiers and 6 vendors. I also threw in some mobile, privacy-blocked, network-constrained, and generally weird adversarial inputs just to see how it handles them.

## The Results (as of May 18, 2026)

| Metric | Value |
| --- | ---: |
| Blind accuracy | **45/46 (97.8%)** |
| Macro-F1 | **0.982** |
| Cohen's κ | **0.969** |
| MAE | **0.022** |
| Settings valid | 45/46 |
| Fuzz crashes | 0/80 |
| Fuzz tier-stable | 78/80 (98%) |
| Latency p95 | 12.12 ms |

## Confusion Matrix

```
             Predicted
             T0   T1   T2   T3
  Actual T0    3    0    0    0
  Actual T1    0   17    0    0
  Actual T2    0    1   11    0
  Actual T3    0    0    0   14
```

## Per-Class Breakdown

| Tier | Precision | Recall | F1 |
| --- | ---: | ---: | ---: |
| T0 | 1.000 | 1.000 | 1.000 |
| T1 | 0.944 | 1.000 | 0.971 |
| T2 | 1.000 | 0.917 | 0.957 |
| T3 | 1.000 | 1.000 | 1.000 |

## Things that are still broken (Known Issues)

1. **Mali-G710** (T2→T1): The mobile cap I put in `constrainedTier()` is accidentally downgrading this tier-2 mobile GPU down to tier 1. The knowledge base actually has the right entry for it, but the hardcoded mobile constraint is overriding it. I'll need to fix that.

2. **RX 5600 XT settings**: It's generating a `maxTextureSize: 4096` at tier 2, which breaks the tier-2 limit of 2048. It looks like the AMD RX5000 series entries in the knowledge base are carrying tier-3 texture sizes by mistake.

## Stuff I ripped out from V2/V3

| What got removed | Why I removed it |
| --- | --- |
| Cold-start tests using verbatim seed GPU strings | It wasn't a blind test at all. If every input is an exact key already in the corpus, getting 100% accuracy is basically guaranteed. |
| Corpus self-retrieval regression (5007 self-queries) | Again, this just tests if duplicate index entries can find themselves. It tells us nothing about whether the pipeline actually generalizes to new inputs. |
| The "100% accuracy" claim in the README | Since it was based on those non-blind v2 tests, I had to scrap it. |

