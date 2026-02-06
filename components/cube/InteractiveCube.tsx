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

interface InteractiveCubeProps {
  onFaceChange?: (faceIndex: number) => void;
  targetFace?: number; // Controlled from slider
}

export function InteractiveCube({ onFaceChange, targetFace = 0 }: InteractiveCubeProps) {
  const meshRef = useRef<THREE.Mesh>(null);
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
  const [activeFace, setActiveFace] = useState(0);

  // Entrance "fly-in with spin" animation
  const entrance = useCubeEntrance();
  // Organic breathing motion (base tilt + oscillation + imperfection)
  const breathing = useCubeBreathing();
  const groupRef = useRef<THREE.Group>(null);

  // Face target rotations (which rotation shows which face)
  const faceTargets: Array<[number, number]> = [
    [0, 0],                          // Front - Intro
    [0, Math.PI],                    // Back - Education
    [0, Math.PI / 2],                // Right - Skills
    [0, -Math.PI / 2],               // Left - Projects
    [-Math.PI / 2, 0],               // Top - Experience
    [Math.PI / 2, 0],                // Bottom - Contact
  ];

  // When targetFace changes from slider, animate to that face
  useEffect(() => {
    if (targetFace >= 0 && targetFace < faceTargets.length) {
      const [targetX, targetY] = faceTargets[targetFace];
      targetRotationX.current = targetX;
      targetRotationY.current = targetY;
      setActiveFace(targetFace);
      onFaceChange?.(targetFace);
    }
  }, [targetFace, onFaceChange]);

  // Drag constants
  const DRAG_SPEED = 0.006;
  const LERP_SPEED = 0.08;

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
  }, [gl, isHovered]);

  // Snap to nearest face
  const snapToNearestFace = useCallback(() => {
    const currentX = targetRotationX.current;
    const currentY = targetRotationY.current;
    
    let closestFace = 0;
    let closestDistance = Infinity;

    faceTargets.forEach(([targetX, targetY], index) => {
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

    const [snapX, snapY] = faceTargets[closestFace];
    targetRotationX.current = snapX;
    targetRotationY.current = snapY;
    setActiveFace(closestFace);
    onFaceChange?.(closestFace);
  }, [onFaceChange]);

  // Animation loop
  useFrame((_, delta) => {
    if (!meshRef.current) return;

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
    meshRef.current.rotation.x =
      currentRotationX.current +
      breathing.baseTiltX +
      entrance.rotationXOffset.current +
      breathing.rotX.current;

    meshRef.current.rotation.y =
      currentRotationY.current +
      breathing.baseTiltY +
      entrance.rotationYOffset.current +
      breathing.rotY.current;

    meshRef.current.rotation.z = breathing.rotZ.current;
  });

  // Face configurations
  const size = cubeVisuals.size;
  const offset = size / 2 + 0.01;
  
  const faceConfigs: Array<{ position: [number, number, number]; rotation: [number, number, number] }> = [
    { position: [0, 0, offset], rotation: [0, 0, 0] },
    { position: [0, 0, -offset], rotation: [0, Math.PI, 0] },
    { position: [offset, 0, 0], rotation: [0, Math.PI / 2, 0] },
    { position: [-offset, 0, 0], rotation: [0, -Math.PI / 2, 0] },
    { position: [0, offset, 0], rotation: [-Math.PI / 2, 0, 0] },
    { position: [0, -offset, 0], rotation: [Math.PI / 2, 0, 0] },
  ];

  return (
    <group ref={groupRef}>
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
          color="#0f172a"
          metalness={0.2}
          roughness={0.8}
          transparent
          opacity={0.95}
        />

        <lineSegments>
          <edgesGeometry args={[new THREE.BoxGeometry(size, size, size)]} />
          <lineBasicMaterial color="#14b8a6" transparent opacity={0.6} />
        </lineSegments>

        {cubeContent.map((face, index) => (
          <Html
            key={face.id}
            transform
            position={faceConfigs[index].position}
            rotation={faceConfigs[index].rotation}
            distanceFactor={3.2}
            zIndexRange={[100, 0]}
            style={{
              width: '280px',
              height: '280px',
              pointerEvents: 'none',
            }}
          >
            <CubeFace content={face} isActive={activeFace === index} />
          </Html>
        ))}
      </mesh>

      <mesh scale={1.02}>
        <boxGeometry args={[size, size, size]} />
        <meshBasicMaterial
          color="#14b8a6"
          transparent
          opacity={isHovered ? 0.06 : 0.02}
        />
      </mesh>
    </group>
  );
}
