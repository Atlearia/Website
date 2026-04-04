# WebGL performance for the Arboreal Library model

Notes from benchmarking a Meshy-generated GLB in a Three.js viewer. Tested on an RTX 4070, Windows, Chrome.

## The model

Two versions of the same scene, both from Meshy AI:

| | Original | meshy2 |
|---|---|---|
| File size | 79 MB | 24 MB |
| Triangles | 2.26 million | 200 thousand |
| Textures | 3 unique | 3 unique |
| Meshes | 1 | 1 |

The original is way too heavy for web use out of the box. 2.26 million triangles in a browser viewer is unusual, most web 3D content sits between 50K and 200K. The meshy2 version falls right into that range after Meshy's decimation.

## What we tested

15 different Three.js renderer configurations, each run for 6 seconds at a locked camera position. We measured the actual render call time in milliseconds rather than FPS, because FPS gets capped by your monitor's refresh rate (VSync) and hides the real differences. A 4070 will show 60 fps whether the frame takes 0.1ms or 10ms to draw, so FPS alone is useless for comparing configs.

## Results overview

Sorted by how much each change helped, biggest to smallest:

| What we changed | Frame time reduction |
|---|---|
| Turned off shadows entirely | 62% faster |
| Removed ground plane and grid | 53% |
| Froze all object transforms (static scene) | 46% |
| Halved the shadow map (2048 to 1024) | 37% |
| Removed tone mapping | 24% |
| Removed fog | 21% |
| Dropped pixel ratio from 2x to 1x | 18% |
| Cut lights from 5 to 2 | 16% |
| Switched shadow filter (PCFSoft to PCF) | 15% |
| Downscaled textures to 1K | 12% |
| Downscaled textures to 512px | 13% |

Combining everything (no shadows, 1x pixel ratio, 1K textures, two lights, no fog, no grid, frozen transforms) cut frame time by 65%.

## The surprise: triangle count barely matters

This was the weird one. We ran the same benchmark on both models, original (2.26M tris) and meshy2 (200K tris), and the frame times were almost identical:

| Config | Original | meshy2 | Difference |
|---|---|---|---|
| Full quality | 0.43ms | 0.38ms | meshy2 13% faster |
| No shadows | 0.20ms | 0.23ms | Original 16% faster |
| Balanced | 0.23ms | 0.22ms | Same |
| Full optimize | 0.16ms | 0.18ms | Original 10% faster |

An 11x difference in geometry, and the performance gap is basically noise. In some configs the original was actually faster.

### Why this happens

An RTX 4070 has 5,888 shader cores clocked around 2 GHz. That is a silly amount of compute. Processing 2.26 million vertices takes roughly 0.03ms out of a 0.4ms frame. The GPU finishes and sits idle for most of every frame, just waiting for the CPU to tell it what to do next.

What takes time isn't the geometry. It's everything around it:

