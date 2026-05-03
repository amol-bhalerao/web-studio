import type { BrandingLine, SiteChromeFooter, SiteChromeHeader, SiteChromePayload } from '../api/types';

export function emptyLine(): BrandingLine {
  return {
    text: '',
    fontSizePx: 16,
    fontWeight: 'normal',
    fontStyle: 'normal',
    fontFamily: 'sans',
  };
}

export function defaultHeader(): SiteChromeHeader {
  return {
    minHeightPx: null,
    maxHeightPx: null,
    leftLogos: [],
    center: {
      mode: 'text',
      imageUrl: null,
      imageMaxHeightPx: 96,
      lines: [emptyLine()],
    },
    rightLogos: [],
  };
}

export function defaultFooter(): SiteChromeFooter {
  return {
    mode: 'text',
    imageUrl: null,
    imageMaxHeightPx: 40,
    lines: [emptyLine()],
  };
}

export function defaultSiteChrome(): SiteChromePayload {
  return { header: defaultHeader(), footer: defaultFooter() };
}

export function normalizeChrome(p: SiteChromePayload): SiteChromePayload {
  const h = p.header;
  const f = p.footer;
  return {
    header: {
      minHeightPx: h.minHeightPx ?? null,
      maxHeightPx: h.maxHeightPx ?? null,
      leftLogos: Array.isArray(h.leftLogos) ? h.leftLogos : [],
      rightLogos: Array.isArray(h.rightLogos) ? h.rightLogos : [],
      center: {
        mode: h.center?.mode === 'image' ? 'image' : 'text',
        imageUrl: h.center?.imageUrl ?? null,
        imageMaxHeightPx: typeof h.center?.imageMaxHeightPx === 'number' ? h.center.imageMaxHeightPx : 96,
        lines:
          Array.isArray(h.center?.lines) && h.center.lines.length > 0
            ? h.center.lines.map((l) => ({
                text: l.text ?? '',
                fontSizePx: typeof l.fontSizePx === 'number' ? l.fontSizePx : 16,
                fontWeight: l.fontWeight ?? 'normal',
                fontStyle: l.fontStyle ?? 'normal',
                fontFamily: l.fontFamily === 'serif' ? 'serif' : 'sans',
                color: l.color,
              }))
            : [emptyLine()],
      },
    },
    footer: {
      mode: f.mode === 'image' ? 'image' : 'text',
      imageUrl: f.imageUrl ?? null,
      imageMaxHeightPx: typeof f.imageMaxHeightPx === 'number' ? f.imageMaxHeightPx : 40,
      lines:
        Array.isArray(f.lines) && f.lines.length > 0
          ? f.lines.map((l) => ({
              text: l.text ?? '',
              fontSizePx: typeof l.fontSizePx === 'number' ? l.fontSizePx : 14,
              fontWeight: l.fontWeight ?? 'normal',
              fontStyle: l.fontStyle ?? 'normal',
              fontFamily: l.fontFamily === 'serif' ? 'serif' : 'sans',
              color: l.color,
            }))
          : [emptyLine()],
    },
  };
}
