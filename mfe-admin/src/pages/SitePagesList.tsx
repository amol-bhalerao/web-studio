import { motion } from 'framer-motion';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import type { SitePage } from '../api/types';
import { useApi } from '../context/ApiContext';

type Row = Pick<SitePage, 'id' | 'slug' | 'title' | 'updated_at'>;

export function SitePagesListPage() {
  const api = useApi();
  const [items, setItems] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const r = await api.sitePagesAdmin();
      setItems(r.data);
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

  async function remove(id: number) {
    if (!confirm('Delete this page? Menu links that pointed to it will break.')) return;
    try {
      await api.deleteSitePage(id);
      void load();
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Delete failed');
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-semibold text-white">Site pages</h1>
          <p className="mt-1 text-sm text-slate-400">About, Contact, and custom pages shown at /p/your-slug</p>
        </div>
        <Link to="new" className="admin-btn-primary inline-flex items-center gap-2">
          <Plus className="h-4 w-4" />
          New page
        </Link>
      </div>

      {err && (
        <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">{err}</div>
      )}

      <div className="overflow-hidden rounded-2xl border border-slate-800/80 bg-slate-900/40 shadow-panel">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-slate-800/80 bg-slate-950/50 text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-3 font-medium">Title</th>
              <th className="px-4 py-3 font-medium">Slug</th>
              <th className="hidden px-4 py-3 font-medium md:table-cell">Updated</th>
              <th className="px-4 py-3 text-right font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {loading && (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-slate-500">
                  Loading…
                </td>
              </tr>
            )}
            {!loading &&
              items.map((p, i) => (
                <motion.tr
                  key={p.id}
                  initial={{ opacity: 0, x: -6 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: Math.min(i * 0.03, 0.2) }}
                  className="hover:bg-slate-800/30"
                >
                  <td className="px-4 py-3 font-medium text-slate-100">{p.title}</td>
                  <td className="px-4 py-3 text-slate-500">{p.slug}</td>
                  <td className="hidden px-4 py-3 text-slate-400 md:table-cell">
                    {p.updated_at?.slice(0, 16).replace('T', ' ') ?? '—'}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      to={String(p.id)}
                      className="mr-2 inline-flex rounded-lg p-2 text-indigo-400 hover:bg-indigo-500/10"
                    >
                      <Pencil className="h-4 w-4" />
                    </Link>
                    <button
                      type="button"
                      onClick={() => void remove(p.id)}
                      className="inline-flex rounded-lg p-2 text-rose-400 hover:bg-rose-500/10"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </motion.tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
