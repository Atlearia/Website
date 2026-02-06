'use client';

import { useState, useEffect, useCallback } from 'react';
import { isClient } from '@/lib/utils';

/** Hook to track scroll position */
export function useScrollPosition() {
  const [scrollY, setScrollY] = useState(0);
  const [scrollDirection, setScrollDirection] = useState<'up' | 'down'>('down');
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    if (!isClient) return;

    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setScrollDirection(currentScrollY > lastScrollY ? 'down' : 'up');
      setLastScrollY(currentScrollY);
      setScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  return { scrollY, scrollDirection };
}

/** Hook to detect user's motion preference */
export function useReducedMotion() {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    if (!isClient) return;

    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const handleChange = (event: MediaQueryListEvent) => {
      setPrefersReducedMotion(event.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  return prefersReducedMotion;
}

/** Hook for handling smooth scroll to anchors */
export function useSmoothScroll(offset: number = 80) {
  const scrollTo = useCallback(
    (href: string) => {
      if (!isClient) return;

      const targetId = href.replace('#', '');
      const element = document.getElementById(targetId);

      if (element) {
        const top = element.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({
          top,
          behavior: 'smooth',
        });
      }
    },
    [offset]
  );

  return scrollTo;
}

/** Hook to track active section based on scroll position */
export function useActiveSection(sectionIds: string[], offset: number = 100) {
  const [activeSection, setActiveSection] = useState<string>(sectionIds[0] || '');

  useEffect(() => {
    if (!isClient) return;

    const handleScroll = () => {
      const scrollPosition = window.scrollY + offset;

      for (const sectionId of sectionIds) {
        const element = document.getElementById(sectionId.replace('#', ''));
        if (element) {
          const { offsetTop, offsetHeight } = element;
          if (
            scrollPosition >= offsetTop &&
            scrollPosition < offsetTop + offsetHeight
          ) {
            setActiveSection(sectionId);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, [sectionIds, offset]);

  return activeSection;
}
