import type {
  CarouselSlidePublic,
  EventDetailPublic,
  EventListPublic,
  GalleryItemPublic,
  NavNode,
  Paginated,
  PublicCategory,
  PublicPost,
  PublicPostFull,
  SiteChromePublic,
  SiteHomePublic,
  SitePagePublic,
} from './types';
import { errorMessageFromBody, parseApiJson } from './http';

export function createPublicApi(baseUrl: string) {
  const base = baseUrl.replace(/\/$/, '');

  async function get<T>(path: string): Promise<T> {
    const url = `${base}${path}`;
    const res = await fetch(url);
    const text = await res.text();
    const data = await parseApiJson<unknown>(res, text);
    if (!res.ok) {
      throw new Error(errorMessageFromBody(data) || `${res.status} ${res.statusText}`);
    }
    return data as T;
  }

  return {
    posts(params: Record<string, string>) {
      const q = new URLSearchParams(params).toString();
      return get<Paginated<PublicPost>>(`/posts?${q}`);
    },
    postBySlug(slug: string) {
      return get<PublicPostFull>(`/posts/${encodeURIComponent(slug)}`);
    },
    categories() {
      return get<{ data: PublicCategory[] }>('/categories');
    },
    navigation() {
      return get<{ data: NavNode[] }>('/navigation');
    },
    sitePage(slug: string) {
      return get<SitePagePublic>(`/pages/${encodeURIComponent(slug)}`);
    },
    carousel() {
      return get<{ data: CarouselSlidePublic[] }>('/carousel');
    },
    gallery() {
      return get<{ data: GalleryItemPublic[] }>('/gallery');
    },
    chrome() {
      return get<SiteChromePublic>('/chrome');
    },
    home() {
      return get<SiteHomePublic>('/home');
    },
    events() {
      return get<{ data: EventListPublic[] }>('/events');
    },
    eventBySlug(slug: string) {
      return get<EventDetailPublic>(`/events/${encodeURIComponent(slug)}`);
    },
  };
}

export type PublicApi = ReturnType<typeof createPublicApi>;
