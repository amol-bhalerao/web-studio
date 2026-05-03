import { motion } from 'framer-motion';
import { Film, ImageIcon } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import type { EventListPublic, GalleryItemPublic, SitePagePublic } from '../api/types';
import { GalleryLightbox } from '../components/GalleryLightbox';
import { usePublicApi } from '../context/ApiContext';
import { mediaUrl } from '../lib/mediaUrl';

export function SitePageView() {
  const { slug } = useParams<{ slug: string }>();
  const api = usePublicApi();
  const [page, setPage] = useState<SitePagePublic | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [galleryItems, setGalleryItems] = useState<GalleryItemPublic[]>([]);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const isGalleryPage = slug === 'gallery';
  const isNewsEventsPage = slug === 'news-events';
  const [newsEventsList, setNewsEventsList] = useState<EventListPublic[]>([]);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    setPage(null);
    setErr(null);
    api
      .sitePage(slug)
      .then((p) => {
        setPage(p);
      })
      .catch((e: Error) => setErr(e.message))
      .finally(() => setLoading(false));
  }, [api, slug]);

  useEffect(() => {
    if (!isGalleryPage) {
      setGalleryItems([]);
      setLightboxIndex(null);
      return;
    }
    api
      .gallery()
      .then((r) => setGalleryItems(r.data ?? []))
      .catch(() => setGalleryItems([]));
  }, [api, isGalleryPage]);

  useEffect(() => {
    if (!isNewsEventsPage) {
      setNewsEventsList([]);
      return;
    }
    api
      .events()
      .then((r) => setNewsEventsList(r.data ?? []))
      .catch(() => setNewsEventsList([]));
  }, [api, isNewsEventsPage]);

  if (err) {
    return (
      <div className="rounded-2xl border border-rose-200 bg-rose-50 px-6 py-8 text-center">
        <p className="text-rose-800">{err}</p>
        <Link to="/" className="mt-4 inline-block text-sm font-medium text-sky-600">
          Back home
        </Link>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-2xl animate-pulse space-y-4">
        <div className="h-10 rounded-lg bg-slate-200" />
        <div className="h-64 rounded-2xl bg-slate-100" />
      </div>
    );
  }

  if (!page) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white px-6 py-8 text-center text-slate-600">
        <p>Page not found.</p>
        <Link to="/" className="mt-4 inline-block text-sm font-medium text-sky-600">
          Back home
        </Link>
      </div>
    );
  }

  return (
    <motion.article
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="mx-auto max-w-3xl"
    >
      <Link to="/" className="mb-6 inline-block text-sm font-medium text-sky-600 hover:text-sky-700">
        ← Home
      </Link>
      <header className="border-b border-slate-200 pb-6">
        <h1 className="font-serif text-3xl font-bold text-slate-900 md:text-4xl">{page.title}</h1>
      </header>
      <div
        className="prose-blog mt-8"
        dangerouslySetInnerHTML={{ __html: page.content_html }}
      />

      {isNewsEventsPage && newsEventsList.length > 0 && (
        <section className="mt-14 border-t border-slate-200 pt-10">
          <h2 className="font-serif text-2xl font-semibold text-slate-900">News &amp; events</h2>
          <ul className="mt-6 space-y-3">
            {newsEventsList.map((ev) => (
              <li key={ev.id} className="list-none">
                <Link
                  to={`/events/${encodeURIComponent(ev.slug)}`}
                  className="block rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm ring-1 ring-slate-900/5 transition hover:border-sky-200 hover:ring-sky-100"
                >
                  <span className="font-semibold text-slate-900">{ev.title}</span>
                  {ev.excerpt && <p className="mt-1 text-sm text-slate-600">{ev.excerpt}</p>}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      {isGalleryPage && (
        <section className="mt-14 border-t border-slate-200 pt-10">
          <h2 className="font-serif text-2xl font-semibold text-slate-900">Gallery</h2>
          <p className="mt-2 text-sm text-slate-600">
            Click any item to open it full screen. Use arrows or keyboard to move between images and videos.
          </p>
          {galleryItems.length === 0 ? (
            <p className="mt-6 rounded-2xl border border-dashed border-slate-200 bg-slate-50/80 px-4 py-8 text-center text-slate-600">
              No media yet. Add images and videos in Admin → Gallery media.
            </p>
          ) : (
            <ul className="mt-8 grid list-none grid-cols-2 gap-3 p-0 sm:grid-cols-3 md:gap-4 lg:grid-cols-4">
              {galleryItems.map((item, i) => (
                <li key={item.id}>
                  <button
                    type="button"
                    onClick={() => setLightboxIndex(i)}
                    className="group relative aspect-square w-full overflow-hidden rounded-xl border border-slate-200/90 bg-slate-100 shadow-sm ring-1 ring-slate-900/5 transition hover:ring-2 hover:ring-sky-400/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500"
                  >
                    {item.media_type === 'image' ? (
                      <img
                        src={mediaUrl(item.url)}
                        alt={item.caption || ''}
                        className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]"
                        loading="lazy"
                      />
                    ) : (
                      <>
                        <video
                          src={mediaUrl(item.url)}
                          className="h-full w-full object-cover opacity-90"
                          muted
                          playsInline
                          preload="metadata"
                        />
                        <span className="absolute inset-0 flex items-center justify-center bg-slate-900/35 transition group-hover:bg-slate-900/25">
                          <Film className="h-10 w-10 text-white drop-shadow-md" aria-hidden />
                        </span>
                      </>
                    )}
                    <span className="pointer-events-none absolute bottom-2 right-2 rounded-full bg-black/55 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white">
                      {item.media_type === 'image' ? (
                        <span className="inline-flex items-center gap-1">
                          <ImageIcon className="h-3 w-3" /> Photo
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1">
                          <Film className="h-3 w-3" /> Video
                        </span>
                      )}
                    </span>
                  </button>
                  {item.caption && (
                    <p className="mt-1.5 line-clamp-2 text-center text-xs text-slate-600">{item.caption}</p>
                  )}
                </li>
              ))}
            </ul>
          )}
        </section>
      )}

      <GalleryLightbox
        items={galleryItems}
        index={lightboxIndex}
        onClose={() => setLightboxIndex(null)}
        onIndexChange={setLightboxIndex}
      />
    </motion.article>
  );
}
