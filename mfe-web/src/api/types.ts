export interface PublicCategory {
  id: number;
  parent_id?: number | null;
  name: string;
  slug: string;
  post_count: number;
}

export interface PublicPost {
  id: number;
  title: string;
  slug: string;
  excerpt: string | null;
  cover_image_url: string | null;
  published_at: string | null;
  created_at: string;
  categories: { id: number; name: string; slug: string }[];
}

export interface PublicPostFull extends PublicPost {
  content_html: string;
  author_email: string;
  pdf_url?: string | null;
}

export interface NavNode {
  id: number;
  label: string;
  href: string;
  children: NavNode[];
}

export interface SitePagePublic {
  id: number;
  slug: string;
  title: string;
  content_html: string;
  updated_at: string;
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

export interface CarouselSlidePublic {
  id: number;
  sort_order: number;
  title: string;
  excerpt: string | null;
  image_url: string;
  body_html: string;
  link_href: string;
  link_post_id: number | null;
}

export interface GalleryItemPublic {
  id: number;
  sort_order: number;
  media_type: 'image' | 'video';
  url: string;
  caption: string | null;
}

export interface BrandingLinePublic {
  text: string;
  fontSizePx: number;
  fontWeight: string;
  fontStyle: string;
  fontFamily: string;
  color?: string;
}

export interface SiteChromeLogoPublic {
  url: string;
  alt?: string;
  maxHeightPx: number;
}

export interface SiteChromeHeaderPublic {
  minHeightPx: number | null;
  maxHeightPx: number | null;
  leftLogos: SiteChromeLogoPublic[];
  center: {
    mode: 'text' | 'image';
    imageUrl: string | null;
    imageMaxHeightPx: number;
    lines: BrandingLinePublic[];
  };
  rightLogos: SiteChromeLogoPublic[];
}

export interface SiteChromeFooterPublic {
  mode: 'text' | 'image';
  imageUrl: string | null;
  imageMaxHeightPx: number;
  lines: BrandingLinePublic[];
}

export interface SiteChromePublic {
  header: SiteChromeHeaderPublic;
  footer: SiteChromeFooterPublic;
}

export interface EventListPublic {
  id: number;
  slug: string;
  title: string;
  excerpt: string | null;
  published_at: string | null;
  sort_order: number;
}

export interface EventDetailPublic {
  id: number;
  slug: string;
  title: string;
  excerpt: string | null;
  content_html: string;
  published_at: string | null;
  updated_at: string;
}

export interface HomeHeroStat {
  label: string;
  value: string;
}

export interface HomeHeroPublic {
  title: string;
  subtitle: string;
  tagline: string;
  image_url: string;
  primary_cta_label: string;
  primary_cta_href: string;
  secondary_cta_label: string;
  secondary_cta_href: string;
  stats: HomeHeroStat[];
}

export interface HomeSectionPublic {
  id: string;
  heading: string;
  subheading: string;
  body_html: string;
  variant: 'default' | 'muted' | 'accent';
}

export interface SiteHomePublic {
  hero: HomeHeroPublic;
  sections: HomeSectionPublic[];
  show_latest_posts: boolean;
  latest_posts_heading: string;
  latest_posts_intro: string;
}
