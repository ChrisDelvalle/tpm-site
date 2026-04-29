# Migration Completion Plan

This document tracks the remaining work to finish the Jekyll-to-Astro migration
and remove files, scripts, metadata, and compatibility code that are not part of
the final Astro project.

The goal is not a permanent compatibility layer. The goal is a simple Astro site
where article authors only add Markdown or MDX files and the codebase remains
small, typed, and predictable.

## Desired End State

- Add `src/content/articles/<category>/<slug>.md` to publish a plain Markdown
  article.
- Add `src/content/articles/<category>/<slug>.mdx` to publish an article that
  uses components.
- Add `src/content/categories/<category>.json` or
  `src/content/categories/<category>.md` only when a category needs explicit
  display metadata such as label, order, or description.
- Keep article authors out of `src/pages`, `src/layouts`, `src/lib`, and
  `src/components` unless they are intentionally changing site code or adding
  reusable components.
- Keep public article URLs as `/articles/:slug/`.
- Keep category URLs as `/categories/:category/` in the final route model.
- Prefer frontmatter metadata for article-specific metadata and publishing
  state, but do not use `slug` or `category` frontmatter.
- Use the article filename stem as the article slug.
- Treat the first folder under `src/content/articles/` as the article category,
  but not as part of the public article URL.
- Keep static public assets under `public/`.
- Keep optimized component-only images under `src/assets/` if Astro image
  processing is desired.
- Remove root-level Jekyll files and duplicate static asset roots once the
  Astro equivalents are authoritative.

`docs/` has been removed from the active content model. Article source lives in
`src/content/articles/`, and Markdown page source lives in
`src/content/pages/`.

## Astro Conventions Cross-Check

Astro's content collection `glob()` loader can load Markdown and MDX from local
directories using a configured `base`, and generated entry IDs can come from
filenames by default. That means the final site does not need a sync script or a
legacy mirror just to read article files.

The intended convention for this project is:

- define content collections in `src/content.config.ts`;
- load local Markdown/MDX with a `glob()` loader whose base is
  `./src/content/articles` and whose pattern is `**/*.{md,mdx}`;
- use the exact filename stem as the article slug;
- avoid Astro's reserved `slug` frontmatter field entirely;
- validate article slugs and category folder names instead of silently
  slugifying user input;
- use the first source folder under `src/content/articles/` as the category
  source of truth;
- keep category folder names out of public article URLs;
- use Zod schemas to validate frontmatter and make invalid content fail before
  production;
- render articles with Astro layouts and `render(entry)`;
- keep static files that must be served by URL in `public/`.

Astro's built-in `glob()` loader returns slugified IDs by default, and Astro
also reserves the `slug` frontmatter field as a per-entry ID override. Because
this project wants filename-only slug behavior and does not want to rely on a
reserved frontmatter field, final routing should configure `generateId`
intentionally so `entry.id` is always the exact filename stem. This is not legacy
logic; it is a small explicit project convention that makes the authoring model
predictable.

## Conventional Astro Target Structure

The final structure should look like a regular Astro content site:

```text
src/
  components/          Reusable UI/components used by pages, layouts, and MDX.
  content.config.ts    Content collections and Zod schemas.
  content/
    articles/          Author-facing Markdown and MDX article source.
      history/
        example.md
    categories/        Optional category metadata collection.
  layouts/             Shared page and article shells.
  lib/                 Small typed helpers for content queries and URLs.
  pages/               File-based routes and dynamic collection routes.
    articles/
      index.astro
      [...slug].astro
    categories/
      index.astro
      [category].astro
public/                Static files served exactly by URL.
```

Conventional Astro behavior to preserve:

- `src/pages` creates routes.
- `src/content` stores related content collections and does not create routes by
  itself.
- Dynamic routes under `src/pages` generate article and category pages from
  collections.
- Markdown/MDX articles use frontmatter for metadata and the shared article
  layout for rendering.
