# The Philosopher's Meme

Astro site for The Philosopher's Meme, migrated from the original Jekyll site.

The source-of-truth article content lives in
`src/content/articles/<category>/`. During the migration, Astro still reads a
generated mirror in `src/content/legacy/`, which is recreated by the sync script
and should not be edited by hand.

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

Run the normal local validation used before opening a PR:

```sh
bun run check
bun run build
bun run verify
```

Run safe automatic fixes before checking code or config changes:

```sh
bun run fix
```

Check formatting without writing files:

```sh
bun run format
```

Run the heavier pre-release gate:

```sh
bun run check:release
```

`check:release` includes browser, accessibility, Lighthouse, coverage, audit,
and secrets checks. The secrets check expects the `gitleaks` binary to be
available locally.

## How The Content Pipeline Works

Article Markdown and MDX live in `src/content/articles/<category>/`.

Legacy non-article Markdown still lives in `docs/` until those pages have a
final Astro destination.

Before `dev`, `check`, and `build`, the project runs:

```sh
bun run sync:content
```

That script copies article files from `src/content/articles/` and legacy
non-article files from `docs/` into `src/content/legacy/`. It also converts any
remaining `.markdown` filenames to `.md` and normalizes duplicate top-level
frontmatter keys for Astro compatibility.

Do not edit `src/content/legacy/` directly. Any changes there will be replaced
the next time content is synced.

## Adding An Article

1. Pick the category folder under `src/content/articles/`.
2. Add a URL-safe `.md` or `.mdx` file whose filename stem is the desired public
   slug.
3. Add frontmatter with `title`, `date`, and the current transitional
   `permalink`.
4. Put images or other static files under `public/assets/` or `public/uploads/`.
5. Run the validation commands.

Example:

```md
---
title: "Example Article Title"
date: 2026-04-27
author: "Author Name"
permalink: /2026/04/27/example-article-title/
excerpt: "Short summary for archive pages and feeds."
---

Article body goes here.
```

The public Astro URL will be:

```text
/articles/example-article-title/
```

During the current transition, the route slug is still read from the dated
`permalink`; keep the last permalink segment equal to the filename stem. The
planned final content loader will make the filename stem authoritative and will
preserve legacy permalink data only as inert metadata.

Do not add `slug`, `topic`, or `category` frontmatter. The category comes from
the first folder below `src/content/articles/`.

## Article Category Folders

The current navigation is still routed as topics, but article grouping is based
on the source category folder mapped in
`src/lib/routes.ts`.

Current article category folders:

- `src/content/articles/memeculture/` -> `/topics/meme-culture/`
- `src/content/articles/metamemetics/` -> `/topics/metamemetics/`
- `src/content/articles/aesthetics/` -> `/topics/aesthetics/`
- `src/content/articles/irony/` -> `/topics/irony/`
- `src/content/articles/game-studies/` -> `/topics/game-studies/`
- `src/content/articles/history/` -> `/topics/history/`
- `src/content/articles/philosophy/` -> `/topics/philosophy/`
- `src/content/articles/politics/` -> `/topics/politics/`

Topic index files such as `docs/history/history.md` are legacy non-article
source files.
Published article pages are generated from entries with dated permalinks.

## Images And Static Files

Files in `public/` are copied to the site root at build time.

Use root-relative paths in Markdown:

```md
![Alt text](/assets/example/image.png)
```

or:

```md
![Alt text](/uploads/example.png)
```

Legacy `{{ site.baseurl }}` references are stripped during Astro Markdown
rendering, and legacy `/glossary/` links are rewritten to
`/articles/glossary-1-dot-0/`.

## URLs And Redirects

Canonical article routes are:

```text
/articles/:slug/
```

Topic pages are:

```text
/topics/:topic/
```

Old dated Jekyll URLs such as:

```text
/2021/05/16/gamergate-as-metagaming/
```

are intentionally not handled by this repo. Production redirects are managed
outside the site, currently through Cloudflare.

## Search, RSS, And Sitemap

`bun run build` generates:

- static Astro pages in `dist/`
- hashed Astro-managed assets, such as CSS and any processed JavaScript, under
  `dist/_astro/`
- Pagefind search index in `dist/pagefind/`
- RSS feed at `/feed.xml`
- sitemap output through `@astrojs/sitemap`

The local dev server is for layout and content iteration. For a production-like
search check, run `bun run build` and then `bun run preview`.

## Production Output

The deployable site is the `dist/` directory produced by `bun run build`.

Astro and Vite process project CSS and normal client scripts for production:
CSS is minified and chunked, processed scripts are bundled and minified, and
emitted project assets use hashed filenames for cacheability.

Files in `public/` are copied through unchanged. Treat images, downloads,
favicons, and other public assets as production-ready before committing them.

Pagefind search assets are generated after the Astro build and live under
`dist/pagefind/`.

## Verification

`bun run verify` checks the built `dist/` output for expected pages, assets,
article count, Liquid artifacts, and broken internal links. It expects 60 article
pages in the current migration.

Run this before opening a PR:

```sh
bun run check && bun run build && bun run verify
```

## Deployment

Configure the host to:

1. Install dependencies with `bun install`.
2. Build with `bun run build`.
3. Publish the `dist/` directory.

The production site origin is configured in `astro.config.mjs`:

```js
site: "https://thephilosophersmeme.com";
```

`public/CNAME`, `public/robots.txt`, and `public/favicon.svg` are copied into
the built site.
