import { motion } from 'framer-motion';
import { ArrowRight, Calendar, Sparkles } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import type { HomeHeroPublic, HomeSectionPublic, PublicPost, SiteHomePublic } from '../api/types';
import { usePublicApi } from '../context/ApiContext';
import { mediaUrl } from '../lib/mediaUrl';

function formatDate(iso: string | null) {
  if (!iso) return '';
  const d = new Date(iso);
  return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
}

function CtaLink({
  href,
  children,
  className,
}: {
  href: string;
  children: React.ReactNode;
  className?: string;
}) {
  const h = href.trim();
  if (!h) return null;
  if (/^https?:\/\//i.test(h) || h.startsWith('//')) {
    return (
      <a href={h} className={className} target="_blank" rel="noreferrer">
        {children}
      </a>
    );
  }
  return (
    <Link to={h} className={className}>
      {children}
    </Link>
  );
}

function sectionShell(variant: HomeSectionPublic['variant']): string {
  switch (variant) {
    case 'muted':
      return 'rounded-2xl border border-slate-200/90 bg-slate-50/90 px-6 py-8 shadow-sm ring-1 ring-slate-900/5 md:px-10 md:py-10';
    case 'accent':
      return 'rounded-2xl border border-indigo-200/70 bg-gradient-to-br from-indigo-50/95 via-white to-sky-50/90 px-6 py-8 shadow-md ring-1 ring-indigo-900/10 md:px-10 md:py-10';
    default:
      return 'py-2';
  }
}

function HomeHero({ hero }: { hero: HomeHeroPublic }) {
  const hasImage = Boolean(hero.image_url?.trim());
  const stats = (hero.stats ?? []).filter((s) => s.label.trim() || s.value.trim());

  return (
    <section className="relative overflow-hidden rounded-[1.75rem] shadow-xl ring-1 ring-slate-900/10">
      {hasImage && (
        <img
          src={mediaUrl(hero.image_url)}
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
        />
      )}
      <div
        className={
          hasImage
            ? 'absolute inset-0 bg-gradient-to-r from-slate-950/90 via-slate-900/75 to-indigo-950/55'
            : 'absolute inset-0 bg-gradient-to-br from-indigo-950 via-slate-900 to-sky-950'
        }
      />
      <div className="relative z-10 px-6 py-12 md:px-12 md:py-14">
        <p className="text-[11px] font-bold uppercase tracking-[0.35em] text-sky-200/90">Overview</p>
        {hero.title.trim() && (
          <h1 className="mt-3 max-w-3xl font-serif text-3xl font-bold leading-tight text-white md:text-4xl lg:text-[2.75rem]">
            {hero.title}
          </h1>
        )}
        {hero.subtitle.trim() && (
          <p className="mt-4 max-w-2xl text-lg leading-relaxed text-slate-100/95 md:text-xl">{hero.subtitle}</p>
        )}
        {hero.tagline.trim() && (
          <p className="mt-4 max-w-2xl text-sm font-medium text-sky-100/90">{hero.tagline}</p>
        )}
        <div className="mt-8 flex flex-wrap gap-3">
          {hero.primary_cta_label.trim() && (
            <CtaLink
              href={hero.primary_cta_href}
              className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-slate-900 shadow-lg transition hover:bg-sky-50"
            >
              {hero.primary_cta_label}
              <ArrowRight className="h-4 w-4" />
            </CtaLink>
          )}
          {hero.secondary_cta_label.trim() && (
            <CtaLink
              href={hero.secondary_cta_href}
              className="inline-flex items-center gap-2 rounded-full border border-white/35 bg-white/10 px-5 py-2.5 text-sm font-semibold text-white backdrop-blur-sm transition hover:bg-white/20"
            >
              {hero.secondary_cta_label}
            </CtaLink>
          )}
        </div>
        {stats.length > 0 && (
          <dl className="mt-10 grid max-w-3xl grid-cols-2 gap-4 sm:grid-cols-3">
            {stats.map((s, i) => (
              <div
                key={i}
                className="rounded-xl border border-white/15 bg-white/10 px-4 py-3 backdrop-blur-md"
              >
                <dt className="text-[11px] font-semibold uppercase tracking-wide text-sky-100/80">{s.label}</dt>
                <dd className="mt-1 font-display text-2xl font-semibold text-white">{s.value}</dd>
              </div>
            ))}
          </dl>
        )}
      </div>
    </section>
  );
}