- Normal article authoring should not require editing route files, layout files,
  helper code, generated mirrors, or category registries.

## Non-Negotiable Invariants

- Article body content must remain intact.
- Existing article metadata values must remain intact, even when legacy field
  names are normalized.
- Legacy `permalink` values must be preserved as data, preferably under
  `legacyPermalink`, but they must not drive Astro routing or article
  classification.
- Existing unpublished content must remain unpublished during and after cleanup.
- Public article URLs must remain `/articles/:slug/`.
- Category URLs should use `/categories/:category/` in the final route model.
- Redirect handling for old dated URLs belongs outside core article rendering.
  Cloudflare is the primary owner. Any in-repo fallback must be isolated from
  article, category, and content-source logic.
- New article authors should not need to understand Astro internals, route
  helpers, generated mirrors, or legacy Jekyll fields.

## Current Legacy Support Inventory

These items currently exist because the first Astro migration preserved
Jekyll-shaped content before normalizing the project.

- `scripts/sync-content.mjs`
  - Copies article files from `src/content/articles/` into generated
    `src/content/legacy/`.
  - Converts `.markdown` files to `.md` if any remain.
  - Removes duplicate top-level frontmatter keys by keeping the last key.

- `src/content/legacy/`
  - Generated content mirror used by Astro content collections.
  - Ignored by git.
  - Exists only because the first migration did not load directly from the
    source article tree.

- `package.json`
  - `sync:content` script.
  - `dev`, `build`, `typecheck`, `verify:content`, and `check` run
    `sync:content` before using content.

- `src/content.config.ts`
  - Collection is named `legacyMarkdown`.
  - Collection base points at `./src/content/legacy`.
  - `generateId` derives IDs from old dated `permalink` values when possible.
  - Fallback ID logic strips leading dates from filenames.
  - Schema accepts many loose Jekyll-era frontmatter fields.

- `src/lib/routes.ts`
  - `LegacyEntry` type name.
  - `sourceFolder()` parses generated paths under `src/content/legacy/`.
  - `articleSlug()` prefers legacy dated `permalink` slug.
  - `articleSlug()` still contains fallback date-prefix stripping for old
    filenames, even though article filenames are now clean.
  - `isDatedPermalink()` classifies articles by old Jekyll permalink shape.
  - `isArticle()` depends on dated `permalink`, not file location.
  - `TOPICS` hard-codes all category folders, labels, slugs, and order while
    the UI still uses topic naming.

- `src/lib/content.ts`
  - Queries `legacyMarkdown`.
  - Article lookup and sorting depend on legacy-normalized entries.

- Page and layout files
  - Several files use `article.id` as the public slug because IDs are currently
    massaged by legacy slug logic.
  - These should use explicit route helpers after IDs become direct source
    paths.

- `astro.config.mjs`
  - Markdown/rehype transforms remove `{{ site.baseurl }}` at render time.
  - Markdown/rehype transforms rewrite legacy `/glossary/` links to the current
    glossary article.
  - Raw HTML cleanup exists to tolerate Jekyll-era content.

- `scripts/verify-content.mjs`
  - Validates generated `src/content/legacy/`.
  - Treats dated `permalink` as article classification.
  - Hard-codes current category folder names.

- `scripts/verify-build.mjs`
  - Allows old dated internal links as redirect candidates.
  - Checks for Liquid artifacts in built output.
  - Hard-codes the current expected article count.

- `README.md`
  - Still describes the temporary legacy workflow.
  - Must be updated after the final content loader lands so authors only see
    the `src/content/articles/<category>/<slug>.md` or `.mdx` workflow.

- Current source content
  - Article files now live under `src/content/articles/<category>/` with clean
    `.md` filenames.
  - The about page now lives under `src/content/pages/about.md`.
  - Unused Jekyll-era category index pages, the dialogues page, and
    `docs/tree.txt` have been removed.
  - `docs/` has been removed.

## Current Content Survey

