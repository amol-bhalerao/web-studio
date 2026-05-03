import { motion } from 'framer-motion';
import { ArrowLeft, FileText, ImageUp, Save, Trash2 } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import type { Category } from '../api/types';
import { RichEditor } from '../components/RichEditor';
import { useApi } from '../context/ApiContext';
import clsx from 'clsx';

type CatNode = Category & { children: CatNode[] };

function buildCategoryTree(cats: Category[]): CatNode[] {
  const map = new Map<number, CatNode>();
  cats.forEach((c) => map.set(c.id, { ...c, children: [] }));
  const roots: CatNode[] = [];
  cats.forEach((c) => {
    const node = map.get(c.id)!;
    const pid = c.parent_id ?? null;
    if (pid != null && map.has(pid)) {
      map.get(pid)!.children.push(node);
    } else {
      roots.push(node);
    }
  });
  const sortTree = (nodes: CatNode[]) => {
    nodes.sort((a, b) => a.name.localeCompare(b.name));
    nodes.forEach((n) => sortTree(n.children));
  };
  sortTree(roots);
  return roots;
}

function flattenCategoryChoices(nodes: CatNode[], depth = 0): { id: number; label: string }[] {
  const out: { id: number; label: string }[] = [];
  for (const n of nodes) {
    const prefix = depth > 0 ? `${'\u00A0\u00A0'.repeat(depth)}↳ ` : '';
    out.push({ id: n.id, label: `${prefix}${n.name}` });
    out.push(...flattenCategoryChoices(n.children, depth + 1));
  }
  return out;
}

