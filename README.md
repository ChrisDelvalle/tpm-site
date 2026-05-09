# The Philosopher's Meme

Astro static site for The Philosopher's Meme.

## Requirements

- Bun
- Node.js `>=22.12.0`

Install dependencies:

```sh
bun install
```

## Common Commands

Start the development server:

```sh
bun run dev
```

Build the static site:

```sh
bun run build
```

Preview the built site locally:

```sh
bun run preview
```

Build and then preview in one command:

```sh
bun run preview:fresh
```

Run the normal local validation used before opening a PR:

```sh
bun run check
bun run build
bun run verify
```

For a short explanation of every package script, see `PACKAGE_SCRIPTS.md`.

Run the same local quality path with successful command output hidden:

```sh
bun run quality
```

Run safe automatic fixes before checking code and config:

```sh
bun run fix
```

Markdown and MDX style checks are review-only, not release blockers:

```sh
bun run review:markdown
bun run fix:markdown
```

Asset cleanup checks are review-only. They warn about duplicate images and
images in `src/assets/` that do not appear to be used by the site. If an unused
image is worth keeping for possible future use, move it to `unused-assets/`.
If a warning is intentionally wrong, add a narrow path or glob to
`scripts/duplicate-image-ignore.json` or `scripts/unused-image-ignore.json`:

```sh
bun run review:assets
```

Run dependency audit review across all severities:

```sh
bun run audit:all
```

Run broad coverage review after changing scripts, helpers, browser scripts, or
other testable code:

```sh
bun run coverage
```

Prefer meaningful behavior tests. If a remaining uncovered path is an
unavoidable process, generated-output, or browser auto-init boundary, document
the reason near that boundary with a `Coverage note:` comment.

Run the heavier pre-release gate:

```sh
bun run check:release
```

Run the heavier pre-release gate with successful command output hidden:

```sh
bun run quality:release
```

`check:release` includes the blocking release gates: normal checks, production
build verification, browser smoke/responsive/search tests, high-severity
dependency audit, and secrets checks. `quality:release` also runs the
non-blocking review signals: Markdown style, asset cleanup, accessibility,
Lighthouse, coverage, and all-severity dependency audit. The secrets check
expects the `gitleaks` binary to be available locally.

## Content Model

For a step-by-step article submission guide for non-technical authors, see
`AUTHOR_TUTORIAL.md`.

Article Markdown and MDX live in:

```text
src/content/articles/<category>/<slug>.md
src/content/articles/<category>/<slug>.mdx
```

Static page Markdown lives in `src/content/pages/`. The about page is
`src/content/pages/about.md`.

Category display metadata lives in `src/content/categories/*.json`. Category
metadata controls labels and ordering for category navigation; article grouping
comes from the first folder below `src/content/articles/`.

## Adding An Article

1. Pick a category folder under `src/content/articles/`.
2. Add a URL-safe `.md` or `.mdx` file whose filename stem is the desired public
   slug.
3. Add frontmatter with `title`, `description`, `date`, and `author`.
   `author` should match an existing entry or alias in `src/content/authors/`.
4. Put new article images under `src/assets/articles/<article-slug>/` unless
   they are shared assets.
5. Run the validation commands.

Example:

```md
---
title: "Example Article Title"
description: "Short summary for search, feeds, and social previews."
date: 2026-04-27
author: "Author Name"
tags:
  - memes
image: "../../../assets/articles/example-article-title/cover.png"
imageAlt: "Brief description of the image."
---

Article body goes here.
```

The public Astro URL will be:

```text
/articles/example-article-title/
```

Use `draft: true` to keep an article unpublished. Draft articles are excluded
from generated article routes, archives, categories, RSS, sitemap, and search.

If an article introduces a new author, add or request a matching author profile
under `src/content/authors/<author-slug>.md`. Keep author metadata factual:
display name, type, aliases, and explicitly approved public links only.

Do not add `slug`, `topic`, or `category` frontmatter. The article slug comes
from the filename. The category comes from the source folder.

`legacyPermalink` and `legacyBanner` may exist on older articles as inert
historical metadata. They do not control routing, publishing, or rendering.

