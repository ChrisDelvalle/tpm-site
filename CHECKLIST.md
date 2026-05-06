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

### Milestone 28: Collection Directory And Homepage Refinement Design

- [x] Update the homepage/content-model docs before implementation so
      collections are not only homepage configuration files, but public
      directory pages at `/collections/` and `/collections/[collection]/`.
- [x] Specify how collection pages resolve article-like publishable entries,
      respect `directory` visibility on list surfaces, and keep direct
      publishable detail routes available for off-site links.
- [x] Specify the homepage refinement: no visible Featured/Categories/Recent
      headings, linked Start Here and Announcements headings, carousel controls
      grouped with the dots, centered category names, and Collections in the
      More strip.
- [x] Specify footer links for Collections, Announcements, and Featured
      Articles.
- [x] Critically review the docs for stale assumptions before implementation
      begins.

### Milestone 29: Collection Directory Routes

- [x] Add route helpers, static path helpers, `/collections/`, and
      `/collections/[collection]/`.
- [x] Render collection detail pages from the shared publishable-entry model so
      ordered collection items can include articles or announcements.
- [x] Update Pagefind, HTML validation, build verification, route tests, and
      page tests so collection pages are release artifacts.
      Verified with focused route/static-path/collection helper tests,
      collection page render tests, build-verifier tests, and typecheck.

### Milestone 30: Homepage, Footer, And Announcement Content Refinement

- [x] Remove the visible Featured, Categories, and Recent headings while
      preserving accessible section names.
- [x] Move Featured carousel previous/next controls into the bottom control row
      with the dots.
- [x] Center homepage category names within the category rail.
- [x] Link Start Here to `/collections/start-here/` and Announcements to
      `/announcements/`.
- [x] Replace the homepage More strip with a first-row quick navigation bar
      labeled `Read / Articles Archive Authors Collections Tags`; include
      `/articles/`, `/articles/all/`, `/authors/`, `/collections/`, and
      `/tags/`, keep it one line, and shrink rather than wrap or overflow.
- [x] Add Collections, Announcements, and Featured Articles to the footer.
- [x] Move `jeremy-cahill-metamer-dismissed-for-serious-misconduct` from
      articles to announcements and set every visibility override to `false`.
      Verified with focused homepage/block/footer/announcement render tests,
      announcement visibility helper tests, legacy redirect tests, and
      `bun run test:astro`.

### Milestone 31: Collection/Homepage Refinement Verification

- [x] Run focused route/helper/page/component tests for collections, homepage
      refinements, footer links, and announcement visibility.
- [x] Run release-relevant checks for typecheck, lint, build, verify, HTML
      validation, formatting, and browser invariants before marking complete.
      Verified with `bun run check`, `bun run build`, `bun run verify`,
      `bun run validate:html`, focused homepage/route Playwright invariants,
      `bun run catalog:check`, focused route/page/component tests, and
      `bun run test:unit`.

### Milestone 32: Article Endcap And TOC Follow-Ups

- [x] Normalize vertical spacing between the end of article prose, the article
      support block, related-content blocks, references, and tags so article
      end surfaces have even gaps.
- [x] Replace the article support block's generic `Support Us` button with the
      same Patreon and Discord brand buttons used on the homepage.
- [x] When the margin table of contents is hidden, render an article-top
      contents section so readers still have heading navigation.
- [x] Remove the `Article Contents` label from the margin TOC; the visible
      control should read `Hide`, and the collapsed control should read
      `Show Contents`.
      Verified with `bun run build`, focused ArticleLayout/SupportBlock/TOC
      component tests, focused article-end/TOC Playwright invariants,
      `bun run format:code`, `bun run format:markdown`, `bun run lint`,
      `bun run verify`, `bun run validate:html`, and `bun run catalog:check`.

### Milestone 33: Full-Width Mobile Menu Shell

- [x] Make the mobile sandwich menu panel span the full viewport width below
      the sticky header rather than keeping side gutters.
- [x] Keep the panel viewport-safe, internally scrollable, and backed by the
      shared anchored-positioning preset so future mobile shell panels inherit
      the same invariant.
- [x] Update component/positioning docs and focused tests for the full-width
      mobile menu contract.
      Verified with focused anchored-positioning unit tests, focused
      `MobileMenu` component tests, focused mobile menu Playwright invariants,
      `bun run format:code`, `bun run format:markdown`, `bun run lint`,
      `bun run build`, `bun run verify`, `bun run validate:html`, and
      `bun run catalog:check`.

