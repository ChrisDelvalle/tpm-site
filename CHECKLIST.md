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

### Milestone 8: Homepage Editorial Front Page Design

- [x] Design a denser homepage that preserves the TPM logo art while making the
      first desktop viewport answer "where should I start reading?", "what is
      current?", and "how can I support or join?".
- [x] Specify configurable homepage promo slots as author-owned Markdown files
      rather than hard-coded Astro copy.
- [x] Specify desktop, tablet, mobile, and short-viewport behavior, including
      which sections are primary and which sections may collapse or become
      secondary.
- [x] Define the component hierarchy, data model, accessibility requirements,
      performance requirements, and testable layout/content invariants before
      implementation begins.

### Milestone 9: Homepage Content Model

- [x] Add a typed `homePromos` content collection where one Markdown file owns
      one promo slot with semantic kind, link, CTA label, order, and active
      state.
- [x] Extend home page frontmatter enough to configure curated Start Here
      article IDs without adding a full CMS-style block array.
- [x] Add helper logic and tests for resolving curated article IDs, selecting
      fallback articles, sorting active promos, and rejecting stale promo
      configuration where practical.
- [x] Add initial TPM promo content for a featured article, Discord, Patreon,
      and project/forum announcement without editing article bodies.

### Milestone 10: Homepage Masthead Components

- [x] Add component docs and Astro components for the desktop three-column
      masthead: Start Here panel, compact hero, and current/community panel.
- [x] Preserve the existing logo art while bounding its desktop and mobile
      height so it acts as an identity anchor instead of a full hero section.
- [x] Ensure the masthead gives visible first-viewport reading and support paths
      without client JavaScript.
- [x] Add component/catalog tests for empty, long-content, and normal states.

### Milestone 11: Homepage Promo, Recent, And Discovery Blocks

- [x] Add component docs and Astro components for the promo rail, promo cards,
      compact most-recent posts, and thin discovery links strip.
- [x] Keep promo slots real static HTML with no auto-advancing carousel
      behavior.
- [x] Place categories before the recent article feed and keep tags out of
      homepage enumeration while linking to `/tags/` in the discovery strip.
- [x] Add component/catalog tests for active promos, multiple promos, empty
      promos, long titles, wrapping discovery links, and no-JavaScript output.

### Milestone 12: Homepage Assembly And Verification

- [x] Recompose `src/pages/index.astro` around the redesigned desktop anatomy
      and mobile ordering documented in `docs/HOMEPAGE_REDESIGN.md`.
- [x] Update homepage component docs, catalog inventory, architecture docs, and
      author-facing notes as needed.
- [x] Add or update browser/a11y/layout tests for homepage first-viewport
      links, desktop masthead columns, promo/latest split, category/discovery
      order, no tag enumeration, and no horizontal overflow.
- [x] Run focused tests, `bun run check`, relevant e2e/a11y checks, and perf
      checks before marking complete. Local Lighthouse did not complete because
      Chrome reported no first paint; build, check, e2e, a11y, HTML validation,
      markdown review, catalog, lint, and typecheck verification passed.

### Milestone 13: Flat Homepage Redesign Design

- [x] Redesign the homepage as a flat editorial index with the desktop anatomy:
      Announcements thin rail plus wide hero, Featured carousel plus thin Start
      Here rail, four-column Categories, thin More Ways To Browse, and
      chronological Recent articles.
- [x] Specify writer-facing interfaces for announcements, featured article
      items, and featured link items without duplicating article metadata.
- [x] Define reusable flat article teaser/list primitives and carousel behavior
      before implementation begins.
- [x] Define accessibility, performance, responsive, and testable invariants
      for the revised homepage and any new routes.

### Milestone 14: Announcements Collection And Routes

- [x] Add an `announcements` content collection that uses article-like
      frontmatter while staying separate from normal article helpers.
- [x] Add typed announcement helpers, route helpers, static paths, `/announcements/`,
      and `/announcements/[slug]/`.
- [x] Add initial announcement content and tests proving announcements are
      newest-first and do not appear in normal article browsing.

### Milestone 15: Featured Content Model And Carousel Data

