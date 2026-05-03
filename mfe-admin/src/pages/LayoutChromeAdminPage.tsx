import { motion } from 'framer-motion';
import { ArrowLeft, ImageIcon, Plus, Save, Trash2, Type } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import type { SiteChromeLogo, SiteChromePayload } from '../api/types';
import { BrandingLinesEditor } from '../components/BrandingLinesEditor';
import { useApi } from '../context/ApiContext';
import { defaultSiteChrome, emptyLine, normalizeChrome } from '../lib/siteChromeDefaults';

function defaultLogo(): SiteChromeLogo {
  return { url: '', alt: '', maxHeightPx: 56 };
}

function LogoStackEditor({
  label,
  logos,
  onChange,
  onUpload,
  disabled,
}: {
  label: string;
  logos: SiteChromeLogo[];
  onChange: (next: SiteChromeLogo[]) => void;
  onUpload: (file: File) => Promise<string>;
  disabled?: boolean;
}) {
  function patch(i: number, p: Partial<SiteChromeLogo>) {
    onChange(logos.map((x, j) => (j === i ? { ...x, ...p } : x)));
  }

  return (
    <div className="space-y-2">
      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</p>
      {logos.length === 0 && <p className="text-sm text-slate-500">No logos — add for side marks.</p>}
      {logos.map((logo, i) => (
        <div key={i} className="rounded-lg border border-slate-700/60 bg-slate-900/30 p-2">
          <div className="flex flex-wrap items-end gap-2">
            {logo.url ? (
              <img src={logo.url} alt={logo.alt || ''} className="h-12 max-w-[120px] object-contain" />
            ) : null}
            <label className="text-xs text-slate-400">
              Upload
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                className="ml-1 text-xs file:mr-2 file:rounded file:border-0 file:bg-slate-700 file:px-2 file:py-1"
                disabled={disabled}
                onChange={async (e) => {
                  const f = e.target.files?.[0];
                  if (!f) return;
                  const url = await onUpload(f);
                  patch(i, { url });
                  e.target.value = '';
                }}
              />
            </label>
            <input
              className="admin-input flex-1 py-1 text-xs"
              placeholder="Image URL (or upload)"
              value={logo.url}
              onChange={(e) => patch(i, { url: e.target.value })}
              disabled={disabled}
            />
            <input
              className="admin-input w-24 py-1 text-xs"
              type="number"
              min={16}
              max={200}
              title="Max height (px)"
              value={logo.maxHeightPx}
              onChange={(e) => patch(i, { maxHeightPx: Number(e.target.value) || 48 })}
              disabled={disabled}
            />
            <button
              type="button"
              className="rounded p-1 text-rose-300 hover:bg-slate-800"
              onClick={() => onChange(logos.filter((_, j) => j !== i))}
              disabled={disabled}
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
          <input
            className="admin-input mt-1 w-full py-1 text-xs"
            placeholder="Alt text"
            value={logo.alt ?? ''}
            onChange={(e) => patch(i, { alt: e.target.value })}
            disabled={disabled}
          />
        </div>
      ))}
      <button
        type="button"
        className="admin-btn-ghost inline-flex items-center gap-1 text-xs"
        onClick={() => onChange([...logos, defaultLogo()])}
        disabled={disabled}
      >
        <Plus className="h-3.5 w-3.5" />
        Add logo
      </button>
    </div>
  );
}

