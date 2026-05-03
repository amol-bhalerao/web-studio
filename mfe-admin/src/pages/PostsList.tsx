import { motion } from 'framer-motion';
import { Pencil, Plus, Search, Trash2 } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import type { PostListItem } from '../api/types';
import { useApi } from '../context/ApiContext';
import clsx from 'clsx';

export function PostsListPage() {
  const api = useApi();
  const [items, setItems] = useState<PostListItem[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [q, setQ] = useState('');
  const [status, setStatus] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setErr(null);
    try {
      const params: Record<string, string> = { page: String(page), per_page: '12' };
      if (q.trim()) params.q = q.trim();
      if (status) params.status = status;
      const r = await api.postsAdmin(params);
      setItems(r.data);
      setTotalPages(r.meta.total_pages || 1);
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Failed to load');
    } finally {
      setLoading(false);
    }
  }, [api, page, q, status]);

  useEffect(() => {
    void load();
  }, [load]);

  async function remove(id: number) {
    if (!confirm('Delete this post?')) return;
    try {
      await api.deletePost(id);
      void load();
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Delete failed');
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold text-white">Posts</h1>
          <p className="mt-1 text-sm text-slate-400">Create, edit, and publish articles</p>
        </div>
        <Link to="new" className="admin-btn-primary self-start sm:self-auto">
          <Plus className="h-4 w-4" />
          New post
        </Link>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
          <input
            className="admin-input pl-10"
            placeholder="Search title or slug…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && void load()}
          />
        </div>
        <select
          className="admin-input max-w-xs"
          value={status}
          onChange={(e) => {
            setPage(1);
            setStatus(e.target.value);
          }}
        >
          <option value="">All statuses</option>
          <option value="published">Published</option>
          <option value="draft">Draft</option>
        </select>
        <button type="button" className="admin-btn-ghost" onClick={() => void load()}>
          Apply
        </button>
      </div>

      {err && (
        <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
          {err}
        </div>
      )}

      <div className="overflow-hidden rounded-2xl border border-slate-800/80 bg-slate-900/40 shadow-panel">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-slate-800/80 bg-slate-950/50 text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-3 font-medium">Title</th>
              <th className="hidden px-4 py-3 font-medium sm:table-cell">Categories</th>
              <th className="hidden px-4 py-3 font-medium lg:table-cell">Menu links</th>
              <th className="hidden px-4 py-3 font-medium md:table-cell">Status</th>
              <th className="hidden px-4 py-3 font-medium xl:table-cell">Updated</th>
              <th className="px-4 py-3 text-right font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {loading && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-slate-500">
                  Loading…
                </td>
              </tr>
            )}
            {!loading &&
              items.map((p, i) => (
                <motion.tr
                  key={p.id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: Math.min(i * 0.03, 0.3) }}
                  className="hover:bg-slate-800/30"
                >
                  <td className="px-4 py-3">
                    <div className="font-medium text-slate-100">{p.title}</div>
                    <div className="text-xs text-slate-500">{p.slug}</div>
                  </td>
                  <td className="hidden max-w-[11rem] px-4 py-3 sm:table-cell">
                    <div className="flex flex-wrap gap-1">
                      {(p.categories ?? []).map((c) => (
                        <span
                          key={c.id}
                          className="inline-block max-w-full truncate rounded-full bg-slate-800 px-2 py-0.5 text-[11px] text-slate-300 ring-1 ring-slate-700"
                          title={c.name}
                        >
                          {c.name}
                        </span>
                      ))}
                      {!(p.categories && p.categories.length) && <span className="text-slate-600">—</span>}
                    </div>
                  </td>
                  <td className="hidden px-4 py-3 lg:table-cell">
                    <div className="flex flex-wrap gap-1">
                      {(p.nav_menu_labels ?? []).map((lab, j) => (
                        <span
                          key={j}
                          className="rounded-full bg-indigo-950/80 px-2 py-0.5 text-[10px] font-medium text-indigo-200 ring-1 ring-indigo-500/35"
                        >
                          Menu: {lab}
                        </span>
                      ))}
                      {(p.nav_menu_labels ?? []).length === 0 && <span className="text-slate-600">—</span>}
                    </div>
                  </td>
                  <td className="hidden px-4 py-3 md:table-cell">
                    <span
                      className={clsx(
                        'inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ring-1',
                        p.status === 'published'
                          ? 'bg-emerald-500/15 text-emerald-300 ring-emerald-500/25'
                          : 'bg-amber-500/15 text-amber-200 ring-amber-500/25'
                      )}
                    >
                      {p.status}
                    </span>
                  </td>
                  <td className="hidden px-4 py-3 text-slate-400 xl:table-cell">
                    {p.updated_at?.replace('T', ' ').slice(0, 16)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-2">
                      <Link
                        to={`${p.id}`}
                        className="rounded-lg p-2 text-indigo-400 hover:bg-indigo-500/10"
                        title="Edit"
                      >
                        <Pencil className="h-4 w-4" />
                      </Link>
                      <button
                        type="button"
                        onClick={() => void remove(p.id)}
                        className="rounded-lg p-2 text-rose-400 hover:bg-rose-500/10"
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

      {totalPages > 1 && (
        <div className="flex justify-center gap-2">
          <button
            type="button"
            className="admin-btn-ghost text-xs"
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            Previous
          </button>
          <span className="flex items-center px-2 text-sm text-slate-400">
            Page {page} / {totalPages}
          </span>
          <button
            type="button"
            className="admin-btn-ghost text-xs"
            disabled={page >= totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
