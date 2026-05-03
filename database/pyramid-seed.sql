-- Pyramid International School — demo content derived from public information at https://www.pyramidschool.org/
-- CBSE Affiliated · Aurangabad, Maharashtra. Used with permission of factual extraction only.
--
-- Apply AFTER schema exists (e.g. docker compose init or php api/scripts/seed-database.php once).
-- Replaces existing demo posts/pages/carousel/gallery/events/nav/chrome/home with school-themed data.
-- Admin login stays the same as default seed: admin@example.com / ChangeMe!Admin1 (rotate in production).
--
-- mysql -u USER -p DB_NAME < database/pyramid-seed.sql

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

DELETE FROM nav_items;
DELETE FROM post_categories;
DELETE FROM posts;
DELETE FROM categories;
DELETE FROM carousel_slides;
DELETE FROM gallery_items;
DELETE FROM events;
DELETE FROM highlight_slots;
DELETE FROM site_pages;
DELETE FROM site_chrome WHERE id = 1;
DELETE FROM site_home WHERE id = 1;

SET FOREIGN_KEY_CHECKS = 1;

INSERT IGNORE INTO users (id, email, display_name, password_hash, role) VALUES
(
  1,
  'admin@example.com',
  'Site Admin',
  '$2y$10$pPpAto9o5KwI7aq/FZZ39OCT9xRMDa/1aI.7xT/LnCyDV.bVpdTv6',
  'admin'
);

INSERT INTO categories (name, slug, parent_id) VALUES
  ('Academics', 'academics', NULL),
  ('Admissions', 'admissions', NULL),
  ('Campus Life', 'campus-life', NULL),
  ('Sports', 'sports', NULL),
  ('Announcements', 'announcements', NULL);

INSERT INTO posts (user_id, title, slug, excerpt, content_html, cover_image_url, status, published_at) VALUES
(
  1,
  'Welcome to Pyramid International School',
  'welcome-pyramid-international-school',
  'Admissions open Nursery to Grade XII — CBSE affiliated school in Aurangabad.',
  '<p><strong>Pyramid International School</strong> is a CBSE-affiliated institution (Affiliation No. 1131240) dedicated to holistic education that nurtures every child''s intellectual, emotional, and social growth.</p><p>Our philosophy rests on five pillars: knowledge, wisdom, spiritual perception, eloquent speech, and vision. We emphasize experiential learning on a 2-acre eco-friendly campus with smart classrooms, science and computer labs, library, and comprehensive sports facilities.</p><p><em>Source: public content summarized from pyramidschool.org.</em></p>',
  'https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=1600&q=80&auto=format&fit=crop',
  'published',
  NOW() - INTERVAL 3 DAY
),
(
  1,
  'Message from the Principal',
  'message-from-the-principal',
  'Education is not just about acquiring knowledge — it is about nurturing character and building dreams.',
  '<blockquote><p>\"Education is not just about acquiring knowledge; it''s about nurturing character, building dreams, and creating future leaders.\"</p></blockquote><p>Dear Parents and Students,</p><p>It gives me immense pleasure to welcome you to Pyramid International School, where we believe in holistic education that goes beyond textbooks. Since our establishment in 2010, we have fostered an environment where every child can discover their potential.</p><p>Our CBSE-affiliated curriculum, modern teaching methodologies, and state-of-the-art infrastructure ensure students receive the best foundation for their future. Our team of experienced educators creates an atmosphere of learning, innovation, and creativity.</p><p><strong>Miss. Khan Almas Bakhtiyar Khan</strong><br/>Principal, Pyramid International School</p><p><em>Paraphrased from the principal''s message on pyramidschool.org.</em></p>',
  'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=1600&q=80&auto=format&fit=crop',
  'published',
  NOW() - INTERVAL 2 DAY
),
(
  1,
  'Holistic development & competitive pathways',
  'holistic-development-programs',
  'Specialized coaching for NDA, JEE Main, and NEET alongside sports, arts, and character building.',
  '<p>Pyramid International School nurtures academic excellence alongside sports, arts, and character building. Specialized coaching supports competitive pathways including <strong>NDA</strong>, <strong>JEE Main</strong>, and <strong>NEET</strong>.</p><p>Programs span cricket, football, basketball, athletics, cultural events, music, dance, and drama — designed for well-rounded development.</p><p><em>Summarized from pyramidschool.org program highlights.</em></p>',
  'https://images.unsplash.com/photo-1529390079861-591de354faf5?w=1600&q=80&auto=format&fit=crop',
  'published',
  NOW() - INTERVAL 1 DAY
);

