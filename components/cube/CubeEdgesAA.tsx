// ============================================================================
// ANTI-ALIASED CUBE EDGES
// ============================================================================
// Renders the 12 edges of a box using drei's <Line> (Line2 / LineMaterial),
// which draws lines as screen-space quads — proper width + anti-aliasing
// regardless of GPU lineWidth limits.
// ============================================================================

'use client';

import { useMemo } from 'react';
import { Line } from '@react-three/drei';

interface CubeEdgesAAProps {
  /** Box size (uniform). */
  size: number;
  /** Line color (CSS / hex). Default "#14b8a6". */
  color?: string;
  /** Line width in pixels. Default 1.4. */
  lineWidth?: number;
  /** Opacity 0–1. Default 0.6. */
  opacity?: number;
}

export function CubeEdgesAA({
  size,
  color = '#14b8a6',
  lineWidth = 1.4,
  opacity = 0.6,
}: CubeEdgesAAProps) {
  // Build the 12 edge segments of a box centred at origin.
  const edgePoints = useMemo(() => {
    const h = size / 2;
    // 8 corners
    const c = [
      [-h, -h, -h], [-h, -h,  h], [-h,  h, -h], [-h,  h,  h],
      [ h, -h, -h], [ h, -h,  h], [ h,  h, -h], [ h,  h,  h],
    ] as const;

    // 12 edges as pairs of corner indices
    const pairs: [number, number][] = [
      // bottom face
      [0, 1], [1, 5], [5, 4], [4, 0],
      // top face
      [2, 3], [3, 7], [7, 6], [6, 2],
      // verticals
      [0, 2], [1, 3], [5, 7], [4, 6],
    ];

    return pairs.map(([a, b]) => [c[a], c[b]] as [[number, number, number], [number, number, number]]);
  }, [size]);

  return (
    <group>
      {edgePoints.map((pair, i) => (
        <Line
          key={i}
          points={pair}
          color={color}
          lineWidth={lineWidth}
          transparent
          opacity={opacity}
        />
      ))}
    </group>
  );
}