This survey describes what must be normalized before the project can follow
plain Astro conventions.

- Source files:
  - 61 article `.md` files under `src/content/articles/`.
  - 1 page `.md` file under `src/content/pages/`.
  - 0 current article files use `.mdx`.

- Article classification:
  - 61 files have dated legacy `permalink` values and are currently treated as
    articles.
  - Article classification must move from dated `permalink` to the
    `src/content/articles/` collection itself.

- Article frontmatter keys currently present:
  - Present on all 61 articles: `title`, `date`, `author`, `nav_order`,
    `permalink`.
  - Present on most articles: `layout` 60, `parent` 60, `excerpt` 57,
    `image` 51.
  - Legacy/mixed-source fields: `tags` 46, `fbpreview` 33, `status` 21,
    `type` 21, `categories` 14, `meta` 13, `banner` 5, `grand_parent` 3,
    `facebook` 2, `published` 2, `has_children` 1.
  - Duplicate top-level `layout` keys appear in 10 files and are currently
    papered over by the sync script.

- Publishing state:
  - One known unpublished article exists:
    `src/content/articles/politics/joshua-citarella-astroturfing.md`.
  - It must become `draft: true`.
  - Legacy `published: false` and `status: draft` must not survive as the final
    publishing model.

- Category metadata:
  - Current category comes from the first folder below
    `src/content/articles/`.
  - Final category should continue to come from that first folder, not
    frontmatter.
  - Existing category labels map to canonical category slugs:
    `memeculture`, `metamemetics`, `aesthetics`, `irony`, `game-studies`,
    `history`, `philosophy`, and `politics`.

- Slug preservation:
  - Article slugs now come from clean filename stems.
  - Two files already received explicit slug-preserving filenames during the
    source move:
    `misattributed-plato-quote-is-real-now` and
    `wittgensteins-most-beloved-quote-was-real-but-its-fake-now`.

- Body markup:
  - 17 files contain `{{ site.baseurl }}`.
  - 15 files contain WordPress-era classes or alignment markup.
  - 11 files contain raw `<img>` elements without `alt`.
  - Raw HTML is common: `<p>`, `<a>`, `<span>`, `<sub>`, `<img>`, `<i>`,
    `<h2>`, `<div>`, `<li>`, `<br>`, `<b>`, `<iframe>`, `<figure>`, and tables.
  - No Kramdown attribute syntax was found in the current scan.

## Target Author Frontmatter

Article frontmatter should converge to a small Astro-oriented shape:

```yaml
---
title: "Example Article"
date: 2026-04-28
author: "Author Name"
excerpt: "Optional summary."
image: "/uploads/example.png"
draft: false
legacyPermalink: "/2026/04/28/example-article/"
---
```

Required:

- `title`
- `date`

Optional:

- `author`
- `excerpt`
- `image`
- `draft`
- `legacyPermalink`

Rules:

- Category is not frontmatter. It is the first folder below
  `src/content/articles/`.
- `slug` frontmatter should not be used. Astro reserves that field for entry ID
  overrides, and this project does not need that behavior.
- The exact filename stem is the article slug.
- Filename stems must be URL-safe and unique across all articles.
- `legacyPermalink` is inert metadata. It must not affect article routing,
  category grouping, sorting, RSS, sitemap, search, or publishing.
- `draft: true` is the only final unpublished marker.
- `layout`, `parent`, `grand_parent`, `nav_order`, `has_children`,
  `permalink`, `published`, `status`, `type`, `fbpreview`, `facebook`, and
  tool-specific `meta` should be removed or migrated to one of the final fields.

Category metadata, if needed, should live in a separate collection:

```text
src/content/categories/metamemetics.json
```

```json
{
  "title": "Metamemetics",
  "order": 2,
  "description": "Optional category description."
}
```

The content collection Zod schema should validate every field in this
frontmatter shape. Filename slug validation belongs in the content verifier or
loader-level checks.

