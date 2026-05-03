import type {
  AdminUser,
  Category,
  CarouselSlideRow,
  EventDetail,
  EventListRow,
  GalleryItemRow,
  HighlightsAdmin,
  NavItemRow,
  Paginated,
  PostDetail,
  PostListItem,
  SiteChromePayload,
  SiteHomePayload,
  SitePage,
  Stats,
} from './types';
import { errorMessageFromBody, parseApiJson } from './http';

/** Shared with shell + college admin MFEs (single sign-on across campus suite). */
const TOKEN_KEY = 'campus_suite_admin_token';

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string | null): void {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
}

export function createApi(baseUrl: string) {
  const base = baseUrl.replace(/\/$/, '');

  async function request<T>(
    path: string,
    options: RequestInit & { auth?: boolean } = {}
  ): Promise<T> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };
    if (options.auth !== false) {
      const t = getToken();
      if (t) headers.Authorization = `Bearer ${t}`;
    }
    const res = await fetch(`${base}${path}`, { ...options, headers });
    if (res.status === 204) return undefined as T;
    const text = await res.text();
    const data = await parseApiJson<unknown>(res, text);
    if (!res.ok) {
      throw new Error(errorMessageFromBody(data) || `${res.status} ${res.statusText}`);
    }
    return data as T;
  }

  return {
    login(email: string, password: string) {
      return request<{ token: string; user: { id: number; email: string } }>(
        '/auth/login',
        { method: 'POST', body: JSON.stringify({ email, password }), auth: false }
      );
    },
    stats(): Promise<Stats> {
      return request('/admin/stats');
    },
    me(): Promise<AdminUser> {
      return request<AdminUser>('/admin/me');
    },
    updateMe(body: { email?: string; display_name?: string | null }) {
      return request<AdminUser>('/admin/me', { method: 'PUT', body: JSON.stringify(body) });
    },
    updatePassword(body: { current_password: string; new_password: string }) {
      return request<void>('/admin/me/password', { method: 'PUT', body: JSON.stringify(body) });
    },
    postsAdmin(params: Record<string, string>) {
      const q = new URLSearchParams(params).toString();
      return request<Paginated<PostListItem>>(`/admin/posts?${q}`);
    },
    postById(id: number) {
      return request<PostDetail>(`/admin/posts/id/${id}`);
    },
    createPost(body: Record<string, unknown>) {
      return request<PostDetail>('/admin/posts', { method: 'POST', body: JSON.stringify(body) });
    },
    updatePost(id: number, body: Record<string, unknown>) {
      return request<PostDetail>(`/admin/posts/${id}`, { method: 'PUT', body: JSON.stringify(body) });
    },
    deletePost(id: number) {
      return request<void>(`/admin/posts/${id}`, { method: 'DELETE' });
    },
    categoriesAdmin() {
      return request<{ data: Category[] }>('/admin/categories');
    },
    createCategory(body: { name: string; slug?: string; parent_id?: number | null }) {
      return request<Category>('/admin/categories', { method: 'POST', body: JSON.stringify(body) });
    },
    updateCategory(id: number, body: { name?: string; slug?: string; parent_id?: number | null }) {
      return request<Category>(`/admin/categories/${id}`, { method: 'PUT', body: JSON.stringify(body) });
    },
    deleteCategory(id: number) {
      return request<void>(`/admin/categories/${id}`, { method: 'DELETE' });
    },
    sitePagesAdmin() {
      return request<{ data: Pick<SitePage, 'id' | 'slug' | 'title' | 'updated_at'>[] }>('/admin/site-pages');
    },
    sitePageAdmin(id: number) {
      return request<SitePage>(`/admin/site-pages/${id}`);
    },
    sitePageAdminBySlug(slug: string) {
      return request<SitePage>(`/admin/site-pages/slug/${encodeURIComponent(slug)}`);
    },
    createSitePage(body: { title: string; slug?: string; content_html?: string }) {
      return request<SitePage>('/admin/site-pages', { method: 'POST', body: JSON.stringify(body) });
    },
    updateSitePage(id: number, body: { title?: string; slug?: string; content_html?: string }) {
      return request<SitePage>(`/admin/site-pages/${id}`, { method: 'PUT', body: JSON.stringify(body) });
    },
    deleteSitePage(id: number) {
      return request<void>(`/admin/site-pages/${id}`, { method: 'DELETE' });
    },
    navigationAdmin() {
      return request<{ data: NavItemRow[] }>('/admin/navigation');
    },
    createNavItem(body: {
      label: string;
      parent_id?: number | null;
      sort_order?: number;
      page_id?: number | null;
      post_id?: number | null;
      url?: string | null;
    }) {
      return request<{ id: number }>('/admin/navigation', { method: 'POST', body: JSON.stringify(body) });
    },
    updateNavItem(
      id: number,
      body: {
        label?: string;
        parent_id?: number | null;
        sort_order?: number;
        page_id?: number | null;
        post_id?: number | null;
        url?: string | null;
      }
    ) {
      return request<void>(`/admin/navigation/${id}`, { method: 'PUT', body: JSON.stringify(body) });
    },
    deleteNavItem(id: number) {
      return request<void>(`/admin/navigation/${id}`, { method: 'DELETE' });
    },
    carouselAdmin() {
      return request<{ data: CarouselSlideRow[] }>('/admin/carousel');
    },
    createCarouselSlide(body: {
      title: string;
      image_url: string;
      sort_order?: number;
      excerpt?: string;
      body_html?: string;
      link_post_id?: number | null;
      link_url?: string | null;
    }) {
      return request<{ id: number }>('/admin/carousel', { method: 'POST', body: JSON.stringify(body) });
    },
    updateCarouselSlide(
      id: number,
      body: Partial<{
        title: string;
        excerpt: string;
        image_url: string;
        body_html: string;
        sort_order: number;
        link_post_id: number | null;
        link_url: string | null;
      }>
    ) {
      return request<void>(`/admin/carousel/${id}`, { method: 'PUT', body: JSON.stringify(body) });
    },
    deleteCarouselSlide(id: number) {
      return request<void>(`/admin/carousel/${id}`, { method: 'DELETE' });
    },
    highlightsAdmin() {
      return request<HighlightsAdmin>('/admin/highlights');
    },
    updateHighlights(body: { news_post_id?: number | null; events_post_id?: number | null }) {
      return request<void>('/admin/highlights', { method: 'PUT', body: JSON.stringify(body) });
    },
    galleryAdmin() {
      return request<{ data: GalleryItemRow[] }>('/admin/gallery');
    },
    createGalleryItem(body: {
      media_type: 'image' | 'video';
      url: string;
      caption?: string;
      sort_order?: number;
    }) {
      return request<{ id: number }>('/admin/gallery', { method: 'POST', body: JSON.stringify(body) });
    },
    updateGalleryItem(id: number, body: Partial<{ caption: string; url: string; sort_order: number; media_type: 'image' | 'video' }>) {
      return request<void>(`/admin/gallery/${id}`, { method: 'PUT', body: JSON.stringify(body) });
    },
    deleteGalleryItem(id: number) {
      return request<void>(`/admin/gallery/${id}`, { method: 'DELETE' });
    },
    reorderGallery(ordered_ids: number[]) {
      return request<void>('/admin/gallery/reorder', {
        method: 'PUT',
        body: JSON.stringify({ ordered_ids }),
      });
    },
    async uploadGalleryMedia(file: File): Promise<{ url: string; media_hint: string }> {
      const fd = new FormData();
      fd.append('file', file);
      const headers: Record<string, string> = {};
      const t = getToken();
      if (t) headers.Authorization = `Bearer ${t}`;
      const res = await fetch(`${base}/admin/uploads/gallery`, { method: 'POST', headers, body: fd });
      const text = await res.text();
      const data = await parseApiJson<unknown>(res, text);
      if (!res.ok) {
        throw new Error(errorMessageFromBody(data) || `${res.status} ${res.statusText}`);
      }
      return data as { url: string; media_hint: string };
    },
    async uploadCover(file: File): Promise<{ url: string }> {
      const fd = new FormData();
      fd.append('file', file);
      const headers: Record<string, string> = {};
      const t = getToken();
      if (t) {
        headers.Authorization = `Bearer ${t}`;
      }
      const res = await fetch(`${base}/admin/uploads`, { method: 'POST', headers, body: fd });
      const text = await res.text();
      const data = await parseApiJson<unknown>(res, text);
      if (!res.ok) {
        throw new Error(errorMessageFromBody(data) || `${res.status} ${res.statusText}`);
      }
      return data as { url: string };
    },
    async uploadPdf(file: File): Promise<{ url: string }> {
      const fd = new FormData();
      fd.append('file', file);
      const headers: Record<string, string> = {};
      const t = getToken();
      if (t) headers.Authorization = `Bearer ${t}`;
      const res = await fetch(`${base}/admin/uploads/pdf`, { method: 'POST', headers, body: fd });
      const text = await res.text();
      const data = await parseApiJson<unknown>(res, text);
      if (!res.ok) {
        throw new Error(errorMessageFromBody(data) || `${res.status} ${res.statusText}`);
      }
      return data as { url: string };
    },
    chromeAdmin() {
      return request<SiteChromePayload>('/admin/chrome');
    },
    updateChrome(body: SiteChromePayload) {
      return request<SiteChromePayload>('/admin/chrome', { method: 'PUT', body: JSON.stringify(body) });
    },
    homeAdmin() {
      return request<SiteHomePayload>('/admin/home');
    },
    updateHome(body: SiteHomePayload) {
      return request<SiteHomePayload>('/admin/home', { method: 'PUT', body: JSON.stringify(body) });
    },
    eventsAdmin() {
      return request<{ data: EventListRow[] }>('/admin/events');
    },
    eventAdmin(id: number) {
      return request<EventDetail>(`/admin/events/${id}`);
    },
    createEvent(body: {
      title: string;
      slug?: string;
      excerpt?: string;
      content_html?: string;
      sort_order?: number;
      status?: 'draft' | 'published';
      published_at?: string | null;
    }) {
      return request<EventDetail>('/admin/events', { method: 'POST', body: JSON.stringify(body) });
    },
    updateEvent(
      id: number,
      body: Partial<{
        title: string;
        slug: string;
        excerpt: string;
        content_html: string;
        sort_order: number;
        status: 'draft' | 'published';
        published_at: string | null;
      }>
    ) {
      return request<EventDetail>(`/admin/events/${id}`, { method: 'PUT', body: JSON.stringify(body) });
    },
    deleteEvent(id: number) {
      return request<void>(`/admin/events/${id}`, { method: 'DELETE' });
    },
  };
}

export type Api = ReturnType<typeof createApi>;
