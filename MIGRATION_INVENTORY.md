# Migration Inventory

This file records the Jekyll content rules used by the Astro migration.

## Source Content

- Markdown sources counted: 72.
- Published dated articles: 60.
- Unpublished dated articles: 1.
- Dated articles total: 61.
- Topic landing pages: 8.
- Static or other pages: 3.

## Published Rules

- Dated Markdown files and files with dated `permalink` values are treated as
  articles.
- Articles with `published: false` or `status: draft` are excluded from
  production article lists, article pages, RSS, sitemap, search, and topic
  listings.
- `docs/notes/about.md` is migrated intentionally to `/about/` even though its
  legacy frontmatter has `published: false`.

## Slug Rules

Article slugs are derived in this order:

1. Old dated `permalink` slug, such as
   `/2021/05/16/gamergate-as-metagaming/`.
2. Date-stripped filename slug, such as
   `2021-05-16-gamergate-as-metagaming.markdown`.
3. Future explicit `slug` frontmatter only if intentionally added later.

The inventory found no duplicate old dated permalink slugs and no duplicate
target `/articles/:slug/` article slugs.

## Frontmatter Keys

Current keys in use:

- `author`
- `banner`
- `categories`
- `date`
- `description`
- `excerpt`
- `facebook`
- `fbpreview`
- `grand_parent`
- `has_children`
- `image`
- `layout`
- `meta`
- `nav_order`
- `parent`
- `permalink`
- `published`
- `status`
- `tags`
- `title`
- `type`

Required for rendering where available: `title`, `date`, `permalink`.
Optional but used by layouts and feeds: `author`, `excerpt`, `image`,
`fbpreview`, `banner`, `parent`, `categories`, `tags`.
Legacy-only fields should not block the Astro build.

## Compatibility Cases

- `{{ site.baseurl }}` appears in legacy Markdown and must be removed during
  rendering without changing article bodies on disk.
- Kramdown attribute syntax appears in `index.md`; the Astro homepage replaces
  that markup directly instead of rendering the legacy syntax.
- Raw HTML appears in many articles and should remain enabled through Astro's
  default Markdown rendering.
- Old dated internal links may remain in article bodies when they are
  intentionally covered by the external Cloudflare redirect layer.

## Legacy Implementation Files

Jekyll implementation details, not content:

- `_layouts/`
- `_includes/`
- `_sass/`
- `Gemfile`
- `Rakefile`
- `just-the-docs.gemspec`
- `bin/`
- `lib/`
- `Dockerfile`
- `docker-compose.yml`
- legacy generated `feed.xml`

Source content and required static files:

- `docs/`
- `index.md`
- `assets/`
- `uploads/`
- `favicon.ico`
- `CNAME`
