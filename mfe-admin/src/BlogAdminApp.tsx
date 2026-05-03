import type { RouteObject } from 'react-router-dom';
import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
  useRoutes,
} from 'react-router-dom';

import { AdminLayout } from './components/AdminLayout';

import { ApiProvider } from './context/ApiContext';

import { RequireAuth } from './auth/RequireAuth';

import { LoginPage } from './pages/Login';

import { AccountPage } from './pages/AccountPage';

import { DashboardPage } from './pages/Dashboard';

import { PostsListPage } from './pages/PostsList';

import { PostEditorPage } from './pages/PostEditor';

import { CategoriesPage } from './pages/Categories';

import { CarouselAdminPage } from './pages/CarouselAdminPage';

import { GalleryAdminPage } from './pages/GalleryAdminPage';

import { EventEditorPage } from './pages/EventEditorPage';

import { HomePageAdminPage } from './pages/HomePageAdminPage';

import { LayoutChromeAdminPage } from './pages/LayoutChromeAdminPage';

import { NewsEventsAdminPage } from './pages/NewsEventsAdminPage';

import { NavMenuPage } from './pages/NavMenuPage';

import { SitePageEditorPage } from './pages/SitePageEditor';

import { SitePagesListPage } from './pages/SitePagesList';

import { SitePagesLayout } from './components/SitePagesLayout';

export interface BlogAdminAppProps {
  apiBaseUrl?: string;

  basename?: string;

  /** Shell mounts `/blog/*` — no inner BrowserRouter; shell handles `/login`. */

  embedded?: boolean;
}

function resolveApiBase(override?: string): string {
  if (override) return override;

  const env = import.meta.env.VITE_API_BASE;

  if (env) return env;

  return '/api/v1';
}

/** Route objects avoid `<Routes>` child validation (breaks across duplicated federated RR bundles). */
function blogEmbeddedRouteObjects(): RouteObject[] {
  return [
    {
      element: <AdminLayout contentOnly />,
      children: [
        { index: true, element: <DashboardPage /> },
        { path: 'account', element: <AccountPage /> },
        { path: 'posts', element: <PostsListPage /> },
        { path: 'posts/new', element: <PostEditorPage /> },
        { path: 'posts/:id', element: <PostEditorPage /> },
        { path: 'categories', element: <CategoriesPage /> },
        { path: 'carousel', element: <CarouselAdminPage /> },
        { path: 'news-events', element: <NewsEventsAdminPage /> },
        { path: 'events/new', element: <EventEditorPage /> },
        { path: 'events/:id', element: <EventEditorPage /> },
        { path: 'home-page', element: <HomePageAdminPage /> },
        { path: 'header-footer', element: <LayoutChromeAdminPage /> },
        { path: 'gallery-media', element: <GalleryAdminPage /> },
        {
          path: 'site-pages',
          element: <SitePagesLayout />,
          children: [
            { index: true, element: <SitePagesListPage /> },
            { path: 'new', element: <SitePageEditorPage /> },
            { path: ':id', element: <SitePageEditorPage /> },
          ],
        },
        { path: 'navigation', element: <NavMenuPage /> },
        {
          path: '*',
          element: <Navigate to="/blog" replace />,
        },
      ],
    },
  ];
}

function BlogRoutesEmbedded() {
  return useRoutes(blogEmbeddedRouteObjects());
}

function BlogRoutes({ embedded }: { embedded?: boolean }) {
  if (embedded) {
    return <BlogRoutesEmbedded />;
  }

  /** Route elements must be direct children of `<Routes>` / parent `<Route>` — not wrapped in a custom component. */
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      <Route element={<RequireAuth />}>
        <Route element={<AdminLayout />}>
          <Route index element={<DashboardPage />} />
          <Route path="account" element={<AccountPage />} />
          <Route path="posts" element={<PostsListPage />} />
          <Route path="posts/new" element={<PostEditorPage />} />
          <Route path="posts/:id" element={<PostEditorPage />} />
          <Route path="categories" element={<CategoriesPage />} />
          <Route path="carousel" element={<CarouselAdminPage />} />
          <Route path="news-events" element={<NewsEventsAdminPage />} />
          <Route path="events/new" element={<EventEditorPage />} />
          <Route path="events/:id" element={<EventEditorPage />} />
          <Route path="home-page" element={<HomePageAdminPage />} />
          <Route path="header-footer" element={<LayoutChromeAdminPage />} />
          <Route path="gallery-media" element={<GalleryAdminPage />} />
          <Route path="site-pages" element={<SitePagesLayout />}>
            <Route index element={<SitePagesListPage />} />
            <Route path="new" element={<SitePageEditorPage />} />
            <Route path=":id" element={<SitePageEditorPage />} />
          </Route>
          <Route path="navigation" element={<NavMenuPage />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function BlogAdminApp({
  apiBaseUrl,
  basename,
  embedded,
}: BlogAdminAppProps) {
  const base = resolveApiBase(apiBaseUrl);

  const inner = <BlogRoutes embedded={embedded} />;

  return (
    <ApiProvider baseUrl={base}>
      {embedded ? inner : (
        <BrowserRouter basename={basename ?? '/'}>{inner}</BrowserRouter>
      )}
    </ApiProvider>
  );
}
