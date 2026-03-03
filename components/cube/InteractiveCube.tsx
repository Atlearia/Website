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
  const lastMouseX = useRef(0);
  const lastMouseY = useRef(0);
  
  const [isHovered, setIsHovered] = useState(false);

  // Entrance "fly-in with spin" animation
  const entrance = useCubeEntrance();
  // Organic breathing motion (base tilt + oscillation + imperfection)
  const breathing = useCubeBreathing();
  const groupRef = useRef<THREE.Group>(null);

  // When targetFace changes from slider, animate to that face
  useEffect(() => {
    if (targetFace >= 0 && targetFace < FACE_TARGETS.length) {
      const [targetX, targetY] = FACE_TARGETS[targetFace];
      targetRotationX.current = targetX;
      targetRotationY.current = targetY;
      onFaceChange?.(targetFace);
    }
  }, [targetFace, onFaceChange]);

  // Drag constants
  const DRAG_SPEED = 0.006;
  const LERP_SPEED = 0.08;

  // Snap to nearest face
  const snapToNearestFace = useCallback(() => {
    const currentX = targetRotationX.current;
    const currentY = targetRotationY.current;
    
    let closestFace = 0;
    let closestDistance = Infinity;

    FACE_TARGETS.forEach(([targetX, targetY], index) => {
      // Normalize angles for comparison
      const normalizedCurrentY = ((currentY % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
      const normalizedTargetY = ((targetY % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
      
      const distX = Math.abs(currentX - targetX);
      const distY = Math.min(
        Math.abs(normalizedCurrentY - normalizedTargetY),
        Math.PI * 2 - Math.abs(normalizedCurrentY - normalizedTargetY)
      );
      
      const distance = distX + distY;
      if (distance < closestDistance) {
        closestDistance = distance;
        closestFace = index;
      }
    });

    const [snapX, snapY] = FACE_TARGETS[closestFace];
    targetRotationX.current = snapX;
    targetRotationY.current = snapY;
    onFaceChange?.(closestFace);
  }, [onFaceChange]);

  // Event handlers for manual drag
  useEffect(() => {
    const canvas = gl.domElement;

    const handleMouseDown = (e: MouseEvent) => {
      isDragging.current = true;
      lastMouseX.current = e.clientX;
      lastMouseY.current = e.clientY;
      canvas.style.cursor = 'grabbing';
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging.current) return;

      const deltaX = e.clientX - lastMouseX.current;
      const deltaY = e.clientY - lastMouseY.current;

      targetRotationY.current += deltaX * DRAG_SPEED;
      targetRotationX.current += deltaY * DRAG_SPEED;

      lastMouseX.current = e.clientX;
      lastMouseY.current = e.clientY;
    };

    const handleMouseUp = () => {
      isDragging.current = false;
      canvas.style.cursor = isHovered ? 'grab' : 'default';
      
      // Snap to nearest face after drag
      snapToNearestFace();
    };

    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        isDragging.current = true;
        lastMouseX.current = e.touches[0].clientX;
        lastMouseY.current = e.touches[0].clientY;
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!isDragging.current || e.touches.length !== 1) return;
      e.preventDefault();

      const deltaX = e.touches[0].clientX - lastMouseX.current;
      const deltaY = e.touches[0].clientY - lastMouseY.current;

      targetRotationY.current += deltaX * DRAG_SPEED;
      targetRotationX.current += deltaY * DRAG_SPEED;

      lastMouseX.current = e.touches[0].clientX;
      lastMouseY.current = e.touches[0].clientY;
    };

    const handleTouchEnd = () => {
      isDragging.current = false;
      snapToNearestFace();
    };

    canvas.addEventListener('mousedown', handleMouseDown);
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseup', handleMouseUp);
    canvas.addEventListener('mouseleave', handleMouseUp);
    canvas.addEventListener('touchstart', handleTouchStart, { passive: true });
    canvas.addEventListener('touchmove', handleTouchMove, { passive: false });
    canvas.addEventListener('touchend', handleTouchEnd);

    return () => {
      canvas.removeEventListener('mousedown', handleMouseDown);
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mouseup', handleMouseUp);
      canvas.removeEventListener('mouseleave', handleMouseUp);
      canvas.removeEventListener('touchstart', handleTouchStart);
      canvas.removeEventListener('touchmove', handleTouchMove);
      canvas.removeEventListener('touchend', handleTouchEnd);
    };
  }, [gl, isHovered, snapToNearestFace]);

  // Animation loop
  useFrame((_, delta) => {
    if (!rotationGroupRef.current) return;

    // --- Entrance animation ---
    entrance.update(delta);

    // --- Breathing (active only when not dragging & entrance done) ---
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

    // --- Smooth interpolation to target rotation ---
    currentRotationX.current += (targetRotationX.current - currentRotationX.current) * LERP_SPEED;
    currentRotationY.current += (targetRotationY.current - currentRotationY.current) * LERP_SPEED;

    // Apply rotation = base snap + base tilt + entrance spin + breathing oscillation
    if (rotationGroupRef.current) {
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
