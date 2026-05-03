export interface SiteBranding {
  /** Primary name shown next to or instead of logo */
  brandName: string;
  /** Optional absolute or site-relative image URL */
  logoUrl: string | null;
  shortTagline: string | null;
  /** Multi-line address — use \n in env or pass array */
  addressLines: string[];
  /** Extra lines e.g. hours, phone — shown as subtle badges/text */
  highlights: string[];
  /** Admin app URL for “Sign in” */
  adminUrl: string;
}

function splitLines(raw: string | undefined): string[] {
  if (!raw) return [];
  return raw
    .split(/\r?\n|\\n/)
    .map((s) => s.trim())
    .filter(Boolean);
}

function splitHighlights(raw: string | undefined): string[] {
  if (!raw) return [];
  return raw
    .split('|')
    .map((s) => s.trim())
    .filter(Boolean);
}

/** Reads `import.meta.env.VITE_BRAND_*`; merge overrides from shell props in the public site app. */
export function defaultSiteBranding(): SiteBranding {
  return {
    brandName: import.meta.env.VITE_BRAND_NAME || 'Web Studio',
    logoUrl: import.meta.env.VITE_BRAND_LOGO_URL || null,
    shortTagline: import.meta.env.VITE_BRAND_TAGLINE || null,
    addressLines: splitLines(import.meta.env.VITE_BRAND_ADDRESS),
    highlights: splitHighlights(import.meta.env.VITE_BRAND_HIGHLIGHTS),
    adminUrl:
      import.meta.env.VITE_ADMIN_URL ||
      (import.meta.env.DEV ? 'http://localhost:5001' : '/admin/'),
  };
}

export function mergeBranding(
  base: SiteBranding,
  patch?: Partial<SiteBranding> & {
    siteTitle?: string;
    brandSubtitle?: string;
  }
): SiteBranding {
  if (!patch) return base;
  return {
    brandName: patch.siteTitle ?? patch.brandName ?? base.brandName,
    logoUrl: patch.logoUrl !== undefined ? patch.logoUrl : base.logoUrl,
    shortTagline: patch.brandSubtitle ?? patch.shortTagline ?? base.shortTagline,
    addressLines: patch.addressLines ?? base.addressLines,
    highlights: patch.highlights ?? base.highlights,
    adminUrl: patch.adminUrl ?? base.adminUrl,
  };
}
