import { Variants } from 'framer-motion';

// Shared easing curve
const ease = [0.25, 0.4, 0.25, 1] as const;

export const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease } },
};

export const slideInLeft: Variants = {
  hidden: { opacity: 0, x: -60 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.7, ease } },
};

export const slideInRight: Variants = {
  hidden: { opacity: 0, x: 60 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.7, ease } },
};

export const scaleInUp: Variants = {
  hidden: { opacity: 0, scale: 0.95, y: 20 },
  visible: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.5, ease } },
};

export const fadeInBlur: Variants = {
  hidden: { opacity: 0, filter: 'blur(10px)', y: 20 },
  visible: { opacity: 1, filter: 'blur(0px)', y: 0, transition: { duration: 0.8, ease } },
};

export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.1 } },
};

export const staggerChild: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease } },
};

export const cardHover: Variants = {
  rest: { scale: 1, y: 0, transition: { duration: 0.3, ease: 'easeOut' } },
  hover: { scale: 1.02, y: -5, transition: { duration: 0.3, ease: 'easeOut' } },
};

export const navbarVariants: Variants = {
  transparent: { backgroundColor: 'rgba(10, 10, 15, 0)', backdropFilter: 'blur(0px)' },
  solid: { backgroundColor: 'rgba(10, 10, 15, 0.85)', backdropFilter: 'blur(12px)' },
};

export const modalBackdrop: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.3 } },
  exit: { opacity: 0, transition: { duration: 0.2 } },
};

export const modalContent: Variants = {
  hidden: { opacity: 0, scale: 0.95, y: 20 },
  visible: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.3, ease } },
  exit: { opacity: 0, scale: 0.95, y: 20, transition: { duration: 0.2 } },
};

export const backToTopVariants: Variants = {
  hidden: { opacity: 0, y: 20, scale: 0.8 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.3, ease: 'easeOut' } },
  exit: { opacity: 0, y: 20, scale: 0.8, transition: { duration: 0.2 } },
};

export const reducedMotionFade: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.01 } },
};