## Root And Project File Audit

This section tracks subtle files that can otherwise linger after the code paths
are migrated.

### Keep

- `package.json`, `bun.lock`
  - Bun is the package manager.

- `.node-version`
  - Useful because Astro requires Node `>=22.12.0`.

- `.editorconfig`, `.prettierrc`, `.prettierignore`,
  `.markdownlint-cli2.jsonc`, `.htmlvalidate.json`, `eslint.config.js`,
  `knip.json`, `lighthouserc.cjs`, `playwright.config.ts`,
  `tsconfig.json`, `tsconfig.tools.json`
  - Current Astro/Bun/tooling configuration.

- `.codex/config.toml`
  - Project-level Astro Docs MCP config for agent-assisted development.
  - Keep only if the project wants this repository to carry Codex-specific
    tooling. It is not required by Astro.

- `.github/workflows/ci.yml`, `.github/workflows/security.yml`, and
  `.github/dependabot.yml`
  - Keep as shared repository quality/security automation if GitHub remains the
    project host.

- `.github/ISSUE_TEMPLATE/` and `.github/release-drafter.yml`
  - Keep only if issue templates and release drafting are part of active
    project maintenance.

- `.vscode/tasks.json`
  - Optional editor convenience. Current tasks target Bun/Astro scripts.
  - Keep only if the project wants editor task configuration in git.

- `public/assets/` and `public/uploads/`
  - Required while article Markdown references `/assets/...` and `/uploads/...`.

- `public/favicon.svg`
  - Current browser tab icon.

- `public/robots.txt`
  - Keep if the deploy should publish this robots policy.

- `public/CNAME`
  - Keep only if the static host reads a `CNAME` file from built output, such as
    a GitHub Pages style deploy.
  - If hosting is fully configured through Cloudflare Pages or another host UI,
    `public/CNAME` is optional and can be removed after deploy behavior is
    confirmed.

### Remove During Cleanup

- `_config.yml`
  - Jekyll configuration; not used by Astro.

- `index.md`
  - Legacy Jekyll homepage; Astro uses `src/pages/index.astro`.

- `script/build`
  - Legacy build helper; Bun scripts are authoritative.

- root `CNAME`
  - Astro does not copy root `CNAME` to `dist/`.
  - Use `public/CNAME` if a deploy-time CNAME file is needed.
  - Do not keep both root `CNAME` and `public/CNAME` long term.

- root `assets/`
  - Legacy static asset source.
  - Remove after every required public URL asset exists under `public/assets/`
    and any `astro:assets` imports are moved to `src/assets/` or replaced with
    public URLs.

- root `uploads/`
  - Legacy static upload source.
  - Remove after every required public URL upload exists under `public/uploads/`
    and any `astro:assets` imports are moved to `src/assets/` or replaced with
    public URLs.

- `public/.gitkeep`
  - No longer needed because `public/` contains real files.

- `.env`
  - Currently only contains `ASTRO_TELEMETRY_DISABLED`.
  - Do not track environment files for this project. Put non-secret defaults in
    scripts or documentation, and ignore `.env*` except for an intentional
    `.env.example`.

- `.DS_Store`
  - Local macOS artifact. Remove from the worktree; keep ignored.

- `.devcontainer/`
  - The tracked Jekyll devcontainer files have been removed.
  - Remove any empty leftover directory from the worktree.

- `package-lock.json`
  - Removed. Do not reintroduce npm lockfiles while Bun is the package manager.

- `.stylelintrc.json`
  - Removed. Current styling checks are through Tailwind, Prettier, ESLint, and
    build/browser gates.

- Bundler/Ruby/Jekyll dependency tracking
  - Removed from active CI/dependency management. Do not reintroduce unless a
    non-Astro tool explicitly requires Ruby.

### Decide At Final Cleanup

- `LICENSE.txt`
  - Keep if it is the project license.

