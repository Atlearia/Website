import { clsx, type ClassValue } from 'clsx';

/** Combines class names using clsx */
export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

/** Check if we're on the client side */
export const isClient = typeof window !== 'undefined';
