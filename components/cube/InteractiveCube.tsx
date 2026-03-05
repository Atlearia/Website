'use client';

// ============================================================================
// INTERACTIVE CUBE - WITH SLIDER CONTROL
// ============================================================================

import { useRef, useState, useCallback, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import { cubeContent, cubeVisuals } from '@/content/cubeContent';
import { CubeFace } from './CubeFace';
import { useCubeEntrance } from '@/hooks/useCubeEntrance';
import { useCubeBreathing } from '@/hooks/useCubeBreathing';

const FACE_TARGETS: Array<[number, number]> = [
  [0, 0],                          // Front - Intro   (face 0, +Z)
  [0, Math.PI],                    // Back - Education (face 1, -Z)
  [0, -Math.PI / 2],               // Right - Skills  (face 2, +X)
  [0, Math.PI / 2],                // Left - Projects (face 3, -X)
  [Math.PI / 2, 0],                // Top - Experience (face 4, +Y)
  [-Math.PI / 2, 0],               // Bottom - Contact (face 5, -Y)
];

// Each face's outward-pointing normal in cube-local space
const FACE_NORMALS: THREE.Vector3[] = [
  new THREE.Vector3(0, 0, 1),   // Front
  new THREE.Vector3(0, 0, -1),  // Back
  new THREE.Vector3(1, 0, 0),   // Right
  new THREE.Vector3(-1, 0, 0),  // Left
  new THREE.Vector3(0, 1, 0),   // Top
  new THREE.Vector3(0, -1, 0),  // Bottom
];

// Direction a face must point in world-space to be visible to the camera
const CAMERA_DIR = new THREE.Vector3(0, 0, 1);
const _vFace = new THREE.Vector3();

// Drag feel tuning
const DRAG_SENSITIVITY = 0.0035; // radians per pixel — lower = less sensitive drag
const DRAG_LERP_SPEED = 0.26;
const IDLE_LERP_SPEED = 0.12;
const SNAP_STRENGTH = 0.12;    //12 default  // snap interpolation speed — higher = snappier pull to face (0.05–0.5)
const VELOCITY_SMOOTHING = 0.5; // how quickly smoothed velocity follows raw input (0–1)
const FLICK_PULL = 0.28;       // how strongly velocity biases toward the next face (0.1–1.0) — does NOT affect animation speed
const FLICK_WINDOW_MS = 80;    // only use velocity from the last N ms of the gesture
const FLICK_DEAD_ZONE = 1.8;   // ignore flick velocity below this threshold (rad/s) — prevents accidental skips

// World-space axes for quaternion drag
const WORLD_X = new THREE.Vector3(1, 0, 0);
const WORLD_Y = new THREE.Vector3(0, 1, 0);

// Pre-computed quaternion targets for each face
const FACE_TARGET_QUATS = FACE_TARGETS.map(([x, y]) =>
  new THREE.Quaternion().setFromEuler(new THREE.Euler(x, y, 0, 'YXZ'))
);

// Deterministic adjacency table: for each face, which face you reach by swiping in each direction.
// "swipe up" = pointer moves up = reveals the face above, etc.
const FACE_ADJACENCY: Record<number, { up: number; down: number; left: number; right: number }> = {
  0: { up: 4, down: 5, left: 2, right: 3 }, // Front  (Ning Ye)
  1: { up: 4, down: 5, left: 3, right: 2 }, // Back   (Education)
  2: { up: 4, down: 5, left: 1, right: 0 }, // Right  (Skills)
  3: { up: 4, down: 5, left: 0, right: 1 }, // Left   (Projects)
  4: { up: 1, down: 0, left: 2, right: 3 }, // Top    (Experience)
  5: { up: 0, down: 1, left: 2, right: 3 }, // Bottom (Contact)
};

// Minimum total drag (radians) to count as an intentional swipe when flick velocity is low
const MIN_DRAG_FOR_SNAP = 0.25;

// Reusable scratch objects (avoids GC pressure in hot paths)
const _qDeltaX = new THREE.Quaternion();
const _qDeltaY = new THREE.Quaternion();
const _qScratch = new THREE.Quaternion();
const _qOffset = new THREE.Quaternion();
const _eScratch = new THREE.Euler();

interface InteractiveCubeProps {
  onFaceChange?: (faceIndex: number) => void;
  targetFace?: number; // Controlled from slider
}

export function InteractiveCube({ onFaceChange, targetFace = 0 }: InteractiveCubeProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const rotationGroupRef = useRef<THREE.Group>(null);
  const { gl } = useThree();
  
  // Rotation state (quaternion-based — avoids gimbal lock on every face)
  const currentQuat = useRef(new THREE.Quaternion());
  const targetQuat = useRef(new THREE.Quaternion());
  
  // Drag state
  const isDragging = useRef(false);
  const activePointerId = useRef<number | null>(null);
  const lastPointerX = useRef(0);
  const lastPointerY = useRef(0);
  const lastPointerTime = useRef(0);
  const velocityX = useRef(0);
  const velocityY = useRef(0);
  // Recent move samples for flick detection (ring buffer of last N ms)
  const moveSamples = useRef<Array<{ dx: number; dy: number; dt: number; time: number }>>([]);
  // Tracks which face we are currently snapped to (for adjacency lookup)
  const currentFaceRef = useRef(0);
  
  const [isHovered, setIsHovered] = useState(false);

  // Entrance "fly-in with spin" animation
  const entrance = useCubeEntrance();
  // Organic breathing motion (base tilt + oscillation + imperfection)
  const breathing = useCubeBreathing();
  const groupRef = useRef<THREE.Group>(null);

  // Detect which face is most aligned with the camera by transforming each
  // face normal into world space and comparing with the camera direction.
  // This works from ANY approach angle — no single-quaternion ambiguity.
  const findClosestFace = useCallback((quat: THREE.Quaternion): number => {
    let best = 0;
    let bestDot = -Infinity;
    for (let i = 0; i < FACE_NORMALS.length; i++) {
      _vFace.copy(FACE_NORMALS[i]).applyQuaternion(quat);
      const d = _vFace.dot(CAMERA_DIR);
      if (d > bestDot) {
        bestDot = d;
        best = i;
      }
    }
    return best;
  }, []);

  // When targetFace changes from slider, animate to that face
  useEffect(() => {
    if (targetFace >= 0 && targetFace < FACE_TARGET_QUATS.length) {
      targetQuat.current.copy(FACE_TARGET_QUATS[targetFace]);
      velocityX.current = 0;
      velocityY.current = 0;
      currentFaceRef.current = targetFace;
      onFaceChange?.(targetFace);
    }
  }, [targetFace, onFaceChange]);

  // Unified pointer handling for mouse + touch + pen
  useEffect(() => {
    const canvas = gl.domElement;

    const startDrag = (event: PointerEvent) => {
      if (activePointerId.current !== null) return;
      if (!event.isPrimary) return;
      if (event.pointerType === 'mouse' && event.button !== 0) return;
      event.preventDefault();

      activePointerId.current = event.pointerId;
      isDragging.current = true;
      lastPointerX.current = event.clientX;
      lastPointerY.current = event.clientY;
      lastPointerTime.current = event.timeStamp || performance.now();
      velocityX.current = 0;
      velocityY.current = 0;
      moveSamples.current = [];
      canvas.style.cursor = 'grabbing';

      try {
        canvas.setPointerCapture(event.pointerId);
      } catch {
        // Some browsers can throw if capture is unavailable; drag still works.
      }
    };

    const endDrag = (event: PointerEvent) => {
      if (activePointerId.current !== event.pointerId) return;
      isDragging.current = false;
      canvas.style.cursor = isHovered ? 'grab' : 'default';
      event.preventDefault();

      // --- Deterministic adjacency-based snap ---
      // Sum all drag samples to get net displacement.
      let netDx = 0; // horizontal (rotY)
      let netDy = 0; // vertical   (rotX)
      for (const s of moveSamples.current) {
        netDx += s.dy; // dy in samples = dRotY (horizontal screen drag)
        netDy += s.dx; // dx in samples = dRotX (vertical screen drag)
      }

      // Compute flick velocity from recent samples (last FLICK_WINDOW_MS).
      const now = event.timeStamp || performance.now();
      const cutoff = now - FLICK_WINDOW_MS;
      const recent = moveSamples.current.filter(s => s.time >= cutoff);
      let flickVelX = 0;
      let flickVelY = 0;
      if (recent.length > 0) {
        let totalDx = 0, totalDy = 0, totalDt = 0;
        for (const s of recent) {
          totalDx += s.dx;
          totalDy += s.dy;
          totalDt += s.dt;
        }
        if (totalDt > 0) {
          flickVelX = totalDx / totalDt;
          flickVelY = totalDy / totalDt;
        }
      }
      const flickSpeed = Math.sqrt(flickVelX * flickVelX + flickVelY * flickVelY);
      const totalDrag = Math.sqrt(netDx * netDx + netDy * netDy);

      let nextFace = currentFaceRef.current;

      if (flickSpeed >= FLICK_DEAD_ZONE || totalDrag >= MIN_DRAG_FOR_SNAP) {
        // Use flick velocity direction if above dead zone, otherwise use net drag direction
        const dirX = flickSpeed >= FLICK_DEAD_ZONE ? flickVelY : netDx; // horizontal
        const dirY = flickSpeed >= FLICK_DEAD_ZONE ? flickVelX : netDy; // vertical

        const absX = Math.abs(dirX);
        const absY = Math.abs(dirY);
        const adj = FACE_ADJACENCY[currentFaceRef.current];

        if (absY > absX) {
          // Vertical swipe dominates
          // dirY > 0 means positive X rotation → top tilts toward camera → reveal top
          nextFace = dirY > 0 ? adj.up : adj.down;
        } else {
          // Horizontal swipe dominates
          // dirX > 0 means pointer moved right on screen → reveal left face
          nextFace = dirX > 0 ? adj.right : adj.left;
        }
      } else {
        // Very small drag — use findClosestFace as fallback for slow exploratory drags
        nextFace = findClosestFace(targetQuat.current);
      }

      currentFaceRef.current = nextFace;
      targetQuat.current.copy(FACE_TARGET_QUATS[nextFace]);
      velocityX.current = 0;
      velocityY.current = 0;
      onFaceChange?.(nextFace);

      try {
        if (canvas.hasPointerCapture(event.pointerId)) {
          canvas.releasePointerCapture(event.pointerId);
        }
      } catch {
        // Ignore release errors when capture has already been lost.
      }

      activePointerId.current = null;
      lastPointerTime.current = 0;
    };

    const handlePointerMove = (event: PointerEvent) => {
      if (!isDragging.current || activePointerId.current !== event.pointerId) return;
      event.preventDefault();

      const dx = event.clientX - lastPointerX.current;
      const dy = event.clientY - lastPointerY.current;
      const now = event.timeStamp || performance.now();
      const dt = Math.max((now - lastPointerTime.current) / 1000, 1 / 240);

      // World-space quaternion drag: dx rotates around world Y, dy around world X.
      // This gives identical drag feel on every face (no gimbal lock).
      const dRotY = dx * DRAG_SENSITIVITY;
      const dRotX = dy * DRAG_SENSITIVITY;
      _qDeltaY.setFromAxisAngle(WORLD_Y, dRotY);
      _qDeltaX.setFromAxisAngle(WORLD_X, dRotX);
      // Pre-multiply = world-space rotation
      targetQuat.current.premultiply(_qDeltaX).premultiply(_qDeltaY).normalize();

      const nextVelY = dRotY / dt;
      const nextVelX = dRotX / dt;
      velocityX.current = THREE.MathUtils.lerp(velocityX.current, nextVelX, VELOCITY_SMOOTHING);
      velocityY.current = THREE.MathUtils.lerp(velocityY.current, nextVelY, VELOCITY_SMOOTHING);

      // Store sample for flick detection
      moveSamples.current.push({ dx: dRotX, dy: dRotY, dt, time: now });
      // Prune old samples outside the flick window
      const cutoff = now - FLICK_WINDOW_MS * 2;
      while (moveSamples.current.length > 0 && moveSamples.current[0].time < cutoff) {
        moveSamples.current.shift();
      }

      lastPointerX.current = event.clientX;
      lastPointerY.current = event.clientY;
      lastPointerTime.current = now;
    };

    const handleLostCapture = (event: PointerEvent) => {
      if (activePointerId.current !== event.pointerId) return;
      isDragging.current = false;
      velocityX.current = 0;
      velocityY.current = 0;
      // Snap back to the current face on lost capture
      const snapFace = findClosestFace(targetQuat.current);
      currentFaceRef.current = snapFace;
      targetQuat.current.copy(FACE_TARGET_QUATS[snapFace]);
      onFaceChange?.(snapFace);
      activePointerId.current = null;
      canvas.style.cursor = isHovered ? 'grab' : 'default';
    };

    canvas.addEventListener('pointerdown', startDrag, { passive: false });
    canvas.addEventListener('pointermove', handlePointerMove, { passive: false });
    canvas.addEventListener('pointerup', endDrag);
    canvas.addEventListener('pointercancel', endDrag);
    canvas.addEventListener('lostpointercapture', handleLostCapture);

    return () => {
      canvas.removeEventListener('pointerdown', startDrag);
      canvas.removeEventListener('pointermove', handlePointerMove);
      canvas.removeEventListener('pointerup', endDrag);
      canvas.removeEventListener('pointercancel', endDrag);
      canvas.removeEventListener('lostpointercapture', handleLostCapture);
    };
  }, [findClosestFace, gl, isHovered, onFaceChange]);

  // Animation loop
  useFrame((_, delta) => {
    if (!rotationGroupRef.current) return;

    // --- Entrance animation ---
    entrance.update(delta);

    // --- Breathing (disabled while dragging to avoid jitter blend) ---
    const breathingActive = !isDragging.current && entrance.isComplete.current;
    breathing.update(delta, breathingActive);

    // --- Apply entrance transforms to the outer group ---
    if (groupRef.current) {
      groupRef.current.position.z = entrance.positionZ.current;
      groupRef.current.position.y = breathing.posY.current;
      groupRef.current.position.x = breathing.posX.current;
      const s = entrance.scale.current;
      groupRef.current.scale.set(s, s, s);
    }

    // Smooth tracking to target via quaternion slerp.
    const lerpSpeed = isDragging.current ? DRAG_LERP_SPEED : SNAP_STRENGTH;
    // Ensure shortest-path slerp (avoid the "long way around")
    if (currentQuat.current.dot(targetQuat.current) < 0) {
      targetQuat.current.set(
        -targetQuat.current.x,
        -targetQuat.current.y,
        -targetQuat.current.z,
        -targetQuat.current.w,
      );
    }
    currentQuat.current.slerp(targetQuat.current, lerpSpeed);

    // Apply rotation: main quaternion + small breathing/entrance offsets
    if (rotationGroupRef.current) {
      // Breathing + entrance as a small world-space offset quaternion
      _eScratch.set(
        breathing.baseTiltX + entrance.rotationXOffset.current + breathing.rotX.current,
        breathing.baseTiltY + entrance.rotationYOffset.current + breathing.rotY.current,
        breathing.rotZ.current,
        'YXZ',
      );
      _qOffset.setFromEuler(_eScratch);
      // offset * main  →  offset is applied in world space (consistent wobble)
      rotationGroupRef.current.quaternion.copy(currentQuat.current).premultiply(_qOffset);
    }
  });

  // Face configurations
  const size = cubeVisuals.size;
  const facePlaneDepth = size / 2 + 0.001;
  const htmlFaceDepthBase = facePlaneDepth + 0.03;

  const faceConfigs: Array<{ normal: [number, number, number]; rotation: [number, number, number] }> = [
    { normal: [0, 0, 1], rotation: [0, 0, 0] },
    { normal: [0, 0, -1], rotation: [0, Math.PI, 0] },
    { normal: [1, 0, 0], rotation: [0, Math.PI / 2, 0] },
    { normal: [-1, 0, 0], rotation: [0, -Math.PI / 2, 0] },
    { normal: [0, 1, 0], rotation: [-Math.PI / 2, 0, 0] },
    { normal: [0, -1, 0], rotation: [Math.PI / 2, 0, 0] },
  ];
  // Why this works: HTML panels are moved slightly in front of their face planes
  // with a tiny per-face epsilon, which prevents depth conflicts and flicker.
  const facePlanePositions = faceConfigs.map(({ normal }) => [
    normal[0] * facePlaneDepth,
    normal[1] * facePlaneDepth,
    normal[2] * facePlaneDepth,
  ] as [number, number, number]);
  const htmlFacePositions = faceConfigs.map(({ normal }, index) => {
    const depth = htmlFaceDepthBase + index * 0.0005;
    return [
      normal[0] * depth,
      normal[1] * depth,
      normal[2] * depth,
    ] as [number, number, number];
  });
  const facePlaneSize = cubeVisuals.faceSize;

  return (
    <group ref={groupRef}>
      <group ref={rotationGroupRef}>
        <mesh
          ref={meshRef}
          onPointerEnter={() => {
            setIsHovered(true);
            if (!isDragging.current) gl.domElement.style.cursor = 'grab';
          }}
          onPointerLeave={() => {
            setIsHovered(false);
            if (!isDragging.current) gl.domElement.style.cursor = 'default';
          }}
        >
          <boxGeometry args={[size, size, size]} />
          <meshStandardMaterial
            color="#0b1120"
            metalness={0.05}
            roughness={0.95}
            transparent={false}
          />

          {faceConfigs.map((face, index) => (
            <mesh
              key={`face-plane-${index}`}
              position={facePlanePositions[index]}
              rotation={face.rotation}
            >
              <planeGeometry args={[facePlaneSize, facePlaneSize]} />
              <meshStandardMaterial
                color="#0b1120"
                metalness={0.05}
                roughness={0.95}
              />
            </mesh>
          ))}

          {cubeContent.map((face, index) => (
            <Html
              key={face.id}
              transform
              wrapperClass="cube-face-html"
              position={htmlFacePositions[index]}
              rotation={faceConfigs[index].rotation}
              distanceFactor={3.2}
              zIndexRange={[100, 0]}
              style={{
                width: '280px',
                height: '280px',
                pointerEvents: 'none',
                backfaceVisibility: 'hidden',
                WebkitBackfaceVisibility: 'hidden',
                willChange: 'transform',
                transformStyle: 'preserve-3d',
              }}
            >
              <CubeFace content={face} />
            </Html>
          ))}
        </mesh>

        {/* Edges inside rotation group for proper tracking */}
        <lineSegments>
          <edgesGeometry args={[new THREE.BoxGeometry(size, size, size)]} />
          <lineBasicMaterial color="#14b8a6" transparent opacity={0.6} />
        </lineSegments>

        <mesh scale={1.02}>
          <boxGeometry args={[size, size, size]} />
          <meshBasicMaterial
            color="#14b8a6"
            transparent
            opacity={isHovered ? 0.04 : 0}
          />
        </mesh>
      </group>
    </group>
  );
}