### Milestone 34: Prose-Native Inline Article Contents

- [x] Update the article TOC component designs so the inline placement is an
      article-native contents section, not a rail moved into the article body.
- [x] Make the inline TOC start open by default and visually distinguish
      primary sections from subsections with more than indentation.
- [x] Make the collapsed inline TOC extremely compact so hiding contents removes
      the visual weight of the section instead of leaving a large gap.
- [x] Keep rail behavior unchanged: visible `Hide` when open, `Show Contents`
      when collapsed, no redundant `Article Contents` heading.
- [x] Add or update focused component and browser invariants for inline default
      open state, compact collapsed spacing, hierarchy styling, and centered
      reading layout.
      Verified with focused ArticleTableOfContents/TableOfContentsItem/
      TableOfContentsToggle/ArticleLayout component tests, `bun run typecheck`,
      `bun run build`, fresh-build focused TOC Playwright invariants,
      `bun run verify`, `bun run validate:html`, `bun run lint`,
      `bun run format:code`, `bun run format:markdown`, and
      `bun run catalog:check`.

### Milestone 35: Inline Contents Section Numbering

- [x] Number in-article contents entries as a hierarchy, such as `1`, `1.1`,
      `1.2`, and `2`, so it reads like an article outline.
- [x] Keep subsections visibly subordinate while showing their parent section
      relationship through the outline number.
- [x] Keep the margin rail unnumbered and visually unchanged.
- [x] Update focused component and browser tests for inline-only numbering.
      Verified with focused ArticleTableOfContents/TableOfContentsItem/
      TableOfContentsToggle/ArticleLayout component tests, `bun run typecheck`,
      `bun run build`, fresh-build focused TOC Playwright invariants,
      `bun run verify`, `bun run validate:html`, `bun run lint`,
      `bun run format:code`, `bun run format:markdown`, and
      `bun run catalog:check`.

### Milestone 36: Cite This Article Component Design

- [x] Add a component design doc for a `Cite this article` article-header
      utility that uses the Lucide `Quote` icon.
- [x] Specify the generated citation data model for this site's own articles:
      title, author metadata, publication date, canonical URL, site name, and
      accessed-date behavior where a format needs it.
- [x] Specify generated formats to support initially, including BibTeX and at
      least one reader-facing prose citation format, with CSL JSON considered
      as the structured intermediate or future export format.
- [x] Specify the UI contract: visible selectable citation text, a Lucide copy
      icon button, accessible labels, copied/error state, and no-JavaScript
      manual-copy fallback.
- [x] Specify placement in the article hierarchy, likely near article metadata
      without becoming a primary visual action.
- [x] Define unit, render, accessibility, and browser tests for citation
      generation, escaping, copy behavior, keyboard interaction, light/dark
      styling, long titles, multiple authors, organizations, and anonymous
      authors.

### Milestone 37: BibTeX Citation Authoring Design

- [x] Update the article references and bibliography technical designs so
      citations use hidden `tpm-bibtex` fenced blocks as structured authoring
      data instead of parsing prose citation styles.
- [x] Specify the authoring contract: inline citation markers reference BibTeX
      keys, BibTeX blocks never render as article prose, and explanatory
      footnotes remain separate from bibliographic source metadata.
- [x] Specify the parsed citation data model, required fields by entry type,
      fallback rendering behavior for missing optional fields, duplicate-key
      handling, unused/missing citation diagnostics, and global bibliography
      aggregation shape.
- [x] Define parser architecture requirements around parse-not-validate,
      type-driven normalized data, strict diagnostics, and avoiding fragile
      regex-only bibliography parsing.
- [x] Define migration and testing requirements for the current article corpus,
      including how legacy references, footnotes, prose links, and bibliography
      sections become either explicit BibTeX citations, explanatory notes, or
      documented non-citation content.

### Milestone 38: Cite This Article Implementation

- [x] Add typed citation-generation helpers for this site's own articles,
      including BibTeX and one prose citation format.
- [x] Add `ArticleCitationMenu` and wire it into `ArticleHeader` without making
      it a primary visual action.
- [x] Add progressive-enhancement copy behavior while preserving visible,
      selectable citation text without JavaScript.
- [x] Add unit, component/render, accessibility, and browser tests for generated
      formats, escaping, copy behavior, long metadata, light/dark mode, and
      responsive header placement.
