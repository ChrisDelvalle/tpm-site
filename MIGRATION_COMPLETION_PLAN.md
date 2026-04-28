# Migration Completion Plan

This document tracks the remaining work to finish the Jekyll-to-Astro migration
and remove compatibility code that exists only to support the first migration
pass.

The desired end state is simple:

- Add `docs/<topic>/<slug>.md` to publish a plain Markdown article.
- Add `docs/<topic>/<slug>.mdx` to publish an article that uses components.
- Add a new top-level folder under `docs/` to create a new topic.
- Keep article authors out of the codebase unless they are intentionally adding
  reusable components.

## Non-Negotiable Invariants

- Article body content must remain intact.
- Existing article metadata must remain intact unless a field is explicitly
  legacy-only and no longer used by Astro.
- Legacy `permalink` metadata must be preserved as data, but it must not drive
  Astro routing or article classification.
- Existing unpublished content must remain unpublished during and after the
  cleanup.
- Public article URLs must remain `/articles/:slug/`.
- Topic URLs must remain `/topics/:topic/`.
- Redirect handling for old dated URLs belongs outside core article rendering.
  The primary owner is Cloudflare. Any in-repo fallback must be isolated from
  the article/topic/content logic.

## Current Legacy Support Inventory

These items were added or retained to make the first Astro migration work with
Jekyll-shaped content.

- `scripts/sync-content.mjs`
  - Copies `docs/` into generated `src/content/legacy/`.
  - Converts `.markdown` files to `.md`.
  - Removes duplicate top-level frontmatter keys by keeping the last key.

- `src/content/legacy/`
  - Generated content mirror used by Astro content collections.
  - Ignored by git.
  - Exists only because the first migration did not load directly from `docs/`.

- `package.json`
  - `sync:content` script.
  - `dev`, `build`, and `check` all run `sync:content` first.

- `src/content.config.ts`
  - Collection is named `legacyMarkdown`.
  - Collection base points at `./src/content/legacy`.
  - `generateId` derives IDs from old dated `permalink` values when possible.
  - Fallback ID logic strips leading dates from filenames.
  - Schema accepts many loose Jekyll-era frontmatter fields.

- `src/lib/routes.ts`
  - `LegacyEntry` type name.
  - `sourceFolder()` parses paths under `/src/content/legacy/`.
  - `articleSlug()` prefers legacy dated `permalink` slug.
  - `articleSlug()` strips date prefixes from legacy filenames.
  - `isDatedPermalink()` classifies articles by old Jekyll permalink shape.
  - `isArticle()` depends on dated `permalink`, not file location.
  - `isTopicEntry()` identifies topic files by legacy permalink.
  - `TOPICS` hard-codes all topic folders, labels, slugs, and order.

- `src/lib/content.ts`
  - `getLegacyEntries()` exposes the legacy collection name.
  - Article lookup compares against `entry.id`, which currently depends on
    custom legacy ID generation.

- Page and layout files
  - Several files use `article.id` as the public slug because IDs are currently
    massaged by legacy slug logic.
  - These should use a purpose-built `articleSlug(entry)` helper after IDs
    become direct content paths.

- `astro.config.mjs`
  - Markdown/rehype transforms remove `{{ site.baseurl }}` at render time.
  - Markdown/rehype transforms rewrite legacy `/glossary/` links to the current
    glossary article.

- `scripts/verify-build.mjs`
  - Allows old dated internal links as redirect candidates.
  - Checks for Liquid artifacts in built output.
  - Hard-codes current expected article count.

- `README.md`
  - Still documents dated filenames and legacy `permalink` as part of adding an
    article.

- `docs/**/*.markdown`
  - Existing article files use Jekyll-era dated filenames and `.markdown`
    extensions.

- Root-level Jekyll leftovers
  - `_config.yml`
  - `index.md`
  - `script/build`
  - root `CNAME`
  - root `favicon.ico`
  - root `assets/`
  - root `uploads/`
  - `package-lock.json`
  - `bundler` entry in `.github/dependabot.yml`

## Target Content Model

### Articles

Article files live in topic folders:

```text
docs/<topic>/<slug>.md
docs/<topic>/<slug>.mdx
```

The filename stem is the article slug. For example:

```text
docs/metamemetics/vulliamy-response.md
```

publishes:

```text
/articles/vulliamy-response/
```

Article frontmatter controls metadata only:

```yaml
---
title: "Example Article"
date: 2026-04-28
author: "Author Name"
topic: "Metamemetics"
excerpt: "Optional summary."
draft: true
permalink: /2026/04/28/example-article/
---
```

`permalink` is preserved for historical reference and redirect generation, but
it does not decide the article slug, route, topic, or published status.

Use `draft: true` for unpublished articles. This follows Astro's documented
content collection pattern: the site filters draft entries out when generating
production routes. Legacy `published: false` and `status: draft` values should
be migrated or supported during transition so no existing draft is accidentally
published.

