/** Public blog origin for “open topic” links from admin (different dev port than admin). */
export function publicTopicUrl(categorySlug: string): string {
  const base = (import.meta.env.VITE_PUBLIC_WEB_ORIGIN as string | undefined)?.replace(/\/$/, '') ?? 'http://localhost:5002';
  return `${base}/topic/${encodeURIComponent(categorySlug)}`;
}
