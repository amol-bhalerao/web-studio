import { AnimatePresence, motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import type { CarouselSlidePublic, PublicPost } from '../api/types';
import { carouselSlideImage } from '../lib/carouselImage';
import { mediaUrl } from '../lib/mediaUrl';
import clsx from 'clsx';

const INTERVAL_MS = 6000;

type HeroSlide =
  | { kind: 'api'; slide: CarouselSlidePublic }
  | { kind: 'post'; post: PublicPost };

function SmartCtaLink({
  href,
  className,
  children,
}: {
  href: string;
  className?: string;
  children: React.ReactNode;
}) {
  if (!href || href === '#') {
    return <span className={className}>{children}</span>;
  }
  if (href.startsWith('http://') || href.startsWith('https://')) {
    return (
      <a href={href} className={className}>
        {children}
      </a>
    );
  }
  const path = href.startsWith('/') ? href : `/${href}`;
  return (
    <Link to={path} className={className}>
      {children}
    </Link>
  );
}

export function HeroCarousel({
  carouselSlides,
  fallbackPosts,
  loading,
  className,
}: {
  carouselSlides: CarouselSlidePublic[];
  fallbackPosts: PublicPost[];
  loading: boolean;
  /** Optional layout tweaks when nested in the home hero grid */
  className?: string;
}) {
  const slides: HeroSlide[] = useMemo(() => {
    if (carouselSlides.length > 0) {
      return carouselSlides.map((slide) => ({ kind: 'api' as const, slide }));
    }
    const posts = fallbackPosts.filter((p) => p.cover_image_url || p.title);
    return posts.map((post) => ({ kind: 'post' as const, post }));
  }, [carouselSlides, fallbackPosts]);

  const [index, setIndex] = useState(0);

  const len = slides.length;

  const next = useCallback(() => setIndex((i) => (len ? (i + 1) % len : 0)), [len]);
  const prev = useCallback(() => setIndex((i) => (len ? (i - 1 + len) % len : 0)), [len]);

  useEffect(() => {
    if (len <= 1) return;
    const t = window.setInterval(next, INTERVAL_MS);
    return () => window.clearInterval(t);
  }, [len, next]);

  useEffect(() => {
    if (index >= len) setIndex(0);
  }, [index, len]);

  const current = slides[index];

  if (loading) {
    return (
      <section className={clsx('relative w-full', className)}>
        <div className="h-[min(52vh,420px)] animate-pulse rounded-3xl bg-gradient-to-br from-slate-200 via-white to-slate-100 ring-1 ring-slate-200/80" />
      </section>
    );
  }

  if (!len || !current) {
    return (
      <section className={clsx('relative w-full', className)}>
        <div className="flex h-[min(40vh,320px)] items-center justify-center rounded-3xl border border-dashed border-slate-300 bg-white/60 text-center text-sm text-slate-500">
          Add carousel slides in Admin → Carousel, or publish posts with covers for automatic slides.
        </div>
      </section>
    );
  }

  const imgSrc =
    current.kind === 'api'
      ? mediaUrl(current.slide.image_url)
      : carouselSlideImage(current.post);
  const title = current.kind === 'api' ? current.slide.title : current.post.title;
  const excerpt =
    current.kind === 'api' ? current.slide.excerpt : current.post.excerpt;
  const bodyHtml = current.kind === 'api' ? current.slide.body_html : '';
  const linkHref =
    current.kind === 'api'
      ? current.slide.link_href
      : `/post/${encodeURIComponent(current.post.slug)}`;

  return (
    <section className={clsx('relative w-full', className)}>
      <div className="relative overflow-hidden rounded-3xl bg-slate-900 shadow-2xl shadow-slate-900/25 ring-1 ring-white/10">
        <div className="relative aspect-[21/9] min-h-[220px] w-full md:aspect-[24/9] md:min-h-[280px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={current.kind === 'api' ? `c-${current.slide.id}` : `p-${current.post.id}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.45 }}
              className="absolute inset-0"
            >
              <img
                src={imgSrc}
                alt=""
                className="h-full w-full object-cover"
                loading={index === 0 ? 'eager' : 'lazy'}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-6 md:p-10">
                <p className="text-xs font-bold uppercase tracking-[0.25em] text-sky-300">Featured</p>
                <h2 className="mt-2 max-w-3xl font-serif text-2xl font-bold leading-tight text-white md:text-4xl">
                  {current.kind === 'post' ? (
                    <Link to={`/post/${encodeURIComponent(current.post.slug)}`} className="hover:text-sky-100">
                      {title}
                    </Link>
                  ) : (
                    <SmartCtaLink href={linkHref} className="hover:text-sky-100">
                      {title}
                    </SmartCtaLink>
                  )}
                </h2>
                {excerpt && (
                  <p className="mt-3 line-clamp-2 max-w-2xl text-sm text-slate-200 md:text-base">{excerpt}</p>
                )}
                {bodyHtml && current.kind === 'api' && (
                  <div
                    className="prose prose-invert prose-sm mt-3 line-clamp-3 max-w-2xl text-slate-200 [&_p]:my-1"
                    dangerouslySetInnerHTML={{ __html: bodyHtml }}
                  />
                )}
                {linkHref && linkHref !== '#' && (
                  <div className="mt-4">
                    <SmartCtaLink
                      href={linkHref}
                      className="inline-flex rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-slate-900 shadow-lg hover:bg-sky-50"
                    >
                      Read article
                    </SmartCtaLink>
                  </div>
                )}
              </div>
            </motion.div>
          </AnimatePresence>

          {len > 1 && (
            <>
              <button
                type="button"
                onClick={prev}
                className="absolute left-3 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-black/35 text-white backdrop-blur-sm transition hover:bg-black/50 md:left-5"
                aria-label="Previous slide"
              >
                <ChevronLeft className="h-6 w-6" />
              </button>
              <button
                type="button"
                onClick={next}
                className="absolute right-3 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-black/35 text-white backdrop-blur-sm transition hover:bg-black/50 md:right-5"
                aria-label="Next slide"
              >
                <ChevronRight className="h-6 w-6" />
              </button>
              <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-2">
                {slides.map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setIndex(i)}
                    className={`h-2 rounded-full transition ${i === index ? 'w-8 bg-white' : 'w-2 bg-white/40 hover:bg-white/70'}`}
                    aria-label={`Go to slide ${i + 1}`}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
