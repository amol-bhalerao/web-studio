import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { Shell } from './components/Shell';
import { PublicApiProvider } from './context/ApiContext';
import { defaultSiteBranding, mergeBranding, type SiteBranding } from './lib/siteBranding';
import { EventPage } from './pages/EventPage';
import { HomePage } from './pages/Home';
import { PostPage } from './pages/Post';
import { SitePageView } from './pages/SitePage';

export interface BlogWebAppProps {
  apiBaseUrl?: string;
  basename?: string;
  /** Shorthand for branding.brandName */
  siteTitle?: string;
  /** Env-driven defaults in `defaultSiteBranding()`; override here or with `VITE_BRAND_*` */
  branding?: Partial<SiteBranding> & { siteTitle?: string; brandSubtitle?: string };
}

/** Prefer `VITE_API_BASE` in `.env.production`. Same-origin `/api/v1` matches Hostinger layout (SPA + PHP API). */
function resolveApiBase(override?: string): string {
  if (override) return override;
  const env = import.meta.env.VITE_API_BASE;
  if (env) return env;
  return '/api/v1';
}

export default function BlogWebApp({ apiBaseUrl, basename, siteTitle, branding: brandingPatch }: BlogWebAppProps) {
  const base = resolveApiBase(apiBaseUrl);
  const branding = mergeBranding(defaultSiteBranding(), {
    ...brandingPatch,
    siteTitle: siteTitle ?? brandingPatch?.siteTitle,
    brandSubtitle: brandingPatch?.brandSubtitle,
  });

  return (
    <PublicApiProvider baseUrl={base}>
      <BrowserRouter basename={basename ?? '/'}>
        <Routes>
          <Route element={<Shell branding={branding} />}>
            <Route index element={<HomePage />} />
            <Route path="topic/:categorySlug" element={<HomePage />} />
            <Route path="post/:slug" element={<PostPage />} />
            <Route path="events/:slug" element={<EventPage />} />
            <Route path="p/:slug" element={<SitePageView />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </PublicApiProvider>
  );
}
