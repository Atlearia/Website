'use client';

// ============================================================================
// CUBE SCENE COMPONENT
// ============================================================================
// Complete 3D scene setup with physics, lighting, and camera
// Wraps the InteractiveCube with proper Three.js and Cannon.js context
// ============================================================================

import { Suspense, useState, useCallback } from 'react';
import { Canvas } from '@react-three/fiber';
import { 
  PerspectiveCamera, 
  Environment, 
  ContactShadows,
  Float,
} from '@react-three/drei';
import { InteractiveCube } from './InteractiveCube';
import { cubeContent } from '@/content/cubeContent';
import { motion, AnimatePresence } from 'framer-motion';

// Loading placeholder while 3D scene initializes
function LoadingFallback() {
  return (
    <div className="absolute inset-0 flex items-center justify-center">
      <div className="relative">
        <div className="w-16 h-16 border-4 border-teal-500/20 border-t-teal-500 rounded-full animate-spin" />
        <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-r-rose-500/50 rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }} />
      </div>
    </div>
  );
}

// Scene lighting setup
function SceneLighting() {
  return (
    <>
      {/* Ambient light for base illumination */}
      <ambientLight intensity={0.4} />
      
      {/* Main key light */}
      <directionalLight
        position={[5, 5, 5]}
        intensity={1}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-far={20}
        shadow-camera-left={-5}
        shadow-camera-right={5}
        shadow-camera-top={5}
        shadow-camera-bottom={-5}
      />
      
      {/* Fill light */}
      <directionalLight
        position={[-3, 3, -3]}
        intensity={0.4}
        color="#14b8a6"
      />
      
      {/* Rim light for edge definition */}
      <pointLight
        position={[0, -3, 3]}
        intensity={0.3}
        color="#f43f5e"
      />

      {/* Subtle accent lights */}
      <pointLight
        position={[3, 2, -2]}
        intensity={0.2}
        color="#8b5cf6"
      />
    </>
  );
}

// Background elements
function SceneBackground() {
  return (
    <>
      {/* Gradient sphere for subtle background color */}
      <mesh position={[0, 0, -10]} scale={20}>
        <sphereGeometry args={[1, 32, 32]} />
        <meshBasicMaterial 
          color="#0a0a0f" 
          side={2}
        />
      </mesh>

      {/* Floating particles for ambiance */}
      {Array.from({ length: 30 }).map((_, i) => (
        <Float
          key={i}
          speed={0.5 + Math.random() * 0.5}
          rotationIntensity={0.2}
          floatIntensity={0.5}
          position={[
            (Math.random() - 0.5) * 15,
            (Math.random() - 0.5) * 15,
            (Math.random() - 0.5) * 10 - 5,
          ]}
        >
          <mesh>
            <sphereGeometry args={[0.02 + Math.random() * 0.03, 8, 8]} />
            <meshBasicMaterial 
              color={i % 3 === 0 ? '#14b8a6' : i % 3 === 1 ? '#f43f5e' : '#8b5cf6'} 
              transparent 
              opacity={0.3 + Math.random() * 0.3} 
            />
          </mesh>
        </Float>
      ))}
    </>
  );
}

interface CubeSceneProps {
  className?: string;
}

export function CubeScene({ className = '' }: CubeSceneProps) {
  const [activeFaceIndex, setActiveFaceIndex] = useState(0);
  const [sliderValue, setSliderValue] = useState(0);
  const activeFace = cubeContent[activeFaceIndex];

  const handleFaceChange = useCallback((index: number) => {
    setActiveFaceIndex(index);
    setSliderValue(index);
  }, []);

  const handleSliderChange = useCallback((value: number) => {
    setSliderValue(value);
    setActiveFaceIndex(value);
  }, []);

  return (
    <div className={`cube-scene-wrapper relative w-full h-full flex flex-col ${className}`}>
      {/* 3D Canvas - takes most of the space */}
      <div className="flex-1 relative">
        <Canvas
          className="cube-canvas-3d"
          shadows
          dpr={[1, 2]}
          gl={{ 
            antialias: true,
            alpha: true,
            powerPreference: 'high-performance',
          }}
          style={{ 
            background: 'transparent',
            cursor: 'grab',
            transformStyle: 'preserve-3d',
            willChange: 'transform',
          }}
        >
          <Suspense fallback={null}>
            <PerspectiveCamera
              makeDefault
              position={[0, 0, 7]}
              fov={50}
              near={0.1}
              far={100}
            />

            <SceneLighting />
            <SceneBackground />
            <Environment preset="city" />
            
            <InteractiveCube 
              onFaceChange={handleFaceChange} 
              targetFace={sliderValue}
            />

            <ContactShadows
              position={[0, -3, 0]}
              opacity={0.4}
              scale={10}
              blur={2}
              far={4}
              color="#14b8a6"
            />
          </Suspense>
        </Canvas>

        {/* Loading overlay */}
        <Suspense fallback={<LoadingFallback />}>
          <div className="sr-only">3D cube loaded</div>
        </Suspense>
      </div>

      {/* Slider Section */}
      <div className="absolute bottom-0 left-0 right-0 pb-8 px-8">
        <div className="max-w-2xl mx-auto">
          {/* Face Title */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeFaceIndex}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="text-center mb-6"
            >
              <p 
                className="text-lg font-semibold"
                style={{ color: activeFace.gradient[0] }}
              >
                {activeFace.title}
              </p>
              {activeFace.subtitle && (
                <p className="text-sm text-gray-400 mt-1">{activeFace.subtitle}</p>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Custom Slider */}
          <div className="relative">
            {/* Track background */}
            <div className="h-1 bg-gray-800 rounded-full relative">
              {/* Progress fill */}
              <motion.div 
                className="absolute h-full rounded-full"
                style={{ 
                  background: `linear-gradient(90deg, ${activeFace.gradient[0]}, ${activeFace.gradient[1]})`,
                  width: `${(sliderValue / (cubeContent.length - 1)) * 100}%`,
                }}
                layout
                transition={{ duration: 0.3 }}
              />
            </div>

            {/* Tick marks and labels */}
            <div className="relative mt-3">
              <div className="flex justify-between">
                {cubeContent.map((face, index) => (
                  <button
                    key={face.id}
                    onClick={() => handleSliderChange(index)}
                    className="flex flex-col items-center group -mt-5"
                  >
                    {/* Tick mark / dot */}
                    <motion.div
                      className={`w-4 h-4 rounded-full border-2 transition-all duration-300 ${
                        index === sliderValue 
                          ? 'scale-125 shadow-lg' 
                          : 'hover:scale-110'
                      }`}
                      style={{
                        borderColor: index === sliderValue ? face.gradient[0] : '#374151',
                        backgroundColor: index === sliderValue ? face.gradient[0] : '#1f2937',
                        boxShadow: index === sliderValue ? `0 0 20px ${face.gradient[0]}50` : 'none',
                      }}
                      whileHover={{ scale: 1.2 }}
                      whileTap={{ scale: 0.9 }}
                    />
                    {/* Label */}
                    <span 
                      className={`mt-2 text-xs font-medium transition-all duration-300 whitespace-nowrap ${
                        index === sliderValue 
                          ? 'opacity-100' 
                          : 'opacity-40 group-hover:opacity-70'
                      }`}
                      style={{
                        color: index === sliderValue ? face.gradient[0] : '#9ca3af',
                      }}
                    >
                      {face.title}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Instruction text */}
          <p className="text-center text-xs text-gray-600 mt-6">
            Click a section or drag the cube to explore
          </p>
        </div>
      </div>
    </div>
  );
}
