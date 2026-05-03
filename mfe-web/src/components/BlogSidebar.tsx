import { motion } from 'framer-motion';
import { AlertCircle, ChevronRight, FolderOpen, Home, LayoutGrid } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import type { PublicCategory } from '../api/types';
import clsx from 'clsx';

type CatNode = PublicCategory & { children: CatNode[] };

function buildCategoryTree(cats: PublicCategory[]): CatNode[] {
  const map = new Map<number, CatNode>();
  cats.forEach((c) => map.set(c.id, { ...c, children: [] }));
  const roots: CatNode[] = [];
  cats.forEach((c) => {
    const node = map.get(c.id)!;
    const pid = c.parent_id ?? null;
    if (pid != null && map.has(pid)) {
      map.get(pid)!.children.push(node);
    } else {
      roots.push(node);
    }
  });
  const sortTree = (nodes: CatNode[]) => {
    nodes.sort((a, b) => a.name.localeCompare(b.name));
    nodes.forEach((n) => sortTree(n.children));
  };
  sortTree(roots);
  return roots;
}

function ancestorIdsForSlug(tree: CatNode[], slug: string): Set<number> {
  function walk(nodes: CatNode[], chain: number[]): number[] | null {
    for (const n of nodes) {
      if (n.slug === slug) return chain;
      const inner = walk(n.children, [...chain, n.id]);
      if (inner) return inner;
    }
    return null;
  }
  const chain = walk(tree, []);
  return new Set(chain ?? []);
}

