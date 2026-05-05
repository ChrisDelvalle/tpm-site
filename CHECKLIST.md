# Checklist

This file tracks implementation milestones. It may keep completed items when
they are useful context. Explicitly deferred work belongs in
[DEFERRED.md](./DEFERRED.md).

## Working Rules

- Move postponed work to `DEFERRED.md` with a resume trigger instead of leaving
  stale unchecked milestones here.
- Move deferred work back into this file before implementation begins.
- Add or update design docs before implementing new components, substantial
  layout behavior, or non-component technical systems.
- Verify each milestone before marking it complete.
- Do not edit `src/content/articles/` unless the current task explicitly asks
  for article-content changes.

### Milestone 1: Tag Pages And Taxonomy Design

- [x] Create or update design docs for tag pages and the shared term-listing
      abstraction that can support both categories and tags without bespoke
      page layouts.
- [x] Document the canonical tag model: tags are lowercase display labels,
      whitespace is trimmed and collapsed, duplicates are removed after
      normalization, and `/` is rejected instead of encoded.
- [x] Document the URL contract: `/tags/` lists all tags, `/tags/[tag]/` shows
      the article directory for one encoded canonical tag, and tag links use
      `encodeURIComponent(normalizedTag)`.
- [x] Define how article-end tag links, footer navigation, SEO, sitemap,
      Pagefind/search, and empty or unknown tag states should behave.
- [x] Define the required unit, render, accessibility, browser, and catalog
      tests before implementation begins.

### Milestone 2: Tag Normalization And Enforcement

- [x] Add programmatic tag normalization tooling that can clean current article
      frontmatter in a deterministic way when article-content edits are
      explicitly in scope.
- [x] Add content schema or verifier rules that enforce canonical tag format,
      reject slash-containing tags, and catch duplicate tags after
      normalization.
- [x] Add tests for trimming, whitespace collapse, lowercase conversion,
      duplicate removal, slash rejection, encoded route generation, and
      deterministic sorting.
- [x] Update author-facing documentation so writers know the accepted tag
      format without needing to think about URL slugs.

### Milestone 3: Tag Data Helpers And Shared Listing Components

- [x] Add typed tag helpers in `src/lib/` for normalization, route generation,
      article grouping, sorting, and lookup by canonical label.
- [x] Extract category/tag overview behavior into a shared term-listing
      component only where it reduces duplication and keeps the page anatomy
      clearer.
- [x] Ensure the shared component supports label, count, href, current state,
      long labels, empty lists, and dense browsing pages.
- [x] Update catalog examples for categories and tags, including long labels,
      many terms, no terms, and light/dark states.

### Milestone 4: Tag Routes And Article Links

- [x] Add `/tags/` and `/tags/[tag]/` routes using the shared browsing layout
      and article-list components.
- [x] Update article-end tag rendering so each tag links to its canonical tag
      page.
- [x] Add a footer link to the tag index without crowding primary navigation.
- [x] Ensure unknown encoded tags return the correct static behavior and do not
      create ambiguous routes.
- [x] Add route, render, accessibility, and Playwright tests for tag index,
      tag detail, article tag links, footer navigation, and responsive layout.

### Milestone 5: Build/Search/Release Route Integration

- [x] Include tag routes in Pagefind indexing, HTML validation, build-output
      verification, sitemap/static-path checks, and package script docs.
- [x] Update generated-output verification so the tag index and every generated
      tag detail page are required release artifacts.
- [x] Add tests proving release checks account for tag pages.

### Milestone 6: Tag Feature Verification

- [x] Run focused tag helper, schema/verifier, component, catalog, browser, and
      accessibility tests.
- [x] Run the normal quality gate and release-oriented checks relevant to route
      generation and static output.
- [x] Update this checklist only after verification passes or after documenting
      any explicit blocker.

### Milestone 7: Platformization Audit

- [x] Audit hard-coded site identity, content roots, asset roots, theme tokens,
      navigation, support copy, route assumptions, tooling paths, tests, docs,
      CI, and deployment assumptions that block reuse as a general blog
      platform.
- [x] Document a public platform plus separate site-instance repo strategy that
      keeps both repos manageable in one local workspace.
- [x] Identify implementation phases, high-risk proof points, and follow-up
      milestones before any migration begins.