- `AGENTS.md`, `QUALITY_TOOLING.md`, `DESIGN_PHILOSOPHY.md`
  - Keep as active project guidance if agents/developers will use them.
  - Otherwise move durable guidance into `README.md` and remove migration-only
    commentary.

- `CHECKLIST.md`, `MIGRATION_INVENTORY.md`, `MIGRATION_COMPLETION_PLAN.md`
  - Keep until migration completion.
  - After completion, either remove them or archive a concise migration record
    under a maintenance/docs location.

## Target Content Model

### Articles

Article files live in Astro's conventional content directory:

```text
src/content/articles/<category>/<slug>.md
src/content/articles/<category>/<slug>.mdx
```

The exact filename stem is the article slug. For example:

```text
src/content/articles/metamemetics/vulliamy-response.md
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
excerpt: "Optional summary."
image: "/uploads/example.png"
draft: false
legacyPermalink: "/2026/04/28/example-article/"
---
```

`legacyPermalink` is preserved for historical reference and redirect generation,
but it does not decide the article slug, route, category, or published status.

Normal article authors should not use `slug` or `category` frontmatter. If the
desired public URL changes, rename the file. If the article category changes,
move the file to the correct category folder.

In implementation, use `entry.id` as the route slug. The collection loader
should make `entry.id` equal to the exact filename stem.

Use `draft: true` for unpublished articles. Legacy `published: false` and
`status: draft` values must be migrated or supported during transition so no
existing draft is accidentally published.

### Categories

Article categories come from the first source folder below
`src/content/articles/`:

```text
src/content/articles/metamemetics/vulliamy-response.md
```

The category folder name is a canonical slug. It is used for filtering,
category pages, RSS metadata, search metadata, and navigation.

Optional category metadata can live in a separate collection:

```text
src/content/categories/metamemetics.json
```

```json
{
  "title": "Metamemetics",
  "order": 2,
  "description": "Optional category description."
}
```

If no category metadata file exists, the site can derive a display label from
the category slug. If curated ordering matters, category metadata should be
required for all public categories.

### Reserved Content Areas

Reserved folders are mostly a migration concern. In the final flat article
collection, `notes` should not sit beside article category folders unless it is
a separate collection.

- `docs/notes/`

If these remain public, migrate them to explicit pages under `src/pages/` or to
dedicated content collections. If they are not public, remove them from the
active content model.

## Redirect Separation

Cloudflare owns the canonical one-time redirect configuration:

```text
/:year/:month/:day/:slug/ -> /articles/:slug/
```

The Astro app should not let old URL handling complicate article routing.

If in-repo fallback redirect pages are added, they must live in a dedicated
module or script. That fallback must:

- read `legacyPermalink` metadata separately from article routing;
- emit redirects only;
- not affect article slug generation;
- not affect category discovery;
- not affect authoring instructions.

## Work Tracker

### Milestone 1: Finish MDX And Component Support

- [x] Add `@astrojs/mdx`.
- [x] Register `mdx()` in `astro.config.mjs`.
- [ ] Add `@astrojs/react`, `react`, `react-dom`, `@types/react`, and
      `@types/react-dom` if MDX articles need React components rather than
      Astro-only components.
- [ ] Register `react()` in `astro.config.mjs` if React is added.
- [ ] Update TypeScript config for React JSX only if React is added.
- [ ] Add or document a small example MDX article using an Astro or React
      component.
- [ ] Verify `.md` and `.mdx` articles render through the same article layout.

### Milestone 2: Normalize Existing Content Files

- [x] Create `src/content/articles/` as the final article collection.
- [x] Move article files from `docs/` into `src/content/articles/`.
- [ ] Keep `docs/` only until `docs/notes/about.md` has a final destination.
- [x] Rename existing article files from dated `.markdown` filenames to clean
      `.md` filenames.
- [x] Use the final desired article URL slug as the filename stem.
- [x] Keep article body content unchanged.
- [x] Remove transitional `topic` frontmatter from article files.
- [ ] Rename legacy `permalink` frontmatter to `legacyPermalink` without losing
      values.