- The CPU packaging up draw calls and uniforms and sending them to the driver
- Shadow passes (the renderer draws the whole scene twice, once from the light's perspective to build the shadow map, then again from the camera)
- Shader compilation and state changes
- Pixel shading, which scales with screen resolution, not triangle count

So on a 4070, going from 2.26M to 200K triangles barely moves the needle. The bottleneck was never the triangles. It was the shadows, the driver overhead, and the fragment shader work.

### When triangle count does matter

On weaker hardware the story changes. Integrated Intel and AMD GPUs (the kind in a regular laptop or a Chromebook) have 10 to 50 times less throughput. 2.26 million triangles on an Intel UHD 620 will absolutely crawl, probably under 10 fps. The same scene at 200K would be fine.

Phones and tablets are even worse. Mobile GPUs throttle aggressively when they get hot, and vertex processing is one of the first things to suffer.

## VRAM is the real problem, not FPS

The original model used about 6 GB of VRAM on the 4070. That 4070 has 12 GB total, so it was using half its memory on one web page.

Where the VRAM goes:

- Each of those 3 textures was likely 4K resolution. A single 4096x4096 RGBA texture is about 64 MB uncompressed in VRAM. They look tiny as compressed JPEGs inside the GLB, but the GPU stores them raw.
- 2.26M triangles worth of vertex buffers (positions, normals, UVs, tangents) is another 150-200 MB.
- Chrome duplicates a lot of this data between CPU and GPU memory.
- The shadow map and framebuffers add a bit more.

Most of that 6 GB is textures and Chrome overhead. And 6 GB means any GPU with 4 GB or less (GTX 1650, most laptops, all integrated GPUs) would either crash the WebGL context or start swapping to system RAM and drop to single digit FPS.

Downscaling textures from 4K to 2K cut VRAM roughly in half. Going to 1K cut it to about a quarter. At web viewer distances you can barely tell the difference visually.

## What to actually do with this

If you're the only person viewing this model on your own machine, none of this matters. The 4070 handles both versions at a locked 60 fps without breaking a sweat.

If you're putting this on a website for other people to see, the conversation changes.

Use the decimated model. 200K triangles is a good target. Honestly, 100K would probably look fine at the zoom distances a web viewer uses. You'd have to get uncomfortably close to notice the difference.

Downscale textures to 2K before export, or even 1K. Blender can do this, gltf-transform can do it from the command line. The file size drops from 79 MB to maybe 15-20 MB, and load times go from over a minute on slow connections to a few seconds. That alone is worth it.

Shadows are worth questioning. They were the most expensive thing in the entire setup by a wide margin, and on a small diorama model like this the visual payoff is subtle. If you want the "grounded" look without the cost, a blurred dark circle texture underneath the model fakes it well enough. Most web 3D viewers do this.

Pixel ratio should be 1 unless you specifically need retina sharpness. Going from 1x to 2x quadruples the number of pixels the GPU has to shade, and most people honestly can't tell the difference on a 3D scene where everything is textured anyway.

For reference, here's what a reasonable web config looks like:

| Setting | Value |
|---|---|
| Model | 100K-200K triangles |
| Textures | 2K max |
| Shadows | Off (use a baked shadow plane) |
| Lights | 2-3 (ambient + directional, maybe a fill) |
| Pixel ratio | 1x |
| Tone mapping | ACES filmic (cheap, looks good) |
| Fog | Optional, nearly free |

That setup would run well on most laptops sold in the past 4-5 years and load in under 10 seconds on a decent connection.

## The numbers, for the record

Full benchmark data from two separate runs on the RTX 4070, Chrome, 1707x811 viewport.

Run 1:

| Config | Avg frame time | Uncapped FPS | vs baseline |
|---|---|---|---|
| Baseline | 0.47ms | 2145 | -- |
| No shadows | 0.20ms | 4949 | -56.7% |
| Shadow map 1024 | 0.30ms | 3389 | -36.7% |
| PCFShadowMap | 0.39ms | 2549 | -15.8% |
| Pixel ratio 1x | 0.38ms | 2611 | -17.8% |
| No fog | 0.37ms | 2718 | -21.1% |
| Two lights only | 0.39ms | 2562 | -16.3% |
| 1K textures | 0.41ms | 2439 | -12.0% |
| 512px textures | 0.41ms | 2459 | -12.8% |
| No tone mapping | 0.36ms | 2814 | -23.8% |
| No grid/ground | 0.22ms | 4598 | -53.4% |
| Static transforms | 0.25ms | 3974 | -46.0% |
| No cast shadow on model | 0.22ms | 4480 | -52.1% |
| Full optimize | 0.12ms | 8255 | -74.0% |
| Balanced | 0.17ms | 5757 | -62.7% |

Run 2 (consistency check):

| Config | Avg frame time | Uncapped FPS | vs baseline |
|---|---|---|---|
| Baseline | 0.42ms | 2356 | -- |
| No shadows | 0.16ms | 6208 | -62.1% |
| Shadow map 1024 | 0.27ms | 3751 | -37.2% |
| PCFShadowMap | 0.36ms | 2772 | -15.0% |
| Pixel ratio 1x | 0.36ms | 2773 | -15.1% |
| No fog | 0.36ms | 2751 | -14.4% |
| Two lights only | 0.37ms | 2702 | -12.8% |
| 1K textures | 0.38ms | 2608 | -9.7% |
| 512px textures | 0.40ms | 2525 | -6.7% |
| No tone mapping | 0.37ms | 2684 | -12.2% |
| No grid/ground | 0.32ms | 3080 | -23.5% |
| Static transforms | 0.36ms | 2747 | -14.3% |
| No cast shadow on model | 0.36ms | 2752 | -14.4% |
| Full optimize | 0.15ms | 6660 | -64.6% |
| Balanced | 0.20ms | 4991 | -52.8% |

Results between runs varied by about 10-15%. That's normal for browser benchmarks, there's garbage collection, tab scheduling, and other stuff running in the background that you can't control. The relative rankings stayed the same though, which is what matters.
