# Codex Plan: Reliable Drag + Snap-To-Section Cube

## Goal
Make cube drag feel smooth and consistent from anywhere on the canvas, then snap to the closest section face on release.

## Current Issues
- Drag only starts reliably when pointer hits specific 3D objects.
- Free-spin release can leave cube between sections.
- Users want predictable landing on closest face (Intro / Education / Skills / Projects / Experience / Connect).

## Implementation
1. Use Pointer Events only on the canvas (`pointerdown/move/up/cancel`).
2. Start drag from canvas (not mesh-only hit), with `setPointerCapture(pointerId)`.
3. Track deltas/velocity during drag:
   - `rotY += dx * SENSITIVITY`
   - `rotX -= dy * SENSITIVITY`
   - clamp pitch to avoid flips.
4. On release:
   - project a short lookahead using velocity,
   - find closest face target,
   - set cube target rotation to that face,
   - call `onFaceChange` so UI tab/slider follows.
5. Keep transform application in render loop (`useFrame`) only.
6. Keep `touch-action: none` on drag surface to avoid mobile scroll conflicts.
7. Validate with lint/build and manual drag-circle behavior.

## Tunables
- `SENSITIVITY`
- `DRAG_LERP_SPEED`
- `IDLE_LERP_SPEED`
- `SNAP_LOOKAHEAD_SECONDS`
