# Controlled GPU benchmark for the Arboreal Library model

Follow-up to V1. This time the measurement method is different and more honest. Tested on an RTX 4070, Windows, Chrome, 1536x730 viewport.

## What changed from V1

The V1 benchmark measured how fast `renderer.render()` returns in JavaScript. The problem is that call returns before the GPU is done drawing. The CPU hands off the work and moves on, so V1 was really measuring CPU command submission speed, not GPU render time. That's why V1 reported things like "6000 estimated fps", which sounded wrong because it was wrong. No browser actually renders 6000 frames per second.

V2 calls `gl.finish()` after every render. That forces the CPU to sit and wait until the GPU is actually done drawing the frame before moving on. The resulting frame times are higher but honest. They include actual GPU work.

## Method

Each model rendered for 15 seconds at a locked camera position. No orbit controls, no mouse interaction, nothing touching the scene during testing. Camera angle and distance identical for both. First 60 frames thrown away as warmup. 2-second cooldown between models so the GPU clocks could settle. All textures downscaled to 2K. Both models pre-loaded and shader-compiled before timing started.

2,455 total frames measured.

## The models

Same two as V1:

| | Original | meshy2 |
|---|---|---|
| File size | 79 MB | 24 MB |
| Triangles | 2.26 million | 200 thousand |
| Textures | 3 unique | 3 unique |
| Meshes | 1 | 1 |

11.3x fewer triangles. 3.3x smaller file.

## Results

| Metric | Original (2.26M tris) | meshy2 (200K tris) |
|---|---|---|
| Avg GPU time | 0.45 ms | 0.41 ms |
| Actual FPS | 58 | 106 |
| Median (P50) | 0.40 ms | 0.40 ms |
| P95 | 0.70 ms | 0.70 ms |
| P99 | 0.80 ms | 0.90 ms |
| Min frame | 0.10 ms | 0.10 ms |
| Max frame | 5.40 ms | 2.00 ms |
| Std dev | ±0.24 ms | ±0.16 ms |

meshy2 comes out 10.1% faster on average. That's a 0.05ms difference per frame.

## What the numbers say

The median GPU time is identical for both models: 0.40ms. Half the time, both models finish in the same amount of time. The 11x triangle difference doesn't show up at all in normal frames.

The 10% gap in the average comes from stability. The original model occasionally spikes up to 5.4ms, while meshy2 tops out at 2.0ms. Those spikes are probably Chrome's garbage collector or the WebGL driver doing buffer management on the larger vertex data. They're rare (the P95 is still just 0.70ms for both), but they drag the average up and slow down the frame loop enough to affect the FPS count.

The FPS numbers look very different (58 vs 106) but that's misleading in its own way. Because gl.finish() blocks the render loop, each spike directly reduces how many frames fit into 15 seconds. In normal rendering without gl.finish(), both models lock to 60 fps on a 60hz display. You would not see a difference in practice.

## Same conclusion as V1, but with better data

Triangle count doesn't matter on this GPU. Shadows are still the biggest cost (V1 showed them eating 62% of frame time). The 4070 processes 2.26M vertices in about 0.03ms, which is invisible next to everything else.

Where meshy2 wins is everywhere except raw frame time:

- 55 MB less to download (44 seconds on a 10 Mbit connection)
- Around 4 GB less VRAM (original pushes ~6 GB, meshy2 sits around 2 GB)
- More stable frame times (lower max, lower standard deviation)
- Won't crash GPUs with 4 GB or less VRAM

## V1 vs V2 measurement comparison

| What | V1 result | V2 result |
|---|---|---|
| Baseline (original) | 0.42-0.47ms | 0.45ms |
| What it measured | CPU submission time | GPU completion time |
| "FPS" shown | 2145-2356 (meaningless) | 58 (actual) |

The frame times are similar because the GPU work on this scene is so light that it finishes almost instantly either way. The big difference is that V2's "58 fps" is a real number you could observe, while V1's "2145 fps" was a theoretical throughput that never happens in practice.

Both V1 and V2 agree on the important stuff: shadows are expensive, triangle count is not, and meshy2's advantage on this hardware is about download size and VRAM, not rendering speed.

!!!!!!!!!!!!!!!!!! IMPORTANT PLEASE READ !!!!!!!!!!!!!!!
In summary, my pc might be too good to properly test efficiently. Between the two models, one optmized another nonoptimized, it still renders at same time and the 10% improvemenet difference only comes from a lag spike and not from steady state rendering being slower. Both models render in under half a millisecond per frame on my 4070 #SufferingFromSuccess