- [x] Update component catalog/examples and package script docs if new scripts
      or catalog entries are added.
- [x] Run focused tests and the normal quality gate before marking complete.

### Milestone 39: BibTeX Article Reference Parser And Plugin Implementation

- [x] Add a small typed BibTeX parser or a vetted direct dependency that parses
      citation-manager-shaped entries without regex-only parsing.
- [x] Update the article-reference model so citations carry parsed BibTeX data
      and generated display data instead of prose footnote definition content.
- [x] Update `remarkArticleReferences` to collect `tpm-bibtex` code fences,
      remove them from rendered prose, match `[^cite-*]` markers to BibTeX
      keys, preserve explanatory `note-*` footnotes, and emit actionable
      diagnostics.
- [x] Preserve the migration mode for current published legacy content until
      corpus normalization is explicitly completed.
- [x] Add unit and plugin tests for parser behavior, missing/unused/duplicate
      BibTeX entries, note/citation separation, MDX behavior, hidden data
      removal, and no raw BibTeX prose output.
- [x] Run focused tests and the normal quality gate before marking complete.

### Milestone 39A: Article Reference Corpus Audit Design

- [x] Add a technical design doc for article-reference corpus auditing that
      defines detected legacy patterns, manual-review criteria, output shape,
      tests, and the boundary between non-content tooling and article-content
      normalization.
- [x] Review the design for ambiguity around ordinary prose links versus true
      bibliographic citations, then update it until it is ready for
      implementation.

### Milestone 40: Article Reference Corpus Audit And Normalization

- [x] Article-content edits require explicit instruction and careful manual
      verification before changing `src/content/articles/`.
- [x] Add or update an audit script/test that inventories current article
      reference formats: explicit references sections, Markdown footnotes,
      bibliography footnotes, bracket-style entries, raw HTML links, MDX links,
      blockquote attributions, media credits, archive links, and prose links.
- [x] Record every article that needs manual normalization and the exact legacy
      pattern it uses.
- [x] Generate a full per-article content migration catalog so every article is
      represented before manual normalization work begins.
- [x] Execute the approved mechanical-safe cleanup pass for simple raw HTML
      links and simple paragraph wrappers, then stop before manual
      citation/reference classification.
- [x] Rerun the audit and catalog after the mechanical pass so unresolved
      manual-review work is current.
- [x] Add a written decision report for article-reference migration decisions,
      and keep it paired with future catalog updates.
- [x] Normalize one article-reference format at a time into canonical
      `note-*` footnotes and `cite-*` markers with `tpm-bibtex` source entries
      according to the approved article-content plan.
- [x] Preserve author wording and article intent; only change reference syntax
      and section structure needed for the canonical parser.
- [x] Keep ambiguous inline prose links out of bibliography data unless the
      article is explicitly edited to use a canonical `cite-*` marker plus
      BibTeX source entry.
- [x] Confirm no explicit exceptions are needed; add explicit documented
      exceptions only when an article cannot reasonably be normalized.
- [x] Enable release-blocking validation for published articles only after the
      normalized corpus and exceptions pass.
- [x] Update author-facing article submission documentation with the canonical
      `note-*`, `cite-*`, and `tpm-bibtex` syntax.

### Milestone 41: Global Bibliography Page Implementation

- [x] Implement only after Milestone 39 provides normalized parsed BibTeX
      citation data and Milestone 40 records corpus status or approved
      exceptions.
- [x] Add the `/bibliography/` route and footer navigation link without
      cluttering the primary header navigation.
- [x] Build global bibliography data from normalized BibTeX citation entries
      and source article metadata; do not infer sources from ordinary inline
      links.
- [x] Preserve article back-links for every bibliography entry so readers can
      see which article used each source.
- [x] Implement bibliography page UI components according to their one-pagers,
      such as `BibliographyPage`, `BibliographyList`, `BibliographyEntry`,
      `BibliographySourceArticles`, `BibliographyFilters`, and
      `BibliographyEmptyState` unless the design chooses better names.
- [x] Add `src/components/bibliography/` for bibliography page components
      rather than mixing global bibliography UI into article-local reference
      components.
- [x] Implement grouping, sorting, duplicate handling, non-URL source display,
      long source display, and empty states according to the approved global
      bibliography design.
- [x] Avoid fuzzy global source deduplication unless explicit canonical source
      IDs are added; do not guess duplicates from prose.
