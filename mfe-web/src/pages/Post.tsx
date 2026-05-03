import { motion } from 'framer-motion';
import { ArrowLeft, Calendar, ExternalLink } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import type { PublicPostFull } from '../api/types';
import { usePublicApi } from '../context/ApiContext';
import { mediaUrl } from '../lib/mediaUrl';

function formatDate(iso: string | null) {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export function PostPage() {
  const { slug } = useParams();
  const api = usePublicApi();
  const [post, setPost] = useState<PublicPostFull | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) return;
    api
      .postBySlug(slug)
      .then(setPost)
      .catch((e: Error) => setErr(e.message));
  }, [api, slug]);

  if (err) {
    return (
      <div className="rounded-2xl border border-rose-200 bg-rose-50 px-6 py-8 text-center">
        <p className="text-rose-800">{err}</p>
        <Link to=".." className="mt-4 inline-block text-sm font-medium text-sky-600">
          Back home
        </Link>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="mx-auto max-w-2xl animate-pulse space-y-4">
        <div className="h-10 rounded-lg bg-slate-200" />
        <div className="h-4 rounded bg-slate-100" />
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
      <Link
        to=".."
        className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-sky-600 hover:text-sky-700"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to articles
      </Link>

      <header className="border-b border-slate-200 pb-8">
        <div className="flex flex-wrap gap-2">
          {post.categories.map((c) => (
            <Link
              key={c.id}
              to={`/topic/${encodeURIComponent(c.slug)}`}
              className="rounded-full bg-sky-50 px-3 py-1 text-xs font-semibold text-sky-800 ring-1 ring-sky-100 transition hover:bg-sky-100"
            >
              {c.name}
            </Link>
          ))}
        </div>
        <h1 className="mt-4 font-serif text-4xl font-semibold tracking-tight text-slate-900 md:text-5xl">
          {post.title}
        </h1>
        <p className="mt-4 inline-flex items-center gap-2 text-sm text-slate-500">
          <Calendar className="h-4 w-4" />
          {formatDate(post.published_at)}
        </p>
        {post.cover_image_url && (
          <img
            src={mediaUrl(post.cover_image_url)}
            alt=""
            className="mt-8 max-h-[420px] w-full rounded-2xl object-cover shadow-lg"
          />
        )}
      </header>

      {post.excerpt && (
        <p className="mt-8 font-serif text-xl italic leading-relaxed text-slate-600">{post.excerpt}</p>
      )}

      {post.pdf_url && (
        <div className="mt-10 w-full overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 shadow-inner ring-1 ring-slate-900/5">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 bg-white/90 px-4 py-2">
            <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Document</span>
            <a
              href={mediaUrl(post.pdf_url)}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 text-sm font-medium text-sky-600 hover:text-sky-800"
            >
              Open in new tab
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </div>
          <iframe
            title={post.title}
            src={mediaUrl(post.pdf_url)}
            className="h-[min(78vh,720px)] w-full bg-white"
          />
        </div>
      )}

      <div
        className="prose-blog mt-10"
        dangerouslySetInnerHTML={{ __html: post.content_html }}
      />
    </motion.article>
  );
}