export function HomePage() {
  const api = usePublicApi();
  const { categorySlug } = useParams<{ categorySlug?: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const legacy = searchParams.get('category');
    if (legacy && !categorySlug) {
      navigate(`/topic/${encodeURIComponent(legacy)}`, { replace: true });
    }
  }, [categorySlug, searchParams, navigate]);

  const category = categorySlug ?? '';
  const [home, setHome] = useState<SiteHomePublic | null>(null);
  const [posts, setPosts] = useState<PublicPost[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    api
      .home()
      .then(setHome)
      .catch(() => setHome(null));
  }, [api]);

  const load = useCallback(async () => {
    setLoading(true);
    setErr(null);
    try {
      const p = await api.posts({
        page: String(page),
        per_page: '9',
        ...(category ? { category } : {}),
      });
      setPosts(p.data);
      setTotalPages(p.meta.total_pages);
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Failed to load');
    } finally {
      setLoading(false);
    }
  }, [api, page, category]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    setPage(1);
  }, [category]);

  const showHero =
    home &&
    (home.hero.title.trim() ||
      home.hero.subtitle.trim() ||
      home.hero.tagline.trim() ||
      home.hero.image_url.trim());
  const showSections = home && home.sections.length > 0;
  const showPostsBlock = home?.show_latest_posts !== false;

  const listTitle = home?.latest_posts_heading?.trim() || 'Latest updates';
  const listIntro =
    home?.latest_posts_intro?.trim() ||
    'Filter by topic in the sidebar. Create and publish posts from Web Studio.';

  return (
    <div className="space-y-12 md:space-y-16">
      {showHero && <HomeHero hero={home!.hero} />}

      {showSections && (
        <div className="space-y-10 md:space-y-12">
          {home!.sections.map((sec, i) => (
            <motion.section
              key={sec.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(i * 0.06, 0.35) }}
              className={sectionShell(sec.variant)}
            >
              {sec.heading.trim() && (
                <h2 className="font-serif text-2xl font-bold text-slate-900 md:text-3xl">{sec.heading}</h2>
              )}
              {sec.subheading.trim() && (
                <p className="mt-2 text-sm font-semibold uppercase tracking-wide text-indigo-600/90">
                  {sec.subheading}
                </p>
              )}
              {sec.body_html.trim() && (
                <div
                  className="prose-blog mt-6 max-w-none"
                  dangerouslySetInnerHTML={{ __html: sec.body_html }}
                />
              )}
            </motion.section>
          ))}
        </div>
      )}

      {showPostsBlock && (
        <>
          <div id="latest" className="scroll-mt-28">
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-indigo-600">Latest</p>
            <h2 className="mt-1 font-serif text-2xl font-bold text-slate-900 md:text-3xl">{listTitle}</h2>
            <p className="mt-2 max-w-2xl text-sm text-slate-600">{listIntro}</p>
          </div>

          {err && (
            <div className="rounded-2xl border border-rose-200 bg-gradient-to-r from-rose-50 to-amber-50 px-5 py-4 text-sm text-rose-900 shadow-md ring-1 ring-rose-100">
              <p className="font-semibold">Couldn&apos;t reach the API</p>
              <p className="mt-1 text-rose-800/90">{err}</p>
              <p className="mt-3 text-xs text-rose-700/80">
                Start the API: <code className="rounded bg-white/80 px-1">cd api</code> then{' '}
                <code className="rounded bg-white/80 px-1">php -S 0.0.0.0:8080 -t public</code> — then seed the DB:{' '}
                <code className="rounded bg-white/80 px-1">php api/scripts/seed-database.php</code>
              </p>
            </div>
          )}

          <div className="grid gap-7 md:grid-cols-2 lg:grid-cols-3">
            {loading &&
              Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="h-80 animate-pulse rounded-[1.35rem] bg-gradient-to-br from-slate-100 via-white to-slate-100 ring-1 ring-slate-200/80"
                />
              ))}
            {!loading && posts.length === 0 && !err && (
              <div className="col-span-full flex flex-col items-center justify-center rounded-[1.5rem] border border-dashed border-slate-300 bg-white/60 py-20 text-center">
                <Sparkles className="h-10 w-10 text-sky-400" />
                <p className="mt-4 font-serif text-xl font-semibold text-slate-800">No published posts yet</p>
                <p className="mt-2 max-w-md text-slate-600">
                  Publish from the admin panel — your stories will appear here with cover art and excerpts.
                </p>
              </div>
            )}
            {!loading &&
              posts.map((post, i) => (
                <motion.article
                  key={post.id}
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: Math.min(i * 0.07, 0.45) }}
                  className="group relative flex flex-col overflow-hidden rounded-[1.35rem] bg-white shadow-lg shadow-slate-900/8 ring-1 ring-slate-200/80 transition duration-300 hover:-translate-y-1.5 hover:shadow-2xl hover:shadow-indigo-950/15"
                >
                  <div className="pointer-events-none absolute inset-0 opacity-0 transition duration-500 group-hover:opacity-100">
                    <div className="absolute -inset-px rounded-[1.35rem] bg-gradient-to-br from-sky-400/25 via-transparent to-violet-400/25" />
                  </div>
                  <div className="relative aspect-[16/10] overflow-hidden bg-slate-100">
                    {post.cover_image_url ? (
                      <img
                        src={mediaUrl(post.cover_image_url)}
                        alt=""
                        className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full w-full flex-col items-center justify-center bg-gradient-to-br from-sky-100 via-indigo-50 to-violet-100">
                        <span className="font-serif text-4xl font-semibold text-indigo-300/80">Aa</span>
                        <span className="mt-2 text-xs font-medium uppercase tracking-widest text-indigo-400/80">
                          Feature
                        </span>
                      </div>
                    )}
                    <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/35 to-transparent opacity-60" />
                  </div>
                  <div className="relative flex flex-1 flex-col p-6">
                    <div className="mb-3 flex flex-wrap gap-2">
                      {post.categories.map((cat) => (
                        <span
                          key={cat.id}
                          className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-slate-600"
                        >
                          {cat.name}
                        </span>
                      ))}
                    </div>
                    <h2 className="font-serif text-xl font-bold leading-snug text-slate-900">
                      <Link to={`/post/${encodeURIComponent(post.slug)}`} className="hover:text-indigo-700">
                        {post.title}
                      </Link>
                    </h2>
                    {post.excerpt && (
                      <p className="mt-3 line-clamp-3 flex-1 text-sm leading-relaxed text-slate-600">{post.excerpt}</p>
                    )}
                    <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4 text-xs text-slate-500">
                      <span className="inline-flex items-center gap-1.5 font-medium">
                        <Calendar className="h-3.5 w-3.5 text-sky-500" />
                        {formatDate(post.published_at)}
                      </span>
                      <Link
                        to={`/post/${encodeURIComponent(post.slug)}`}
                        className="inline-flex items-center gap-1 font-semibold text-indigo-600 hover:text-indigo-800"
                      >
                        Read more
                        <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5" />
                      </Link>
                    </div>
                  </div>
                </motion.article>
              ))}
          </div>

          {totalPages > 1 && (
            <div className="flex justify-center gap-3 pt-4">
              <button
                type="button"
                className="rounded-full border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 shadow-sm ring-1 ring-slate-900/5 transition hover:bg-slate-50 disabled:opacity-40"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                Previous
              </button>
              <span className="flex items-center px-2 text-sm font-medium text-slate-500">
                Page {page} / {totalPages}
              </span>
              <button
                type="button"
                className="rounded-full border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 shadow-sm ring-1 ring-slate-900/5 transition hover:bg-slate-50 disabled:opacity-40"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
