import type { CSSProperties } from 'react';
import type { BrandingLinePublic } from '../api/types';

export function lineClassName(family: string): string {
  return family === 'serif' ? 'font-serif' : 'font-sans';
}

/** Scales type down on narrow screens, caps at the configured size on large screens. */
export function lineStyle(line: BrandingLinePublic): CSSProperties {
  const px = Math.max(10, line.fontSizePx);
  const minPx = Math.max(10, Math.round(px * 0.55));
  const s: CSSProperties = {
    fontSize: `clamp(${minPx}px, 2.4vw + 0.45rem, ${px}px)`,
    fontWeight: line.fontWeight,
    fontStyle: line.fontStyle,
    lineHeight: 1.2,
    margin: 0,
  };
  if (line.color?.trim()) {
    s.color = line.color.trim();
  }
  return s;
}