- [x] Add SEO, sitemap, Pagefind, canonical URL, and machine-readable metadata
      behavior according to the design.
- [x] Add route data tests, render tests, accessibility tests, and Playwright
      tests for grouping, sorting, back-links, filters if present, no
      JavaScript behavior, long sources, duplicate sources, and no horizontal
      overflow.
- [x] Update `CHECKLIST.md` with any remaining bibliography follow-up
      discovered during implementation.

### Milestone 42: Minimal Cite This Article Redesign

- [x] Update the `ArticleCitationMenu` and `ArticleHeader` component designs so
      the citation utility is a metadata-row trigger with an anchored popover,
      not an in-flow panel.
- [x] Keep the citation UI minimal: reserve only trigger space in the article
      header, use compact four-column citation-style controls, and update one
      citation text box in place instead of rendering per-format dropdown text
      boxes.
- [x] Add common citation outputs for TPM articles beyond BibTeX and MLA,
      including APA, Chicago, Harvard, IEEE, and a citation-manager export.
- [x] Implement the redesigned component using existing anchored-positioning
      primitives rather than bespoke positioning.
- [x] Update tests for placement, popover behavior, generated formats, copy
      behavior, stable citation text-box width, and no-overflow invariants.
- [x] Run focused tests and the normal quality gate before marking complete.

### Milestone 43: Correct Article Reference Semantics And Migration

- [x] Make explanatory footnote markers visually distinct from bibliography
      citations: notes render as naked clickable superscript numbers, while
      citations retain citation-specific label/bracket styling.
- [x] Update article-reference docs and tests so the footnote/citation visual
      distinction is explicit and difficult to regress.
- [x] Reopen the corpus audit to detect visible source-list/reference content,
      including headings such as `Source List` that are still bibliography-like
      even if they are not named `References` or `Bibliography`.
- [x] Regenerate the per-article migration catalog so every article is
      represented and any remaining citation/source/reference material is
      visible for review.
- [x] Manually review every article flagged by the updated audit, including
      articles already edited in the previous pass.
- [x] Migrate every feasible citation/source/reference entry to canonical
      `cite-*` markers plus hidden `tpm-bibtex` entries; do not satisfy this
      milestone by renaming bibliography sections.
- [x] Record explicit decisions for anything left as visible prose, including
      why it is not currently feasible or correct to convert to TPM BibTeX.
- [x] Run focused reference tests, content verification, build, audit, catalog,
      and the normal quality gate before marking complete.

### Milestone 44: Manual Article Reference Audit

- [x] Manually inspect every article file, independent of the automated audit,
      for citation/source/reference sections, manual inline citations, and
      footnotes being used as citations.
- [x] Record a per-article decision for every inspected article in a durable
      manual audit report.
- [x] Convert any missed clear inline citations or source/reference structures
      to canonical `cite-*`, `note-*`, and hidden `tpm-bibtex` syntax.
- [x] Record uncertain cases explicitly for user review instead of silently
      normalizing them.
- [x] Run reference checks, content verification, build, formatting, and focused
      tests before marking complete.

### Milestone 45: Numeric Citation Default And Appendix Preservation

- [x] Make inline bibliography citation markers render numerically by default
      while preserving generated source labels in structured data for future
      explicit style overrides.
- [x] Restore author-owned appendix content that was incorrectly treated as
      disposable bibliography data.
- [x] Remove invalid structured bibliography entries that encode visible
      article headings or appendix structure as source metadata.
- [x] Review changed article files for additional author-intent risks and
      report any non-obvious cases.
- [x] Update article-reference docs and decision records to encode the numeric
      default and appendix-preservation rule.
- [x] Run focused article-reference tests, content/reference checks, markdown
      formatting, and build verification before marking complete.

### Milestone 46: Bibliography Malformed Entry Cleanup

- [x] Inspect the rendered global bibliography for malformed source entries.
- [x] Remove or correct malformed structured source data without inventing
      missing article metadata.
- [x] Add validation/tests so placeholder literal citation fields cannot render
      as global bibliography entries.
- [x] Update migration/audit docs with the preservation decision.
- [x] Run focused reference, bibliography, content, formatting, and build
      checks before marking complete.

### Milestone 47: Bibliography Merge And Generated Reference TOC Support

- [x] Merge `codex/site-improvements` into `codex/architecture-overhaul` while
      preserving bibliography, announcements, collections, tags, footer,
      Pagefind, HTML validation, and build verification routes.
