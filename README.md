# The Philosopher's Meme

Astro site for The Philosopher's Meme, migrated from the original Jekyll site.

The source-of-truth article content remains in `docs/`. Astro reads a generated
mirror in `src/content/legacy/`, which is recreated by the sync script and should
not be edited by hand.

## Requirements

- Bun

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

Run the full local validation used before opening a PR:

```sh
bun run check
bun run build
bun run verify
```

Format source files:

```sh
bun run format
```

## How The Content Pipeline Works

Legacy Markdown stays in `docs/`.

Before `dev`, `check`, and `build`, the project runs:

```sh
bun run sync:content
```

That script copies Markdown from `docs/` into `src/content/legacy/`, converts
`.markdown` filenames to `.md`, and normalizes duplicate top-level frontmatter
keys for Astro compatibility.

Do not edit `src/content/legacy/` directly. Any changes there will be replaced
the next time content is synced.

## Adding An Article

1. Pick the topic folder under `docs/`.
2. Add a dated Markdown file using the existing naming pattern.
3. Add frontmatter with a dated legacy permalink.
4. Put images or other static files under `public/assets/` or `public/uploads/`.
5. Run the validation commands.

Example:

```md
---
title: "Example Article Title"
date: 2026-04-27
author: "Author Name"
parent: Meme Culture
permalink: /2026/04/27/example-article-title/
excerpt: "Short summary for archive pages and feeds."
---

Article body goes here.
```

The public Astro URL will be:

```text
/articles/example-article-title/
```

The slug is taken from the dated `permalink` when possible. If no dated
permalink is present, the slug is derived from the filename with the leading date
removed.

## Topic Folders

The topic navigation is based on the folder-to-topic mapping in
`src/lib/routes.ts`.

Current topic folders:

- `docs/memeculture/` -> `/topics/meme-culture/`
- `docs/metamemetics/` -> `/topics/metamemetics/`
- `docs/aesthetics/` -> `/topics/aesthetics/`
- `docs/irony/` -> `/topics/irony/`
- `docs/game studies/` -> `/topics/game-studies/`
- `docs/history/` -> `/topics/history/`
- `docs/philosophy/` -> `/topics/philosophy/`
- `docs/politics/` -> `/topics/politics/`

Topic index files such as `docs/history/history.md` are legacy source files.
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
- Pagefind search index in `dist/pagefind/`
- RSS feed at `/feed.xml`
- sitemap output through `@astrojs/sitemap`

The local dev server is for layout and content iteration. For a production-like
search check, run `bun run build` and then `bun run preview`.

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
site: "https://thephilosophersmeme.com"
```

`public/CNAME`, `public/robots.txt`, and `public/favicon.svg` are copied into
the built site.
