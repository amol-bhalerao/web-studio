-- Web Studio — MySQL 8+
SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS nav_items;
DROP TABLE IF EXISTS site_pages;
DROP TABLE IF EXISTS site_home;
DROP TABLE IF EXISTS site_chrome;
DROP TABLE IF EXISTS events;
DROP TABLE IF EXISTS gallery_items;
DROP TABLE IF EXISTS carousel_slides;
DROP TABLE IF EXISTS highlight_slots;
DROP TABLE IF EXISTS post_categories;
DROP TABLE IF EXISTS posts;
DROP TABLE IF EXISTS categories;
DROP TABLE IF EXISTS users;

SET FOREIGN_KEY_CHECKS = 1;

CREATE TABLE users (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) NOT NULL,
  display_name VARCHAR(160) NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(32) NOT NULL DEFAULT 'admin',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_users_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE categories (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  parent_id INT UNSIGNED NULL,
  name VARCHAR(160) NOT NULL,
  slug VARCHAR(180) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_categories_slug (slug),
  KEY idx_categories_parent (parent_id),
  CONSTRAINT fk_categories_parent FOREIGN KEY (parent_id) REFERENCES categories(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE posts (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  user_id INT UNSIGNED NOT NULL,
  title VARCHAR(500) NOT NULL,
  slug VARCHAR(200) NOT NULL,
  excerpt TEXT NULL,
  content_html MEDIUMTEXT NOT NULL,
  cover_image_url VARCHAR(1024) NULL,
  pdf_url VARCHAR(1024) NULL,
  status ENUM('draft','published') NOT NULL DEFAULT 'draft',
  published_at DATETIME NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_posts_slug (slug),
  KEY idx_posts_status_published (status, published_at),
  CONSTRAINT fk_posts_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE post_categories (
  post_id INT UNSIGNED NOT NULL,
  category_id INT UNSIGNED NOT NULL,
  PRIMARY KEY (post_id, category_id),
  KEY idx_pc_category (category_id),
  CONSTRAINT fk_pc_post FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
  CONSTRAINT fk_pc_category FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE carousel_slides (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  sort_order INT NOT NULL DEFAULT 0,
  title VARCHAR(500) NOT NULL,
  excerpt TEXT NULL,
  image_url VARCHAR(1024) NOT NULL,
  body_html MEDIUMTEXT NULL,
  link_post_id INT UNSIGNED NULL,
  link_url VARCHAR(1024) NULL,
  KEY idx_carousel_sort (sort_order),
  CONSTRAINT fk_carousel_link_post FOREIGN KEY (link_post_id) REFERENCES posts(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE highlight_slots (
  slot_key VARCHAR(16) NOT NULL PRIMARY KEY,
  post_id INT UNSIGNED NULL,
  CONSTRAINT fk_highlight_slot_post FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE gallery_items (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  sort_order INT NOT NULL DEFAULT 0,
  media_type ENUM('image','video') NOT NULL,
  url VARCHAR(1024) NOT NULL,
  caption VARCHAR(500) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  KEY idx_gallery_sort (sort_order)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE events (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  slug VARCHAR(200) NOT NULL,
  title VARCHAR(500) NOT NULL,
  excerpt TEXT NULL,
  content_html MEDIUMTEXT NOT NULL,
  sort_order INT NOT NULL DEFAULT 0,
  status ENUM('draft','published') NOT NULL DEFAULT 'draft',
  published_at DATETIME NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_events_slug (slug),
  KEY idx_events_pub (status, published_at),
  KEY idx_events_sort (sort_order)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE site_chrome (
  id TINYINT UNSIGNED NOT NULL PRIMARY KEY,
  header_json LONGTEXT NOT NULL,
  footer_json LONGTEXT NOT NULL,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE site_home (
  id TINYINT UNSIGNED NOT NULL PRIMARY KEY,
  content_json LONGTEXT NOT NULL,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE site_pages (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  slug VARCHAR(200) NOT NULL,
  title VARCHAR(300) NOT NULL,
  content_html MEDIUMTEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_site_pages_slug (slug)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE nav_items (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  parent_id INT UNSIGNED NULL,
  sort_order INT NOT NULL DEFAULT 0,
  label VARCHAR(160) NOT NULL,
  page_id INT UNSIGNED NULL,
  post_id INT UNSIGNED NULL,
  url VARCHAR(1024) NULL,
  KEY idx_nav_parent (parent_id),
  KEY idx_nav_page (page_id),
  KEY idx_nav_post (post_id),
  KEY idx_nav_sort (parent_id, sort_order),
  CONSTRAINT fk_nav_items_parent FOREIGN KEY (parent_id) REFERENCES nav_items(id) ON DELETE CASCADE,
  CONSTRAINT fk_nav_items_page FOREIGN KEY (page_id) REFERENCES site_pages(id) ON DELETE CASCADE,
  CONSTRAINT fk_nav_items_post FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
