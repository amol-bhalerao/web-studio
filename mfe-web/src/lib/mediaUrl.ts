/** Turn stored API paths into browser URLs (dev proxy serves /uploads from PHP). */
export function mediaUrl(path: string | null | undefined): string {
  if (!path) return '';
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  return path;
}
