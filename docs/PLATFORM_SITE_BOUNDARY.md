# Platform And Site Boundary

## Purpose

This document was the first implementation pass after
`docs/PLATFORMIZATION_AUDIT.md`. The earlier audit established that TPM should
become two products that happen to live in one repo for now:

```text
platform/
  reusable blogging engine for site owners, authors, and developers

site/
  the file-based control surface for one publication instance
```

The first pass created a real boundary by moving site-owner decisions into a
validated root-level `site/` surface while the existing Astro source layout
remained stable. The follow-up full content and asset migration is specified in
`docs/SITE_INSTANCE_MIGRATION.md`.

## Philosophical Boundary

The site and the platform have different users.

The TPM site serves readers, editors, and authors. It should be easy to navigate,
easy to edit, and hard to break. Its files should read like publication settings
and editorial content, not like framework internals.

The TPM Platform serves site owners, authors, and developers who need a robust
blogging engine. It should absorb technical complexity: routing, validation,
SEO, PDFs, feeds, search, images, citations, sharing, accessibility,
performance, and testing.

The platform succeeds when ordinary site owners do not need to understand Astro
routes, Tailwind class composition, Markdown plugin internals, PDF generation,
or social metadata to manage a site.

## Target Repo Shape

The long-term shape is:

```text
platform/
  src/
  tests/
  docs/

site/
  config/
  content/
  assets/
  public/
  docs/
```

The current in-repo shape keeps the Astro project intact while placing
site-owned files under `site/`:

```text
site/
  README.md
  config/
    site.json
  content/
  assets/
  public/
  unused-assets/

src/
  components/
  layouts/
  lib/
  pages/
```

The first full migration moved content, assets, root public files, and unused
assets into the site surface. Remaining platformization work is about making the
external-instance workflow production-ready, moving remaining site decisions
behind validated data, and removing reusable-platform dependencies on TPM asset
names. It is not about moving the live in-repo TPM corpus again.

## Import Rule

The durable import rule is:

```text
platform code must not import from site code
platform code may read validated site data through one adapter
site files must not import platform internals
```

During the in-repo transition, the adapter is `src/lib/site-config.ts`. It is the
only platform module allowed to read `site/config/site.json` directly. Components
and pages should import normalized config or helpers from the adapter, never read
site files themselves.

## Site Directory UX

The `site/` directory is the future admin UI in file form. A non-technical site
owner should be able to answer:

- where do I change the site name and description?
- where do I change support, Discord, or social links?
- where do I change header and footer navigation?
- where do I change homepage curation?
- where do I put content and images?
- what validation error tells me which file to fix?

Rules for the site surface:

- Prefer JSON, YAML, Markdown, or frontmatter-shaped data over TypeScript.
- Keep field names editorial and product-facing, not framework-facing.
- Defaults should make simple blogs work with minimal config.
- Validation errors should name the site file and field path.
- Fields should be serializable so a future GUI can read and write them.
- Avoid arbitrary functions, imports, and executable config.
- Keep advanced escape hatches explicit and documented.

## First Config Surface

`site/config/site.json` owns the site-level choices that are currently scattered
through reusable code. The implemented surface is intentionally small and
serializable:

```ts
interface SiteConfig {
  identity: {
    title: string;
    shortTitle?: string;
    description: string;
    url: string;
    language: string;
    timezone?: string;
    publisherName?: string;
  };
  routes: {
    home: string;
    articles: string;
    allArticles: string;
    announcements: string;
    authors: string;
    bibliography: string;
    categories: string;
    collections: string;
    feed: string;
    search: string;
    tags: string;
  };
  navigation: {
    primary: SiteNavigationLink[];
    footer: SiteNavigationLink[];
  };
  support: {
    patreon: SiteExternalLink & {
      compactLabel?: string;
    };
    discord: SiteExternalLink;
    block: {
      title: string;
      body: string;
    };
  };
  share: {
    xViaHandle?: string;
    threadsMention?: string;
  };
  homepage: {
    featuredCollection: string;
    startHereCollection: string;
    announcementLimit: number;
    recentLimit: number;
  };
}
```