INSERT INTO post_categories (post_id, category_id) VALUES
  (1, 2),
  (1, 5),
  (2, 1),
  (3, 1),
  (3, 4);

INSERT IGNORE INTO highlight_slots (slot_key, post_id) VALUES ('news', NULL), ('events', NULL);
UPDATE highlight_slots SET post_id = 1 WHERE slot_key = 'news';

INSERT INTO carousel_slides (sort_order, title, excerpt, image_url, body_html, link_post_id, link_url) VALUES
(
  0,
  'Empowering Young Minds',
  'Admissions open Nursery to Grade XII · CBSE · Eco-friendly campus in Aurangabad.',
  'https://images.unsplash.com/photo-1564981797816-1043664bf78d?w=1600&q=80&auto=format&fit=crop',
  '<p>Experience world-class education with smart classrooms, dedicated faculty, and comprehensive development programs.</p>',
  NULL,
  NULL
),
(
  1,
  'Excellence in Education',
  'Building future leaders with values and vision.',
  'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=1600&q=80&auto=format&fit=crop',
  '<p>Hands-on learning in science and computer labs, library, and sports infrastructure.</p>',
  NULL,
  NULL
),
(
  2,
  'Sports & cultural life',
  'Cricket, football, basketball, athletics, and vibrant annual events.',
  'https://images.unsplash.com/photo-1461896836934-660605b9cdaa?w=1600&q=80&auto=format&fit=crop',
  '<p>Celebrating talent through annual functions, music, dance, drama, and inter-house competitions.</p>',
  NULL,
  NULL
);