## Category Folders

Current article category folders:

- `src/content/articles/memeculture/` -> `/categories/memeculture/` (`Culture`)
- `src/content/articles/metamemetics/` -> `/categories/metamemetics/`
- `src/content/articles/aesthetics/` -> `/categories/aesthetics/`
- `src/content/articles/irony/` -> `/categories/irony/`
- `src/content/articles/game-studies/` -> `/categories/game-studies/`
- `src/content/articles/history/` -> `/categories/history/`
- `src/content/articles/philosophy/` -> `/categories/philosophy/`
- `src/content/articles/politics/` -> `/categories/politics/`

If you add a new category folder, add a matching JSON file in
`src/content/categories/` when you want a custom display title, description, or
ordering.

## Images

Use `src/assets/` for project-owned images so Astro can process and validate
them. Article-owned images should usually live under a folder matching the
article slug:

```text
src/assets/articles/example-article-title/
  diagram.png
```

Shared article images belong in `src/assets/shared/`. Site UI and homepage
images belong in `src/assets/site/`.

Use MDX when an article needs component-level image control:

```mdx
import { Image } from "astro:assets";
import diagram from "../../../assets/articles/example-article-title/diagram.png";

<Image src={diagram} alt="Alt text" />
```

Do not put article, page, or site UI images in `public/` or in repository-root
image folders. Those locations bypass Astro's image validation and processing.

Use a relative source path for the frontmatter `image` field:

```yaml
image: "../../../assets/articles/example-article-title/cover.png"
imageAlt: "Brief description of the image."
```

The slug-matching asset folder is an organization convention, not an enforced
rule. Authors can reference any asset under `src/assets/` when an image is
shared or belongs somewhere else.

Use `public/` only for non-image files that intentionally need stable
root-relative URLs, such as favicons, `robots.txt`, deploy host files, or
downloads that should not be transformed.

## URLs And Redirects

Canonical article routes are:

```text
/articles/:slug/
```

Category pages are:

```text
/categories/:category/
```

Historical dated URLs such as:

```text
/2021/05/16/gamergate-as-metagaming/
```

are intentionally not handled by this repo. Production redirects are managed
outside the site, currently through Cloudflare.

## Search, RSS, And Sitemap

`bun run build` generates:

- static Astro pages in `dist/`
- hashed Astro-managed assets under `dist/_astro/`
- Pagefind search index in `dist/pagefind/`
- RSS feed at `/feed.xml`
- sitemap output through `@astrojs/sitemap`

For a production-like search check, run `bun run build` and then
`bun run preview`.

## Production Output

The deployable site is the `dist/` directory produced by `bun run build`.

Astro and Vite process project CSS and normal client scripts for production:
CSS is minified and chunked, processed scripts are bundled and minified, and
emitted project assets use hashed filenames for cacheability.

Files in `public/` are copied through unchanged. Treat downloads, favicons, and
other public files as production-ready before committing them.

Pagefind search assets are generated after the Astro build and live under
`dist/pagefind/`.

## Verification

`bun run verify` checks the built `dist/` output for expected pages, assets,
published article count, and broken internal links. The
expected article count is derived from current source content, excluding
articles marked `draft: true`.

Run this before opening a PR:

```sh
bun run check
bun run build
bun run verify
```

## Deployment

GitHub Pages deployment is handled by `.github/workflows/ci.yml` on pushes to
`main`. Deployment waits for the blocking quality, build verification, browser,
and high-severity audit jobs, then publishes the generated `dist/` directory
with GitHub Pages Actions.

GitHub review also runs non-blocking Markdown, asset cleanup, accessibility,
Lighthouse, coverage, and all-severity audit jobs. Treat those as review
signals rather than publish blockers.

Manual deployment hosts should:

1. Install dependencies with `bun install`.
2. Build with `bun run build`.
3. Publish the `dist/` directory.

The production site origin is configured in `astro.config.ts`:

```js
site: "https://thephilosophersmeme.com";
```

`public/CNAME`, `public/robots.txt`, and `public/favicon.svg` are copied into
the built site.
