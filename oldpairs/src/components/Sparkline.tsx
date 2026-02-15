'use client';

import { useMemo } from 'react';

interface SparklineProps {
  data: number[];
  width?: number;
  height?: number;
  positive?: boolean;
}

export default function Sparkline({ data, width = 80, height = 28, positive }: SparklineProps) {
  const path = useMemo(() => {
    if (!data || data.length < 2) return '';

    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min || 1;
    const padding = 2;

    const points = data.map((val, i) => ({
      x: padding + (i / (data.length - 1)) * (width - padding * 2),
      y: padding + (1 - (val - min) / range) * (height - padding * 2),
    }));

    let d = `M ${points[0].x} ${points[0].y}`;
    for (let i = 1; i < points.length; i++) {
      const prev = points[i - 1];
      const curr = points[i];
      const cpx = (prev.x + curr.x) / 2;
      d += ` C ${cpx} ${prev.y}, ${cpx} ${curr.y}, ${curr.x} ${curr.y}`;
    }

    return d;
  }, [data, width, height]);

  const isPositive = positive ?? (data.length >= 2 && data[data.length - 1] >= data[0]);
  const color = isPositive ? '#00e676' : '#ff4444';

  const gradientId = useMemo(
    () => `sparkline-${Math.random().toString(36).slice(2)}`,
    []
  );

  // Create fill path (closed version of the line)
  const fillPath = useMemo(() => {
    if (!path) return '';
    return `${path} L ${width - 2} ${height} L 2 ${height} Z`;
  }, [path, width, height]);

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className="mini-chart"
    >
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity={0.3} />
          <stop offset="100%" stopColor={color} stopOpacity={0} />
        </linearGradient>
      </defs>
      {fillPath && (
        <path d={fillPath} fill={`url(#${gradientId})`} />
      )}
      <path
        d={path}
        fill="none"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
