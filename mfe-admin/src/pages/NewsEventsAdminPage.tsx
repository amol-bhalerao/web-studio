import { motion } from 'framer-motion';
import { ArrowLeft, Pencil, Plus, Save, Trash2 } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import type { EventListRow, SitePage } from '../api/types';
import { RichEditor } from '../components/RichEditor';
import { useApi } from '../context/ApiContext';

const RESERVED_SLUG = 'news-events';

/** Intro copy + multiple entries (news & events in one list). */
export function NewsEventsAdminPage() {
  const api = useApi();
  const [page, setPage] = useState<SitePage | null>(null);
  const [title, setTitle] = useState('News & events');
  const [contentHtml, setContentHtml] = useState('<p></p>');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [events, setEvents] = useState<EventListRow[]>([]);
  const [eventsLoading, setEventsLoading] = useState(true);

  const loadPage = useCallback(async () => {
    setLoading(true);
    try {
      const p = await api.sitePageAdminBySlug(RESERVED_SLUG);
      setPage(p);
      setTitle(p.title);
      setContentHtml(p.content_html || '<p></p>');
      setErr(null);
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Load failed');
      setPage(null);
    } finally {
      setLoading(false);
    }
  }, [api]);

  const loadEvents = useCallback(async () => {
    setEventsLoading(true);
    try {
      const r = await api.eventsAdmin();
      setEvents(r.data ?? []);
    } catch {
      setEvents([]);
    } finally {
      setEventsLoading(false);
    }
  }, [api]);

  useEffect(() => {
    void loadPage();
  }, [loadPage]);

  useEffect(() => {
    void loadEvents();
  }, [loadEvents]);

  async function saveIntro(e: React.FormEvent) {
    e.preventDefault();
    if (!page) return;
    if (!title.trim()) return;
    setSaving(true);
    setErr(null);
    try {
      const updated = await api.updateSitePage(page.id, {
        title: title.trim(),
        content_html: contentHtml,
      });
      setPage(updated);
    } catch (ex) {
      setErr(ex instanceof Error ? ex.message : 'Save failed');
    } finally {
      setSaving(false);
    }
  }

  async function removeEvent(id: number) {
    if (!confirm('Delete this entry?')) return;
    try {
      await api.deleteEvent(id);
      await loadEvents();
    } catch (ex) {
      setErr(ex instanceof Error ? ex.message : 'Delete failed');
    }
  }

  if (loading) {
    return <p className="text-slate-400">Loading…</p>;
  }

  if (!page) {
    return (
      <div className="space-y-4">
        <p className="text-rose-200">
          {err ?? 'Missing page.'} Run <code className="rounded bg-slate-800 px-1">php api/scripts/seed-database.php</code> to
          create the <code className="rounded bg-slate-800 px-1">news-events</code> page.
        </p>
        <button type="button" className="admin-btn-ghost" onClick={() => void loadPage()}>
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-10">
      <div className="flex items-center gap-3">
        <Link to=".." className="rounded-xl border border-slate-800 p-2 text-slate-400 hover:bg-slate-800/80 hover:text-white">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="font-display text-2xl font-semibold text-white">News &amp; events</h1>
          <p className="text-sm text-slate-400">
            One intro for the sidebar and full page; below, add as many <strong>entries</strong> as you need (news or
            events — same list). Each published entry opens at{' '}
            <code className="text-slate-300">/events/your-slug</code>.
          </p>
        </div>
      </div>

      {err && (
        <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">{err}</div>
      )}

      <motion.form
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        onSubmit={(ev) => void saveIntro(ev)}
        className="space-y-4 rounded-2xl border border-slate-800 bg-slate-950/30 p-6 ring-1 ring-slate-800/80"
      >
        <h2 className="font-display text-lg font-semibold text-white">Intro</h2>
        <div>
          <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-slate-500">Section title</label>
          <input className="admin-input" value={title} onChange={(e) => setTitle(e.target.value)} required />
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-slate-500">Intro content</label>
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
        <p className="text-xs text-slate-500">Reserved slug: {RESERVED_SLUG}</p>
        <button type="submit" className="admin-btn-primary inline-flex items-center gap-2" disabled={saving}>
          <Save className="h-4 w-4" />
          {saving ? 'Saving…' : 'Save intro'}
        </button>
      </motion.form>

      <section className="rounded-2xl border border-slate-800 bg-slate-950/30 p-6 ring-1 ring-slate-800/80">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-display text-lg font-semibold text-white">News &amp; events entries</h2>
          <Link
            to="/events/new"
            className="admin-btn-primary inline-flex items-center gap-2 text-sm"
          >
            <Plus className="h-4 w-4" />
            Add entry
          </Link>
        </div>
        <p className="mt-2 text-sm text-slate-400">
          All entries appear together on the home strip and news page — no separate “news” vs “events” sections.
        </p>

        {eventsLoading ? (
          <p className="mt-6 text-slate-500">Loading…</p>
        ) : events.length === 0 ? (
          <p className="mt-6 text-sm text-slate-500">No entries yet. Add your first announcement or event.</p>
        ) : (
          <div className="mt-6 overflow-x-auto">
            <table className="w-full min-w-[520px] border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-slate-800 text-xs uppercase tracking-wide text-slate-500">
                  <th className="py-2 pr-3">Title</th>
                  <th className="py-2 pr-3">Slug</th>
                  <th className="py-2 pr-3">Status</th>
                  <th className="py-2 pr-3">Order</th>
                  <th className="py-2 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {events.map((ev) => (
                  <tr key={ev.id} className="border-b border-slate-800/60">
                    <td className="py-2.5 pr-3 font-medium text-slate-200">{ev.title}</td>
                    <td className="py-2.5 pr-3 font-mono text-xs text-slate-400">{ev.slug}</td>
                    <td className="py-2.5 pr-3">
                      <span
                        className={
                          ev.status === 'published'
                            ? 'rounded-full bg-emerald-500/15 px-2 py-0.5 text-emerald-300'
                            : 'rounded-full bg-slate-600/30 px-2 py-0.5 text-slate-400'
                        }
                      >
                        {ev.status}
                      </span>
                    </td>
                    <td className="py-2.5 pr-3 text-slate-500">{ev.sort_order}</td>
                    <td className="py-2.5 text-right">
                      <div className="flex justify-end gap-1">
                        <Link
                          to={`/events/${ev.id}`}
                          className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-white"
                          title="Edit"
                        >
                          <Pencil className="h-4 w-4" />
                        </Link>
                        <button
                          type="button"
                          className="rounded-lg p-2 text-rose-300 hover:bg-slate-800"
                          title="Delete"
                          onClick={() => void removeEvent(ev.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