export function LayoutChromeAdminPage() {
  const api = useApi();
  const [chrome, setChrome] = useState<SiteChromePayload>(() => defaultSiteChrome());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const c = await api.chromeAdmin();
      setChrome(normalizeChrome(c));
      setErr(null);
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Load failed');
      setChrome(defaultSiteChrome());
    } finally {
      setLoading(false);
    }
  }, [api]);

  useEffect(() => {
    void load();
  }, [load]);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setErr(null);
    try {
      const out = normalizeChrome(chrome);
      const saved = await api.updateChrome(out);
      setChrome(normalizeChrome(saved));
    } catch (ex) {
      setErr(ex instanceof Error ? ex.message : 'Save failed');
    } finally {
      setSaving(false);
    }
  }

  async function upload(f: File) {
    const r = await api.uploadCover(f);
    return r.url;
  }

  if (loading) {
    return <p className="text-slate-400">Loading…</p>;
  }

  const h = chrome.header;
  const f = chrome.footer;

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <div className="flex items-center gap-3">
        <Link to=".." className="rounded-xl border border-slate-800 p-2 text-slate-400 hover:bg-slate-800/80 hover:text-white">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="font-display text-2xl font-semibold text-white">Header &amp; footer</h1>
          <p className="text-sm text-slate-400">
            Public site chrome: 3-column header (logos · branding · logos) and a styled footer. Height follows content
            unless you set min/max.
          </p>
        </div>
      </div>

      {err && <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">{err}</div>}

      <motion.form
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        onSubmit={(ev) => void save(ev)}
        className="space-y-10"
      >
        <section className="rounded-2xl border border-slate-800 bg-slate-950/40 p-6 ring-1 ring-slate-800/80">
          <h2 className="font-display text-lg font-semibold text-white">Header</h2>
          <div className="mt-4 flex flex-wrap gap-4">
            <label className="text-xs text-slate-500">
              Min height (px)
              <input
                type="number"
                min={0}
                className="admin-input ml-2 w-24 py-1 text-sm"
                placeholder="auto"
                value={h.minHeightPx ?? ''}
                onChange={(e) => {
                  const v = e.target.value;
                  setChrome({
                    ...chrome,
                    header: { ...h, minHeightPx: v === '' ? null : Number(v) || null },
                  });
                }}
                disabled={saving}
              />
            </label>
            <label className="text-xs text-slate-500">
              Max height (px)
              <input
                type="number"
                min={0}
                className="admin-input ml-2 w-24 py-1 text-sm"
                placeholder="auto"
                value={h.maxHeightPx ?? ''}
                onChange={(e) => {
                  const v = e.target.value;
                  setChrome({
                    ...chrome,
                    header: { ...h, maxHeightPx: v === '' ? null : Number(v) || null },
                  });
                }}
                disabled={saving}
              />
            </label>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
            <LogoStackEditor
              label="Left — logos"
              logos={h.leftLogos}
              onChange={(leftLogos) => setChrome({ ...chrome, header: { ...h, leftLogos } })}
              onUpload={upload}
              disabled={saving}
            />

            <div className="space-y-3">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Center — branding</p>
              <div className="flex gap-2">
                <button
                  type="button"
                  className={`inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-sm ${
                    h.center.mode === 'text'
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-800 text-slate-300'
                  }`}
                  onClick={() => setChrome({ ...chrome, header: { ...h, center: { ...h.center, mode: 'text' } } })}
                >
                  <Type className="h-3.5 w-3.5" />
                  Text lines
                </button>
                <button
                  type="button"
                  className={`inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-sm ${
                    h.center.mode === 'image'
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-800 text-slate-300'
                  }`}
                  onClick={() => setChrome({ ...chrome, header: { ...h, center: { ...h.center, mode: 'image' } } })}
                >
                  <ImageIcon className="h-3.5 w-3.5" />
                  Image
                </button>
              </div>
              {h.center.mode === 'image' ? (
                <div className="space-y-2">
                  {h.center.imageUrl ? (
                    <img
                      src={h.center.imageUrl}
                      alt=""
                      className="max-h-32 w-auto object-contain"
                    />
                  ) : null}
                  <label className="block text-xs text-slate-500">
                    Upload banner
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp,image/gif"
                      className="mt-1 block w-full text-xs"
                      disabled={saving}
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        const url = await upload(file);
                        setChrome({
                          ...chrome,
                          header: { ...h, center: { ...h.center, imageUrl: url } },
                        });
                        e.target.value = '';
                      }}
                    />
                  </label>
                  <input
                    className="admin-input w-full text-sm"
                    placeholder="Image URL"
                    value={h.center.imageUrl ?? ''}
                    onChange={(e) =>
                      setChrome({
                        ...chrome,
                        header: { ...h, center: { ...h.center, imageUrl: e.target.value || null } },
                      })
                    }
                    disabled={saving}
                  />
                  <label className="text-xs text-slate-500">
                    Max image height (px)
                    <input
                      type="number"
                      className="admin-input ml-2 w-24 py-1"
                      value={h.center.imageMaxHeightPx}
                      onChange={(e) =>
                        setChrome({
                          ...chrome,
                          header: {
                            ...h,
                            center: { ...h.center, imageMaxHeightPx: Number(e.target.value) || 96 },
                          },
                        })
                      }
                      disabled={saving}
                    />
                  </label>
                </div>
              ) : (
                <BrandingLinesEditor
                  lines={h.center.lines.length ? h.center.lines : [emptyLine()]}
                  onChange={(lines) => setChrome({ ...chrome, header: { ...h, center: { ...h.center, lines } } })}
                  disabled={saving}
                />
              )}
            </div>

            <LogoStackEditor
              label="Right — logos"
              logos={h.rightLogos}
              onChange={(rightLogos) => setChrome({ ...chrome, header: { ...h, rightLogos } })}
              onUpload={upload}
              disabled={saving}
            />
          </div>
        </section>

        <section className="rounded-2xl border border-slate-800 bg-slate-950/40 p-6 ring-1 ring-slate-800/80">
          <h2 className="font-display text-lg font-semibold text-white">Footer</h2>
          <p className="mt-1 text-sm text-slate-500">Single block below the page — image or styled lines.</p>
          <div className="mt-4 flex gap-2">
            <button
              type="button"
              className={`inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-sm ${
                f.mode === 'text' ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-300'
              }`}
              onClick={() => setChrome({ ...chrome, footer: { ...f, mode: 'text' } })}
            >
              Text lines
            </button>
            <button
              type="button"
              className={`inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-sm ${
                f.mode === 'image' ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-300'
              }`}
              onClick={() => setChrome({ ...chrome, footer: { ...f, mode: 'image' } })}
            >
              Image
            </button>
          </div>
          <div className="mt-4">
            {f.mode === 'image' ? (
              <div className="space-y-2">
                {f.imageUrl ? <img src={f.imageUrl} alt="" className="max-h-24 object-contain" /> : null}
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  disabled={saving}
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    const url = await upload(file);
                    setChrome({ ...chrome, footer: { ...f, imageUrl: url } });
                    e.target.value = '';
                  }}
                />
                <input
                  className="admin-input w-full text-sm"
                  placeholder="Image URL"
                  value={f.imageUrl ?? ''}
                  onChange={(e) => setChrome({ ...chrome, footer: { ...f, imageUrl: e.target.value || null } })}
                  disabled={saving}
                />
                <label className="text-xs text-slate-500">
                  Max height (px)
                  <input
                    type="number"
                    className="admin-input ml-2 w-24 py-1"
                    value={f.imageMaxHeightPx}
                    onChange={(e) =>
                      setChrome({
                        ...chrome,
                        footer: { ...f, imageMaxHeightPx: Number(e.target.value) || 40 },
                      })
                    }
                    disabled={saving}
                  />
                </label>
              </div>
            ) : (
              <BrandingLinesEditor
                lines={f.lines.length ? f.lines : [emptyLine()]}
                onChange={(lines) => setChrome({ ...chrome, footer: { ...f, lines } })}
                disabled={saving}
              />
            )}
          </div>
        </section>

        <button type="submit" className="admin-btn-primary inline-flex items-center gap-2" disabled={saving}>
          <Save className="h-4 w-4" />
          {saving ? 'Saving…' : 'Save layout'}
        </button>
      </motion.form>
    </div>
  );
}
