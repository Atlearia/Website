import { useEffect, useRef } from 'react';

interface ConfettiProps {
  active: boolean;
}

/**
 * Lightweight canvas-based confetti burst. No external deps.
 * Renders ~80 coloured rectangles that fall and spin, then stops.
 */
export default function Confetti({ active }: ConfettiProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!active) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const COLORS = ['#5b9bd5', '#70c1b3', '#f6bd60', '#e76f51', '#a78bfa', '#f472b6'];
    const PARTICLE_COUNT = 90;

    interface Particle {
      x: number;
      y: number;
      w: number;
      h: number;
      color: string;
      vx: number;
      vy: number;
      rot: number;
      vr: number;
      opacity: number;
    }

    const particles: Particle[] = Array.from({ length: PARTICLE_COUNT }, () => ({
      x: canvas.width / 2 + (Math.random() - 0.5) * 300,
      y: canvas.height / 2 - 100,
      w: Math.random() * 8 + 4,
      h: Math.random() * 6 + 2,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      vx: (Math.random() - 0.5) * 12,
      vy: Math.random() * -14 - 4,
      rot: Math.random() * Math.PI * 2,
      vr: (Math.random() - 0.5) * 0.3,
      opacity: 1,
    }));

    let frame: number;
    const start = performance.now();

    function draw(now: number) {
      const elapsed = now - start;
      if (elapsed > 3500) {
        ctx!.clearRect(0, 0, canvas!.width, canvas!.height);
        return; // stop after ~3.5s
      }
      ctx!.clearRect(0, 0, canvas!.width, canvas!.height);

      for (const p of particles) {
        p.x += p.vx;
        p.vy += 0.25; // gravity
        p.y += p.vy;
        p.rot += p.vr;
        if (elapsed > 2500) p.opacity = Math.max(0, p.opacity - 0.03);

        ctx!.save();
        ctx!.translate(p.x, p.y);
        ctx!.rotate(p.rot);
        ctx!.globalAlpha = p.opacity;
        ctx!.fillStyle = p.color;
        ctx!.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        ctx!.restore();
      }
      frame = requestAnimationFrame(draw);
    }
    frame = requestAnimationFrame(draw);

    return () => cancelAnimationFrame(frame);
  }, [active]);

  if (!active) return null;

  return (
    <canvas
      ref={canvasRef}
      className="confetti-canvas"
      aria-hidden="true"
    />
  );
}
