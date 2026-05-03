-- Web Studio — generic starter data. Admin: create your own password after first login.
INSERT INTO users (email, password_hash, role) VALUES (
  'admin@example.com',
  '$2y$10$pPpAto9o5KwI7aq/FZZ39OCT9xRMDa/1aI.7xT/LnCyDV.bVpdTv6',
  'admin'
);

INSERT INTO categories (name, slug, parent_id) VALUES
  ('General', 'general', NULL),
  ('News', 'news', NULL),
  ('Resources', 'resources', NULL),
  ('Services', 'services', NULL),
  ('Archive', 'archive', NULL);

INSERT INTO posts (user_id, title, slug, excerpt, content_html, cover_image_url, status, published_at) VALUES
(1, 'Welcome to your site', 'welcome-to-your-site',
 'Replace this with your first announcement or landing story.',
 '<p>This is sample content for the <strong>Web Studio</strong> public site. Edit posts, pages, navigation, and the home layout from the admin app. No rebuild required for most changes.</p><p>Add categories, upload media, and publish when you are ready.</p>',
 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1600&q=80&auto=format&fit=crop',
 'published', NOW() - INTERVAL 2 DAY),
(1, 'Draft: Coming soon', 'draft-coming-soon',
 'Drafts stay private until you publish.',
 '<p>Use drafts to prepare announcements, policy updates, or campaign pages before they go live.</p>',
 NULL,
 'draft', NULL);

INSERT INTO post_categories (post_id, category_id) VALUES (1, 1), (1, 2);

INSERT IGNORE INTO highlight_slots (slot_key, post_id) VALUES ('news', NULL), ('events', NULL);

INSERT INTO site_pages (slug, title, content_html) VALUES
('about', 'About', '<div class="prose-blog"><p>Introduce your organization here. Edit this under <strong>Admin → Site pages</strong>.</p></div>'),
('gallery', 'Gallery', '<div class="prose-blog"><p>Intro text for your gallery. Add photos and videos under <strong>Admin → Gallery media</strong>; they appear below.</p></div>'),
('contact', 'Contact', '<div class="prose-blog"><p>Contact details — update in Admin.</p></div>'),
('news-events', 'News & events', '<div class="prose-blog"><p>Latest updates — edit this card in <strong>Admin → News & events</strong>.</p></div>');

INSERT INTO nav_items (parent_id, sort_order, label, page_id, url)
SELECT NULL, 0, 'About', id, NULL FROM site_pages WHERE slug = 'about' LIMIT 1;

INSERT INTO nav_items (parent_id, sort_order, label, page_id, url)
SELECT NULL, 1, 'Gallery', id, NULL FROM site_pages WHERE slug = 'gallery' LIMIT 1;

INSERT INTO nav_items (parent_id, sort_order, label, page_id, url)
SELECT NULL, 2, 'Contact', id, NULL FROM site_pages WHERE slug = 'contact' LIMIT 1;

INSERT INTO nav_items (parent_id, sort_order, label, page_id, url)
SELECT NULL, 3, 'News & events', id, NULL FROM site_pages WHERE slug = 'news-events' LIMIT 1;
