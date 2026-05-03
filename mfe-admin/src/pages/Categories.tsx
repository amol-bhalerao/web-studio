import { motion } from 'framer-motion';
import { ExternalLink, FilePlus, Pencil, Plus, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import type { Category } from '../api/types';
import { publicTopicUrl } from '../lib/publicSiteUrl';
import { useApi } from '../context/ApiContext';

export function CategoriesPage() {
  const api = useApi();
  const [items, setItems] = useState<Category[]>([]);
  const [name, setName] = useState('');
  const [parentId, setParentId] = useState('');
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [editing, setEditing] = useState<number | null>(null);
  const [editName, setEditName] = useState('');
  const [editParent, setEditParent] = useState('');

  async function load() {
    setLoading(true);
    try {
      const r = await api.categoriesAdmin();
      setItems(r.data);
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Failed to load');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, [api]);

  function parentLabel(parentIdVal: number | null | undefined): string {
    if (parentIdVal == null) return '—';
    return items.find((x) => x.id === parentIdVal)?.name ?? `#${parentIdVal}`;
  }

  async function create(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    try {
      await api.createCategory({
        name: name.trim(),
        parent_id: parentId === '' ? null : Number(parentId),
      });
      setName('');
      setParentId('');
      void load();
    } catch (err2) {
      alert(err2 instanceof Error ? err2.message : 'Failed');
    }
  }

  async function saveEdit(id: number) {
    try {
      await api.updateCategory(id, {
        name: editName.trim(),
        parent_id: editParent === '' ? null : Number(editParent),
      });
      setEditing(null);
      void load();
    } catch (err2) {
      alert(err2 instanceof Error ? err2.message : 'Failed');
    }
  }

  async function remove(id: number) {
    if (!confirm('Delete this category? Linked posts will be unassigned from this category.')) return;
    try {
      await api.deleteCategory(id);
      void load();
    } catch (err2) {
      alert(err2 instanceof Error ? err2.message : 'Failed');
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-2xl font-semibold text-white">Categories</h1>
        <p className="mt-1 text-sm text-slate-400">Organize posts — nest categories for the public sidebar</p>
      </div>

      <form onSubmit={create} className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 lg:items-end">
        <div className="sm:col-span-2 lg:col-span-2">
          <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-slate-500">
            New category
          </label>
          <input
            className="admin-input"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Name"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-slate-500">
            Under parent
          </label>
          <select className="admin-input" value={parentId} onChange={(e) => setParentId(e.target.value)}>
            <option value="">Top level</option>
            {items.map((c) => (
              <option key={c.id} value={String(c.id)}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        <button type="submit" className="admin-btn-primary">
          <Plus className="h-4 w-4" />
          Add
        </button>
      </form>

      {err && (
        <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
          {err}
        </div>
      )}

      <div className="overflow-hidden rounded-2xl border border-slate-800/80 bg-slate-900/40 shadow-panel">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-slate-800/80 bg-slate-950/50 text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-3 font-medium">Name</th>
              <th className="hidden px-4 py-3 font-medium lg:table-cell">Parent</th>
              <th className="px-4 py-3 font-medium">Slug</th>
              <th className="hidden px-4 py-3 font-medium md:table-cell">Posts</th>
              <th className="hidden px-4 py-3 font-medium xl:table-cell">Add / view</th>
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
              items.map((c, i) => (
                <motion.tr
                  key={c.id}
                  initial={{ opacity: 0, x: -6 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: Math.min(i * 0.04, 0.25) }}
                  className="hover:bg-slate-800/30"
                >
                  <td className="px-4 py-3 align-top">
                    {editing === c.id ? (
                      <div className="space-y-2">
                        <input
                          className="admin-input py-1.5 text-sm"
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          autoFocus
                        />
                        <div>
                          <label className="mb-1 block text-[10px] uppercase text-slate-500">Parent</label>
                          <select
                            className="admin-input py-1.5 text-sm"
                            value={editParent}
                            onChange={(e) => setEditParent(e.target.value)}
                          >
                            <option value="">Top level</option>
                            {items
                              .filter((x) => x.id !== c.id)
                              .map((x) => (
                                <option key={x.id} value={String(x.id)}>
                                  {x.name}
                                </option>
                              ))}
                          </select>
                        </div>
                      </div>
                    ) : (
                      <span className="font-medium text-slate-100">{c.name}</span>
                    )}
                  </td>
                  <td className="hidden px-4 py-3 text-slate-400 lg:table-cell">{parentLabel(c.parent_id)}</td>
                  <td className="px-4 py-3 text-slate-500">{c.slug}</td>
                  <td className="hidden px-4 py-3 text-slate-400 md:table-cell">{c.post_count ?? 0}</td>
                  <td className="hidden px-4 py-3 xl:table-cell">
                    <div className="flex flex-col gap-1.5">
                      <Link
                        to={`../posts/new?category=${c.id}`}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-sky-400 hover:text-sky-300"
                      >
                        <FilePlus className="h-3.5 w-3.5" />
                        Add post
                      </Link>
                      <a
                        href={publicTopicUrl(c.slug)}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-xs text-slate-400 hover:text-white"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                        Open topic
                      </a>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right">
                    {editing === c.id ? (
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          className="admin-btn-ghost px-2 py-1 text-xs"
                          onClick={() => setEditing(null)}
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          className="admin-btn-primary px-3 py-1 text-xs"
                          onClick={() => void saveEdit(c.id)}
                        >
                          Save
                        </button>
                      </div>
                    ) : (
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setEditing(c.id);
                            setEditName(c.name);
                            setEditParent(c.parent_id != null ? String(c.parent_id) : '');
                          }}
                          className="rounded-lg p-2 text-indigo-400 hover:bg-indigo-500/10"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => void remove(c.id)}
                          className="rounded-lg p-2 text-rose-400 hover:bg-rose-500/10"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    )}
                  </td>
                </motion.tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