### Topics

Topic folders live directly under `docs/`:

```text
docs/metamemetics/
docs/history/
docs/new-topic/
```

The folder name determines the default topic slug. The default topic label can
be derived from the folder name.

Optional topic metadata can live in a reserved file such as:

```text
docs/<topic>/index.md
```

That file is not an article. It can provide label/order/description without
requiring code changes:

```yaml
---
title: "Meme Culture"
order: 1
description: "Optional topic description."
---
```

This lets maintainers add a topic by adding a folder, while still allowing
curated labels and ordering when needed.

### Reserved Content Areas

Some top-level folders are not article topics and should be explicitly reserved:

- `docs/notes/`
- `docs/dialogues/` if it remains non-article content

Reserved folders should be documented in one place and excluded from topic
generation.

## Redirect Separation

Cloudflare owns the canonical one-time redirect configuration:

```text
/:year/:month/:day/:slug/ -> /articles/:slug/
```

The Astro app should not let old URL handling complicate article routing.

If in-repo fallback redirect pages are added, they should be generated in a
dedicated module or script, for example:

```text
src/pages/[year]/[month]/[day]/[slug].astro
```

or a generated redirects artifact. That fallback must:

- read legacy `permalink` metadata separately from article routing;
- emit redirects only;
- not affect article slug generation;
- not affect topic discovery;
- not affect authoring instructions.

## Work Tracker

### Milestone 1: Add MDX And React Support

- [ ] Add `@astrojs/mdx`.
- [ ] Add `@astrojs/react`, `react`, `react-dom`, `@types/react`, and
      `@types/react-dom`.
- [ ] Register `mdx()` and `react()` in `astro.config.mjs`.
- [ ] Update `tsconfig.json` for React JSX.
- [ ] Add or document a small example MDX article using an Astro or React
      component.
- [ ] Verify `.md` and `.mdx` articles render through the same article layout.

### Milestone 2: Normalize Existing Content Files

- [ ] Rename existing article files from dated `.markdown` filenames to clean
      `.md` filenames.
- [ ] Preserve current public slugs when filename slug differs from legacy
      `permalink` slug.
- [ ] Keep article body content unchanged.
- [ ] Keep legacy `permalink` frontmatter intact as metadata.
- [ ] Add explicit `topic` frontmatter derived from the current topic folder if
      articles move into a flat `src/content/articles/` collection.
- [ ] Normalize unpublished article metadata to `draft: true`.
- [ ] Confirm any legacy `published: false` or `status: draft` article remains
      excluded from production output.
- [ ] Clean duplicate frontmatter keys once so the sync script is no longer
      needed.
- [ ] Decide whether topic metadata files become `docs/<topic>/index.md`.
- [ ] Remove or regenerate `docs/tree.txt`.

Known slug-preservation exceptions:

```text
docs/history/2015-08-19_misattributed-plato-quote.markdown
-> docs/history/misattributed-plato-quote-is-real-now.md
```

```text
docs/history/2022-04-06_wittgensteins-most-beloved-quote-was-fake-but-its-real-now.markdown
-> docs/history/wittgensteins-most-beloved-quote-was-real-but-its-fake-now.md
```

### Milestone 3: Load Content Directly From `docs/`

- [ ] Change the content collection base from `./src/content/legacy` to
      `./docs`.
- [ ] Rename the collection from `legacyMarkdown` to a neutral name such as
      `content` or `documents`.
- [ ] Load `**/*.{md,mdx}`.
- [ ] Remove custom ID generation based on dated `permalink`.
- [ ] Make collection IDs reflect source paths under `docs/`.
- [ ] Keep schema loose enough to preserve old metadata, but make the future
      required fields clear for authors.

### Milestone 4: Simplify Article And Topic Logic

- [ ] If articles move to a flat `src/content/articles/` folder, derive topic
      pages from `topic` frontmatter instead of folder paths.
- [ ] If topic folders remain, replace hard-coded `TOPICS` with topic discovery
      from content folders.
- [ ] Add one reserved-folder list only if folder-based topics remain.
- [ ] Derive topic slug from `topic` frontmatter or folder name, depending on
      the chosen content structure.
- [ ] Derive topic label from `topic` frontmatter, optional metadata, or folder
      name.
- [ ] Derive article slug from filename stem.
- [ ] Define `isArticle()` as "content file under a topic folder, excluding
      reserved topic metadata files."
- [ ] Stop using `permalink` for article detection.
- [ ] Filter production articles with `draft !== true`.
- [ ] Keep temporary compatibility for legacy `published: false` and
      `status: draft` until content frontmatter is normalized.
- [ ] Stop stripping dates from filenames in runtime logic.
- [ ] Stop parsing `/src/content/legacy/` paths.
- [ ] Rename `LegacyEntry` and `getLegacyEntries()` to neutral names.
- [ ] Update all page/layout references to use `articleSlug(entry)` instead of
      assuming `entry.id` is the URL slug.
