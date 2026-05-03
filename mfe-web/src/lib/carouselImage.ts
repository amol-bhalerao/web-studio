import type { PublicPost } from '../api/types';
import { mediaUrl } from './mediaUrl';

/** Editorial stock images when a post has no cover — carousel always shows a photo */
const FALLBACK_COVERS = [
  'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1600&q=80&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1600&q=80&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=1600&q=80&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=1600&q=80&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1600&q=80&auto=format&fit=crop',
];

export function carouselSlideImage(post: PublicPost): string {
  if (post.cover_image_url) {
    return mediaUrl(post.cover_image_url);
  }
  return FALLBACK_COVERS[Math.abs(post.id) % FALLBACK_COVERS.length];
}
