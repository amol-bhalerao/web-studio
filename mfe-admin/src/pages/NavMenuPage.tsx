import { motion } from 'framer-motion';
import { Pencil, Plus, Trash2, X } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import type { NavItemRow, PostListItem, SitePage } from '../api/types';
import { useApi } from '../context/ApiContext';

export function NavMenuPage() {
  const api = useApi();
  const [items, setItems] = useState<NavItemRow[]>([]);
  const [pages, setPages] = useState<Pick<SitePage, 'id' | 'slug' | 'title'>[]>([]);
  const [posts, setPosts] = useState<PostListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  const [label, setLabel] = useState('');
  const [parentId, setParentId] = useState('');
  const [sortOrder, setSortOrder] = useState('0');
  const [target, setTarget] = useState<'page' | 'post' | 'url'>('page');
  const [pageId, setPageId] = useState('');
  const [postId, setPostId] = useState('');
  const [url, setUrl] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [na, pg, po] = await Promise.all([
        api.navigationAdmin(),
        api.sitePagesAdmin(),
        api.postsAdmin({ page: '1', per_page: '100' }),
      ]);
      setItems(na.data);
      setPages(pg.data);
      setPosts(po.data);
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
    setLabel('');
    setParentId('');
    setSortOrder('0');
    setPageId('');
    setPostId('');
    setUrl('');
    setTarget('page');
    setEditingId(null);
  }

  function startEdit(n: NavItemRow) {
    setEditingId(n.id);
    setLabel(n.label);
    setParentId(n.parent_id != null ? String(n.parent_id) : '');
    setSortOrder(String(n.sort_order));
    if (n.post_id != null) {
      setTarget('post');
      setPostId(String(n.post_id));
      setPageId('');
      setUrl('');
    } else if (n.url) {
      setTarget('url');
      setUrl(n.url);
      setPageId('');
      setPostId('');
    } else {
      setTarget('page');
      setPageId(n.page_id != null ? String(n.page_id) : '');
      setPostId('');
      setUrl('');
    }
  }

  async function add(e: React.FormEvent) {
    e.preventDefault();
    if (!label.trim()) return;
    try {
      const base = {
        label: label.trim(),
        parent_id: parentId === '' ? null : Number(parentId),
        sort_order: Number(sortOrder) || 0,
      };
      const body =
        target === 'page'
          ? { ...base, page_id: pageId === '' ? null : Number(pageId), post_id: null as number | null, url: null as string | null }
          : target === 'post'
            ? {
                ...base,
                page_id: null as number | null,
                post_id: postId === '' ? null : Number(postId),
                url: null as string | null,
              }
            : {
                ...base,
                page_id: null as number | null,
                post_id: null as number | null,
                url: url.trim() || null,
              };
      if (editingId != null) {
        await api.updateNavItem(editingId, body);
      } else {
        await api.createNavItem(body);
      }
      resetForm();
      void load();
    } catch (ex) {
      alert(ex instanceof Error ? ex.message : 'Failed');
    }
  }

  async function remove(id: number) {
    if (!confirm('Remove this menu item (and any children)?')) return;
    try {
      await api.deleteNavItem(id);
      void load();
    } catch (ex) {
      alert(ex instanceof Error ? ex.message : 'Failed');
    }
  }

  function parentLabel(pid: number | null): string {
    if (pid == null) return '—';
    return items.find((x) => x.id === pid)?.label ?? `#${pid}`;
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-2xl font-semibold text-white">Navigation menu</h1>
        <p className="mt-1 text-sm text-slate-400">
          Link to a <strong>site page</strong>, a <strong>blog post</strong>, or a custom <strong>URL</strong>. Use parent
          to create submenus; several items can point to the same page, post, or category-driven URLs.
        </p>
      </div>

      {err && (
        <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">{err}</div>
      )}

      <form onSubmit={add} className="grid gap-4 rounded-2xl border border-slate-800/80 bg-slate-900/40 p-6">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-sm font-semibold text-slate-200">
            {editingId != null ? `Edit menu item #${editingId}` : 'Add menu item'}
          </h2>
          {editingId != null ? (
            <button type="button" className="admin-btn-ghost inline-flex items-center gap-1 text-xs" onClick={() => resetForm()}>
              <X className="h-3.5 w-3.5" />
              Cancel edit
            </button>
          ) : null}
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-xs uppercase text-slate-500">Label</label>
            <input className="admin-input" value={label} onChange={(e) => setLabel(e.target.value)} placeholder="About" />
          </div>
          <div>
            <label className="mb-1 block text-xs uppercase text-slate-500">Parent (submenu)</label>
            <select className="admin-input" value={parentId} onChange={(e) => setParentId(e.target.value)}>
              <option value="">Top level</option>
              {items.map((n) => (
                <option key={n.id} value={String(n.id)}>
                  {n.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs uppercase text-slate-500">Sort order</label>
            <input
              className="admin-input"
              type="number"
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
            />
          </div>
          <div className="flex flex-wrap gap-4 sm:col-span-2">
            <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-300">
              <input
                type="radio"
                name="tgt"
                checked={target === 'page'}
                onChange={() => setTarget('page')}
              />
              Site page
            </label>
            <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-300">
              <input type="radio" name="tgt" checked={target === 'post'} onChange={() => setTarget('post')} />
              Article / post
            </label>
            <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-300">
              <input type="radio" name="tgt" checked={target === 'url'} onChange={() => setTarget('url')} />
              Custom URL
            </label>
          </div>
          {target === 'page' ? (
            <div className="sm:col-span-2">
              <label className="mb-1 block text-xs uppercase text-slate-500">Page</label>
              <select className="admin-input" value={pageId} onChange={(e) => setPageId(e.target.value)}>
                <option value="">Select page…</option>
                {pages.map((p) => (
                  <option key={p.id} value={String(p.id)}>
                    {p.title} ({p.slug})
                  </option>
                ))}
              </select>
            </div>
          ) : target === 'post' ? (
            <div className="sm:col-span-2">
              <label className="mb-1 block text-xs uppercase text-slate-500">Post</label>
              <select className="admin-input" value={postId} onChange={(e) => setPostId(e.target.value)}>
                <option value="">Select post…</option>
                {posts.map((p) => (
                  <option key={p.id} value={String(p.id)}>
                    {p.title} ({p.slug})
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <div className="sm:col-span-2">
              <label className="mb-1 block text-xs uppercase text-slate-500">URL</label>
              <input
                className="admin-input font-mono text-sm"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://example.com or /some-path"
              />
            </div>
          )}
        </div>
        <button type="submit" className="admin-btn-primary inline-flex max-w-xs items-center gap-2">
          {editingId != null ? <Pencil className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
          {editingId != null ? 'Save changes' : 'Add to menu'}
        </button>
      </form>

      <div className="overflow-hidden rounded-2xl border border-slate-800/80 bg-slate-900/40 shadow-panel">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-slate-800/80 bg-slate-950/50 text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-3 font-medium">Label</th>
              <th className="px-4 py-3 font-medium">Parent</th>
              <th className="hidden px-4 py-3 font-medium lg:table-cell">Resolves to</th>
              <th className="px-4 py-3 font-medium">Sort</th>
              <th className="px-4 py-3 text-right font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {loading && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-slate-500">
                  Loading…
                </td>
              </tr>
            )}
            {!loading &&
              items.map((n, i) => (
                <motion.tr
                  key={n.id}
                  initial={{ opacity: 0, x: -6 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: Math.min(i * 0.03, 0.2) }}
                  className="hover:bg-slate-800/30"
                >
                  <td className="px-4 py-3 font-medium text-slate-100">{n.label}</td>
                  <td className="px-4 py-3 text-slate-400">{parentLabel(n.parent_id)}</td>
                  <td className="hidden max-w-xs px-4 py-3 font-mono text-xs text-slate-500 lg:table-cell">
                    <span className="block truncate" title={n.href}>
                      {n.href}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-400">{n.sort_order}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-1">
                      <button
                        type="button"
                        onClick={() => startEdit(n)}
                        className="inline-flex rounded-lg p-2 text-indigo-400 hover:bg-indigo-500/10"
                        title="Edit"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => void remove(n.id)}
                        className="inline-flex rounded-lg p-2 text-rose-400 hover:bg-rose-500/10"
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
