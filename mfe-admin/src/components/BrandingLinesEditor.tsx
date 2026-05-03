import { Plus, Trash2 } from 'lucide-react';
import type { BrandingLine } from '../api/types';
import { emptyLine } from '../lib/siteChromeDefaults';

export function BrandingLinesEditor({
  lines,
  onChange,
  disabled,
}: {
  lines: BrandingLine[];
  onChange: (next: BrandingLine[]) => void;
  disabled?: boolean;
}) {
  function update(i: number, patch: Partial<BrandingLine>) {
    const next = lines.map((l, j) => (j === i ? { ...l, ...patch } : l));
    onChange(next);
  }

  function remove(i: number) {
    if (lines.length <= 1) return;
    onChange(lines.filter((_, j) => j !== i));
  }

  return (
    <div className="space-y-3">
      {lines.map((line, i) => (
        <div
          key={i}
          className="rounded-xl border border-slate-700/80 bg-slate-900/40 p-3 shadow-inner ring-1 ring-slate-800/80"
        >
          <div className="flex flex-wrap items-start gap-2">
            <textarea
              className="admin-input min-h-[72px] min-w-[min(100%,14rem)] flex-1 text-sm"
              value={line.text}
              onChange={(e) => update(i, { text: e.target.value })}
              placeholder="Line text (address, phone, site name…)"
              disabled={disabled}
            />
            <button
              type="button"
              className="admin-btn-ghost shrink-0 p-2 text-rose-300"
              onClick={() => remove(i)}
              disabled={disabled || lines.length <= 1}
              title="Remove line"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            <label className="flex items-center gap-1 text-xs text-slate-500">
              Size (px)
              <input
                type="number"
                min={10}
                max={96}
                className="admin-input w-16 py-1 text-xs"
                value={line.fontSizePx}
                onChange={(e) => update(i, { fontSizePx: Number(e.target.value) || 14 })}
                disabled={disabled}
              />
            </label>
            <select
              className="admin-input py-1 text-xs"
              value={line.fontWeight}
              onChange={(e) => update(i, { fontWeight: e.target.value as BrandingLine['fontWeight'] })}
              disabled={disabled}
            >
              <option value="normal">Normal</option>
              <option value="500">Medium</option>
              <option value="600">Semibold</option>
              <option value="700">Bold</option>
              <option value="bold">Bold (CSS)</option>
            </select>
            <select
              className="admin-input py-1 text-xs"
              value={line.fontStyle}
              onChange={(e) => update(i, { fontStyle: e.target.value as BrandingLine['fontStyle'] })}
              disabled={disabled}
            >
              <option value="normal">Upright</option>
              <option value="italic">Italic</option>
            </select>
            <select
              className="admin-input py-1 text-xs"
              value={line.fontFamily}
              onChange={(e) => update(i, { fontFamily: e.target.value as BrandingLine['fontFamily'] })}
              disabled={disabled}
            >
              <option value="sans">Sans</option>
              <option value="serif">Serif</option>
            </select>
            <label className="flex items-center gap-1 text-xs text-slate-500">
              Color
              <input
                type="text"
                className="admin-input w-24 py-1 text-xs"
                placeholder="#334155"
                value={line.color ?? ''}
                onChange={(e) => update(i, { color: e.target.value || undefined })}
                disabled={disabled}
              />
            </label>
          </div>
        </div>
      ))}
      <button
        type="button"
        className="admin-btn-ghost inline-flex items-center gap-2 text-sm"
        onClick={() => onChange([...lines, emptyLine()])}
        disabled={disabled}
      >
        <Plus className="h-4 w-4" />
        Add line
      </button>
    </div>
  );
}