- [ ] Normalize unpublished article metadata to `draft: true`.
- [ ] Confirm any legacy `published: false` or `status: draft` article remains
      excluded from production output.
- [ ] Clean duplicate frontmatter keys once so the sync script is no longer
      needed.
- [ ] Remove Jekyll/Siteleaf/WordPress-only frontmatter fields after their data
      has either been migrated or intentionally dropped.
- [ ] Convert author objects to the final author representation.
- [ ] Decide whether category metadata files become
      `src/content/categories/*.json` or `src/content/categories/*.md`.
- [ ] Move `docs/notes/about.md` to an explicit page or page content source.
- [x] Remove unused Jekyll-era category index pages.
- [x] Remove unused legacy dialogues content.
- [x] Remove `docs/tree.txt`; it is not final article content.

Known filename decisions where the legacy `permalink` slug is clearer than the
old dated filename stem:

```text
src/content/articles/history/misattributed-plato-quote-is-real-now.md
```

```text
src/content/articles/history/wittgensteins-most-beloved-quote-was-real-but-its-fake-now.md
```

### Milestone 3: Load Content Directly From The Article Source Tree

- [ ] Change the content collection base from `./src/content/legacy` to
      `./src/content/articles`.
- [ ] Rename the collection from `legacyMarkdown` to `articles`.
- [ ] Load `**/*.{md,mdx}` directly.
- [ ] Remove custom ID generation based on dated `permalink`.
- [ ] Implement loader ID generation so `entry.id` resolves to the exact
      filename stem.
- [ ] Validate slug uniqueness across all articles.
- [ ] Validate filename stems as URL-safe values.
- [ ] Validate category folder names as URL-safe values.
- [ ] Add an optional `categories` content collection if curated category
      display data is needed.
- [ ] Replace the loose legacy schema with the final Zod schema.
- [ ] Define the final author-facing fields clearly: required `title` and
      `date`; optional `author`, `excerpt`, `image`, `draft`, and
      `legacyPermalink`.

### Milestone 4: Simplify Article And Category Logic

- [ ] Replace hard-coded `TOPICS` with category discovery from article source
      folders plus optional category metadata.
- [ ] Derive category slug from the first folder below `src/content/articles/`.
- [ ] Derive category label from category metadata or from the category slug.
- [ ] Derive article slug from `entry.id`, with loader behavior documented as
      exact filename stem only.
- [ ] Define `isArticle()` as "entry from the `articles` collection."
- [ ] Stop using `permalink` for article detection.
- [ ] Filter production articles with `draft !== true`.
- [ ] Keep temporary compatibility for legacy `published: false` and
      `status: draft` until frontmatter is normalized.
- [ ] Stop stripping dates from filenames in runtime logic.
- [ ] Stop parsing `src/content/legacy/` paths.
- [ ] Rename `LegacyEntry` and `getLegacyEntries()` to neutral names.
- [ ] Update all page/layout references to use route helpers rather than
      assuming legacy-normalized IDs.
- [ ] Keep global slug uniqueness checks because article URLs are
      `/articles/:slug/`.
- [ ] Rename user-facing route and helper language from topics to categories.

### Milestone 5: Remove The Sync Layer

- [ ] Delete `scripts/sync-content.mjs`.
- [ ] Remove `sync:content` from `package.json`.
- [ ] Remove `sync:content` from `dev`, `build`, `typecheck`,
      `verify:content`, and `check` scripts.
- [ ] Remove `src/content/legacy` from active documentation.
- [ ] Remove `src/content/legacy` ignore entries once it is no longer generated.

### Milestone 6: Clean Legacy Markup At The Source

- [ ] Replace `{{ site.baseurl }}` references in article source with
      root-relative paths.
