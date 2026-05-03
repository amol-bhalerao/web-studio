import { motion } from 'framer-motion';
import {
  ArrowDown,
  ArrowUp,
  Home,
  ImageIcon,
  Loader2,
  Plus,
  Save,
  Trash2,
} from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { useApi } from '../context/ApiContext';
import type { HomeSectionRow, SiteHomePayload } from '../api/types';

function newSection(): HomeSectionRow {
  return {
    id: `s-${Date.now()}`,
    heading: 'New section',
    subheading: '',
    body_html: '<p></p>',
    variant: 'default',
  };
}

function moveSection(sections: HomeSectionRow[], index: number, delta: -1 | 1): HomeSectionRow[] {
  const j = index + delta;
  if (j < 0 || j >= sections.length) return sections;
  const next = [...sections];
  [next[index], next[j]] = [next[j], next[index]];
  return next;
}

export function HomePageAdminPage() {
  const api = useApi();
  const [draft, setDraft] = useState<SiteHomePayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setErr(null);
    try {
      const h = await api.homeAdmin();
      setDraft(h);
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Failed to load');
    } finally {
      setLoading(false);
    }
  }, [api]);

  useEffect(() => {
    void load();
  }, [load]);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!draft) return;
    setSaving(true);
    setErr(null);
    try {
      const saved = await api.updateHome(draft);
      setDraft(saved);
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Save failed');
    } finally {
      setSaving(false);
    }
  }

  if (loading || !draft) {
    return (
      <div className="flex items-center gap-2 text-slate-400">
        <Loader2 className="h-5 w-5 animate-spin" />
        Loading home page…
      </div>
    );
  }

  const { hero, sections } = draft;

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-2 text-indigo-400/90">
          <Home className="h-5 w-5" />
          <span className="text-xs font-bold uppercase tracking-wider">Public site</span>
        </div>
        <h1 className="mt-2 font-display text-2xl font-semibold text-white">Home page</h1>
        <p className="mt-1 text-sm text-slate-400">
          Hero, quick figures, and multiple HTML sections for your college or institution. This appears on the public
          home route before the post list.
        </p>
      </motion.div>

      {err && (
        <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">{err}</div>
      )}

      <form onSubmit={save} className="space-y-8">
        <section className="space-y-4 rounded-2xl border border-slate-800 bg-slate-950/40 p-5 ring-1 ring-slate-800/80">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Hero</h2>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-slate-500">Title</label>
            <input
              className="admin-input"
              value={hero.title}
              onChange={(e) => setDraft({ ...draft, hero: { ...hero, title: e.target.value } })}
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-slate-500">Subtitle</label>
            <input
              className="admin-input"
              value={hero.subtitle}
              onChange={(e) => setDraft({ ...draft, hero: { ...hero, subtitle: e.target.value } })}
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-slate-500">Tagline</label>
            <input
              className="admin-input"
              value={hero.tagline}
              onChange={(e) => setDraft({ ...draft, hero: { ...hero, tagline: e.target.value } })}
              placeholder="Accreditation, affiliation, short line"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-slate-500">Background image</label>
            <div className="flex flex-wrap items-end gap-2">
              {hero.image_url ? (
                <img
                  src={hero.image_url}
                  alt=""
                  className="h-16 max-w-[200px] rounded-lg object-cover ring-1 ring-slate-700"
                />
              ) : null}
              <label className="admin-btn-ghost inline-flex cursor-pointer items-center gap-1 text-xs">
                <ImageIcon className="h-3.5 w-3.5" />
                Upload
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  className="hidden"
                  onChange={async (e) => {
                    const f = e.target.files?.[0];
                    if (!f) return;
                    try {
                      const { url } = await api.uploadCover(f);
                      setDraft({ ...draft, hero: { ...hero, image_url: url } });
                    } catch (ex) {
                      setErr(ex instanceof Error ? ex.message : 'Upload failed');
                    }
                    e.target.value = '';
                  }}
                />
              </label>
              <input
                className="admin-input min-w-[12rem] flex-1"
                placeholder="Or paste image URL"
                value={hero.image_url}
                onChange={(e) => setDraft({ ...draft, hero: { ...hero, image_url: e.target.value } })}
              />
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-slate-500">Primary button label</label>
              <input
                className="admin-input"
                value={hero.primary_cta_label}
                onChange={(e) => setDraft({ ...draft, hero: { ...hero, primary_cta_label: e.target.value } })}
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-slate-500">Primary link</label>
              <input
                className="admin-input font-mono text-sm"
                value={hero.primary_cta_href}
                onChange={(e) => setDraft({ ...draft, hero: { ...hero, primary_cta_href: e.target.value } })}
                placeholder="/p/about"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-slate-500">Secondary button label</label>
              <input
                className="admin-input"
                value={hero.secondary_cta_label}
                onChange={(e) => setDraft({ ...draft, hero: { ...hero, secondary_cta_label: e.target.value } })}
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-slate-500">Secondary link</label>
              <input
                className="admin-input font-mono text-sm"
                value={hero.secondary_cta_href}
                onChange={(e) => setDraft({ ...draft, hero: { ...hero, secondary_cta_href: e.target.value } })}
                placeholder="/p/news-events"
              />
            </div>
          </div>
          <div>
            <p className="mb-2 text-xs font-medium text-slate-500">Quick stats (e.g. students, programs)</p>
            <div className="space-y-2">
              {hero.stats.map((row, i) => (
                <div key={i} className="flex flex-wrap items-center gap-2">
                  <input
                    className="admin-input w-32"
                    placeholder="Label"
                    value={row.label}
                    onChange={(e) => {
                      const stats = [...hero.stats];
                      stats[i] = { ...stats[i], label: e.target.value };
                      setDraft({ ...draft, hero: { ...hero, stats } });
                    }}
                  />
                  <input
                    className="admin-input w-24"
                    placeholder="Value"
                    value={row.value}
                    onChange={(e) => {
                      const stats = [...hero.stats];
                      stats[i] = { ...stats[i], value: e.target.value };
                      setDraft({ ...draft, hero: { ...hero, stats } });
                    }}
                  />
                  <button
                    type="button"
                    className="rounded p-1.5 text-rose-300 hover:bg-slate-800"
                    onClick={() => {
                      const stats = hero.stats.filter((_, j) => j !== i);
                      setDraft({ ...draft, hero: { ...hero, stats } });
                    }}
                    aria-label="Remove stat"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
              <button
                type="button"
                className="text-xs font-medium text-indigo-400 hover:text-indigo-300"
                onClick={() =>
                  setDraft({ ...draft, hero: { ...hero, stats: [...hero.stats, { label: '', value: '' }] } })
                }
              >
                + Add stat
              </button>
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Content sections</h2>
            <button
              type="button"
              className="admin-btn-ghost inline-flex items-center gap-1 text-sm"
              onClick={() => setDraft({ ...draft, sections: [...sections, newSection()] })}
            >
              <Plus className="h-4 w-4" />
              Add section
            </button>
          </div>
          {sections.map((sec, i) => (
            <div
              key={sec.id}
              className="space-y-3 rounded-2xl border border-slate-800 bg-slate-950/40 p-4 ring-1 ring-slate-800/80"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-xs font-medium text-slate-500">Section {i + 1}</span>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    className="rounded p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white"
                    onClick={() => setDraft({ ...draft, sections: moveSection(sections, i, -1) })}
                    disabled={i === 0}
                    aria-label="Move up"
                  >
                    <ArrowUp className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    className="rounded p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white"
                    onClick={() => setDraft({ ...draft, sections: moveSection(sections, i, 1) })}
                    disabled={i === sections.length - 1}
                    aria-label="Move down"
                  >
                    <ArrowDown className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    className="rounded p-1.5 text-rose-300 hover:bg-slate-800"
                    onClick={() => setDraft({ ...draft, sections: sections.filter((_, j) => j !== i) })}
                    aria-label="Remove section"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
              <input
                className="admin-input font-semibold"
                placeholder="Heading"
                value={sec.heading}
                onChange={(e) => {
                  const next = [...sections];
                  next[i] = { ...sec, heading: e.target.value };
                  setDraft({ ...draft, sections: next });
                }}
              />
              <input
                className="admin-input text-sm"
                placeholder="Subheading (optional)"
                value={sec.subheading}
                onChange={(e) => {
                  const next = [...sections];
                  next[i] = { ...sec, subheading: e.target.value };
                  setDraft({ ...draft, sections: next });
                }}
              />
              <div>
                <label className="mb-1 block text-xs text-slate-500">Style</label>
                <select
                  className="admin-input max-w-xs"
                  value={sec.variant}
                  onChange={(e) => {
                    const next = [...sections];
                    next[i] = { ...sec, variant: e.target.value as HomeSectionRow['variant'] };
                    setDraft({ ...draft, sections: next });
                  }}
                >
                  <option value="default">Default</option>
                  <option value="muted">Muted panel</option>
                  <option value="accent">Accent panel</option>
                </select>
              </div>
              <div>
                <label className="mb-1 block text-xs text-slate-500">Body (HTML)</label>
                <textarea
                  className="admin-input min-h-[140px] font-mono text-sm"
                  value={sec.body_html}
                  onChange={(e) => {
                    const next = [...sections];
                    next[i] = { ...sec, body_html: e.target.value };
                    setDraft({ ...draft, sections: next });
                  }}
                />
              </div>
            </div>
          ))}
        </section>

        <section className="space-y-3 rounded-2xl border border-slate-800 bg-slate-950/40 p-5 ring-1 ring-slate-800/80">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Post list block</h2>
          <label className="flex items-center gap-2 text-sm text-slate-300">
            <input
              type="checkbox"
              checked={draft.show_latest_posts}
              onChange={(e) => setDraft({ ...draft, show_latest_posts: e.target.checked })}
              className="rounded border-slate-600"
            />
            Show latest posts grid below the sections
          </label>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-slate-500">Heading</label>
            <input
              className="admin-input"
              value={draft.latest_posts_heading}
              onChange={(e) => setDraft({ ...draft, latest_posts_heading: e.target.value })}
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-slate-500">Intro text</label>
            <textarea
              className="admin-input min-h-[72px]"
              value={draft.latest_posts_intro}
              onChange={(e) => setDraft({ ...draft, latest_posts_intro: e.target.value })}
            />
          </div>
        </section>

        <button type="submit" disabled={saving} className="admin-btn-primary inline-flex items-center gap-2">
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          Save home page
        </button>
      </form>
    </div>
  );
}
