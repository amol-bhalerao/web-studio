import { motion } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import type {
  CarouselSlidePublic,
  EventListPublic,
  NavNode,
  PublicCategory,
  PublicPost,
  SiteChromePublic,
  SitePagePublic,
} from '../api/types';
import { usePublicApi } from '../context/ApiContext';
import type { SiteBranding } from '../lib/siteBranding';
import { BlogSidebar } from './BlogSidebar';
import { HeroCarousel } from './HeroCarousel';
import { NewsEventsStrip } from './NewsEventsStrip';
import { PublicChromeFooter } from './PublicChromeFooter';
import { PublicChromeHeader } from './PublicChromeHeader';
import { PublicNavDesktop, PublicNavDrawer } from './PublicNav';

function isPostDetailPath(pathname: string): boolean {
  return /\/post\/[^/]+\/?$/.test(pathname);
}

export function Shell({ branding }: { branding: SiteBranding }) {
  const { pathname } = useLocation();
  const showHeroSection = !isPostDetailPath(pathname);
  const api = usePublicApi();
  const [categories, setCategories] = useState<PublicCategory[]>([]);
  const [categoriesError, setCategoriesError] = useState(false);
  const [spotlightPosts, setSpotlightPosts] = useState<PublicPost[]>([]);
  const [carouselSlides, setCarouselSlides] = useState<CarouselSlidePublic[]>([]);
  const [newsEventsPage, setNewsEventsPage] = useState<SitePagePublic | null>(null);
  const [publicEvents, setPublicEvents] = useState<EventListPublic[]>([]);
  const [siteChrome, setSiteChrome] = useState<SiteChromePublic | null>(null);
  const [loadingCat, setLoadingCat] = useState(true);
  const [loadingHero, setLoadingHero] = useState(true);
  const [drawer, setDrawer] = useState(false);
  const [navItems, setNavItems] = useState<NavNode[]>([]);

  useEffect(() => {
    api
      .categories()
      .then((r) => {
        setCategories(r.data);
        setCategoriesError(false);
      })
      .catch(() => {
        setCategories([]);
        setCategoriesError(true);
      })
      .finally(() => setLoadingCat(false));
  }, [api]);

  useEffect(() => {
    Promise.all([
      api.carousel().catch(() => ({ data: [] as CarouselSlidePublic[] })),
      api.sitePage('news-events').catch(() => null as SitePagePublic | null),
      api.events().catch(() => ({ data: [] as EventListPublic[] })),
      api.posts({ page: '1', per_page: '12' }).catch(() => ({
        data: [] as PublicPost[],
      })),
    ])
      .then(([car, ne, ev, po]) => {
        setCarouselSlides(car.data ?? []);
        setNewsEventsPage(ne);
        setPublicEvents(ev.data ?? []);
        setSpotlightPosts(po.data ?? []);
      })
      .catch(() => {
        setCarouselSlides([]);
        setNewsEventsPage(null);
        setPublicEvents([]);
        setSpotlightPosts([]);
      })
      .finally(() => setLoadingHero(false));
  }, [api]);

  useEffect(() => {
    api
      .navigation()
      .then((r) => setNavItems(r.data))
      .catch(() => setNavItems([]));
  }, [api]);

  useEffect(() => {
    api
      .chrome()
      .then((c) => setSiteChrome(c))
      .catch(() => setSiteChrome(null));
  }, [api]);

  return (
    <div className="relative flex min-h-screen flex-col overflow-x-hidden bg-stone-100 text-slate-800">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_120%_80%_at_50%_-20%,rgba(56,189,248,0.18),transparent)]" />
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_80%_50%_at_100%_50%,rgba(129,140,248,0.12),transparent)]" />
      <div className="pointer-events-none fixed inset-0 bg-[length:40px_40px] bg-[linear-gradient(to_right,rgb(15_23_42/0.06)_1px,transparent_1px),linear-gradient(to_bottom,rgb(15_23_42/0.06)_1px,transparent_1px)] opacity-60" />

      <header className="sticky top-0 z-40 shrink-0 border-b border-slate-200/80 bg-white/75 shadow-sm backdrop-blur-xl">
        <PublicChromeHeader chrome={siteChrome} branding={branding} />

        {/* Main menu + account */}
        <div className="border-t border-slate-200/70 bg-gradient-to-r from-slate-100/95 via-stone-50/95 to-sky-50/85 backdrop-blur-md">
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 md:px-8">
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-full bg-slate-900/5 px-3 py-2 text-sm font-semibold text-slate-700 ring-1 ring-slate-900/10 md:hidden"
              onClick={() => setDrawer(true)}
              aria-label="Open topics menu"
            >
              <Menu className="h-5 w-5" />
              Menu
            </button>
            <nav className="hidden min-w-0 flex-1 flex-wrap items-center gap-1.5 md:flex">
              <Link
                to="/"
                className="rounded-full bg-slate-900/5 px-4 py-2 text-sm font-semibold text-slate-700 ring-1 ring-slate-900/10 transition hover:bg-slate-900 hover:text-white hover:ring-slate-900"
              >
                Home
              </Link>
              <PublicNavDesktop items={navItems} />
            </nav>
            <a
              href={branding.adminUrl}
              target="_blank"
              rel="noreferrer"
              className="shrink-0 rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-md transition hover:bg-slate-800"
            >
              Admin
            </a>
          </div>
        </div>
      </header>

      {showHeroSection && (
        <section className="relative z-0 mx-auto mt-1 w-full max-w-7xl scroll-mt-4 px-3 pt-4 sm:px-4 md:mt-0 md:px-8 md:pt-6">
          <div className="flex flex-col gap-5 sm:gap-6 lg:grid lg:min-h-[min(52vh,440px)] lg:grid-cols-[minmax(0,1fr)_minmax(240px,320px)] lg:items-stretch lg:gap-8">
            <HeroCarousel
              carouselSlides={carouselSlides}
              fallbackPosts={spotlightPosts}
              loading={loadingHero}
              className="min-h-0"
            />
            <NewsEventsStrip page={newsEventsPage} events={publicEvents} loading={loadingHero} />
          </div>
        </section>
      )}

      {drawer && (
        <div className="fixed inset-0 z-50 md:hidden">
          <button type="button" className="absolute inset-0 bg-black/40" aria-label="Close" onClick={() => setDrawer(false)} />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            transition={{ type: 'spring', damping: 28 }}
            className="absolute right-0 top-0 h-full w-[min(100%,20rem)] overflow-y-auto border-l border-slate-200 bg-white p-4 shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <span className="font-semibold text-slate-900">Menu</span>
              <button type="button" onClick={() => setDrawer(false)} className="rounded-lg p-2 text-slate-500">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="mt-4 w-full space-y-6">
              <PublicNavDrawer items={navItems} onNavigate={() => setDrawer(false)} />
              <div>
                <p className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-500">Topics</p>
              <BlogSidebar
                categories={categories}
                loading={loadingCat}
                categoriesError={categoriesError}
                className="w-full"
                onNavigate={() => setDrawer(false)}
              />
              </div>
            </div>
          </motion.div>
        </div>
      )}

      <div className="flex min-h-0 flex-1 flex-col">
        <div className="relative mx-auto flex w-full max-w-7xl flex-1 flex-col px-4 md:px-8">
          <div className="flex min-h-0 flex-1 flex-col gap-8 pb-10 pt-6 md:flex-row md:items-stretch md:gap-0 md:pt-8">
            <div className="hidden min-h-0 w-72 shrink-0 flex-col self-stretch pr-3 md:flex">
              <div className="flex h-full min-h-0 flex-col border-r border-slate-200/90 bg-gradient-to-b from-white to-slate-50/90 pr-5">
                <BlogSidebar
                  categories={categories}
                  loading={loadingCat}
                  categoriesError={categoriesError}
                  fillHeight
                  className="h-full min-h-0"
                />
              </div>
            </div>
            <div className="min-h-0 min-w-0 flex-1 border-slate-200/90 pl-0 md:border-l md:pl-10">
              <Outlet />
            </div>
          </div>
        </div>
      </div>

      <PublicChromeFooter chrome={siteChrome} />
    </div>
  );
}
