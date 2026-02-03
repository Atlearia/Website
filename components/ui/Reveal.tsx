'use client';

import { useRef } from 'react';
import { motion, useInView, Variants } from 'framer-motion';
import { useReducedMotion } from '@/hooks/useScrollAnimations';
import {
  fadeInUp,
  slideInLeft,
  slideInRight,
  scaleInUp,
  staggerContainer,
  staggerChild,
  reducedMotionFade,
} from '@/lib/motion';

export type RevealDirection = 'up' | 'down' | 'left' | 'right' | 'scale' | 'none';

interface RevealProps {
  children: React.ReactNode;
  direction?: RevealDirection;
  delay?: number;
  duration?: number;
  className?: string;
  once?: boolean;
  amount?: number;
  as?: keyof JSX.IntrinsicElements;
}

const directionVariants: Record<RevealDirection, Variants> = {
  up: fadeInUp,
  down: {
    hidden: { opacity: 0, y: -30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: [0.25, 0.4, 0.25, 1] },
    },
  },
  left: slideInLeft,
  right: slideInRight,
  scale: scaleInUp,
  none: {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { duration: 0.6, ease: 'easeOut' },
    },
  },
};

/**
 * Reveal Component
 * Wraps content and animates it into view when scrolled into viewport
 */
export function Reveal({
  children,
  direction = 'up',
  delay = 0,
  duration,
  className = '',
  once = true,
  amount = 0.2,
  as = 'div',
}: RevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once, amount });
  const prefersReducedMotion = useReducedMotion();

  // Get the appropriate variant
  const variants = prefersReducedMotion
    ? reducedMotionFade
    : directionVariants[direction];

  // Apply custom duration if provided
  const customVariants: Variants = duration
    ? {
        ...variants,
        visible: {
          ...(variants.visible as object),
          transition: {
            ...((variants.visible as { transition?: object })?.transition || {}),
            duration,
            delay,
          },
        },
      }
    : {
        ...variants,
        visible: {
          ...(variants.visible as object),
          transition: {
            ...((variants.visible as { transition?: object })?.transition || {}),
            delay,
          },
        },
      };

  const MotionComponent = motion[as as keyof typeof motion] as typeof motion.div;

  return (
    <MotionComponent
      ref={ref}
      initial="hidden"
      animate={isInView ? 'visible' : 'hidden'}
      variants={customVariants}
      className={className}
    >
      {children}
    </MotionComponent>
  );
}

/**
 * RevealGroup Component
 * Container for staggered reveal animations
 */
interface RevealGroupProps {
  children: React.ReactNode;
  className?: string;
  staggerDelay?: number;
  once?: boolean;
  amount?: number;
}

export function RevealGroup({
  children,
  className = '',
  staggerDelay = 0.1,
  once = true,
  amount = 0.2,
}: RevealGroupProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once, amount });
  const prefersReducedMotion = useReducedMotion();

  const containerVariants: Variants = prefersReducedMotion
    ? {
        hidden: { opacity: 0 },
        visible: { opacity: 1 },
      }
    : {
        ...staggerContainer,
        visible: {
          ...staggerContainer.visible,
          transition: {
            staggerChildren: staggerDelay,
            delayChildren: 0.1,
          },
        },
      };

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={isInView ? 'visible' : 'hidden'}
      variants={containerVariants}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/**
 * RevealItem Component
 * Child of RevealGroup for staggered animations
 */
interface RevealItemProps {
  children: React.ReactNode;
  className?: string;
  as?: keyof JSX.IntrinsicElements;
}

export function RevealItem({
  children,
  className = '',
  as = 'div',
}: RevealItemProps) {
  const prefersReducedMotion = useReducedMotion();
  const MotionComponent = motion[as as keyof typeof motion] as typeof motion.div;

  return (
    <MotionComponent
      variants={prefersReducedMotion ? reducedMotionFade : staggerChild}
      className={className}
    >
      {children}
    </MotionComponent>
  );
}

export default Reveal;