- [x] Replace the first-pass `homePromos` model with `homeFeatured` Markdown
      entries using `kind: article` and `kind: link`.
- [x] Add normalization helpers that inherit article feature metadata from
      normal articles, validate stale slugs, and render link features from
      explicit frontmatter and Markdown body.
- [x] Add tests for sorting, inactive entries, stale article slugs, article
      feature inheritance, and link feature validation.

### Milestone 16: Flat Homepage Components And Carousel

- [x] Add component docs and reusable flat teaser/list primitives for compact
      announcement, Start Here, and Recent surfaces.
- [x] Add `HomeFeaturedCarousel` and supporting browser script with static
      first-item fallback, controls, reduced-motion behavior, and interaction
      pause behavior.
- [x] Update catalog examples and component tests for empty, single-item,
      multi-item, long-content, and no-JavaScript states.

### Milestone 17: Homepage Assembly Redesign

- [x] Recompose `src/pages/index.astro` into the revised row anatomy from
      `docs/HOMEPAGE_REDESIGN.md`.
- [x] Remove GitHub and RSS from homepage discovery, rename headings to concise
      labels, use four-column desktop Categories, and ensure Recent is
      chronological normal articles only.
- [x] Remove or retire first-pass home promo components/content that no longer
      belong to the homepage design.

### Milestone 18: Homepage Redesign Verification

- [x] Add or update page, e2e, accessibility, build-verifier, catalog, and
      content tests for the new homepage, announcement routes, featured
      carousel, and no-announcement-leakage invariants.
- [x] Run focused tests and the normal quality gate before marking complete.
      Verified with focused unit/component/page tests, `bun run typecheck`,
      `bun run lint`, `bun run check`, `bun run build`, `bun run verify`,
      `bun run validate:html`, `bun run test:e2e`, `bun run test:a11y`, and
      `bun run coverage`.
- [x] Record any local performance-check blocker explicitly if Lighthouse cannot
      run in the local environment. `bun run test:perf` rebuilt successfully,
      but local LHCI healthcheck failed because Chrome was not installed in the
      expected Lighthouse environment.

### Milestone 19: Homepage Lead Grid Revision

- [x] Revise the homepage lead area from two independent rows into one
      two-column lead grid: wide column with Hero then Featured, thin column
      with Start Here then Announcements.
- [x] Preserve mobile source order as Hero, Featured, Start Here,
      Announcements, followed by Categories, More, and Recent.
- [x] Update homepage design/component docs and browser invariants for desktop
      column relationships, stable carousel height, and mobile ordering.
- [x] Run focused homepage tests and normal quality gates before marking
      complete. Verified with focused Astro/component/script tests,
      `bun run check`, `bun run build`, `bun run validate:html`,
      `bun run review:markdown`, `bun run test:e2e`, `bun run test:a11y`,
      `bun run coverage`, and `bun run test:perf` with Playwright Chromium.
      Lighthouse passed assertions with a homepage LCP warning at 2559.6308ms
      against the 2500ms warning threshold.

### Milestone 20: Homepage Lead Row Alignment

- [x] Refactor the homepage lead grid so Hero, Featured, Start Here, and
      Announcements are direct grid cells on desktop rather than nested
      independent columns.
- [x] Preserve mobile source order as Hero, Featured, Start Here, and
      Announcements while placing Start Here beside Hero and Announcements
      beside Featured on desktop.
- [x] Update homepage docs and browser invariants so the Announcements heading
      aligns with the Featured heading without margin offsets or height hacks.
- [x] Run focused homepage tests and formatting before marking complete.
      Verified with focused Astro component/page tests, the focused Playwright
      homepage invariant, `bun run build`, and `bun run validate:html`.

### Milestone 21: Homepage Category Rail

- [x] Replace the homepage category grid with a one-row horizontal rail that
      reduces vertical space while preserving the shared browsing measure.
- [x] Add minimal previous/next icon buttons that actually scroll the rail and
      reveal only when the rail has horizontal overflow.
- [x] Preserve native horizontal scrolling, keyboard navigation, focus-visible
      states, and no-JavaScript readability.
- [x] Keep category cards equal width and height with content-aware sizing that
      stretches evenly when the rail has spare horizontal space.