INSERT INTO gallery_items (sort_order, media_type, url, caption) VALUES
(0, 'image', 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=1200&q=80&auto=format&fit=crop', 'Smart classrooms & primary learning spaces'),
(1, 'image', 'https://images.unsplash.com/photo-1532094349884-543cba11c5d3?w=1200&q=80&auto=format&fit=crop', 'Science lab discovery'),
(2, 'image', 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=1200&q=80&auto=format&fit=crop', 'Library & reading culture'),
(3, 'image', 'https://images.unsplash.com/photo-1526676533256-9ebb41f8e7da?w=1200&q=80&auto=format&fit=crop', 'Sports on campus');

INSERT INTO events (slug, title, excerpt, content_html, sort_order, status, published_at) VALUES
(
  'annual-cultural-celebration',
  'Annual cultural celebration',
  'Music, dance, drama, and stage performances celebrating student talent.',
  '<p>Our annual cultural programs showcase talent across music, dance, drama, and public speaking. Families and guests experience the creativity and confidence of Pyramid students.</p>',
  0,
  'published',
  NOW() + INTERVAL 14 DAY
),
(
  'inter-house-sports-meet',
  'Inter-house sports meet',
  'Track and field, team games, and house spirit across the campus.',
  '<p>Comprehensive sports programs including cricket, football, basketball, volleyball, and athletics with coaching and house competitions.</p>',
  1,
  'published',
  NOW() + INTERVAL 21 DAY
);

INSERT INTO site_pages (slug, title, content_html) VALUES
(
  'about',
  'About Pyramid International School',
  '<div class="prose-blog"><h2>The foundation of success</h2><p>Pyramid International School is a <strong>CBSE-affiliated</strong> institution (Affiliation No. <strong>1131240</strong>) offering Nursery through Grade XII on a <strong>2-acre eco-friendly campus</strong> at Silicon Valley, Behind Himayat Bagh, Aurangabad.</p><p>We nurture intellectual, emotional, and social growth through experiential learning, smart classrooms, science and computer laboratories, air-conditioned learning spaces, and dedicated sports facilities.</p><p>With <strong>14+ years</strong> of excellence, <strong>50+</strong> faculty members, <strong>25+</strong> smart classrooms, and <strong>1000+</strong> students, we prepare learners for the 21st century while grounding them in ethics and values.</p><p><em>Facts summarized from pyramidschool.org.</em></p></div>'
),
(
  'contact',
  'Contact & admissions',
  '<div class="prose-blog"><h2>Get in touch</h2><p><strong>Pyramid International School</strong></p><p>Silicon Valley, Behind Himayat Bagh<br/>Harsul, Aurangabad - 431003<br/>Maharashtra, India</p><p>Phone: <a href="tel:9595737888">9595 737 888</a><br/>Email: <a href="mailto:info@pyramidschool.org">info@pyramidschool.org</a></p><p>Admissions: Nursery to Grade XII · CBSE</p></div>'
),
(
  'gallery',
  'Campus gallery',
  '<div class="prose-blog"><p>Explore smart classrooms, laboratories, library, sports grounds, and cultural life at Pyramid International School. Additional photos can be managed under <strong>Admin → Gallery media</strong>.</p></div>'
),
(
  'news-events',
  'News & events',
  '<div class="prose-blog"><p>Stay updated on academics, admissions notices, sports, and cultural events. Pair this page with <strong>News & events</strong> highlights on the home page.</p></div>'
);

INSERT INTO nav_items (parent_id, sort_order, label, page_id, post_id, url)
SELECT NULL, 0, 'About', id, NULL, NULL FROM site_pages WHERE slug = 'about' LIMIT 1;

INSERT INTO nav_items (parent_id, sort_order, label, page_id, post_id, url)
SELECT NULL, 1, 'Gallery', id, NULL, NULL FROM site_pages WHERE slug = 'gallery' LIMIT 1;

INSERT INTO nav_items (parent_id, sort_order, label, page_id, post_id, url)
SELECT NULL, 2, 'Contact', id, NULL, NULL FROM site_pages WHERE slug = 'contact' LIMIT 1;

INSERT INTO nav_items (parent_id, sort_order, label, page_id, post_id, url)
SELECT NULL, 3, 'News & events', id, NULL, NULL FROM site_pages WHERE slug = 'news-events' LIMIT 1;

INSERT INTO site_chrome (id, header_json, footer_json) VALUES (
  1,
  '{"minHeightPx":null,"maxHeightPx":null,"leftLogos":[],"center":{"mode":"text","imageUrl":null,"imageMaxHeightPx":96,"lines":[{"text":"Pyramid International School","fontSizePx":22,"fontWeight":"700","fontStyle":"normal","fontFamily":"system-ui","color":"#0f172a"},{"text":"CBSE · Nursery to XII · Aurangabad","fontSizePx":14,"fontWeight":"500","fontStyle":"normal","fontFamily":"system-ui","color":"#475569"}]},"rightLogos":[]}',
  '{"mode":"text","imageUrl":null,"imageMaxHeightPx":48,"lines":[{"text":"Silicon Valley, Behind Himayat Bagh · Harsul, Aurangabad - 431003","fontSizePx":13,"fontWeight":"400","fontStyle":"normal","fontFamily":"system-ui","color":"#64748b"},{"text":"9595 737 888 · info@pyramidschool.org","fontSizePx":13,"fontWeight":"500","fontStyle":"normal","fontFamily":"system-ui","color":"#64748b"}]}'
);

INSERT INTO site_home (id, content_json) VALUES (
  1,
  '{"hero":{"title":"Empowering Young Minds for a Brighter Tomorrow","subtitle":"Pyramid International School — CBSE affiliated · Eco-friendly campus · Aurangabad","tagline":"Admissions open Nursery to Grade XII · Affiliation No. 1131240","image_url":"https://images.unsplash.com/photo-1564981797816-1043664bf78d?w=1600&q=80&auto=format&fit=crop","primary_cta_label":"About the school","primary_cta_href":"/p/about","secondary_cta_label":"Contact & admissions","secondary_cta_href":"/p/contact","stats":[{"label":"Years of excellence","value":"14+"},{"label":"Dedicated faculty","value":"50+"},{"label":"Smart classrooms","value":"25+"},{"label":"Happy students","value":"1000+"}]},"sections":[{"id":"welcome","heading":"Experiential learning school","subheading":"Holistic education on a green campus","body_html":"<p>Pyramid International School combines academic rigour with sports, arts, and character education. Specialized pathways support competitive exams including NDA, JEE Main, and NEET alongside rich co-curricular programs.</p>","variant":"default"},{"id":"facilities","heading":"Facilities that inspire","subheading":"Smart classrooms, labs, library, sports","body_html":"<p>State-of-the-art smart classrooms, Physics, Chemistry, Biology and Computer labs, a library with 5000+ titles, activity hall for cultural programs, and outdoor sports for cricket, football, basketball, volleyball, and athletics.</p>","variant":"muted"},{"id":"eco","heading":"Eco-friendly campus","subheading":"Safety & sustainability","body_html":"<p>Our 2-acre green campus emphasizes environmental awareness, CCTV-enabled security, and spaces designed for safe, focused learning.</p>","variant":"accent"}],"show_latest_posts":true,"latest_posts_heading":"News from campus","latest_posts_intro":"Stories on academics, admissions, and student life — content summarized from pyramidschool.org."}'
);
