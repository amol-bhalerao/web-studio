import { motion } from 'framer-motion';
import { Calendar } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import type { EventDetailPublic } from '../api/types';
import { usePublicApi } from '../context/ApiContext';

function formatDate(iso: string | null) {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export function EventPage() {
  const { slug } = useParams<{ slug: string }>();
  const api = usePublicApi();
  const [ev, setEv] = useState<EventDetailPublic | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) return;
    api
      .eventBySlug(slug)
      .then(setEv)
      .catch((e: Error) => setErr(e.message));
  }, [api, slug]);

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

  if (!ev) {
    return (
      <div className="mx-auto max-w-2xl animate-pulse space-y-4">
        <div className="h-10 rounded-lg bg-slate-200" />
        <div className="h-64 rounded-2xl bg-slate-100" />
      </div>
    );
  }

  return (
    <motion.article
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="mx-auto max-w-3xl"
    >
      <Link to="/p/news-events" className="mb-6 inline-block text-sm font-medium text-sky-600 hover:text-sky-700">
        ← News &amp; events
      </Link>
      <header className="border-b border-slate-200 pb-6">
        <h1 className="font-serif text-3xl font-bold text-slate-900 md:text-4xl">{ev.title}</h1>
        {ev.published_at && (
          <p className="mt-3 flex items-center gap-2 text-sm text-slate-500">
            <Calendar className="h-4 w-4 shrink-0" />
            {formatDate(ev.published_at)}
          </p>
        )}
        {ev.excerpt && <p className="mt-4 text-lg text-slate-600">{ev.excerpt}</p>}
      </header>
      <div className="prose-blog mt-8" dangerouslySetInnerHTML={{ __html: ev.content_html }} />
    </motion.article>
  );
}
