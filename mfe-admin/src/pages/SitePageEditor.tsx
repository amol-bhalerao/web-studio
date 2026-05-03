import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { RichEditor } from '../components/RichEditor';
import { useApi } from '../context/ApiContext';

export function SitePageEditorPage() {
  const { id } = useParams<{ id?: string }>();
  const api = useApi();
  const navigate = useNavigate();
  /** Route `site-pages/new` has no `:id` param — `id` is undefined, not the string `new`. */
  const isNew = !id || id === 'new';

  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [contentHtml, setContentHtml] = useState('<p></p>');
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    if (isNew || !id || id === 'new') return;
    const numId = Number(id);
    if (!Number.isFinite(numId)) return;
    setLoading(true);
    api
      .sitePageAdmin(numId)
      .then((p) => {
        setTitle(p.title);
        setSlug(p.slug);
        setContentHtml(p.content_html || '<p></p>');
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
        await api.createSitePage({
          title: title.trim(),
          slug: slug.trim() || undefined,
          content_html: contentHtml,
        });
      } else {
        await api.updateSitePage(Number(id), {
          title: title.trim(),
          slug: slug.trim() || undefined,
          content_html: contentHtml,
        });
      }
      navigate('..', { replace: true });
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
        <Link to="/site-pages" className="text-sm text-slate-400 hover:text-white">
          ← Site pages
        </Link>
      </div>
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-display text-2xl font-semibold text-white">
          {isNew ? 'New site page' : 'Edit site page'}
        </h1>
        <p className="mt-1 text-sm text-slate-400">Rich content is saved as HTML and rendered on the public site.</p>
      </motion.div>

      {err && (
        <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">{err}</div>
      )}

      <form onSubmit={save} className="space-y-4">
        <div>
          <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-slate-500">Title</label>
          <input className="admin-input" value={title} onChange={(e) => setTitle(e.target.value)} required />
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-slate-500">
            Slug (optional — URL segment)
          </label>
          <input className="admin-input font-mono text-sm" value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="about" />
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-slate-500">Content</label>
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
        <button type="submit" className="admin-btn-primary" disabled={saving}>
          {saving ? 'Saving…' : 'Save'}
        </button>
      </form>
    </div>
  );
}
