import { motion } from 'framer-motion';
import { BookOpen, MapPin } from 'lucide-react';
import type { CSSProperties } from 'react';
import type { SiteChromeHeaderPublic, SiteChromeLogoPublic, SiteChromePublic } from '../api/types';
import { lineClassName, lineStyle } from '../lib/brandingLineStyle';
import type { SiteBranding } from '../lib/siteBranding';
import { mediaUrl } from '../lib/mediaUrl';

function hasHeaderChromeContent(h: SiteChromeHeaderPublic): boolean {
  if (h.leftLogos.length || h.rightLogos.length) {
    return true;
  }
  if (h.center.mode === 'image' && h.center.imageUrl) {
    return true;
  }
  if (h.center.mode === 'text' && h.center.lines.some((l) => l.text?.trim())) {
    return true;
  }
  return false;
}

function LogoTile({ logo }: { logo: SiteChromeLogoPublic }) {
  if (!logo.url) return null;
  const maxH = logo.maxHeightPx || 56;
  const boxMax = maxH + 24;
  return (
    <div
      className="flex shrink-0 items-center justify-center rounded-xl bg-white/70 p-2 shadow-sm ring-1 ring-slate-200/70 sm:p-2.5"
      style={{ maxHeight: boxMax, maxWidth: `min(100%, ${maxH * 3}px)` }}
    >
      <img
        src={mediaUrl(logo.url)}
        alt={logo.alt || ''}
        className="h-auto w-auto max-h-full max-w-full object-contain"
        style={{ maxHeight: maxH }}
        loading="lazy"
      />
    </div>
  );
}

function LogoRow({ logos }: { logos: SiteChromeLogoPublic[] }) {
  const nodes = logos.map((logo, i) => (logo.url ? <LogoTile key={i} logo={logo} /> : null)).filter(Boolean);
  if (nodes.length === 0) return null;
  return <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3">{nodes}</div>;
}