function CategoryNavRow({
  node,
  depth,
  expanded,
  onToggle,
  activeSlug,
  onNavigate,
}: {
  node: CatNode;
  depth: number;
  expanded: Set<number>;
  onToggle: (id: number) => void;
  activeSlug: string;
  onNavigate?: () => void;
}) {
  const hasKids = node.children.length > 0;
  const isOn = activeSlug === node.slug;
  const isOpen = expanded.has(node.id);

  return (
    <div>
      <div
        className="flex items-stretch gap-0.5 rounded-xl transition"
        style={{ paddingLeft: depth * 12 }}
      >
        {hasKids ? (
          <button
            type="button"
            className="flex h-10 w-8 shrink-0 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-800"
            aria-expanded={isOpen}
            aria-label={isOpen ? 'Collapse' : 'Expand'}
            onClick={(e) => {
              e.preventDefault();
              onToggle(node.id);
            }}
          >
            <ChevronRight className={clsx('h-4 w-4 transition-transform', isOpen && 'rotate-90')} />
          </button>
        ) : (
          <span className="w-8 shrink-0" />
        )}
        <Link
          to={`/topic/${encodeURIComponent(node.slug)}`}
          onClick={() => onNavigate?.()}
          className={clsx(
            'flex min-w-0 flex-1 items-center justify-between gap-2 rounded-xl px-2 py-2 text-sm font-semibold transition',
            isOn ? 'bg-sky-50 text-sky-900 ring-1 ring-sky-200' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
          )}
        >
          <span className="flex min-w-0 items-center gap-2">
            <FolderOpen className="h-4 w-4 shrink-0 text-sky-500" />
            <span className="truncate" title={node.name}>
              {node.name}
            </span>
          </span>
          <span className="shrink-0 rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-bold text-slate-500">
            {node.post_count}
          </span>
        </Link>
      </div>
      {hasKids && isOpen && (
        <div className="mt-0.5 space-y-0.5 border-l border-slate-200/80 pl-1 ml-[18px]">
          {node.children.map((ch) => (
            <CategoryNavRow
              key={ch.id}
              node={ch}
              depth={depth + 1}
              expanded={expanded}
              onToggle={onToggle}
              activeSlug={activeSlug}
              onNavigate={onNavigate}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function BlogSidebar({
  categories,
  loading,
  className,
  fillHeight,
  categoriesError,
  /** Called when user follows a topic link (e.g. close mobile drawer). */
  onNavigate,
}: {
  categories: PublicCategory[];
  loading: boolean;
  className?: string;
  fillHeight?: boolean;
  /** True when the categories request failed (API down, CORS, etc.) */
  categoriesError?: boolean;
  onNavigate?: () => void;
}) {
  const { categorySlug } = useParams();
  const [searchParams] = useSearchParams();
  const activeSlug =
    categorySlug || searchParams.get('category') || '';

  const tree = useMemo(() => buildCategoryTree(categories), [categories]);

  const [expanded, setExpanded] = useState<Set<number>>(() => new Set());

  useEffect(() => {
    const next = ancestorIdsForSlug(tree, activeSlug);
    setExpanded(next);
  }, [tree, activeSlug]);

  const onToggle = useCallback((id: number) => {
    setExpanded((prev) => {
      const n = new Set(prev);
      if (n.has(id)) {
        n.delete(id);
      } else {
        n.add(id);
      }
      return n;
    });
  }, []);

  const inner = (
    <div
      className={clsx(
        'rounded-2xl border border-slate-200/90 bg-white/90 p-5 shadow-lg shadow-slate-900/5 ring-1 ring-slate-900/5 backdrop-blur-md',
        fillHeight && 'flex h-full min-h-0 flex-col lg:rounded-l-none lg:border-y-0 lg:border-l-0 lg:shadow-none lg:ring-0'
      )}
    >
      <p className="flex shrink-0 items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-indigo-600">
        <LayoutGrid className="h-3.5 w-3.5" />
        Topics
      </p>
      <nav
        className={clsx(
          'mt-4 flex flex-col gap-0.5',
          fillHeight && 'min-h-0 flex-1 overflow-y-auto overscroll-contain pr-1'
        )}
      >
        <Link
          to="/"
          onClick={() => onNavigate?.()}
          className={clsx(
            'flex shrink-0 items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition',
            !activeSlug
              ? 'bg-gradient-to-r from-slate-900 to-indigo-900 text-white shadow-md'
              : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
          )}
        >
          <Home className="h-4 w-4 shrink-0 opacity-80" />
          All posts
        </Link>

        {loading && (
          <div className="space-y-2 px-1 py-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-9 animate-pulse rounded-lg bg-slate-100" />
            ))}
          </div>
        )}

        {!loading && categoriesError && (
          <div className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-3 text-xs leading-relaxed text-amber-950">
            <p className="flex items-start gap-2 font-semibold">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              Couldn&apos;t load topics
            </p>
            <p className="mt-2 text-amber-900/90">
              Start MySQL, align <code className="rounded bg-white/80 px-1">api/.env</code>, run{' '}
              <code className="rounded bg-white/80 px-1">php api/scripts/seed-database.php</code>, then{' '}
              <code className="rounded bg-white/80 px-1">php -S 0.0.0.0:8080 -t public</code> from{' '}
              <code className="rounded bg-white/80 px-1">api</code>. Check{' '}
              <code className="rounded bg-white/80 px-1">GET /api/v1/health/db</code>.
            </p>
          </div>
        )}

        {!loading && !categoriesError && tree.length === 0 && (
          <p className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-xs text-slate-600">
            No categories yet. Open Admin → Categories and add topics (you can nest subcategories under a parent).
          </p>
        )}

        {!loading &&
          tree.map((node, i) => (
            <motion.div
              key={node.id}
              initial={{ opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.03 }}
            >
              <CategoryNavRow
                node={node}
                depth={0}
                expanded={expanded}
                onToggle={onToggle}
                activeSlug={activeSlug}
                onNavigate={onNavigate}
              />
            </motion.div>
          ))}
      </nav>

      <p
        className={clsx(
          'mt-6 shrink-0 border-t border-slate-100 pt-4 text-xs leading-relaxed text-slate-500',
          fillHeight && 'mt-auto'
        )}
      >
        Expand a topic to see subcategories. Choose a link to filter stories; parent topics include all posts in their
        subcategories.
      </p>
    </div>
  );

  return (
    <aside className={clsx(fillHeight && 'flex h-full min-h-0 flex-col', className)}>
      {!fillHeight ? (
        <div className="lg:sticky lg:top-28">{inner}</div>
      ) : (
        inner
      )}
    </aside>
  );
}
