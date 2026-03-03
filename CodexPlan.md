# Codex Plan: Stabilize 3D Cube Face Readability

## Goal
Keep all cube face content continuously readable while rotating: no blinking, no disappearing text.

## Diagnosis
- Face content is always mounted (`cubeContent.map(...)` in `InteractiveCube`), so this is **not** a mount/unmount issue.
- Likely primary cause: **occlusion + near-coplanar depth conflict**.
  - `Html` faces use `occlude={[meshRef]}` which can rapidly toggle visibility near edge-on angles.
  - Face planes and `Html` overlays share almost the same depth (`size / 2 + 0.001`), which can cause z-fighting-like instability.
- Secondary cause: `Html` style currently forces `transformStyle: 'flat'`, which is counter to stable 3D stacking for nested transformed content.

## Implementation Steps
1. Keep all faces mounted (no conditional rendering changes that unmount face content).
2. Split geometric and HTML face depths:
   - Geometry planes remain at face depth.
   - HTML content sits slightly above each plane with epsilon depth (`+0.03` plus tiny per-face stagger).
3. Remove `occlude` on face `Html` to prevent visibility popping during rotation.
4. Enforce 3D rendering styles:
   - `transform-style: preserve-3d` on wrapper and face content.
   - `backface-visibility: hidden` + `-webkit-backface-visibility: hidden` on face wrappers.
5. Reduce rendering jitter:
   - Add `will-change: transform` on cube wrapper and faces.
   - Keep animation on `transform` only.
6. Remove non-essential per-face opacity toggles tied to active state inside face panel visuals.
7. Validate:
   - Run lint/type checks.
   - Manual acceptance target: rotate for 20 seconds; text does not disappear/flash.

## Deliverables Mapping
- Cause identified: occlusion/depth instability (z-fighting-adjacent) rather than unmounting.
- Exact code changes: `components/cube/InteractiveCube.tsx`, `components/cube/CubeFace.tsx`, `app/globals.css`.
- Include short inline "why this works" comments near key fixes.
- Acceptance test guidance included and rechecked post-change.
