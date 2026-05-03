import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import type { EventListPublic, SitePagePublic } from '../api/types';

export function NewsEventsStrip({
  page,
  events,
  loading,
}: {
  page: SitePagePublic | null;
  events: EventListPublic[];
  loading: boolean;
}) {
  if (loading) {
    return (
      <div className="flex h-full min-h-[280px] flex-col gap-3">
        <div className="h-8 w-40 animate-pulse rounded-lg bg-slate-200/80" />
        <div className="min-h-[220px] flex-1 animate-pulse rounded-2xl bg-slate-200/70" />
      </div>
    );
  }

  const title = page?.title?.trim() || 'News & events';
  const html = page?.content_html?.trim() ?? '';

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="mb-3 flex items-center justify-between gap-2">
        <h2 className="font-serif text-lg font-bold text-slate-900">{title}</h2>
        <Link
          to="p/news-events"
          className="shrink-0 text-xs font-semibold text-indigo-600 hover:text-indigo-800 md:text-sm"
        >
          Full page
        </Link>
      </div>

      <motion.div
        layout
        className="relative flex min-h-[220px] flex-1 flex-col overflow-hidden rounded-2xl border border-slate-200/90 bg-white/95 shadow-lg shadow-slate-900/5 ring-1 ring-slate-900/5"
      >
        <div className="pointer-events-none absolute inset-x-0 top-0 z-10 h-8 bg-gradient-to-b from-white to-transparent" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-8 bg-gradient-to-t from-white to-transparent" />

        <div className="news-events-preview prose-blog relative max-h-[min(52vh,420px)] min-h-[180px] flex-1 overflow-y-auto px-4 pb-6 pt-5">
          {html ? (
            <div dangerouslySetInnerHTML={{ __html: html }} />
          ) : (
            <p className="text-sm font-medium text-slate-600">
              Edit the intro in Admin → News &amp; events. Add dated items below as <strong>events</strong>.
            </p>
          )}

          {events.length > 0 && (
            <div className="mt-6 border-t border-slate-200 pt-4">
              <p className="mb-2 text-[11px] font-bold uppercase tracking-wider text-sky-700">News &amp; events</p>
              <ul className="space-y-2 !my-0">
                {events.map((ev) => (
                  <li key={ev.id} className="list-none">
                    <Link
                      to={`/events/${encodeURIComponent(ev.slug)}`}
                      className="block rounded-lg border border-slate-100 bg-sky-50/50 px-3 py-2 text-left text-sm font-semibold text-slate-900 ring-1 ring-slate-900/5 transition hover:border-sky-200 hover:bg-sky-50"
                    >
                      <span className="line-clamp-2">{ev.title}</span>
                      {ev.excerpt && (
                        <span className="mt-0.5 block text-xs font-normal text-slate-600 line-clamp-2">{ev.excerpt}</span>
                      )}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