- [x] Update component docs and tests for rail layout, button behavior, and
      homepage ordering before marking complete.
      Verified with focused scroll-rail/component tests, `bun run typecheck`,
      `bun run lint`, `bun run build`, the focused homepage Playwright
      invariant, `bun run verify`, `bun run validate:html`, `bun run format`,
      and `bun run format:markdown`.

### Milestone 22: Publishable Homepage Content Model Design

- [x] Design the publishable-entry, collection, visibility, and homepage
      view-model system that keeps article and announcement authoring aligned
      while making homepage lists source-agnostic.
- [x] Define collection authoring for `featured` and `start-here`, including
      manual order, optional item notes, duplicate/missing-slug failures, and
      folder-derived publishable kind.
- [x] Define reusable list/component boundaries so Announcements, Start Here,
      future collection pages, and compact discovery lists consume the same
      normalized publishable list item shape.
- [x] Define visibility defaults and override semantics for homepage,
      directory, feed, and search surfaces before implementation begins.
- [x] Critically review the design for overgeneralization, stale homepage
      assumptions, author ergonomics, and testable invariants before marking
      complete.
      Completed in `docs/HOMEPAGE_CONTENT_MODEL.md`; older homepage design and
      architecture docs now point to the publishable-entry/collections model.

### Milestone 23: Publishable Schema And Model

- [x] Add shared publishable visibility schema defaults to article and
      announcement frontmatter without adding author-facing kind fields.
- [x] Add internal publishable types/helpers that derive kind from collection
      location, build a global slug index, and fail duplicate publishable slugs
      across articles and announcements.
- [x] Add focused tests for visibility defaults, visibility overrides,
      kind derivation, duplicate slug failures, and source-agnostic list-item
      conversion.
      Verified with focused schema/model/route/SEO tests and
      `bun run typecheck`.

### Milestone 24: Collections Content Model

- [x] Replace homepage-specific `home-featured` content with a general
      `collections` content collection.
- [x] Add `featured` and `start-here` collection files using ordered
      publishable slug references and optional item notes.
- [x] Add typed collection helpers that resolve collection items from the
      global publishable index, preserve manual order, reject duplicates, and
      report missing slugs clearly.
- [x] Add schema/helper tests and update content-collection config tests.
      Verified with focused collection/schema/content-config tests and
      `bun run typecheck`.

### Milestone 25: Homepage View Model Migration

- [x] Move homepage data orchestration into a typed homepage view model so
      `src/pages/index.astro` composes blocks instead of resolving content
      rules inline.
- [x] Drive Featured from the `featured` collection, Start Here from the
      `start-here` collection, Announcements from newest visible announcements,
      and Recent from newest visible normal articles.
- [x] Keep homepage visuals, ordering, carousel behavior, and concise labels
      unchanged unless required by the new data model.
- [x] Add tests proving homepage collections resolve correctly and
      announcements still do not leak into Recent or normal article browsing.
      Verified with focused homepage model tests, Astro page/component render
      tests, and `bun run typecheck`.

### Milestone 26: Source-Agnostic Compact List Cleanup

- [x] Generalize compact list item types and component docs so flat homepage
      lists are publishable-entry lists, not article-only lists.
- [x] Keep compatibility wrappers or aliases where needed to avoid unrelated
      component churn, but ensure new homepage code depends on the generic
      model.
- [x] Update catalog/docs/tests for compact list empty, article, announcement,
      collection, metadata, and long-title states.
      Verified with focused compact list component tests, announcement/list
      helper tests, homepage render tests, and `bun run typecheck`.

### Milestone 27: Publishable Homepage Model Verification

- [x] Run focused schema/helper/homepage/component tests after each
      implementation milestone.
- [x] Run release-relevant checks for build output, typecheck, lint, HTML
      validation, formatting, and browser homepage invariants before marking
      the model complete.
      Verified with focused model/component/page tests during milestones 23-26,
      `bun run check`, `bun run build`, `bun run verify`,
      `bun run validate:html`, `bun run review:markdown`,
      the focused homepage Playwright invariants, full `bun run test:e2e`, and
      `bun run test:a11y`.
