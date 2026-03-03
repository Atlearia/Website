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
  [0, 0],                          // Front - Intro
  [0, Math.PI],                    // Back - Education
  [0, Math.PI / 2],                // Right - Skills
  [0, -Math.PI / 2],               // Left - Projects
  [-Math.PI / 2, 0],               // Top - Experience
  [Math.PI / 2, 0],                // Bottom - Contact
];

// Drag feel tuning
const SENSITIVITY = 0.0035; // radians per pixel
const DRAG_LERP_SPEED = 0.26;
const IDLE_LERP_SPEED = 0.12;
const MAX_PITCH = THREE.MathUtils.degToRad(90);
const VELOCITY_SMOOTHING = 0.35;
const SNAP_LOOKAHEAD_SECONDS = 0.18;
const TWO_PI = Math.PI * 2;

const clampPitch = (pitch: number) => THREE.MathUtils.clamp(pitch, -MAX_PITCH, MAX_PITCH);
const nearestEquivalentAngle = (current: number, target: number) => {
  const delta = ((target - current + Math.PI) % TWO_PI + TWO_PI) % TWO_PI - Math.PI;
  return current + delta;
};

interface InteractiveCubeProps {
  onFaceChange?: (faceIndex: number) => void;
  targetFace?: number; // Controlled from slider
}

export function InteractiveCube({ onFaceChange, targetFace = 0 }: InteractiveCubeProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const rotationGroupRef = useRef<THREE.Group>(null);
  const { gl } = useThree();
  
  // Rotation state
  const currentRotationX = useRef(0);
  const currentRotationY = useRef(0);
  const targetRotationX = useRef(0);
  const targetRotationY = useRef(0);
  
  // Drag state
  const isDragging = useRef(false);
  const activePointerId = useRef<number | null>(null);
  const lastPointerX = useRef(0);
  const lastPointerY = useRef(0);
  const lastPointerTime = useRef(0);
  const velocityX = useRef(0);
  const velocityY = useRef(0);
  
  const [isHovered, setIsHovered] = useState(false);

  // Entrance "fly-in with spin" animation
  const entrance = useCubeEntrance();
  // Organic breathing motion (base tilt + oscillation + imperfection)
  const breathing = useCubeBreathing();
  const groupRef = useRef<THREE.Group>(null);

  const findClosestFace = useCallback((rotationX: number, rotationY: number): number => {
    let closestFace = 0;
    let closestDistance = Infinity;
    const normalizedCurrentY = ((rotationY % TWO_PI) + TWO_PI) % TWO_PI;

    FACE_TARGETS.forEach(([targetX, targetY], index) => {
      const normalizedTargetY = ((targetY % TWO_PI) + TWO_PI) % TWO_PI;
      const distX = Math.abs(rotationX - targetX);
      const distY = Math.min(
        Math.abs(normalizedCurrentY - normalizedTargetY),
        TWO_PI - Math.abs(normalizedCurrentY - normalizedTargetY)
      );
      // At the poles (top/bottom, targetX = ±π/2) every Y value shows the
      // same face, so Y distance is irrelevant. Scale it by |cos(targetX)|:
      // 1 for side faces (equator), ~0 for top/bottom (poles).
      const yawRelevance = Math.abs(Math.cos(targetX));
      const distance = distX + yawRelevance * distY;
      if (distance < closestDistance) {
        closestDistance = distance;
        closestFace = index;
      }
    });

    return closestFace;
  }, []);

  // When targetFace changes from slider, animate to that face
  useEffect(() => {
    if (targetFace >= 0 && targetFace < FACE_TARGETS.length) {
      const [targetX, targetY] = FACE_TARGETS[targetFace];
      targetRotationX.current = clampPitch(targetX);
      targetRotationY.current = nearestEquivalentAngle(targetRotationY.current, targetY);
      velocityX.current = 0;
      velocityY.current = 0;
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

      const projectedX = targetRotationX.current + velocityX.current * SNAP_LOOKAHEAD_SECONDS;
      const projectedY = targetRotationY.current + velocityY.current * SNAP_LOOKAHEAD_SECONDS;
      const closestFace = findClosestFace(projectedX, projectedY);
      const [snapX, snapY] = FACE_TARGETS[closestFace];
      targetRotationX.current = snapX;
      targetRotationY.current = nearestEquivalentAngle(targetRotationY.current, snapY);
      velocityX.current = 0;
      velocityY.current = 0;
      onFaceChange?.(closestFace);

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

      // Why this works: pointer handlers only update target state + velocity.
      // Visual rotation is still committed once per frame in useFrame.
      targetRotationY.current += dx * SENSITIVITY;
      // Keep vertical drag direction consistent on every face:
      // dragging down (positive dy) should tilt cube downward (positive rotationX).
      targetRotationX.current = clampPitch(targetRotationX.current + dy * SENSITIVITY);

      const nextVelY = (dx * SENSITIVITY) / dt;
      const nextVelX = (dy * SENSITIVITY) / dt;
      velocityX.current = THREE.MathUtils.lerp(velocityX.current, nextVelX, VELOCITY_SMOOTHING);
      velocityY.current = THREE.MathUtils.lerp(velocityY.current, nextVelY, VELOCITY_SMOOTHING);

      lastPointerX.current = event.clientX;
      lastPointerY.current = event.clientY;
      lastPointerTime.current = now;
    };

    const handleLostCapture = (event: PointerEvent) => {
      if (activePointerId.current !== event.pointerId) return;
      isDragging.current = false;
      velocityX.current = 0;
      velocityY.current = 0;
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

    // Smooth tracking to target without mutating transforms in pointer events.
    const lerpSpeed = isDragging.current ? DRAG_LERP_SPEED : IDLE_LERP_SPEED;
    currentRotationX.current = clampPitch(
      currentRotationX.current + (targetRotationX.current - currentRotationX.current) * lerpSpeed
    );
    currentRotationY.current += (targetRotationY.current - currentRotationY.current) * lerpSpeed;

    // Apply rotation = base snap + base tilt + entrance spin + breathing oscillation
    if (rotationGroupRef.current) {
      // YXZ order: Y (yaw) is applied first as world-space horizontal rotation,
      // then X (pitch) tilts on top. This avoids gimbal lock at the poles
      // (top/bottom faces) where XYZ would conflate yaw with roll.
      rotationGroupRef.current.rotation.order = 'YXZ';
      rotationGroupRef.current.rotation.x =
        currentRotationX.current +
        breathing.baseTiltX +
        entrance.rotationXOffset.current +
        breathing.rotX.current;

      rotationGroupRef.current.rotation.y =
        currentRotationY.current +
        breathing.baseTiltY +
        entrance.rotationYOffset.current +
        breathing.rotY.current;

      rotationGroupRef.current.rotation.z = breathing.rotZ.current;
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
