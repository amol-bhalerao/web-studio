import { ChevronDown } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { NavNode } from '../api/types';
import clsx from 'clsx';

function isExternal(href: string) {
  return href.startsWith('http://') || href.startsWith('https://');
}

function LeafLink({
  item,
  className,
  onNavigate,
}: {
  item: NavNode;
  className?: string;
  onNavigate?: () => void;
}) {
  const inner = (
    <span className="block min-w-0 truncate" title={item.label}>
      {item.label}
    </span>
  );
  if (item.href === '#' || item.href === '') {
    return (
      <span className={clsx('cursor-default opacity-60', className)} title={item.label}>
        {inner}
      </span>
    );
  }
  if (isExternal(item.href)) {
    return (
      <a
        href={item.href}
        target="_blank"
        rel="noreferrer"
        className={className}
        title={item.label}
        onClick={onNavigate}
      >
        {inner}
      </a>
    );
  }
  return (
    <Link to={item.href} className={className} title={item.label} onClick={onNavigate}>
      {inner}
    </Link>
  );
}

const pill =
  'inline-flex max-w-[11rem] min-w-0 items-center sm:max-w-[15rem] rounded-full px-3.5 py-2 text-sm font-semibold text-slate-700 ring-1 ring-slate-900/10 transition hover:bg-slate-900 hover:text-white hover:ring-slate-900';

/** Desktop + tablet: horizontal nav with hover dropdowns */
export function PublicNavDesktop({ items }: { items: NavNode[] }) {
  if (!items.length) return null;
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {items.map((item) => (
        <DesktopEntry key={item.id} item={item} />
      ))}
    </div>
  );
}

function DesktopEntry({ item }: { item: NavNode }) {
  const kids = item.children ?? [];
  if (kids.length === 0) {
    return <LeafLink item={item} className={pill} />;
  }
  const ext = isExternal(item.href);
  const hasMainLink = !ext && item.href !== '#' && item.href !== '';
  return (
    <div className="group relative flex items-stretch">
      {hasMainLink ? (
        <Link
          to={item.href}
          className={clsx(pill, 'rounded-r-none border-r border-white/20 pr-3')}
          title={item.label}
        >
          <span className="block min-w-0 truncate">{item.label}</span>
        </Link>
      ) : (
        <span className={clsx(pill, 'rounded-r-none border-r border-white/20 pr-3')} title={item.label}>
          <span className="block min-w-0 truncate">{item.label}</span>
        </span>
      )}
      <button
        type="button"
        className={clsx(pill, 'rounded-l-none bg-slate-900/5 px-2')}
        aria-haspopup="menu"
        aria-label={`${item.label} submenu`}
      >
        <ChevronDown className="h-4 w-4 opacity-80" />
      </button>
      <div
        className="invisible absolute left-0 top-[calc(100%+6px)] z-50 min-w-[12rem] rounded-xl border border-slate-200 bg-white py-2 opacity-0 shadow-xl ring-1 ring-slate-900/5 transition-all duration-150 group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100"
        role="menu"
      >
        {kids.map((c) => (
          <SubDesktop key={c.id} item={c} />
        ))}
      </div>
    </div>
  );
}

function SubDesktop({ item }: { item: NavNode }) {
  const kids = item.children ?? [];
  if (kids.length === 0) {
    return (
      <LeafLink
        item={item}
        className="block max-w-[15rem] px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
      />
    );
  }
  return (
    <div className="group/sub relative border-b border-slate-50 last:border-0">
      <button
        type="button"
        className="flex w-full max-w-[15rem] items-center justify-between gap-2 px-4 py-2.5 text-left text-sm font-semibold text-slate-700 hover:bg-slate-50"
        title={item.label}
      >
        <span className="min-w-0 flex-1 truncate text-left">{item.label}</span>
        <ChevronDown className="h-4 w-4 shrink-0 -rotate-90 opacity-70" />
      </button>
      <div className="invisible absolute left-full top-0 z-50 ml-1 min-w-[11rem] rounded-xl border border-slate-200 bg-white py-2 opacity-0 shadow-xl ring-1 ring-slate-900/5 transition-all duration-150 group-hover/sub:visible group-hover/sub:opacity-100">
        {kids.map((c) => (
          <div key={c.id} className="border-b border-slate-50 last:border-0">
            <SubDesktop item={c} />
          </div>
        ))}
      </div>
    </div>
  );
}

/** Mobile drawer: stacked links */
export function PublicNavDrawer({ items, onNavigate }: { items: NavNode[]; onNavigate?: () => void }) {
  if (!items.length) return null;
  return (
    <nav className="space-y-1 border-b border-slate-100 pb-4">
      <p className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-500">Site</p>
      {items.map((item) => (
        <DrawerEntry key={item.id} item={item} depth={0} onNavigate={onNavigate} />
      ))}
    </nav>
  );
}

function DrawerEntry({
  item,
  depth,
  onNavigate,
}: {
  item: NavNode;
  depth: number;
  onNavigate?: () => void;
}) {
  const kids = item.children ?? [];
  return (
    <div style={{ paddingLeft: depth * 10 }}>
      <LeafLink
        item={item}
        className="block max-w-full rounded-lg px-2 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-50"
        onNavigate={onNavigate}
      />
      {kids.map((c) => (
        <DrawerEntry key={c.id} item={c} depth={depth + 1} onNavigate={onNavigate} />
      ))}
    </div>
  );
}
