'use client';

// ============================================================================
// INTERACTIVE 3D CUBE CV PAGE
// ============================================================================
// A playful, professional 3D representation of your portfolio
// Features physics-based rotation with drag, flick, and snap interactions
// ============================================================================

import { CubeScene } from '@/components/cube';
import { motion } from 'framer-motion';
import Link from 'next/link';

export default function CubePage() {
  return (
    <main className="relative min-h-screen w-full overflow-hidden bg-background">
      {/* Gradient background */}
      <div className="fixed inset-0 bg-gradient-to-br from-background via-background to-surface-elevated" />
      
      {/* Subtle grid pattern */}
      <div 
        className="fixed inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(20, 184, 166, 0.5) 1px, transparent 1px),
            linear-gradient(90deg, rgba(20, 184, 166, 0.5) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px',
        }}
      />

      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="fixed top-0 left-0 right-0 z-50 p-6"
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Logo / Back link */}
          <Link 
            href="/"
            className="font-display text-xl font-bold text-text-primary hover:text-primary transition-colors flex items-center gap-2 group"
          >
            <svg 
              className="w-5 h-5 opacity-50 group-hover:opacity-100 transition-opacity" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span>NY<span className="text-primary">.</span></span>
          </Link>

          {/* Page title */}
          <h1 className="text-sm text-text-muted font-medium">
            Interactive CV Cube
          </h1>

          {/* View portfolio link */}
          <Link
            href="/#projects"
            className="text-sm text-text-secondary hover:text-primary transition-colors"
          >
            View Portfolio →
          </Link>
        </div>
      </motion.header>

      {/* 3D Cube Scene */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="fixed inset-0"
      >
        <CubeScene className="w-full h-full" />
      </motion.div>

      {/* Instructions overlay - visible on first load */}
      <motion.div
        initial={{ opacity: 1 }}
        animate={{ opacity: 0 }}
        transition={{ duration: 1, delay: 3 }}
        className="fixed inset-0 flex items-center justify-center pointer-events-none z-40"
      >
        <div className="text-center">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-surface/80 backdrop-blur-xl border border-surface-border"
          >
            <svg className="w-5 h-5 text-primary animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11.5V14m0-2.5v-6a1.5 1.5 0 113 0m-3 6a1.5 1.5 0 00-3 0v2a7.5 7.5 0 0015 0v-5a1.5 1.5 0 00-3 0m-6-3V11m0-5.5v-1a1.5 1.5 0 013 0v1m0 0V11m0-5.5a1.5 1.5 0 013 0v3m0 0V11" />
            </svg>
            <span className="text-sm text-text-secondary">Drag the cube to explore</span>
          </motion.div>
        </div>
      </motion.div>

      {/* Decorative elements */}
      <div className="fixed top-1/4 left-10 w-32 h-32 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
      <div className="fixed bottom-1/4 right-10 w-40 h-40 bg-accent/5 rounded-full blur-3xl pointer-events-none" />
      <div className="fixed top-1/2 left-1/4 w-24 h-24 bg-violet-500/5 rounded-full blur-3xl pointer-events-none" />
    </main>
  );
}
