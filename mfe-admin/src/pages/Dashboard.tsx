import { motion } from 'framer-motion';
import {
  FileEdit,
  FileText,
  FolderTree,
  Home,
  ImageIcon,
  LayoutGrid,
  Newspaper,
  Pencil,
  Plus,
  Sparkles,
} from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import type { EventListRow, SitePage, Stats } from '../api/types';
import { useApi } from '../context/ApiContext';

const NEWS_EVENTS_SLUG = 'news-events';

export function DashboardPage() {
  const api = useApi();
  const [stats, setStats] = useState<Stats | null>(null);
  const [newsIntro, setNewsIntro] = useState<SitePage | null>(null);
  const [entries, setEntries] = useState<EventListRow[]>([]);
  const [loadingExtra, setLoadingExtra] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    api
      .stats()
      .then(setStats)
      .catch((e: Error) => setErr(e.message));
  }, [api]);

  const loadNewsEvents = useCallback(async () => {
    setLoadingExtra(true);
    try {
      const [page, ev] = await Promise.all([
        api.sitePageAdminBySlug(NEWS_EVENTS_SLUG).catch(() => null),
        api.eventsAdmin().catch(() => ({ data: [] as EventListRow[] })),
      ]);
      setNewsIntro(page);
      setEntries(ev.data ?? []);
    } catch {
      setNewsIntro(null);
      setEntries([]);
    } finally {
      setLoadingExtra(false);
    }
  }, [api]);

  useEffect(() => {
    void loadNewsEvents();
  }, [loadNewsEvents]);

  const n = (v: number | undefined) => (typeof v === 'number' ? v : 0);

  const statCards = stats
    ? [
        { label: 'Posts', value: stats.posts_total, icon: FileText, accent: 'from-violet-500/20 to-fuchsia-500/10' },
        { label: 'Published', value: stats.posts_published, icon: Sparkles, accent: 'from-emerald-500/20 to-teal-500/10' },
        { label: 'Drafts', value: stats.posts_draft, icon: FileEdit, accent: 'from-amber-500/20 to-orange-500/10' },
        { label: 'Categories', value: stats.categories, icon: FolderTree, accent: 'from-sky-500/20 to-indigo-500/10' },
        { label: 'News & events entries', value: n(stats.events_total), icon: Newspaper, accent: 'from-rose-500/20 to-orange-500/10' },
        { label: 'Site pages', value: n(stats.site_pages), icon: FileText, accent: 'from-cyan-500/20 to-blue-500/10' },
        { label: 'Gallery items', value: n(stats.gallery_items), icon: ImageIcon, accent: 'from-pink-500/20 to-violet-500/10' },
      ]
    : [];

  return (
    <div className="space-y-10">
      <div>
        <h1 className="font-display text-2xl font-semibold text-white">Dashboard</h1>
        <p className="mt-1 text-sm text-slate-400">Overview of your blog, news &amp; events, and media.</p>
      </div>

      {err && (
        <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">{err}</div>
      )}

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {statCards.map((c, i) => (
          <motion.div
            key={c.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.03 }}
            className={`relative overflow-hidden rounded-2xl border border-slate-800/80 bg-gradient-to-br ${c.accent} p-4 shadow-panel`}
          >
            <c.icon className="absolute right-3 top-3 h-7 w-7 text-white/10" />
            <p className="text-xs font-medium text-slate-400">{c.label}</p>
            <p className="mt-1 font-display text-2xl font-semibold text-white">{c.value}</p>
          </motion.div>
        ))}
      </div>

      <div className="flex flex-wrap gap-3">
        <Link to="posts/new" className="admin-btn-primary inline-flex items-center gap-2">
          <Plus className="h-4 w-4" />
          New post
        </Link>
        <Link to="news-events" className="admin-btn-ghost inline-flex items-center gap-2">
          <Newspaper className="h-4 w-4" />
          News &amp; events
        </Link>
        <Link to="gallery-media" className="admin-btn-ghost inline-flex items-center gap-2">
          <LayoutGrid className="h-4 w-4" />
          Gallery
        </Link>
        <Link to="categories" className="admin-btn-ghost">
          Categories
        </Link>
        <Link to="site-pages" className="admin-btn-ghost">
          Site pages
        </Link>
        <Link to="carousel" className="admin-btn-ghost">
          Carousel
        </Link>
        <Link to="navigation" className="admin-btn-ghost">
          Navigation
        </Link>
        <Link to="home-page" className="admin-btn-ghost inline-flex items-center gap-2">
          <Home className="h-4 w-4" />
          Home page
        </Link>
        <Link to="header-footer" className="admin-btn-ghost">
          Header &amp; footer
        </Link>
      </div>

      <section className="rounded-2xl border border-slate-800 bg-slate-950/40 p-6 ring-1 ring-slate-800/80">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="font-display text-lg font-semibold text-white">News &amp; events</h2>
            <p className="mt-1 text-sm text-slate-400">
              Intro title:{' '}
              <span className="text-slate-200">
                {loadingExtra ? '…' : newsIntro?.title ?? '—'}
              </span>
              {' · '}
              <Link to="/news-events" className="font-medium text-indigo-400 hover:text-indigo-300">
                Edit intro &amp; entries
              </Link>
            </p>
          </div>
          <Link to="/events/new" className="admin-btn-primary inline-flex items-center gap-2 text-sm">
            <Plus className="h-4 w-4" />
            Add entry
          </Link>
        </div>

        {loadingExtra ? (
          <p className="mt-6 text-sm text-slate-500">Loading…</p>
        ) : entries.length === 0 ? (
          <p className="mt-6 text-sm text-slate-500">
            No entries yet. Add announcements or events — they share one list on the public site.
          </p>
        ) : (
          <div className="mt-6 overflow-x-auto">
            <table className="w-full min-w-[480px] border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-slate-800 text-xs uppercase tracking-wide text-slate-500">
                  <th className="py-2 pr-3">Title</th>
                  <th className="py-2 pr-3">Status</th>
                  <th className="py-2 text-right"> </th>
                </tr>
              </thead>
              <tbody>
                {entries.slice(0, 12).map((ev) => (
                  <tr key={ev.id} className="border-b border-slate-800/60">
                    <td className="py-2.5 pr-3 font-medium text-slate-200">{ev.title}</td>
                    <td className="py-2.5 pr-3">
                      <span
                        className={
                          ev.status === 'published'
                            ? 'rounded-full bg-emerald-500/15 px-2 py-0.5 text-emerald-300'
                            : 'rounded-full bg-slate-600/30 px-2 py-0.5 text-slate-400'
                        }
                      >
                        {ev.status}
                      </span>
                    </td>
                    <td className="py-2.5 text-right">
                      <Link
                        to={`/events/${ev.id}`}
                        className="inline-flex items-center gap-1 rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-white"
                      >
                        <Pencil className="h-4 w-4" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {entries.length > 12 && (
              <p className="mt-3 text-xs text-slate-500">
                Showing 12 of {entries.length}.{' '}
                <Link to="/news-events" className="text-indigo-400 hover:text-indigo-300">
                  View all
                </Link>
              </p>
            )}
          </div>
        )}
      </section>
    </div>
  );
}