- [x] Include generated Notes and Bibliography headings in article-local TOC
      data when those sections render, and omit them when the corresponding
      section is empty.
- [x] Add focused tests for TOC extraction/rendering with notes, citations,
      both notes and citations, and no references.
- [x] Run release-readiness checks and inspect `/bibliography/` plus
      citation-heavy article pages before marking complete.
      Verified with focused article TOC/reference tests, bibliography component
      tests, local preview inspection of `/bibliography/` and citation-heavy
      article routes, `bun --silent run test:e2e`, and
      `bun --silent run check:release`.

### Milestone 48: Scholar-Compatible Article PDF Export Design

- [x] Design a static Scholar-compatible PDF export system for every published
      article, including Highwire/Google Scholar metadata, `citation_pdf_url`,
      generated same-directory PDFs, and a compact article-header `Save PDF`
      action.
- [x] Specify the PDF rendering policy: plain academic styling, inline
      contents, article body, generated notes and bibliography, no site chrome,
      no CTAs, no related lists, no interactive UI, and lightweight generated
      files.
- [x] Inventory article-system components and article-content MDX components
      that must be rendered, transformed, or stripped for PDF output.
- [x] Define a maintainable PDF compatibility model so future MDX article
      components must declare a static fallback policy before publication.
- [x] Define build, verification, file-size, metadata, route, component, and
      browser tests before implementation begins.
      Completed in `docs/ARTICLE_PDF_EXPORT.md`; implementation is unblocked
      with explicit source-derived verification, MDX compatibility, and PDF
      file-size requirements.

### Milestone 49: Article Scholar Metadata And Save PDF Action

- [x] Add typed article PDF helper data for same-directory PDF paths, absolute
      `citation_pdf_url`, Scholar publication dates, and article-header action
      props.
- [x] Emit Scholar/Highwire tags on article pages: `citation_title`,
      `citation_author`, `citation_publication_date`, and
      `citation_pdf_url`.
- [x] Add a secondary `Save PDF` article-header link with a Lucide save/download
      icon that points to the generated static PDF and stays hidden from print
      output.
- [x] Add focused helper, component, and article page tests for metadata,
      multi-author/fallback author behavior, and the header action.
      Verified with `bun test tests/src/lib/article-pdf.test.ts`,
      focused `bun --silent run test:astro`, and
      `bun --silent run typecheck`.

### Milestone 50: Article PDF Rendering And Compatibility Policy

- [x] Add print/PDF CSS that produces plain academic article output and strips
      site chrome, CTAs, related/endcap UI, citation UI, image inspector UI,
      hover panels, and other browser-only surfaces.
- [x] Preserve printable article content: title, authors, date, canonical URL,
      description, inline contents, prose, figures, notes, and bibliography.
- [x] Add iframe/embed print fallbacks so media-heavy articles keep a plain
      URL/title reference instead of an empty PDF frame.
- [x] Add a PDF compatibility registry or verifier for article-content MDX
      imports so future components must declare PDF behavior.
- [x] Add focused tests for print CSS markers, iframe fallback output, current
      MDX component inventory, and unsupported MDX component failures.
      Verified with focused Bun tests, focused `bun --silent run test:astro`,
      and `bun --silent run typecheck`.

### Milestone 51: Static PDF Generation Build Step

- [x] Add `scripts/build/generate-article-pdfs.ts` to serve built `dist/`, open
      each published article with Playwright print media, and write
      `dist/articles/<slug>/<slug>.pdf`.
- [x] Set generated PDF document metadata where the toolchain supports it,
      including title, author, subject/description, keywords, creator, producer,
      and stable date fields without letting metadata diverge from article
      frontmatter.
- [x] Enforce generated PDF existence, PDF header validity, and a hard size
      budget below the Google Scholar 5 MB limit.
- [x] Add `build:pdf` and integrate the production build path as
      `build:raw -> build:pdf -> build:optimize`.
- [x] Update package script docs and script-entrypoint tests.
- [x] Add script unit tests for CLI usage, successful generation, missing input,
      invalid article pages, oversized PDFs, and quiet output.
      Verified with focused generator tests, `bun --silent run typecheck`,
      `bun --silent run build:raw`, and `bun --silent run build:pdf`; generated
      59 article PDFs and kept the largest below 5 MB.

### Milestone 52: PDF Build Verification And Browser Invariants

- [x] Extend build verification so every published article has a matching PDF,
      PDF link, and Scholar metadata derived from source content.