The first implementation keeps route segments fixed in behavior even though the
paths are centralized. Arbitrary route renaming is still deferred until the
content-root and tooling migration proves stable.

## Completed Boundary Work

These values now live behind config or the site-instance resolver:

- site title, description, language, URL, and publisher name;
- Astro `site`;
- primary navigation links;
- footer navigation links;
- support link destination and labels;
- article support block title/body/CTA destinations;
- homepage hero CTA destinations;
- share attribution for X and Threads;
- article title suffixes and RSS title;
- content, assets, public files, and unused assets under `site/`;
- resolver-backed content, asset, PDF, build verification, Pagefind, HTML
  validation, and accountability paths.

## Remaining Split Work

The next implementation tranche should finish the parts that still prevent a
clean production external-instance proof:

- move legacy redirects out of `astro.config.ts` into a site-owned config file;
- move homepage collection IDs, list limits, and hero images out of platform
  imports and into validated site config/content;
- remove reusable component imports from TPM-named fallback assets;
- make built-in brand-button assets platform-owned, because those components
  are reusable platform UI rather than publication content;
- expand `tests/fixtures/site-instance/` into a minimal but complete site
  instance that can run the normal production build path with
  `SITE_INSTANCE_ROOT`;
- add a repeatable script for the external fixture build proof;
- refresh catalog and docs language so generic platform docs are not confused
  with TPM instance instructions.

Theme-token extraction remains a later platform milestone. It is important, but
it is not a blocker for proving the external instance build because the current
platform can still supply default semantic tokens.

## Component Contract

Reusable components should not know they are rendering TPM. They may render TPM
because the current site config passes TPM values.

Good platform-facing component shape:

```text
Component receives explicit props
or
Route/layout passes normalized config-derived props
```

Acceptable transition shape:

```text
Component imports siteConfig for a default prop value
```

Preferred final shape:

```text
Layout or page composes platform components with normalized site config
```

The transition shape is allowed for small leaf components such as `BrandLink`
and `SupportLink` so behavior can move to config without broad page churn. New
platform components should prefer explicit props.

## Testing Requirements

This boundary needs tests at three levels:

- Config tests: parse current TPM config, reject malformed URL/path/link fields,
  and preserve defaults.
- Helper/component tests: navigation, support, share attribution, SEO, and
  article title suffixes render from config-backed values.
- Release smoke: build/typecheck should prove the adapter works in Astro,
  tests, scripts that import Astro config, and static rendering.

The first pass should not require broad screenshot updates because rendered TPM
HTML should remain intentionally unchanged.

## Critical Review

The main risk is exposing too much low-level machinery to site owners. The site
directory should not become a dumping ground for every platform switch. Config
belongs in `site/` only when a site owner can plausibly understand and edit it.

The second risk is overgeneralizing routes and homepage layout before the core
boundary exists. The first pass centralizes fixed route paths but does not sell
route renaming as supported behavior.

The third risk is importing site config everywhere. That solves literals but
creates hidden global coupling. The adapter is acceptable as a first step, but
future milestones should move toward route/layout composition and explicit
props for reusable blocks.

The fourth risk is false confidence from helper-only external tests. A resolver
test that parses a fixture proves path math, but not Astro content loading,
Markdown image handling, Pagefind, PDF generation, or post-build optimization.
The next proof must run a real fixture build through the same build script used
by the live site.

The fifth risk is making homepage composition arbitrary too early. The homepage
should remain a small typed recipe: configured collection IDs and limits,
editor-owned collections, and page-owned hero images. A full page builder is
still intentionally out of scope.

## Implementation Milestones

The active next implementation scope is:

1. Add site-owned redirect config and load it from Astro config.
2. Extend the site config/page content model for homepage collection IDs,
   list limits, and hero image ownership.
3. Replace TPM-named platform fallback assets with generic rendered fallbacks
   or platform-owned vendor assets.
4. Expand the external fixture into a complete minimal site instance and add a
   reproducible fixture-build script.
5. Update docs/tests so platform behavior is verified against generic fixtures
   while TPM values remain in `site/`.

Later milestones should handle theme-token splitting, public/private CI
checkout orchestration, JSON Schema export, and `site:doctor` style admin UI
preparation.