- [ ] Keep global slug uniqueness checks because article URLs are
      `/articles/:slug/`.

### Milestone 5: Remove The Sync Layer

- [ ] Delete `scripts/sync-content.mjs`.
- [ ] Remove `sync:content` from `package.json`.
- [ ] Remove `sync:content` from `dev`, `build`, and `check` scripts.
- [ ] Remove `src/content/legacy` from active documentation.
- [ ] Keep `src/content/legacy` ignored if desired, but it should no longer be
      generated or referenced.

### Milestone 6: Clean Legacy Markup At The Source

- [ ] Replace `{{ site.baseurl }}` references in `docs/` with root-relative
      paths.
- [ ] Replace legacy `/glossary/` links in `docs/` with
      `/articles/glossary-1-dot-0/`.
- [ ] Remove render-time Jekyll/Liquid cleanup transforms from
      `astro.config.mjs` after source cleanup is complete.
- [ ] Keep the build verifier checking for Liquid artifacts.

### Milestone 7: Remove Jekyll And Tooling Leftovers

- [ ] Remove root `_config.yml`.
- [ ] Remove root `index.md`.
- [ ] Remove `script/build`.
- [ ] Remove root `CNAME` after confirming `public/CNAME` is authoritative.
- [ ] Remove root `favicon.ico` after confirming `public/favicon.ico` or
      `public/favicon.svg` is authoritative.
- [ ] Remove root `assets/` after confirming `public/assets/` contains every
      referenced asset.
- [ ] Remove root `uploads/` after confirming `public/uploads/` contains every
      referenced upload.
- [ ] Remove `package-lock.json` if Bun is the only supported package manager.
- [ ] Remove the `bundler` block from `.github/dependabot.yml`.

### Milestone 8: Update Verification And Documentation

- [ ] Update `scripts/verify-build.mjs` for the new content model.
- [ ] Keep checks for expected article count, required representative pages,
      broken internal links, and Liquid artifacts.
- [ ] Separate redirect-candidate reporting from core link checking.
- [ ] Update `README.md` so article authors only see the simple workflow.
- [ ] Document MDX usage and where reusable components should live.
- [ ] Document topic creation through `docs/<topic>/`.
- [ ] Document reserved folders.
- [ ] Document deploy output as `dist/`.

## Files To Review During Completion

Core implementation:

```text
package.json
bun.lock
astro.config.mjs
tsconfig.json
src/content.config.ts
src/lib/routes.ts
src/lib/content.ts
src/layouts/ArticleLayout.astro
src/layouts/BaseLayout.astro
src/pages/articles/[...slug].astro
src/pages/articles/index.astro
src/pages/topics/[topic].astro
src/pages/topics/index.astro
src/pages/feed.xml.ts
src/pages/index.astro
src/pages/about.astro
scripts/verify-build.mjs
```

Content and docs:

```text
docs/
docs/tree.txt
README.md
CHECKLIST.md
MIGRATION_INVENTORY.md
```

Legacy cleanup:

```text
scripts/sync-content.mjs
_config.yml
index.md
script/build
CNAME
favicon.ico
assets/
uploads/
public/assets/
public/uploads/
package-lock.json
.github/dependabot.yml
```

## Validation Checklist

- [ ] `bun run check` passes.
- [ ] `bun run build` passes.
- [ ] `bun run verify` passes.
- [ ] Article count remains correct.
- [ ] Existing public `/articles/:slug/` routes remain stable.
- [ ] Topic pages render the same article groupings.
- [ ] RSS uses `/articles/:slug/` URLs.
- [ ] Sitemap uses `/articles/:slug/` URLs.
- [ ] Pagefind indexes article bodies.
- [ ] No `{{ site.baseurl }}` or Liquid syntax appears in built output.
- [ ] Old dated URLs are either covered by Cloudflare or by an isolated fallback
      redirect layer.

## Current Assumptions

- Cloudflare will be the primary redirect layer for old dated URLs.
- In-repo redirects, if added, are fallback infrastructure and not part of core
  content routing.
- Existing articles should become `.md`, not `.mdx`.
- Future articles can use `.mdx` when they need components.
- New unpublished articles should use `draft: true`.
- The maintainer should never edit `src/` to add a normal article.
- A new topic should not require editing a hard-coded topic list.

## Open Decisions

- Whether topic metadata should use `docs/<topic>/index.md`,
  `docs/<topic>/_topic.md`, or no explicit metadata file.
- Whether articles should live in a flat `src/content/articles/` collection with
  explicit `topic` frontmatter, or continue using topic folders.
- Whether the site should keep an in-repo fallback redirect route in addition to
  Cloudflare.
- Whether `docs/dialogues/` should become a normal topic, remain reserved, or be
  removed from active content.