- [x] Add focused verifier tests for missing PDFs, missing/mismatched
      `citation_pdf_url`, missing required Scholar tags, broken PDF links, and
      oversized PDFs.
- [x] Verify representative generated PDFs expose expected title/author
      document metadata and searchable first-page text.
- [x] Add Playwright checks for representative article PDF links, print media
      stripping of site-only UI, inline TOC presence, generated references, MDX
      hover-link fallback behavior, and iframe fallback visibility.
- [x] Run release-relevant checks after implementation and record any explicit
      blocker before release handoff.
      Verified with `bun --silent run check`, `bun --silent run build`,
      `bun --silent run verify`, `bun --silent run validate:html`,
      `bun --silent run test:e2e`, `bun --silent run coverage`,
      `bun --silent run test:catalog`, `bun --silent run test:a11y`,
      `bun --silent run test:perf`, `bun --silent run test:accountability:release`,
      `bun --silent run audit`, and `bun --silent run secrets`. Lighthouse still
      reports a non-blocking homepage LCP warning in local runs, but the perf
      gate exits successfully.

### Milestone 53: PDF Robustness And Escape Hatch Design

- [x] Update the PDF export design so generated PDFs are the default for
      articles, but authors have a frontmatter escape hatch that disables the
      generated PDF, PDF action, and `citation_pdf_url` without removing base
      Scholar metadata.
- [x] Specify deterministic PDF image loading so lazy article images are
      explicitly loaded and decoded before Chromium prints the page.
- [x] Specify PDF image-efficiency checks that verify article images come from
      Astro's optimized build output and keep generated files under the
      established size budgets.
- [x] Specify a PDF-visible static-export disclaimer for interactive media,
      embeds, and other browser-only features.
- [x] Critically review the design for author burden, Google Scholar metadata
      behavior, build-verifier edge cases, image-heavy articles, and future MDX
      components before implementation begins.
      Verified with `bun --silent run lint:markdown` and
      `bun --silent run format:markdown`.

### Milestone 54: PDF Eligibility Frontmatter

- [x] Add the article frontmatter `pdf` boolean with default `true`, while
      keeping current articles enabled and avoiding announcement schema drift.
- [x] Thread PDF eligibility through article PDF helpers, article layout,
      Scholar metadata, and the article header so disabled articles omit only
      the generated PDF surfaces.
- [x] Update the PDF generator and build verifier so only PDF-eligible
      published articles require and generate same-directory PDFs, while stale
      PDFs or stale `citation_pdf_url` tags are rejected for disabled articles.
- [x] Add focused schema, helper, component, generator, and verifier tests for
      default-enabled and explicitly disabled PDF behavior.
      Verified with focused content-schema/article-PDF/generator/verifier Bun
      tests, focused Astro component/layout/page tests, `bun --silent run
      typecheck`, `bun --silent run format:code`, `bun --silent run
      lint:markdown`, and `bun --silent run format:markdown`.

### Milestone 55: Reliable PDF Image Loading And Disclaimer

- [x] Update the PDF generator to force all article images in the built article
      page to eager-load, scroll into view, and decode before printing.
- [x] Fail PDF generation when a printable article image cannot load, rather
      than silently dropping it from the generated PDF.
- [x] Add a print/PDF-only static-export disclaimer to article PDFs without
      showing it in the web article.
- [x] Add focused tests for the image-loading contract and disclaimer rendering.
      Verified with focused PDF generator/style Bun tests, focused
      ArticleHeader/ArticleLayout Astro tests, `bun --silent run format:code`,
      and `bun --silent run typecheck`.

### Milestone 56: PDF Efficiency Reporting And Final Verification

- [x] Add PDF image-efficiency reporting so generation records total article
      images and optimized Astro image sources used by generated PDFs.
- [x] Add or update tests for unoptimized image-source regressions and release
      reporting.
- [x] Run focused PDF tests plus release-relevant build, verify, HTML
      validation, typecheck, and browser PDF invariants before marking complete.
      Verified with focused PDF generator/config/rehype/style Bun tests,
      `bun --silent run typecheck`, `bun --silent run build:raw`,
      `bun --silent run build:pdf`, `bun --silent run verify`,
      `bun --silent run validate:html`, and `bun --silent run check:release`.
      Generated PDFs are currently under the 5 MB release cap; the largest
      local output observed was `the-interpretation-of-memes.pdf` at 3.6 MB.