- [ ] Replace legacy `/glossary/` links with `/articles/glossary-1-dot-0/`.
- [ ] Convert simple raw HTML paragraphs, emphasis, bold text, lists, headings,
      blockquotes, and links to Markdown where doing so is mechanically safe.
- [ ] Keep complex raw HTML only where it expresses behavior Markdown cannot
      express cleanly, such as iframes, complex tables, or intentional custom
      image/link structures.
- [ ] Add missing `alt` text or convert raw `<img>` tags to Markdown image
      syntax where safe.
- [ ] Remove WordPress-era classes and alignment markup when equivalent
      Markdown or site-level prose styling can replace it.
- [ ] Remove render-time Jekyll/Liquid cleanup transforms from
      `astro.config.mjs` after source cleanup is complete.
- [ ] Keep the build verifier checking for Liquid artifacts.

### Milestone 7: Normalize Static Assets

- [ ] Decide the final source of truth for static URL assets:
      `public/assets/` and `public/uploads/`.
- [ ] Verify `public/assets/` contains every referenced `/assets/...` file.
- [ ] Verify `public/uploads/` contains every referenced `/uploads/...` file.
- [ ] Move homepage/design images currently imported from root `assets/` and
      root `uploads/` into `src/assets/` if they should be optimized by
      `astro:assets`.
- [ ] Replace any remaining root `assets/` or root `uploads/` imports.
- [ ] Remove root `assets/`.
- [ ] Remove root `uploads/`.
- [ ] Remove `public/.gitkeep`.
- [ ] Keep `public/favicon.svg` as the authoritative favicon unless replaced.
- [ ] Decide whether `public/CNAME` is required by the deploy host.
- [ ] Remove root `CNAME`.

### Milestone 8: Remove Jekyll And Non-Astro Leftovers

- [ ] Remove root `_config.yml`.
- [ ] Remove root `index.md`.
- [ ] Remove `script/build`.
- [ ] Remove tracked `.env`; encode non-secret defaults in scripts/docs instead.
- [ ] Add `.env*` to `.gitignore`, with an exception only for an intentional
      `.env.example`.
- [ ] Remove local `.DS_Store`.
- [ ] Remove any empty `.devcontainer/` directory from the worktree.
- [ ] Confirm `package-lock.json` stays removed.
- [ ] Confirm `.stylelintrc.json` stays removed.
- [ ] Confirm Bundler/Ruby/Jekyll dependency tracking stays removed.
- [ ] Decide whether `.codex/config.toml` and `.vscode/tasks.json` are desired
      project tooling or should remain local-only.

### Milestone 9: Update Verification And Documentation

- [ ] Update `scripts/verify-content.mjs` for the final content model.
- [ ] Update `scripts/verify-build.mjs` for the final route and asset model.
- [ ] Keep checks for expected article count, required representative pages,
      broken internal links, and Liquid artifacts.
- [ ] Separate redirect-candidate reporting from core link checking.
- [ ] Update `README.md` so article authors only see the simple workflow.
- [ ] Document MDX usage and where reusable components should live.
- [ ] Document category assignment through the first folder below
      `src/content/articles/`.
- [ ] Document category metadata under `src/content/categories/` if that
      collection is added.
- [ ] Document reserved folders or confirm none remain.
- [ ] Document deploy output as `dist/`.
- [ ] Remove or archive migration-only docs after the migration is complete.

## Files To Review During Completion

Core implementation:

```text
package.json
bun.lock
astro.config.mjs
tsconfig.json
tsconfig.tools.json
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
scripts/verify-content.mjs
scripts/verify-build.mjs
tests/
```

Content and public assets:

```text
docs/
src/content/articles/
src/content/categories/
src/content/legacy/
public/assets/
public/uploads/
public/CNAME
public/favicon.svg
public/robots.txt
src/assets/
```

Root and hidden cleanup:

