# Active Checklist

This file tracks active work and recent implementation context only. Deferred
or non-current work belongs in [DEFERRED.md](./DEFERRED.md) so the checklist
stays usable.

Older completed milestones were intentionally removed from this active working
file. The durable architecture, design, and implementation rationale lives in
`agent-docs/`, `docs/`, source tests, and git history.

## Working Rules

- Keep this file focused on work that is active, imminent, or recently
  completed enough to preserve context.
- Move postponed work to `DEFERRED.md` with a resume trigger instead of leaving
  stale unchecked milestones here.
- Move deferred work back into this file before implementation begins.
- Add or update design docs before implementing new components, substantial
  layout behavior, or non-component technical systems.
- Verify each milestone before marking it complete.
- Do not edit `src/content/articles/` unless the current task explicitly asks
  for article-content changes.

### Milestone 1: Tag Pages And Taxonomy Design

- [ ] Create or update design docs for tag pages and the shared term-listing
      abstraction that can support both categories and tags without bespoke
      page layouts.
- [ ] Document the canonical tag model: tags are lowercase display labels,
      whitespace is trimmed and collapsed, duplicates are removed after
      normalization, and `/` is rejected instead of encoded.
- [ ] Document the URL contract: `/tags/` lists all tags, `/tags/[tag]/` shows
      the article directory for one encoded canonical tag, and tag links use
      `encodeURIComponent(normalizedTag)`.
- [ ] Define how article-end tag links, footer navigation, SEO, sitemap,
      Pagefind/search, and empty or unknown tag states should behave.
- [ ] Define the required unit, render, accessibility, browser, and catalog
      tests before implementation begins.

### Milestone 2: Tag Normalization And Enforcement

- [ ] Add programmatic tag normalization tooling that can clean current article
      frontmatter in a deterministic way when article-content edits are
      explicitly in scope.
- [ ] Add content schema or verifier rules that enforce canonical tag format,
      reject slash-containing tags, and catch duplicate tags after
      normalization.
- [ ] Add tests for trimming, whitespace collapse, lowercase conversion,
      duplicate removal, slash rejection, encoded route generation, and
      deterministic sorting.
- [ ] Update author-facing documentation so writers know the accepted tag
      format without needing to think about URL slugs.

### Milestone 3: Tag Data Helpers And Shared Listing Components

- [ ] Add typed tag helpers in `src/lib/` for normalization, route generation,
      article grouping, sorting, and lookup by canonical label.
- [ ] Extract category/tag overview behavior into a shared term-listing
      component only where it reduces duplication and keeps the page anatomy
      clearer.
- [ ] Ensure the shared component supports label, count, href, current state,
      long labels, empty lists, and dense browsing pages.
- [ ] Update catalog examples for categories and tags, including long labels,
      many terms, no terms, and light/dark states.

### Milestone 4: Tag Routes And Article Links

- [ ] Add `/tags/` and `/tags/[tag]/` routes using the shared browsing layout
      and article-list components.
- [ ] Update article-end tag rendering so each tag links to its canonical tag
      page.
- [ ] Add a footer link to the tag index without crowding primary navigation.
- [ ] Ensure unknown encoded tags return the correct static behavior and do not
      create ambiguous routes.
- [ ] Add route, render, accessibility, and Playwright tests for tag index,
      tag detail, article tag links, footer navigation, and responsive layout.

### Milestone 5: Tag Feature Verification

- [ ] Run focused tag helper, schema/verifier, component, catalog, browser, and
      accessibility tests.
- [ ] Run the normal quality gate and release-oriented checks relevant to route
      generation and static output.
- [ ] Update this checklist only after verification passes or after documenting
      any explicit blocker.