export function PostEditorPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const api = useApi();
  const isNew = id === 'new' || !id;
  const preCategory = searchParams.get('category');

  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [content, setContent] = useState('<p></p>');
  const [cover, setCover] = useState('');
  const [pdfUrl, setPdfUrl] = useState('');
  const [status, setStatus] = useState<'draft' | 'published'>('draft');
  const [categoryIds, setCategoryIds] = useState<number[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadingPdf, setUploadingPdf] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const categoryChoices = useMemo(
    () => flattenCategoryChoices(buildCategoryTree(categories)),
    [categories]
  );

  useEffect(() => {
    api
      .categoriesAdmin()
      .then((r) => setCategories(r.data))
      .catch(() => {});
  }, [api]);

  useEffect(() => {
    if (!isNew || !preCategory) return;
    const cid = Number(preCategory);
    if (Number.isFinite(cid)) {
      setCategoryIds([cid]);
    }
  }, [isNew, preCategory]);

  useEffect(() => {
    if (isNew || !id) return;
    const pid = Number(id);
    if (Number.isNaN(pid)) return;
    setLoading(true);
    api
      .postById(pid)
      .then((p) => {
        setTitle(p.title);
        setSlug(p.slug);
        setExcerpt(p.excerpt || '');
        setContent(p.content_html || '<p></p>');
        setCover(p.cover_image_url || '');
        setPdfUrl(p.pdf_url || '');
        setStatus(p.status);
        setCategoryIds(p.category_ids || []);
      })
      .catch((e: Error) => setErr(e.message))
      .finally(() => setLoading(false));
  }, [api, id, isNew]);

  async function onPdfFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingPdf(true);
    setErr(null);
    try {
      const r = await api.uploadPdf(file);
      setPdfUrl(r.url);
    } catch (err2) {
      setErr(err2 instanceof Error ? err2.message : 'PDF upload failed');
    } finally {
      setUploadingPdf(false);
      e.target.value = '';
    }
  }

  async function onCoverFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setErr(null);
    try {
      const r = await api.uploadCover(file);
      setCover(r.url);
    } catch (err2) {
      setErr(err2 instanceof Error ? err2.message : 'Upload failed');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  }

  function toggleCategory(cid: number) {
    setCategoryIds((prev) =>
      prev.includes(cid) ? prev.filter((x) => x !== cid) : [...prev, cid]
    );
  }

  async function save() {
    setSaving(true);
    setErr(null);
    try {
      const body = {
        title,
        slug: slug.trim() || undefined,
        excerpt,
        content_html: content,
        cover_image_url: cover.trim() || null,
        pdf_url: pdfUrl.trim() || null,
        status,
        category_ids: categoryIds,
      };
      if (isNew) {
        const created = await api.createPost(body);
        navigate(`../${created.id}`, { relative: 'path', replace: true });
      } else {
        await api.updatePost(Number(id), body);
      }
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Save failed');
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-slate-500">
        Loading post…
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Link
            to=".."
            relative="path"
            className="rounded-xl border border-slate-800 p-2 text-slate-400 hover:bg-slate-800/80 hover:text-white"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="font-display text-2xl font-semibold text-white">
              {isNew ? 'New post' : 'Edit post'}
            </h1>
            <p className="text-sm text-slate-400">
              Rich content — colors, links, tables, and images in the editor
              {preCategory ? ' · category pre-selected' : ''}
            </p>
          </div>
        </div>
        <button type="button" className="admin-btn-primary" onClick={() => void save()} disabled={saving}>
          <Save className="h-4 w-4" />
          {saving ? 'Saving…' : 'Save'}
        </button>
      </div>

      {err && (
        <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
          {err}
        </div>
      )}

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-4 rounded-2xl border border-slate-800/80 bg-slate-900/40 p-6 shadow-panel"
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-slate-500">
              Title
            </label>
            <input className="admin-input" value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-slate-500">
              Slug (optional)
            </label>
            <input className="admin-input" value={slug} onChange={(e) => setSlug(e.target.value)} />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-slate-500">
              Status
            </label>
            <select
              className="admin-input"
              value={status}
              onChange={(e) => setStatus(e.target.value as 'draft' | 'published')}
            >
              <option value="draft">Draft</option>
              <option value="published">Published</option>
            </select>
          </div>
          <div className="sm:col-span-2 space-y-3">
            <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-slate-500">
              Cover image
            </label>
            <div className="flex flex-wrap items-center gap-4">
              <label className="admin-btn-ghost cursor-pointer">
                <ImageUp className="h-4 w-4" />
                {uploading ? 'Uploading…' : 'Upload file'}
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  className="sr-only"
                  disabled={uploading || saving}
                  onChange={(e) => void onCoverFile(e)}
                />
              </label>
              {cover ? (
                <img
                  src={cover.startsWith('http') ? cover : cover}
                  alt=""
                  className="h-24 max-w-[200px] rounded-lg border border-slate-700 object-cover"
                />
              ) : null}
            </div>
            <p className="text-xs text-slate-500">JPEG, PNG, WebP or GIF · max 5 MB. Or paste a URL:</p>
            <input
              className="admin-input"
              value={cover}
              onChange={(e) => setCover(e.target.value)}
              placeholder="https://… or /uploads/…"
            />
          </div>
          <div className="sm:col-span-2 space-y-3">
            <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-slate-500">
              PDF (optional)
            </label>
            <p className="text-xs text-slate-500">
              Shown inline on the public post. Max 20 MB. You can still use the rich text body above or below the
              document.
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <label className="admin-btn-ghost cursor-pointer">
                <FileText className="h-4 w-4" />
                {uploadingPdf ? 'Uploading…' : 'Upload PDF'}
                <input
                  type="file"
                  accept="application/pdf"
                  className="sr-only"
                  disabled={uploadingPdf || saving}
                  onChange={(e) => void onPdfFile(e)}
                />
              </label>
              {pdfUrl ? (
                <button
                  type="button"
                  className="admin-btn-ghost text-rose-300"
                  onClick={() => setPdfUrl('')}
                  title="Remove PDF"
                >
                  <Trash2 className="h-4 w-4" />
                  Remove
                </button>
              ) : null}
            </div>
            <input
              className="admin-input"
              value={pdfUrl}
              onChange={(e) => setPdfUrl(e.target.value)}
              placeholder="/uploads/… or paste URL"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-slate-500">
              Excerpt
            </label>
            <textarea
              className="admin-input min-h-[88px] resize-y"
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
            />
          </div>
        </div>

        <div>
          <label className="mb-2 block text-xs font-medium uppercase tracking-wide text-slate-500">
            Categories
          </label>
          <div className="flex flex-wrap gap-2">
            {categoryChoices.map((c) => (
              <button
                key={c.id}
                type="button"
                title={c.label.replace(/\u00A0/g, ' ').trim()}
                onClick={() => toggleCategory(c.id)}
                className={clsx(
                  'max-w-full truncate rounded-full px-3 py-1.5 text-left text-xs font-medium ring-1 transition',
                  categoryIds.includes(c.id)
                    ? 'bg-indigo-600/30 text-indigo-100 ring-indigo-500/40'
                    : 'bg-slate-800/80 text-slate-400 ring-slate-700 hover:text-slate-200'
                )}
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="mb-2 block text-xs font-medium uppercase tracking-wide text-slate-500">
            Content
          </label>
          <RichEditor
            value={content}
            onChange={setContent}
            disabled={saving}
            uploadImage={async (file) => {
              const r = await api.uploadCover(file);
              return r.url;
            }}
          />
        </div>
      </motion.div>
    </div>
  );
}
