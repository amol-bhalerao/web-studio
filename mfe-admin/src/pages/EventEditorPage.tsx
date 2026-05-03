import { motion } from 'framer-motion';
import { ArrowLeft, Save } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { RichEditor } from '../components/RichEditor';
import { useApi } from '../context/ApiContext';

export function EventEditorPage() {
  const { id } = useParams<{ id?: string }>();
  const api = useApi();
  const navigate = useNavigate();
  const isNew = !id || id === 'new';

  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [contentHtml, setContentHtml] = useState('<p></p>');
  const [sortOrder, setSortOrder] = useState(0);
  const [status, setStatus] = useState<'draft' | 'published'>('draft');
  const [publishedAt, setPublishedAt] = useState('');
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    if (isNew || !id || id === 'new') return;
    const numId = Number(id);
    if (!Number.isFinite(numId)) return;
    setLoading(true);
    api
      .eventAdmin(numId)
      .then((ev) => {
        setTitle(ev.title);
        setSlug(ev.slug);
        setExcerpt(ev.excerpt ?? '');
        setContentHtml(ev.content_html || '<p></p>');
        setSortOrder(ev.sort_order);
        setStatus(ev.status);
        setPublishedAt(ev.published_at ? ev.published_at.slice(0, 16) : '');
      })
      .catch((e: Error) => setErr(e.message))
      .finally(() => setLoading(false));
  }, [api, id, isNew]);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    setSaving(true);
    setErr(null);
    try {
      if (isNew) {
        await api.createEvent({
          title: title.trim(),
          slug: slug.trim() || undefined,
          excerpt: excerpt.trim() || undefined,
          content_html: contentHtml,
          sort_order: sortOrder,
          status,
          published_at: status === 'published' ? publishedAt || undefined : undefined,
        });
      } else {
        await api.updateEvent(Number(id), {
          title: title.trim(),
          slug: slug.trim() || undefined,
          excerpt: excerpt.trim() || undefined,
          content_html: contentHtml,
          sort_order: sortOrder,
          status,
          published_at: status === 'published' ? publishedAt || null : null,
        });
      }
      navigate('/news-events', { replace: true });
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Save failed');
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <p className="text-slate-400">Loading…</p>;
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex items-center gap-4">
        <Link to="/news-events" className="text-sm text-slate-400 hover:text-white">
          ← News &amp; events
        </Link>
      </div>
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-display text-2xl font-semibold text-white">{isNew ? 'New entry' : 'Edit entry'}</h1>
        <p className="mt-1 text-sm text-slate-400">
          News and announcements share one list — each entry gets its own page on the public site when published.
        </p>
      </motion.div>

      {err && (
        <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">{err}</div>
      )}

      <form onSubmit={(ev) => void save(ev)} className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-slate-500">Title</label>
            <input className="admin-input" value={title} onChange={(e) => setTitle(e.target.value)} required />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-slate-500">URL slug</label>
            <input
              className="admin-input"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder="auto from title if empty"
            />
          </div>
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-slate-500">
            Short excerpt (optional)
          </label>
          <textarea className="admin-input min-h-[72px]" value={excerpt} onChange={(e) => setExcerpt(e.target.value)} />
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-slate-500">Sort order</label>
            <input
              type="number"
              className="admin-input"
              value={sortOrder}
              onChange={(e) => setSortOrder(Number(e.target.value))}
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-slate-500">Status</label>
            <select
              className="admin-input"
              value={status}
              onChange={(e) => setStatus(e.target.value as 'draft' | 'published')}
            >
              <option value="draft">Draft</option>
              <option value="published">Published</option>
            </select>
          </div>
          {status === 'published' && (
            <div>
              <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-slate-500">
                Publish date
              </label>
              <input
                type="datetime-local"
                className="admin-input"
                value={publishedAt}
                onChange={(e) => setPublishedAt(e.target.value)}
              />
            </div>
          )}
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-slate-500">Body</label>
          <RichEditor
            value={contentHtml}
            onChange={setContentHtml}
            disabled={saving}
            uploadImage={async (file) => {
              const r = await api.uploadCover(file);
              return r.url;
            }}
          />
        </div>
        <div className="flex gap-3">
          <button type="submit" className="admin-btn-primary inline-flex items-center gap-2" disabled={saving}>
            <Save className="h-4 w-4" />
            {saving ? 'Saving…' : 'Save'}
          </button>
          <Link to="/news-events" className="admin-btn-ghost inline-flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
