# Web Studio

Multipurpose **website + admin + REST API** stack: a public React site (`mfe-web`), an admin app (`mfe-admin`), and a PHP Slim API (`api`) backed by MySQL. Use it for schools, nonprofits, agencies, or any organization that needs editable pages, posts, navigation, carousel, gallery, and events—without coupling to one vertical.

## Repository contents

| Path | Purpose |
|------|---------|
| `api/` | Slim 4 JSON API (`/api/v1`), JWT admin auth, uploads |
| `mfe-web/` | Public Vite + React site |
| `mfe-admin/` | Admin Vite + React app (Module Federation remote capable) |
| `database/` | `schema.sql`, `seed.sql`, optional `pyramid-seed.sql` demo |

## Requirements

- PHP **8.1+**, [Composer](https://getcomposer.org/)
- Node **18+**, npm
- MySQL **8** (local or Docker)

## Quick start (development)

### 1. Database

```bash
docker compose up -d
```

Creates database `blog_mfe`, user `blog` / `blog_secret`, applies `schema.sql` + `seed.sql`.

Or point MySQL at your own instance and create DB `blog_mfe`.

### 2. API

```bash
cd api
composer install
copy .env.example .env   # Windows — or cp on Unix; set DB_* and JWT_SECRET
php scripts/seed-database.php   # idempotent schema + seed if needed
php -S 127.0.0.1:8080 -t public
```

Health check: `GET http://127.0.0.1:8080/api/v1/health`

Default admin after seed (change immediately): `admin@example.com` — password set in `database/seed.sql` hash (rotate via admin UI).

### 3. Public site

```bash
cd mfe-web
npm install
npm run dev
```

Opens Vite dev server (default port **5002**); proxies `/api` and `/uploads` to **8080**.

Optional branding via `mfe-web/.env`:

```env
VITE_BRAND_NAME=Your Organization
VITE_BRAND_TAGLINE=Short line under the name
```

### 4. Admin (Web Studio)

```bash
cd mfe-admin
npm install
npm run dev
```

Dev server on port **5001**; proxies API same as above.

## Optional school demo seed

After base seed, you can load sample content inspired by a real school site:

```bash
mysql -u blog -p blog_mfe < database/pyramid-seed.sql
```

Adjust credentials to match `api/.env`.

## Production notes

- Build `mfe-web` / `mfe-admin` with `npm run build`; serve `dist/` behind your HTTP server or CDN.
- Set `VITE_API_BASE` if the API is not same-origin.
- Use strong `JWT_SECRET` and HTTPS.
- Do not commit `api/.env`, `node_modules/`, `vendor/`, or `dist/`.

## License

Use and modify for your projects; attribute upstream authors where appropriate.
