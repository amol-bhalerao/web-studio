import { Sparkles } from 'lucide-react';
import type { SiteChromeFooterPublic, SiteChromePublic } from '../api/types';
import { lineClassName, lineStyle } from '../lib/brandingLineStyle';
import { mediaUrl } from '../lib/mediaUrl';

function hasFooterChromeContent(f: SiteChromeFooterPublic): boolean {
  if (f.mode === 'image' && f.imageUrl) {
    return true;
  }
  if (f.mode === 'text' && f.lines.some((l) => l.text?.trim())) {
    return true;
  }
  return false;
}

export function PublicChromeFooter({ chrome }: { chrome: SiteChromePublic | null }) {
  const f = chrome?.footer;
  const useLegacy = !f || !hasFooterChromeContent(f);

  if (useLegacy) {
    return (
      <footer className="relative mt-auto shrink-0 border-t border-slate-200/80 bg-white/90 py-4">
        <div className="pointer-events-none absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-sky-400/30 to-transparent" />
        <div className="mx-auto flex max-w-7xl flex-col gap-1 px-4 text-center text-xs text-slate-500 md:flex-row md:items-center md:justify-between md:text-left">
          <div className="flex items-center justify-center gap-2 md:justify-start">
            <Sparkles className="h-3.5 w-3.5 shrink-0 text-amber-500" />
            <p>Web Studio — content from your API</p>
          </div>
          <p className="text-slate-400">Sky · Ink · Paper</p>
        </div>
      </footer>
    );
  }

  const mh = f.imageMaxHeightPx || 48;

  return (
    <footer className="relative mt-auto shrink-0 border-t border-slate-200/80 bg-white/90 py-6">
      <div className="pointer-events-none absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-sky-400/30 to-transparent" />
      <div className="mx-auto flex max-w-7xl flex-col items-center gap-3 px-4 text-center md:px-8">
        {f.mode === 'image' && f.imageUrl ? (
          <img
            src={mediaUrl(f.imageUrl)}
            alt=""
            className="h-auto max-w-full object-contain"
            style={{ maxHeight: mh }}
          />
        ) : (
          <div className="flex flex-col items-center gap-1">
            {f.lines.map((line, i) =>
              line.text.trim() ? (
                <p key={i} className={`text-sm ${lineClassName(line.fontFamily)}`} style={lineStyle(line)}>
                  {line.text}
                </p>
              ) : null
            )}
          </div>
        )}
      </div>
    </footer>
  );
}
