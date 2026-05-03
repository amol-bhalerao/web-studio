import { motion } from 'framer-motion';
import { ImageUp, Plus, Save, Trash2 } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import type { CarouselSlideRow, PostListItem } from '../api/types';
import { RichEditor } from '../components/RichEditor';
import { useApi } from '../context/ApiContext';
import clsx from 'clsx';

export function CarouselAdminPage() {
  const api = useApi();
  const [slides, setSlides] = useState<CarouselSlideRow[]>([]);
  const [posts, setPosts] = useState<PostListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  const [editingId, setEditingId] = useState<number | null>(null);
  const [sortOrder, setSortOrder] = useState('0');
  const [title, setTitle] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [bodyHtml, setBodyHtml] = useState('<p></p>');
  const [linkTarget, setLinkTarget] = useState<'none' | 'post' | 'url'>('none');
  const [linkPostId, setLinkPostId] = useState('');
  const [linkUrl, setLinkUrl] = useState('');
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [cr, pr] = await Promise.all([
        api.carouselAdmin(),
        api.postsAdmin({ page: '1', per_page: '100' }),
      ]);
      setSlides(cr.data);
      setPosts(pr.data);
      setErr(null);
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Failed to load');
    } finally {
      setLoading(false);
    }
  }, [api]);

  useEffect(() => {
    void load();
  }, [load]);

  function resetForm() {
    setEditingId(null);
    setSortOrder(String(slides.length));
    setTitle('');
    setExcerpt('');
    setImageUrl('');
    setBodyHtml('<p></p>');
    setLinkTarget('none');
    setLinkPostId('');
    setLinkUrl('');
  }

  function startEdit(s: CarouselSlideRow) {
    setEditingId(s.id);
    setSortOrder(String(s.sort_order));
    setTitle(s.title);
    setExcerpt(s.excerpt ?? '');
    setImageUrl(s.image_url);
    setBodyHtml(s.body_html || '<p></p>');
    if (s.link_post_id) {
      setLinkTarget('post');
      setLinkPostId(String(s.link_post_id));
      setLinkUrl('');
    } else if (s.link_url) {
      setLinkTarget('url');
      setLinkUrl(s.link_url);
      setLinkPostId('');
    } else {
      setLinkTarget('none');
      setLinkPostId('');
      setLinkUrl('');
    }
  }

  async function onUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const r = await api.uploadCover(file);
      setImageUrl(r.url);
    } catch (ex) {
      alert(ex instanceof Error ? ex.message : 'Upload failed');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !imageUrl.trim()) return;
    setSaving(true);
    try {
      const link_post_id =
        linkTarget === 'post' && linkPostId !== '' ? Number(linkPostId) : null;
      const link_url =
        linkTarget === 'url' && linkUrl.trim() !== '' ? linkUrl.trim() : null;
      const payload = {
        sort_order: Number(sortOrder) || 0,
        title: title.trim(),
        excerpt: excerpt.trim(),
        image_url: imageUrl.trim(),
        body_html: bodyHtml,
        link_post_id: linkTarget === 'post' ? link_post_id : null,
        link_url: linkTarget === 'url' ? link_url : null,
      };
      if (editingId == null) {
        await api.createCarouselSlide({
          ...payload,
          excerpt: excerpt.trim() || undefined,
        });
      } else {
        await api.updateCarouselSlide(editingId, payload);
      }
      resetForm();
      void load();
    } catch (ex) {
      alert(ex instanceof Error ? ex.message : 'Save failed');
    } finally {
      setSaving(false);
    }
  }

  async function remove(id: number) {
    if (!confirm('Delete this slide?')) return;
    try {
      await api.deleteCarouselSlide(id);
      if (editingId === id) resetForm();
      void load();
    } catch (ex) {
      alert(ex instanceof Error ? ex.message : 'Delete failed');
    }
  }

  if (loading && slides.length === 0) {
    return <p className="text-slate-400">Loading…</p>;
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-2xl font-semibold text-white">Carousel</h1>
        <p className="mt-1 text-sm text-slate-400">
          Hero slides for the public homepage — image, optional rich body, and a link to a post or URL.
        </p>
      </div>

      {err && (
        <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">{err}</div>
      )}

      <motion.form
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        onSubmit={(ev) => void save(ev)}
        className="space-y-4 rounded-2xl border border-slate-800/80 bg-slate-900/40 p-6"
      >
        <h2 className="text-sm font-semibold text-slate-200">
          {editingId == null ? 'Add slide' : `Edit slide #${editingId}`}
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-xs uppercase text-slate-500">Sort order</label>
            <input
              className="admin-input"
              type="number"
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
            />
          </div>
          <div className="sm:col-span-2">
            <label className="mb-1 block text-xs uppercase text-slate-500">Title</label>
            <input className="admin-input" value={title} onChange={(e) => setTitle(e.target.value)} required />
          </div>
          <div className="sm:col-span-2">
            <label className="mb-1 block text-xs uppercase text-slate-500">Excerpt (optional)</label>
            <textarea
              className="admin-input min-h-[72px] resize-y"
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
            />
          </div>
          <div className="sm:col-span-2 space-y-2">
            <label className="mb-1 block text-xs uppercase text-slate-500">Image</label>
            <div className="flex flex-wrap items-center gap-3">
              <label className="admin-btn-ghost cursor-pointer text-xs">
                <ImageUp className="h-4 w-4" />
                {uploading ? 'Uploading…' : 'Upload'}
                <input type="file" accept="image/*" className="sr-only" disabled={uploading} onChange={(e) => void onUpload(e)} />
              </label>
              <input
                className="admin-input flex-1 font-mono text-xs"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://… or /uploads/…"
                required
              />
            </div>
            {imageUrl ? (
              <img src={imageUrl.startsWith('http') ? imageUrl : imageUrl} alt="" className="h-24 max-w-full rounded-lg object-cover" />
            ) : null}
          </div>
          <div className="sm:col-span-2">
            <label className="mb-1 block text-xs uppercase text-slate-500">Body (optional)</label>
            <RichEditor
              value={bodyHtml}
              onChange={setBodyHtml}
              disabled={saving}
              uploadImage={async (file) => {
                const r = await api.uploadCover(file);
                return r.url;
              }}
            />
          </div>
          <div className="flex flex-wrap gap-4 sm:col-span-2">
            <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-300">
              <input type="radio" name="clink" checked={linkTarget === 'none'} onChange={() => setLinkTarget('none')} />
              No button link
            </label>
            <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-300">
              <input type="radio" name="clink" checked={linkTarget === 'post'} onChange={() => setLinkTarget('post')} />
              Link to post
            </label>
            <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-300">
              <input type="radio" name="clink" checked={linkTarget === 'url'} onChange={() => setLinkTarget('url')} />
              Custom URL
            </label>
          </div>
          {linkTarget === 'post' ? (
            <div className="sm:col-span-2">
              <label className="mb-1 block text-xs uppercase text-slate-500">Post</label>
              <select className="admin-input" value={linkPostId} onChange={(e) => setLinkPostId(e.target.value)}>
                <option value="">Select…</option>
                {posts.map((p) => (
                  <option key={p.id} value={String(p.id)}>
                    {p.title}
                  </option>
                ))}
              </select>
            </div>
          ) : null}
          {linkTarget === 'url' ? (
            <div className="sm:col-span-2">
              <label className="mb-1 block text-xs uppercase text-slate-500">URL</label>
              <input className="admin-input font-mono text-sm" value={linkUrl} onChange={(e) => setLinkUrl(e.target.value)} />
            </div>
          ) : null}
        </div>
        <div className="flex flex-wrap gap-3">
          <button type="submit" className="admin-btn-primary inline-flex items-center gap-2" disabled={saving}>
            <Save className="h-4 w-4" />
            {saving ? 'Saving…' : editingId == null ? 'Create slide' : 'Update slide'}
          </button>
          {editingId != null ? (
            <button type="button" className="admin-btn-ghost" onClick={() => resetForm()}>
              Cancel edit
            </button>
          ) : null}
        </div>
      </motion.form>

      <div className="overflow-hidden rounded-2xl border border-slate-800/80 bg-slate-900/40">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-slate-800/80 bg-slate-950/50 text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-3 font-medium">Order</th>
              <th className="px-4 py-3 font-medium">Title</th>
              <th className="hidden px-4 py-3 font-medium md:table-cell">Image</th>
              <th className="px-4 py-3 text-right font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {slides.map((s, i) => (
              <motion.tr
                key={s.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: Math.min(i * 0.03, 0.15) }}
                className={clsx('hover:bg-slate-800/30', editingId === s.id && 'bg-indigo-900/20')}
              >
                <td className="px-4 py-3 text-slate-400">{s.sort_order}</td>
                <td className="px-4 py-3 font-medium text-slate-100">{s.title}</td>
                <td className="hidden max-w-[120px] px-4 py-3 md:table-cell">
                  <img src={s.image_url} alt="" className="h-10 w-16 rounded object-cover" />
                </td>
                <td className="px-4 py-3 text-right">
                  <button
                    type="button"
                    onClick={() => startEdit(s)}
                    className="mr-2 rounded-lg px-2 py-1 text-xs text-indigo-300 hover:bg-indigo-500/10"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => void remove(s.id)}
                    className="inline-flex rounded-lg p-2 text-rose-400 hover:bg-rose-500/10"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </td>
              </motion.tr>
            ))}
            {!slides.length && (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-slate-500">
                  No slides yet — use the form above.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <button type="button" className="admin-btn-ghost inline-flex items-center gap-2 text-sm" onClick={() => resetForm()}>
        <Plus className="h-4 w-4" />
        New slide (clear form)
      </button>
    </div>
  );
}