function LegacyBrandingStrip({ branding }: { branding: SiteBranding }) {
  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-3 px-3 py-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:px-4 sm:py-4 md:px-8">
      <div className="flex min-w-0 items-start gap-3 sm:gap-4">
        {branding.logoUrl ? (
          <div className="flex shrink-0 items-center rounded-xl bg-white/70 p-2 ring-1 ring-slate-200/70 sm:p-2.5">
            <img
              src={mediaUrl(branding.logoUrl)}
              alt=""
              className="h-10 w-auto max-w-[min(100%,180px)] object-contain sm:h-12 md:h-14 md:max-w-[200px]"
            />
          </div>
        ) : (
          <motion.span
            layout
            className="relative flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-sky-500 via-indigo-500 to-violet-600 text-white shadow-lg shadow-indigo-500/30 ring-2 ring-white/50 sm:h-12 sm:w-12 md:h-14 md:w-14"
            whileHover={{ scale: 1.03 }}
            transition={{ type: 'spring', stiffness: 400, damping: 24 }}
          >
            <span className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.35),transparent_50%)]" />
            <BookOpen className="relative h-5 w-5 sm:h-6 sm:w-6" />
          </motion.span>
        )}
        <div className="min-w-0">
          <p className="font-serif text-lg font-bold tracking-tight text-slate-900 sm:text-xl md:text-2xl">
            {branding.brandName}
          </p>
          {branding.shortTagline && (
            <p className="mt-0.5 text-xs font-medium text-sky-700/90 sm:text-sm">{branding.shortTagline}</p>
          )}
          {branding.addressLines.length > 0 && (
            <p className="mt-1.5 flex items-start gap-1.5 text-[11px] leading-snug text-slate-600 sm:mt-2 sm:text-xs md:text-sm">
              <MapPin className="mt-0.5 h-3 w-3 shrink-0 text-slate-400 sm:h-3.5 sm:w-3.5" />
              <span>
                {branding.addressLines.map((line, i) => (
                  <span key={i}>
                    {i > 0 && <br />}
                    {line}
                  </span>
                ))}
              </span>
            </p>
          )}
          {branding.highlights.length > 0 && (
            <ul className="mt-2 flex flex-wrap gap-1.5 sm:gap-2">
              {branding.highlights.map((h) => (
                <li
                  key={h}
                  className="rounded-full bg-slate-900/5 px-2 py-0.5 text-[10px] font-semibold text-slate-600 ring-1 ring-slate-900/10 sm:text-[11px]"
                >
                  {h}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

function CenterBranding({
  h,
  maxImg,
}: {
  h: SiteChromeHeaderPublic;
  maxImg: number;
}) {
  if (h.center.mode === 'image' && h.center.imageUrl) {
    return (
      <div className="flex w-full min-w-0 justify-center px-1">
        <img
          src={mediaUrl(h.center.imageUrl)}
          alt=""
          className="h-auto w-full max-w-full object-contain"
          style={{ maxHeight: `min(${maxImg}px, 28vh)` }}
        />
      </div>
    );
  }

  return (
    <div className="flex w-full min-w-0 flex-col items-center justify-center gap-0 px-1 text-center [-webkit-text-size-adjust:100%]">
      {h.center.lines.map((line, i) =>
        line.text.trim() ? (
          <p
            key={i}
            className={`max-w-full hyphens-auto break-words ${lineClassName(line.fontFamily)}`}
            style={lineStyle(line)}
          >
            {line.text}
          </p>
        ) : null
      )}
    </div>
  );
}

export function PublicChromeHeader({
  chrome,
  branding,
}: {
  chrome: SiteChromePublic | null;
  branding: SiteBranding;
}) {
  const h = chrome?.header;
  const useLegacy = !h || !hasHeaderChromeContent(h);

  if (useLegacy) {
    return (
      <div className="border-b border-slate-200/60 bg-gradient-to-r from-slate-50/95 via-white/90 to-sky-50/40">
        <LegacyBrandingStrip branding={branding} />
      </div>
    );
  }

  const wrapStyle: CSSProperties = {};
  if (typeof h.minHeightPx === 'number' && h.minHeightPx > 0) {
    wrapStyle.minHeight = h.minHeightPx;
  }
  if (typeof h.maxHeightPx === 'number' && h.maxHeightPx > 0) {
    wrapStyle.maxHeight = h.maxHeightPx;
  }

  const maxImg = h.center.imageMaxHeightPx || 96;
  const left = <LogoRow logos={h.leftLogos} />;
  const right = <LogoRow logos={h.rightLogos} />;
  const center = <CenterBranding h={h} maxImg={maxImg} />;

  return (
    <div
      className="border-b border-slate-200/60 bg-gradient-to-r from-slate-50/95 via-white/90 to-sky-50/40"
      style={wrapStyle}
    >
      {/* Mobile: logos first (left + right), then center full width */}
      <div className="mx-auto max-w-7xl px-3 py-3 sm:px-4 md:hidden">
        <div className="flex flex-col gap-2 border-b border-slate-200/50 pb-3">
          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2">
            {h.leftLogos.map((logo, i) => (logo.url ? <LogoTile key={`l-${i}`} logo={logo} /> : null))}
            {h.rightLogos.map((logo, i) => (logo.url ? <LogoTile key={`r-${i}`} logo={logo} /> : null))}
          </div>
        </div>
        <div className="pt-3">{center}</div>
      </div>

      {/* Desktop: three columns — sides hug content, center takes all remaining width */}
      <div className="mx-auto hidden max-w-7xl px-4 py-3 md:grid md:grid-cols-[auto_minmax(0,1fr)_auto] md:items-center md:gap-5 md:px-8 md:py-4 lg:gap-8">
        <div className="flex min-w-0 flex-wrap items-center justify-end gap-2 lg:gap-3">{left}</div>
        <div className="flex min-w-0 justify-center md:px-2">{center}</div>
        <div className="flex min-w-0 flex-wrap items-center justify-start gap-2 lg:gap-3">{right}</div>
      </div>
    </div>
  );
}
