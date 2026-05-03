import { motion } from 'framer-motion';
import { GripVertical, ImagePlus, Trash2, Upload } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import type { GalleryItemRow } from '../api/types';
import { useApi } from '../context/ApiContext';

export function GalleryAdminPage() {
  const api = useApi();
  const [items, setItems] = useState<GalleryItemRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const r = await api.galleryAdmin();
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

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setErr(null);
    try {
      const up = await api.uploadGalleryMedia(file);
      const mt: 'image' | 'video' = up.media_hint === 'video' ? 'video' : 'image';
      await api.createGalleryItem({
        media_type: mt,
        url: up.url,
        sort_order: items.length,
      });
      await load();
    } catch (ex) {
      setErr(ex instanceof Error ? ex.message : 'Upload failed');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  }

  async function remove(id: number) {
    if (!confirm('Remove this item from the gallery?')) return;
    try {
      await api.deleteGalleryItem(id);
      await load();
    } catch (ex) {
      alert(ex instanceof Error ? ex.message : 'Failed');
    }
  }

  async function saveCaption(id: number, caption: string) {
    try {
      await api.updateGalleryItem(id, { caption: caption.trim() || '' });
      await load();
    } catch (ex) {
      alert(ex instanceof Error ? ex.message : 'Failed');
    }
  }

  async function move(ix: number, dir: -1 | 1) {
    const next = ix + dir;
    if (next < 0 || next >= items.length) return;
    const order = [...items];
    const [sp] = order.splice(ix, 1);
    order.splice(next, 0, sp);
    try {
      await api.reorderGallery(order.map((x) => x.id));
      setItems(order.map((x, i) => ({ ...x, sort_order: i })));
    } catch (ex) {
      alert(ex instanceof Error ? ex.message : 'Reorder failed');
      void load();
    }
  }

  if (loading && items.length === 0) {
    return <p className="text-slate-400">Loading…</p>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold text-white">Gallery media</h1>
          <p className="mt-1 text-sm text-slate-400">
            Photos and videos for the public <strong>Gallery</strong> page. Edit intro copy under{' '}
            <Link to="../site-pages" className="text-sky-400 hover:text-sky-300">
              Site pages → Gallery
            </Link>
            .
          </p>
        </div>
        <label className="admin-btn-primary inline-flex cursor-pointer items-center gap-2 self-start">
          <Upload className="h-4 w-4" />
          {uploading ? 'Uploading…' : 'Upload image or video'}
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif,video/mp4,video/webm"
            className="sr-only"
            disabled={uploading}
            onChange={(ev) => void onFile(ev)}
          />
        </label>
      </div>

      {err && (
        <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">{err}</div>
      )}

      <div className="rounded-xl border border-slate-800/80 bg-slate-900/40 px-4 py-3 text-sm text-slate-400">
        <ImagePlus className="mb-2 inline h-4 w-4 text-sky-500" /> JPEG / PNG / WebP / GIF up to 5 MB; MP4 / WebM up to
        50 MB. Visitors open items in a fullscreen viewer with prev/next.
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((it, i) => (
          <motion.div
            key={it.id}
            layout
            className="overflow-hidden rounded-2xl border border-slate-800/80 bg-slate-950/50 shadow-panel"
          >
            <div className="relative aspect-video bg-black/40">
              {it.media_type === 'video' ? (
                <video src={it.url.startsWith('http') ? it.url : it.url} className="h-full w-full object-contain" muted playsInline controls />
              ) : (
                <img src={it.url.startsWith('http') ? it.url : it.url} alt="" className="h-full w-full object-cover" />
              )}
              <span className="absolute left-2 top-2 rounded-full bg-black/60 px-2 py-0.5 text-[10px] font-bold uppercase text-white">
                {it.media_type}
              </span>
            </div>
            <div className="space-y-2 p-3">
              <input
                className="admin-input py-1.5 text-xs"
                placeholder="Caption (optional)"
                defaultValue={it.caption ?? ''}
                onBlur={(e) => {
                  if ((it.caption ?? '') !== e.target.value.trim()) void saveCaption(it.id, e.target.value);
                }}
              />
              <div className="flex items-center justify-between gap-2">
                <div className="flex gap-1">
                  <button
                    type="button"
                    title="Move up"
                    disabled={i === 0}
                    className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 disabled:opacity-30"
                    onClick={() => void move(i, -1)}
                  >
                    <GripVertical className="h-4 w-4 rotate-180" />
                  </button>
                  <button
                    type="button"
                    title="Move down"
                    disabled={i === items.length - 1}
                    className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 disabled:opacity-30"
                    onClick={() => void move(i, 1)}
                  >
                    <GripVertical className="h-4 w-4" />
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => void remove(it.id)}
                  className="rounded-lg p-2 text-rose-400 hover:bg-rose-500/10"
                  title="Delete"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {!items.length && !loading && (
        <p className="text-center text-sm text-slate-500">No media yet — upload images or videos above.</p>
      )}
    </div>
  );
}
