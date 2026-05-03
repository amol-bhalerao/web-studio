export interface Category {
  id: number;
  parent_id?: number | null;
  name: string;
  slug: string;
  post_count?: number;
  created_at?: string;
}

export interface PostCategoryBrief {
  id: number;
  name: string;
  slug: string;
}

export interface PostListItem {
  id: number;
  title: string;
  slug: string;
  status: 'draft' | 'published';
  published_at: string | null;
  created_at: string;
  updated_at: string;
  author_email?: string;
  /** Present on admin list endpoint */
  categories?: PostCategoryBrief[];
  nav_menu_labels?: string[];
}

export interface PostDetail extends PostListItem {
  excerpt: string;
  content_html: string;
  cover_image_url: string | null;
  pdf_url?: string | null;
  user_id: number;
  category_ids: number[];
}

export interface Paginated<T> {
  data: T[];
  meta: {
    page: number;
    per_page: number;
    total: number;
    total_pages: number;
  };
}

export interface Stats {
  posts_total: number;
  posts_published: number;
  posts_draft: number;
  categories: number;
  /** Present after API update with extended dashboard stats */
  events_total?: number;
  site_pages?: number;
  gallery_items?: number;
}

export interface AdminUser {
  id: number;
  email: string;
  display_name: string | null;
  role: string;
  created_at: string;
}

export interface SitePage {
  id: number;
  slug: string;
  title: string;
  content_html: string;
  created_at?: string;
  updated_at?: string;
}

export interface NavItemRow {
  id: number;
  parent_id: number | null;
  sort_order: number;
  label: string;
  page_id: number | null;
  post_id: number | null;
  url: string | null;
  href: string;
}

export interface CarouselSlideRow {
  id: number;
  sort_order: number;
  title: string;
  excerpt: string | null;
  image_url: string;
  body_html: string;
  link_post_id: number | null;
  link_url: string | null;
}

export interface HighlightsAdmin {
  news_post_id: number | null;
  events_post_id: number | null;
}

export interface GalleryItemRow {
  id: number;
  sort_order: number;
  media_type: 'image' | 'video';
  url: string;
  caption: string | null;
}

export interface BrandingLine {
  text: string;
  fontSizePx: number;
  fontWeight: 'normal' | 'bold' | '500' | '600' | '700';
  fontStyle: 'normal' | 'italic';
  fontFamily: 'sans' | 'serif';
  color?: string;
}

export interface SiteChromeLogo {
  url: string;
  alt?: string;
  maxHeightPx: number;
}

export interface SiteChromeHeader {
  minHeightPx: number | null;
  maxHeightPx: number | null;
  leftLogos: SiteChromeLogo[];
  center: {
    mode: 'text' | 'image';
    imageUrl: string | null;
    imageMaxHeightPx: number;
    lines: BrandingLine[];
  };
  rightLogos: SiteChromeLogo[];
}

export interface SiteChromeFooter {
  mode: 'text' | 'image';
  imageUrl: string | null;
  imageMaxHeightPx: number;
  lines: BrandingLine[];
}

export interface SiteChromePayload {
  header: SiteChromeHeader;
  footer: SiteChromeFooter;
}

export interface EventListRow {
  id: number;
  slug: string;
  title: string;
  excerpt: string | null;
  status: 'draft' | 'published';
  sort_order: number;
  published_at: string | null;
  updated_at: string;
}

export interface EventDetail extends EventListRow {
  content_html: string;
}

export interface HomeHeroStatRow {
  label: string;
  value: string;
}

export interface HomeSectionRow {
  id: string;
  heading: string;
  subheading: string;
  body_html: string;
  variant: 'default' | 'muted' | 'accent';
}

export interface SiteHomePayload {
  hero: {
    title: string;
    subtitle: string;
    tagline: string;
    image_url: string;
    primary_cta_label: string;
    primary_cta_href: string;
    secondary_cta_label: string;
    secondary_cta_href: string;
    stats: HomeHeroStatRow[];
  };
  sections: HomeSectionRow[];
  show_latest_posts: boolean;
  latest_posts_heading: string;
  latest_posts_intro: string;
}