```text
.codex/config.toml
.devcontainer/
.DS_Store
.env
.gitignore
.node-version
.vscode/tasks.json
_config.yml
index.md
script/build
CNAME
assets/
uploads/
public/.gitkeep
package-lock.json
.stylelintrc.json
.github/ISSUE_TEMPLATE/
.github/release-drafter.yml
.github/dependabot.yml
```

Documentation:

```text
README.md
AGENTS.md
CHECKLIST.md
DESIGN_PHILOSOPHY.md
QUALITY_TOOLING.md
MIGRATION_INVENTORY.md
MIGRATION_COMPLETION_PLAN.md
```

## Validation Checklist

- [ ] `bun run fix` makes no unintended article body changes.
- [ ] `bun run check` passes.
- [ ] `bun run build` passes.
- [ ] `bun run verify` passes.
- [ ] `bun run validate:html` passes.
- [ ] Browser tests pass when a preview server can bind locally.
- [ ] Article count remains correct.
- [ ] All final article source files live under `src/content/articles/`.
- [ ] No final article source files use `.markdown` extensions.
- [ ] No final article source filenames contain legacy date prefixes unless the
      date is intentionally part of the title slug.
- [ ] No final article frontmatter contains `layout`, `parent`,
      `grand_parent`, `nav_order`, `has_children`, `permalink`, `published`,
      `status`, `type`, `fbpreview`, `facebook`, or tool-specific `meta`.
- [ ] The Zod schema validates final article metadata.
- [ ] No final article uses `slug` frontmatter.
- [ ] No final article uses `category` or `topic` frontmatter.
- [ ] `draft: true` articles are excluded from article indexes, categories, RSS,
      sitemap, search, and generated pages.
- [ ] Existing public `/articles/:slug/` routes remain stable.
- [ ] Category pages render the same article groupings.
- [ ] Category groupings come from the first folder below
      `src/content/articles/`, not frontmatter or Jekyll `parent`.
- [ ] RSS uses `/articles/:slug/` URLs.
- [ ] Sitemap uses `/articles/:slug/` URLs.
- [ ] Pagefind indexes article bodies.
- [ ] No `{{ site.baseurl }}` or Liquid syntax appears in built output.
- [ ] Runtime route/content helpers do not inspect `legacyPermalink`.
- [ ] `scripts/sync-content.mjs` and `src/content/legacy/` are gone.
- [ ] Old dated URLs are either covered by Cloudflare or by an isolated fallback
      redirect layer.
- [ ] No root Jekyll files remain.
- [ ] No duplicate root/public asset trees remain.
- [ ] No tracked local environment or OS artifact files remain.

## Current Assumptions

- Cloudflare will be the primary redirect layer for old dated URLs.
- In-repo redirects, if added, are fallback infrastructure and not part of core
  content routing.
- Existing articles should become `.md`, not `.mdx`.
- Future articles can use `.mdx` when they need components.
- The final author-facing article source is `src/content/articles/`.
- The final article route slug is `entry.id`, configured to match the exact
  filename stem.
- `slug` frontmatter should not be used.
- New unpublished articles should use `draft: true`.
- The maintainer should never edit route, layout, helper, or app component code
  to add a normal article. Normal article work should stay in
  `src/content/articles/`.
- A new category should not require editing a hard-coded category list.
- Categories come from article source folders. Optional category metadata is
  only for labels, order, and descriptions.
- Root `CNAME` should be removed; `public/CNAME` is deploy-host dependent.
- Root `assets/` and `uploads/` should not survive as permanent duplicates.

## Open Decisions

- Whether optional category metadata should use JSON or Markdown files under
  `src/content/categories/`.
- Whether authors should be a simple string field, a structured object, or a
  separate collection.
- Whether legacy HTML cleanup should be mostly scripted, mostly manual, or a
  scripted pass followed by review.
- Whether the site should keep an in-repo fallback redirect route in addition to
  Cloudflare.
- Whether `.codex/config.toml` and `.vscode/tasks.json` are desired shared
  project tooling or local-only preferences.
- Whether `public/CNAME` is required by the final host.
