# Component Architecture Implementation Checklist

This checklist translates `docs/COMPONENT_ARCHITECTURE.md` into
developer-ready implementation milestones.

Scope rules:

- Do not edit `src/content/articles/` for these milestones unless a future task
  explicitly asks for article-content work.
- Keep each milestone independently buildable and reviewable.
- Prefer structure-preserving extraction before visual redesign.
- Keep normal production builds static and free of internal catalog routes.

## Milestone 1: Component Directory Foundation And UI Primitives

- [x] Create the target component folders that do not already exist:
      `src/components/ui/`, `src/components/media/`,
      `src/components/layout/`, `src/components/navigation/`,
      `src/components/articles/`, `src/components/pages/`,
      `src/components/blocks/`, and `src/components/islands/`.
- [x] Move or wrap the existing article components into the long-term
      `src/components/articles/` namespace, preserving imports and behavior.
- [x] Add `src/components/ui/Button.astro` for button actions with typed
      `variant`, `size`, and `tone` props.
- [x] Add `src/components/ui/LinkButton.astro` for link-shaped CTAs such as
      Support links.
- [x] Add `src/components/ui/IconButton.astro` with a required accessible label.
- [x] Add `src/components/ui/TextLink.astro` for inline and navigation links
      that need shared focus/hover behavior.
- [x] Add `src/components/ui/Input.astro` for shared native input styling.
- [x] Add `src/components/ui/Badge.astro`,
      `src/components/ui/Separator.astro`, `src/components/ui/Container.astro`,
      `src/components/ui/Section.astro`, and `src/components/ui/Card.astro`.
- [x] Add `src/components/media/ResponsiveIframe.astro` for stable,
      accessible iframe sizing with required titles.
- [x] Add `src/components/media/EmbedFrame.astro` for external embeds with
      stable spacing, fallback content, and loading policy.
- [x] Ensure primitives use semantic Tailwind tokens such as
      `bg-background`, `text-foreground`, `border-border`, `bg-card`,
      `text-muted-foreground`, and `text-primary`.
- [x] Keep primitive class strings statically visible to Tailwind through
      `class:list` in Astro or complete class-string maps where needed.
- [x] Add mirrored render tests for new primitive, media, and article namespace
      components so their public contracts are test-accountable.

## Milestone 2: Component Catalog Foundation

- [x] Add `src/catalog/catalog.config.ts` with explicit catalog metadata and an
      ignore list for intentionally uncatalogued public components.
- [x] Add `src/catalog/ComponentCatalog.astro`,
      `src/catalog/CatalogSection.astro`, and
      `src/catalog/CatalogExample.astro`.
- [x] Add `src/catalog/examples/ui.examples.ts` with realistic examples for
      the UI primitives from Milestone 1.
- [x] Add a tracked `.env.catalog` file that sets
      `TPM_COMPONENT_CATALOG=true` and `ASTRO_TELEMETRY_DISABLED=1`.
- [x] Add `src/pages/catalog/[...path].astro` and gate `getStaticPaths()` behind
      `TPM_COMPONENT_CATALOG=true`.
- [x] Return no catalog paths when `TPM_COMPONENT_CATALOG` is not enabled, and
      return the top-level `/catalog/` path when it is enabled.
- [x] Treat `TPM_COMPONENT_CATALOG` as `false` when it is unset, empty, or any
      value other than `true`.
- [x] Ensure normal `bun run build` output does not include `dist/catalog`.
- [x] Add `scripts/quality/verify-component-catalog.ts` to scan
      `src/components/**/*.{astro,tsx}` for public components.
- [x] Require every public component to have a catalog example or an ignore-list
      entry with a short reason.
- [x] Add package scripts:
      `catalog:dev`, `catalog:build`, `catalog:preview`,
      `catalog:preview:fresh`, and `catalog:check`.
- [x] Ensure `catalog:*` scripts opt into the catalog with
      `bun --env-file=.env.catalog` instead of relying on Astro dev mode.
- [x] Do not use POSIX-only inline environment-variable syntax like
      `TPM_COMPONENT_CATALOG=true astro build`.
- [x] Add a production-build guard to fail if `dist/catalog` appears in normal
      build output.
- [x] Document the catalog scripts in `PACKAGE_SCRIPTS.md`.

## Milestone 3: Astro Component Render Test Coverage

- [x] Keep Vitest and Astro Container API support for isolated `.astro`
      component rendering working with the static Astro/Bun project.
- [x] Add or update `tests/src/components/ui/` render tests for the primitive
      components.
- [x] Test semantic output for links, buttons, icon labels, slots, variants, and
      disabled or missing-content states where applicable.
- [x] Keep Bun tests for pure TypeScript logic in `tests/lib/` and
      `tests/scripts/`; do not migrate those to browser tests.
- [x] Use the existing `test:astro` package script for Astro component render
      tests, expanding it as new component tests are added.
- [x] Keep `test:astro` documented in `PACKAGE_SCRIPTS.md`.

## Milestone 4: Navigation Data Boundary

- [x] Refine `src/lib/navigation.ts` as the shared navigation data boundary.
- [x] Export normalized navigation data types such as `SectionNavItem` and
      `ArticleSummary`.
- [x] Build category navigation data from existing content helpers in one place.
- [x] Include display-ready `title`, `href`, `slug`, optional `description`,
      and article preview data.
- [x] Preserve current category ordering and current-page active state.
- [x] Replace ad hoc category shaping in `src/layouts/BaseLayout.astro` with the
      shared navigation helper.
- [x] Add pure logic tests in `tests/lib/navigation.test.ts` for category
      ordering, article summary shape, href generation, and current item state.

## Milestone 5: Navigation Components And Discovery Surfaces

- [x] Add `src/components/navigation/BrandLink.astro`.
- [x] Add `src/components/navigation/PrimaryNav.astro` for high-level links
      such as Articles, About, Search, and Support.
- [x] Add `src/components/navigation/SectionNav.astro` and
      `src/components/navigation/SectionNavItem.astro` for publication category
      links.
- [x] Add `src/components/navigation/SearchForm.astro` using semantic search
      markup and accessible labels.
- [x] Add `src/components/navigation/SupportLink.astro` using
      `LinkButton.astro`.
- [x] Add `src/components/navigation/ThemeToggle.astro`.
- [x] Move persistent theme browser logic into
      `src/components/islands/ThemeController.ts` if the toggle needs a
      separate processed script boundary.
- [x] Add `src/components/navigation/MobileMenu.astro` with all core
      destinations and category discovery available at narrow sizes.
- [x] Add `src/components/navigation/CategoryTree.astro` and
      `CategoryGroup.astro` for reusable category discovery.
- [x] Use native `details`/`summary` for category disclosure unless a later test
      proves a small island is required.
- [x] Keep RSS out of crowded header surfaces unless the final navigation design
      deliberately includes it.
- [x] Add catalog examples for navigation states: desktop, mobile, current
      category, long article title, and keyboard-focus states.

## Milestone 6: Layout Shell Extraction

- [x] Add `src/components/layout/SiteShell.astro` for the high-level page shell.
- [x] Add `src/components/layout/MainFrame.astro` for main/sidebar layout
      composition.
- [x] Add `src/components/layout/SiteHeader.astro` composed from navigation
      components.
- [x] Add `src/components/layout/SiteFooter.astro` with useful publication
      links: Articles, categories, About, RSS, Discord/community, and Support.
- [x] Add `src/components/layout/PageFrame.astro` for generic page layout
      spacing and optional sidebar regions.
- [x] Move header, sidebar, footer, and mobile-menu markup out of
      `src/layouts/BaseLayout.astro`.
- [x] Keep `src/layouts/BaseLayout.astro` focused on document structure, global
      CSS import, theme boot script, `SiteHead`, skip link, and slots.
- [x] Preserve canonical metadata, favicon, theme default, and skip-link
      behavior during extraction.
- [x] Add catalog examples for layout shells where useful.

## Milestone 7: Article Components And Article-End Discovery

- [x] Keep `src/layouts/ArticleLayout.astro` as the article route-facing layout
      and extract article display pieces into `src/components/articles/`.
- [x] Add `src/components/articles/ArticleHeader.astro` for title,
      description, author, dates, tags, and hero metadata.
- [x] Add `src/components/articles/ArticleMeta.astro` for machine-readable
      `<time datetime>` output and compact metadata display.
- [x] Keep or move `ArticleProse.astro` under `src/components/articles/` and
      make it the only prose wrapper for article Markdown/MDX output.
- [x] Add `src/components/articles/ArticleTags.astro`.
- [x] Add `src/components/articles/ArticleImage.astro` for future MDX/article
      images using Astro `Image` or `Picture` defaults.
- [x] Add `src/components/articles/ArticleCard.astro` and
      `src/components/articles/ArticleList.astro`.
- [x] Add `src/components/articles/MoreInCategoryBlock.astro`.
- [x] Add `src/components/articles/RelatedArticlesBlock.astro` as a stable
      placeholder for future related-article logic; keep it simple if no real
      data exists yet.
- [x] Add `src/components/articles/ArticleEndcap.astro` composed from
      more-in-category, related/discovery, and `SupportBlock`.
- [x] Use the new article components in `src/pages/articles/[...slug].astro`,
      `src/pages/articles/index.astro`, and `src/pages/categories/[category].astro`.
- [x] Preserve article body wording and rendered content.

## Milestone 8: Generic Markdown Page Components

- [x] Add `src/components/pages/MarkdownPage.astro` for non-article Markdown
      surfaces.
- [x] Add `src/components/pages/PageHeader.astro` for page title and optional
      description.
- [x] Add `src/components/pages/PageProse.astro` for non-article prose using
      the shared typography rules without article metadata.
- [x] Update `src/pages/about.astro` to compose the new page components while
      keeping page copy in `src/content/pages/` where possible.
- [x] Ensure non-article pages do not import article-specific metadata or
      article-only endcap components.
- [x] Add catalog examples for page prose and page headers.

## Milestone 9: Homepage Content Model And Blocks

- [x] Add `src/content/pages/index.md` for homepage editorial prose and stable
      page data that authors may edit.
- [x] Keep `src/pages/index.astro` as the homepage composer for dynamic article
      data and Astro image components.
- [x] Add `src/components/blocks/HomeHeroBlock.astro`.
- [x] Add `src/components/blocks/HomeAnnouncementBlock.astro`.
- [x] Add `src/components/blocks/HomeLatestArticleBlock.astro`.
- [x] Add `src/components/blocks/HomeFeaturedArticlesBlock.astro` or a
      start-here equivalent if featured data is available.
- [x] Add `src/components/blocks/HomeCategoryOverviewBlock.astro`.
- [x] Add `src/components/blocks/HomeArchiveLinksBlock.astro`.
- [x] Add `src/components/blocks/SupportBlock.astro` for reusable support CTAs.
- [x] Use `ArticleCard`, `ArticleList`, category navigation data, and shared
      media/image components inside homepage blocks.
- [x] Remove repeated homepage section markup from `src/pages/index.astro`.
- [x] Add catalog examples for each homepage block with normal, narrow, long
      title, and missing-content states where applicable.

## Milestone 10: Archive, Category, Search, And Footer Reuse

- [x] Update `src/pages/articles/index.astro` to use shared archive/list
      components.
- [x] Update `src/pages/categories/index.astro` to use
      `CategoryOverviewBlock.astro` or equivalent reusable category overview
      components.
- [x] Update `src/pages/categories/[category].astro` to use shared category
      page framing and `ArticleList.astro`.
- [x] Add `src/components/blocks/SearchResultsBlock.astro`.
- [x] Update `src/pages/search.astro` so search UI is composed from
      `SearchForm.astro` and `SearchResultsBlock.astro`.
- [x] Ensure `SiteFooter.astro` uses the same navigation/category data boundary
      as header, sidebar, and homepage category discovery.
- [x] Keep Pagefind behavior working without hydrating unrelated page regions.
- [x] Add catalog examples for archive lists, category overviews, search empty
      state, and footer layout.

## Milestone 11: Global CSS Cleanup And Token-Driven Styling

- [x] Audit `src/styles/global.css` for component selectors such as `.button`,
      `.site-header`, `.sidebar`, `.category-*`, `.archive-*`,
      `.category-card`, and page-section classes.
- [x] Move `.button` behavior into `Button.astro` and `LinkButton.astro`.
- [x] Move header and mobile-menu styling into layout/navigation components via
      Tailwind classes.
- [x] Move sidebar and category-tree styling into navigation components.
- [x] Move archive/card/list styling into article and block components.
- [x] Move page section spacing into `Container.astro`, `Section.astro`, and
      page/block components.
- [x] Keep global CSS limited to Tailwind imports/plugins, theme tokens,
      light/dark variables, document base styles, focus behavior, skip link,
      prose defaults, and rare cross-cutting browser behavior.
- [x] Replace hard-coded palette classes in first-party UI with semantic tokens
      unless a one-off editorial treatment is intentional and documented.
- [x] Confirm border radius, shadows, spacing, and typography come from tokens
      or component variants rather than one-off global classes.

## Milestone 12: Responsive, Accessibility, And Browser Hardening

- [x] Add or update Playwright checks for no horizontal overflow on key routes:
      `/`, `/articles/`, at least one article page, `/categories/`,
      one category page, `/about/`, and `/search/`.
- [x] Add or update Playwright checks for mobile, tablet, desktop, wide
      desktop, and short viewport heights.
- [x] Add or update checks for theme switching, focus visibility, mobile menu
      disclosure, category disclosure, and search behavior.
- [x] Add or update axe checks for critical and serious accessibility issues.
- [x] Manually inspect the component catalog in light and dark mode.
- [x] Manually inspect long titles, missing excerpts, missing images, empty
      search, category pages, article endcaps, and support CTAs.
- [x] Verify likely LCP images are eager only when appropriate and below-fold
      media lazy-loads.
- [x] Verify media and embeds reserve stable space and do not cause layout
      shift.
- [x] Verify JSON-LD, Open Graph, canonical URLs, sitemap, RSS, and Pagefind
      still work after the component extraction.

## Milestone 13: Component Design One-Pagers

- [x] Add `docs/components/README.md` describing the component design
      one-pager standard and where new component designs must be documented
      before implementation.
- [x] Structure `docs/components/` to mirror `src/components/`, including
      subfolders such as `ui/`, `media/`, `layout/`, `navigation/`,
      `articles/`, `pages/`, `blocks/`, and `islands/` where corresponding
      component folders exist.
- [x] Add a reusable component one-pager template covering purpose, public
      contract, composition relationships, layout behavior, responsive behavior,
      layering/z-index behavior, interaction states, accessibility semantics,
      content edge cases, theme behavior, and testable invariants.
- [x] Inventory every public component in `src/components/` and every page-level
      block in `src/components/blocks/`, grouped by UI primitive, layout,
      navigation, article, page, media, and homepage responsibility.
- [x] Create a one-page design doc for every existing public component and
      block, using the template and keeping each doc specific to the actual
      component rather than generic design guidance.
- [x] For each component one-pager, document its intended relationships to
      sibling and parent components: alignment, shared dimensions, spacing,
      containment, ordering, visibility exclusivity, sticky/fixed behavior, and
      what should happen during scrolling and resizing.
- [x] For each component one-pager, document all meaningful states and variants:
      default, hover, focus-visible, active, disabled, current, selected,
      expanded/collapsed, empty, loading, error, missing content, long content,
      and dense content where applicable.
- [x] For each layout-sensitive component one-pager, document the mobile base
      behavior, tablet behavior, desktop behavior, wide behavior, short-viewport
      behavior, wrapping rules, overflow rules, and container/viewport
      dependencies.
- [x] For each interactive component one-pager, document keyboard behavior,
      pointer behavior, touch behavior, focus order, accessible names, ARIA or
      native semantic requirements, and no-JavaScript fallback expectations.
- [x] For each media/content component one-pager, document image sizing,
      aspect-ratio behavior, caption relationships, fallback behavior, loading
      policy, and how content should avoid layout shift.
- [x] For each component one-pager, list the specific invariant, render,
      accessibility, interaction, and visual checks that should exist in tests.
- [x] Record brittle or questionable implementation decisions discovered during
      documentation in the relevant one-pager with a follow-up note, instead of
      silently treating the current implementation as the design contract.
- [x] Move or create the component architecture source of truth at
      `docs/COMPONENT_ARCHITECTURE.md`, keeping agent-specific summaries out of
      the project design-doc tree.
- [x] Update `docs/COMPONENT_ARCHITECTURE.md` to state that new
      component work starts with a one-pager, then catalog examples, then
      implementation, then tests.

## Milestone 14: Component Invariant Documentation And Tests

- [x] Use the Milestone 13 one-pagers as the source of truth for component
      intentions, and update a one-pager first if a missing or unclear
      invariant is discovered while writing tests.
- [x] Add reusable Playwright layout helpers under `tests/e2e/helpers/` for
      bounding boxes, overlap detection, visible dimensions, viewport matrices,
      scroll positions, focus state, z-order checks, and element-relative
      assertions.
- [x] Add component-catalog e2e coverage that exercises canonical component
      examples in light mode and dark mode without depending on production-only
      pages.
- [x] Add invariant tests for UI primitives: buttons, link buttons, icon
      buttons, text links, inputs, badges, separators, cards, containers, and
      sections.
- [x] Test primitive relationships where meaningful: equal heights, consistent
      alignment, stable dimensions across variants, disabled and focus-visible
      states, text wrapping, and no accidental low-contrast states.
- [x] Add invariant tests for site layout: header, shell, main frame, sidebar,
      footer, skip link, and page frame composition.
- [x] Test layout relationships across scrolling and resizing: sticky elements
      do not overlap incorrectly, fixed-height regions remain stable, sidebars
      stay below headers, footers do not cover content, and content never gains
      unintended horizontal overflow.
- [x] Add invariant tests for navigation components: brand link, primary nav,
      support link, theme toggle, search form, mobile menu, category tree,
      category groups, and category sidebar.
- [x] Test navigation behavior across viewports: desktop and mobile surfaces do
      not both expose conflicting controls, hidden surfaces are truly hidden,
      disclosure state does not cause unwanted navigation, keyboard focus order
      remains usable, and touch-size targets remain practical.
- [x] Add invariant tests for article components: article header, metadata,
      tags, prose wrapper, article cards, article lists, more-in-category,
      related/discovery placeholders, and article endcaps.
- [x] Move article tags out of the top article header and render them as the
      final article surface after the article endcap/discovery surfaces, so the
      top of the article stays visually uncluttered.
- [x] Test article relationships: prose measure remains readable, hero/media
      placement does not shift surrounding content, article cards align in
      grids, metadata remains associated with titles, and endcap/support blocks
      do not compete visually with article content.
- [x] Add invariant tests for media and embed components: responsive images,
      hover-card images, iframes, embeds, captions, and missing-media states.
- [x] Test media behavior across viewports: media stays centered where intended,
      aspect ratios are preserved, previews stay related to their trigger,
      embeds reserve space, and images do not exceed their containing measure.
- [x] Add invariant tests for homepage and archive blocks: hero, announcement,
      latest article, featured/start-here, category overview, archive links,
      search results, support block, and footer discovery surfaces.
- [x] Fix and test the homepage bottom support block so its bounding box aligns
      with the same content measure/container as the surrounding homepage
      sections instead of spanning wider than the rest of the content.
- [x] Fix and test the `/articles/`, `/categories/`, and `/search/` page
      content measure so archive-style pages keep a comfortable reading width
      instead of filling the entire viewport on wide screens.
- [x] Test dynamic behavior where it represents component intent: theme
      persistence, search result highlighting renders as real markup rather than
      escaped text, search empty states, mobile menu disclosure, category
      disclosure, and hover/focus/touch alternatives for interactive previews.
- [x] Prefer stable `data-*` test anchors for structural relationships that are
      hard to select semantically, and avoid tests coupled to incidental class
      strings unless the class is the public contract being tested.
- [x] Record brittle or questionable implementation decisions discovered during
      invariant review in `docs/COMPONENT_ARCHITECTURE.md` or a focused
      follow-up checklist item instead of hiding them in tests.
- [x] Keep invariant tests useful rather than screenshot-only: assert explicit
      relationships, states, dimensions, visibility, stacking, focus behavior,
      overflow, and interaction outcomes.
- [x] Update `PACKAGE_SCRIPTS.md` if new invariant-specific test scripts or
      catalog test commands are added.

## Milestone 15: Regression Hardening And Reliability Gates

- [x] Add a "new component readiness" policy to
      `docs/COMPONENT_ARCHITECTURE.md`: every new public component needs
      a catalog example, render test, documented invariants, invariant e2e tests
      when layout-sensitive, and keyboard/a11y tests when interactive.
- [x] Add or update reusable hostile fixtures for catalog and tests: long
      titles, long unbroken words, missing images, missing excerpts, many tags,
      empty states, dense lists, one-item lists, many-item lists, narrow
      containers, short viewport heights, unusual punctuation, and both themes.
- [x] Audit component state modeling and replace brittle boolean clusters with
      discriminated states where a component can be `empty`, `ready`, `error`,
      `loading`, `expanded`, `collapsed`, `selected`, or otherwise mutually
      exclusive.
- [x] Keep internal URL construction centralized in `src/lib/routes.ts` or
      similarly explicit route helpers; remove hand-built internal URLs from
      components where a route helper should be used.
- [x] Add route-helper tests for every public helper, including trailing-slash
      behavior, article paths, category paths, page paths, RSS/feed paths, and
      canonical URL composition.
- [x] Add content schema and published-filter tests for required frontmatter,
      invalid dates, invalid image references, unpublished content exclusion,
      duplicate article slugs, missing category metadata, and category/article
      count consistency.
- [x] Add route-level smoke coverage for every generated page and endpoint:
      homepage, articles, categories, Markdown pages, RSS/feed, sitemap, search,
      and representative article/category detail pages.
- [x] Add semantic document tests for key routes: one `main`, valid skip-link
      target, sensible heading order, labeled navigation landmarks, footer
      landmark, accessible names for links/buttons, and no duplicate critical
      landmarks.
- [x] Add focused visual/invariant-regression coverage for stable surfaces:
      homepage,
      article page, component catalog overview, header/nav, sidebar, support
      block, article cards, search results, and mobile menu.
- [x] Keep visual-regression tests targeted and reviewable; do not replace
      explicit invariant assertions with broad screenshot tests where a
      relationship can be tested directly.
- [x] Add build-output guards for no accidental catalog route in production, no
      unexpected client JavaScript growth, no unexpected hydration boundaries,
      no source maps unless deliberately enabled, no broken internal links, and
      no escaped markup where real HTML is intended.
- [x] Add asset-integrity checks for referenced local images, required alt text
      or documented alt exceptions, approved `public/` files only, and
      project-owned images living under `src/assets/`.
- [x] Add design-token enforcement or review checks for hard-coded colors,
      border radii, shadows, and spacing in first-party UI when semantic tokens
      or component variants should be used instead.
- [x] Add theme-matrix checks for key components so light and dark mode both
      preserve readable text, visible borders, visible focus rings, and correct
      CTA contrast.
- [x] Add interaction-state checks for hover, focus-visible, active, disabled,
      current, selected, expanded, and collapsed states where those states are
      part of a component contract.
- [x] Add content-relationship tests so article cards link to the correct
      routes, article metadata remains associated with titles, category counts
      match published article data, and archive/search/RSS use the same
      published-content filter.
- [x] Reorder article-end surfaces so `Support The Philosopher's Meme` appears
      before `More in <category>`, related/references/discovery comes next, and
      article tags are the final surface at the bottom of the article.
- [x] Audit and fix article header-to-body spacing so articles without a hero
      image do not reserve awkward empty space; if hero images are added later,
      image-specific spacing should be owned by the hero/media component rather
      than by a permanent prose offset.
- [x] Fix and test the homepage Browse Categories block so its grid is
      constrained by the same comfortable content measure as the surrounding
      homepage sections and cannot drift wider on large screens.
- [x] Fix and test category detail pages such as `/categories/metamemetics/`
      so they use the same shared page framing and comfortable content measure
      as archive, category-index, and search pages.
- [x] Add a modularization and reuse pass for page framing, archive/list
      layout, discovery sections, and support surfaces so routes stop
      reimplementing common layout decisions and sitewide consistency is the
      default.
- [x] Add review-only performance budget checks for page weight, client
      JavaScript size/count, image sizing, LCP candidate sanity, and
      CLS-sensitive layout shifts.
- [x] Maintain a documented exception ledger for intentionally untested,
      untestable, or deliberately rule-breaking cases, with a clear reason and
      explicit handoff note.
- [x] Establish a regression policy: every layout, accessibility, routing,
      content, or interaction bug fix should add a focused invariant or
      contract test for the underlying intention.
- [x] Update `PACKAGE_SCRIPTS.md`, CI workflow comments, and agent docs if new
      reliability scripts, review-only checks, or release gates are added.

## Milestone 16: Site Anatomy Technical Design

- [x] Add a site anatomy technical design doc at `docs/SITE_ANATOMY.md`.
- [x] Inventory every route in `src/pages/` and document its current anatomy:
      document shell, site shell, header/nav, sidebar/discovery, content frame,
      page body, blocks, end surfaces, and footer.
- [x] Inventory every public component in `src/components/` and classify it as
      a document shell, layout primitive, page body, page section, content
      block, article part, navigation part, media part, UI primitive, or island.
- [x] Document the current component tree for each major page type: homepage,
      article detail, article archive, category index, category detail, search,
      about/generic Markdown page, 404, and catalog.
- [x] Identify every place where routes or blocks reimplement page width,
      gutters, vertical rhythm, sidebar placement, archive/list layout,
      discovery ordering, support CTA placement, or footer-like surfaces.
- [x] Propose a simpler target anatomy that makes sitewide consistency the
      default, with a small set of reusable page-body primitives instead of
      bespoke route layouts.
- [x] Decide and document the final page-body taxonomy. The expected direction
      is a reading body for article/prose-first pages and a browsing body for
      homepage, archives, categories, search, and other discovery-first pages,
      but use the most conventional names after design review.
- [x] Define the target article anatomy, including article header, article
      body/prose, optional article media/hero ownership, article
      support/discovery surfaces, references/related surfaces, tags, article
      table of contents, and article footer/end metadata.
- [x] Define the target browsing-page anatomy, including page header, optional
      intro/prose, primary listing/grid region, filters/search or category
      discovery, support/discovery surfaces, and footer handoff.
- [x] Define the target site-shell anatomy, including sticky header, mobile
      navigation, category discovery in navigation surfaces, article-local
      margin/sidebar surfaces, centered content column, right margin, footer,
      skip link, and theme/search islands.
- [x] Document the navigation decision that category discovery moves into the
      site-wide navigation, mobile menu, footer/homepage discovery, and category
      pages; the desktop margin sidebar becomes article-local table of contents
      where article headings make that useful.
- [x] Name every new or changed layout/navigation/article component that needs a
      component one-pager before implementation.
- [x] Define the test strategy for the anatomy refactor: render tests,
      catalog examples, accessibility checks, Playwright layout invariants, and
      build-output guards.
- [x] Update `docs/COMPONENT_ARCHITECTURE.md` with the final site anatomy and
      make it clear that future pages must compose existing anatomy primitives
      before adding new bespoke layout.
- [x] Update `CHECKLIST.md` if the anatomy design discovers additional required
      design or implementation milestones.

## Milestone 17: Layout Primitive Component Designs

- [x] Update or create component one-pagers under `docs/components/layout/` for
      every layout primitive chosen in Milestone 16 before implementation.
- [x] Update or create component one-pagers for the shared site shell, main
      frame, page frame, reading body, browsing body, section stack, content
      rail, endcap stack, and margin/sidebar layout as applicable.
- [x] Document parent-child relationships, slot ownership, content measure,
      gutters, vertical rhythm, sidebar/margin placement, sticky offsets,
      overflow rules, responsive breakpoints, and no-sidebar behavior for each
      layout primitive.
- [x] Document mobile, tablet, desktop, wide desktop, and short-viewport
      behavior for every layout-sensitive primitive.
- [x] Document catalog examples required for every new or changed anatomy
      primitive: reading body, browsing body, section stack, content rail,
      endcap stack, margin/sidebar layout, empty states, dense states, and
      long-content states.
- [x] Document render, accessibility, and Playwright invariants for each layout
      primitive before implementation begins.
- [x] Record any brittle prototype layout decisions that must be removed during
      implementation.

## Milestone 18: Category Navigation Component Designs

- [x] Update or create component one-pagers before implementation for
      `src/components/navigation/DiscoveryMenu.astro`,
      `src/components/navigation/CategoryDropdown.astro`, and
      `src/components/navigation/CategoryPreviewList.astro`.
- [x] Update existing one-pagers for affected navigation components such as
      `SiteHeader`, `PrimaryNav`, `MobileMenu`, `SectionNav`, `CategoryTree`,
      `CategoryGroup`, `SearchForm`, `SupportLink`, `ThemeToggle`, and
      `SiteFooter` where their contracts change.
- [x] Choose and document the dropdown primitive: native `details`/`summary`,
      HTML `popover`, or a small Radix/shadcn island based on accessibility,
      no-JavaScript behavior, browser support, and testing complexity.
- [x] Document the category dropdown contract: category labels, direct category
      links, recent or featured article previews if used, View All links,
      no-full-archive rule, empty preview states, and data ownership.
- [x] Document keyboard, pointer, touch, focus, dismissal, reduced-motion,
      no-JavaScript fallback, and assistive-technology behavior.
- [x] Document responsive behavior and visibility exclusivity so desktop
      dropdowns, mobile menus, and footer/homepage discovery do not compete.
- [x] Document catalog examples and render/Playwright tests required before
      production navigation uses the dropdown.

## Milestone 19: Article Table Of Contents Component Designs

- [x] Update or create component one-pagers before implementation for the
      article table-of-contents components, using names such as
      `ArticleTableOfContents`, `TableOfContentsItem`, `TableOfContentsToggle`,
      and `MarginSidebarLayout` unless Milestone 16 chooses better conventional
      names.
- [x] Update existing one-pagers for affected article/layout components such as
      `ArticleLayout`, `ArticleHeader`, `ArticleProse`, `ArticleEndcap`,
      `ArticleTags`, `MainFrame`, and `PageFrame` where their contracts change.
- [x] Document how article headings are discovered, which heading levels are
      included, how duplicate heading IDs are handled, how generated Markdown
      IDs stay stable, and how malformed heading order should be reported.
- [x] Document no-headings and too-few-headings behavior: no empty sidebar, no
      reserved blank margin, and no broken layout on articles that do not need a
      contents surface.
- [x] Document hide/show behavior: visible label, keyboard behavior, focus
      behavior, reduced-motion behavior, state persistence decision, and the
      smallest acceptable client-side boundary.
- [x] Document sticky and layering rules: the TOC stays below the sticky header,
      never hides underneath it while scrolling, never overlays article prose,
      and never competes with mobile navigation.
- [x] Document active-section behavior if included, including scroll-spy
      thresholds, URL hash behavior, focus/target behavior, and the
      no-JavaScript fallback.
- [x] Document catalog examples and render/Playwright tests required before the
      article TOC ships.

## Milestone 20: Bibliography And Article References Technical Design

- [x] Add the article references remark plugin technical design at
      `docs/remark-plugins/article-references.md`.
- [x] Document the canonical article-local reference syntax:
      `note-*` labels for explanatory footnotes, `cite-*` labels for
      bibliography citations, and optional leading `[@Display Label]`
      definition metadata.
- [x] Document parser architecture requirements: use parsed GFM footnote AST
      nodes, keep pure normalization separate from the remark transformer,
      parse into typed data, and make invalid states unrepresentable after
      normalization.
- [x] Document the preferred metadata output path, documented AST-injection
      fallback, validation rules, author-readable diagnostics, test fixtures,
      and implementation file structure for article references.
- [x] Add a bibliography technical design doc at `docs/BIBLIOGRAPHY.md`.
- [x] Inventory every article in `src/content/articles/` for bibliography or
      citation-like content, including explicit references sections, footnotes,
      inline Markdown links used as citations, blockquote attributions, raw HTML
      links, bibliography-style lists, and article-specific unusual formats.
- [x] Record every bibliography/citation format found, the articles that use it,
      whether it is parseable without ambiguity, and whether it appears to be a
      real source entry, a normal prose link, media credit, archive link, or
      editorial aside.
- [x] Determine whether there is a consistent existing bibliography format
      across the corpus; if not, propose the smallest canonical Markdown/MDX
      bibliography format authors can realistically follow.
- [x] Define the canonical bibliography entry data model: source text/title, URL
      or non-URL source, optional author/publication/date fields, optional note,
      source article title, source article URL, article category, and article
      publication date.
- [x] Decide whether bibliography entries should be parsed from Markdown AST,
      MDX AST, frontmatter, explicit bibliography/reference blocks, or another
      structured source; avoid fragile regex-only parsing unless the design doc
      proves it is sufficient.
- [x] Document how bad or legacy bibliography/citation formats should be adapted
      to the canonical format while preserving article wording and author
      intent.
- [x] Document which article edits are required for bibliography normalization
      and mark them as article-content work requiring careful manual
      verification.
- [x] Define validation/enforcement for future articles: content checks,
      markdown/MDX linting, parser tests, author-facing error messages, and
      documentation in the article submission tutorial.
- [x] Define technical tests needed before implementation: parser fixtures for
      every bibliography/citation format, duplicate/invalid bibliography tests,
      content-validation tests, and route data tests.
- [x] Identify open questions and risks: ambiguous source/link distinction, dead
      external links, non-URL sources, generated IDs, duplicates across
      articles, and whether normalization should be blocking or review-only.

## Milestone 21: Bibliography Component Designs

- [x] Add article-local reference component one-pagers for
      `ArticleReferences`, `ArticleFootnotes`, `ArticleBibliography`, and
      `ArticleReferenceBacklinks`.
- [x] Document the article-local reference hierarchy:
      `ArticleLayout` owns placement, `ArticleReferences` owns note versus
      bibliography section composition, `ArticleFootnotes` owns explanatory
      note markup, `ArticleBibliography` owns citation markup, and
      `ArticleReferenceBacklinks` owns shared return-link behavior.
- [x] Document article-local reference ordering: references render after
      `ArticleEndcap` and before `ArticleTags`, with notes before
      bibliography when both exist.
- [x] Document article-local reference states: no references, notes only,
      citations only, repeated citation references, optional display labels,
      long source text, long URLs, rich Markdown definitions, and backlink
      accessibility.
- [x] Update or create component one-pagers before implementation for the
      bibliography page and bibliography UI components, using names such as
      `BibliographyPage`, `BibliographyList`, `BibliographyEntry`,
      `BibliographySourceArticles`, `BibliographyFilters`, and
      `BibliographyEmptyState` unless Milestone 20 chooses better names.
- [x] Update existing one-pagers for affected footer/navigation components so
      the bibliography page is reachable site-wide without cluttering the
      primary header navigation.
- [x] Design the `/bibliography/` page information architecture: grouping,
      sorting, duplicate handling, source display, search/filter behavior if
      any, and article back-links for every bibliography entry.
- [x] Document empty, malformed, duplicate, external-link, non-URL source, long
      source title, many-source, and no-JavaScript states.
- [x] Document SEO, JSON-LD, canonical URL, sitemap, RSS/feed, and Pagefind
      implications for bibliography pages.
- [x] Document catalog examples and render/Playwright/accessibility tests
      required before implementation.

## Milestone 22: Author Metadata Technical Design

- [x] Add an author metadata technical design doc at `docs/AUTHORS.md`.
- [x] Inventory all current article author values in `src/content/articles/`,
      including spelling variants, legacy metadata shapes, group authors,
      multiple-author articles if any, and articles with missing or ambiguous
      author data.
- [x] Decide the canonical author model and where it lives. The expected
      direction is an `authors` content collection or similarly structured
      source under `src/content/`, but the design doc should compare options
      before choosing.
- [x] Define stable author identity rules: slug generation, display name,
      aliases, legacy names, duplicate names, group authors, and how article
      frontmatter references an author without relying on fragile free-text
      matching.
- [x] Define optional author metadata fields: short bio for article pages,
      longer profile description for author pages, avatar/image if used,
      website, social links, affiliations, location/time period if relevant,
      and any privacy/consent rules for public links.
- [x] Define graceful fallback behavior for authors with no profile metadata:
      author links should still be useful, at minimum showing the author's
      article list, without requiring placeholder bios or broken profile boxes.
- [x] Define how author data participates in machine-readable metadata: Article
      JSON-LD author references, optional Person/Organization schema, Open Graph
      metadata, RSS author fields, and canonical URLs.
- [x] Define validation/enforcement for future articles: every published
      article should reference a known author or use an explicitly documented
      fallback; aliases and unknown authors should fail or warn according to the
      design decision.
- [x] Document any article frontmatter edits required to normalize author
      references and mark them as article-content work requiring careful manual
      verification.
- [x] Define technical tests needed before implementation: author metadata
      schema tests, alias/duplicate resolution tests, article-author
      relationship tests, structured-data tests, RSS tests, and route data tests.
- [x] Identify open questions and risks: public personal data, authors who do
      not want profile pages, group authors, pseudonyms, dead social links,
      author name changes, and whether missing author metadata should block
      publishing or remain review-only.

## Milestone 23: Author Page Component Designs

- [x] Update or create component one-pagers before implementation for author UI
      components, using names such as `AuthorLink`, `AuthorByline`,
      `AuthorBioBlock`, `AuthorProfileHeader`, `AuthorArticleList`,
      `AuthorSocialLinks`, `AuthorPage`, and `AuthorsIndexPage` unless
      Milestone 22 chooses better names.
- [x] Update existing one-pagers for affected article components such as
      `ArticleMeta`, `ArticleHeader`, `ArticleCard`, `ArticleList`,
      `ArticleEndcap`, and `ArticleJsonLd` where author behavior changes.
- [x] Design the article-page author interaction: author name links from
      article metadata, optional "About the author" surface, placement relative
      to article endcaps/tags, and behavior for multiple authors.
- [x] Design the author detail page route, likely `/authors/[author]/`,
      including page header, short/long bio, external links, article count,
      chronological article list, category/tag summaries if useful, and SEO
      metadata.
- [x] Decide whether an `/authors/` index page is needed now or deferred; if
      included, design grouping, sorting, empty states, and navigation from the
      footer or other discovery surfaces.
- [x] Document empty metadata, missing bio, no social links, long author names,
      group authors, multiple authors, dark/light mode, mobile, and wide layout
      states.
- [x] Document catalog examples and render/Playwright/accessibility tests
      required before implementation.

## Milestone 24: Site-Wide Anatomy Layout Refactor

- [x] Implement only after Milestones 16 and 17 are complete.
- [x] Create or refactor the reusable layout primitives named in the design:
      site shell, main frame, page frame, reading body, browsing body, section
      stack, content rail, endcap stack, and margin/sidebar layout as needed.
- [x] Add `src/components/layout/ReadingBody.astro`,
      `BrowsingBody.astro`, `SectionStack.astro`, `ContentRail.astro`,
      `EndcapStack.astro`, and `MarginSidebarLayout.astro` according to their
      component one-pagers.
- [x] Make layout primitives own reusable constraints: content measure, gutters,
      vertical rhythm, sidebar/margin placement, sticky offsets, overflow rules,
      and responsive breakpoints.
- [x] Keep route files thin: each route should load data, choose the correct
      page body, pass normalized props, and avoid implementing custom layout
      structure inline.
- [x] Refactor article detail pages to use the reading-body anatomy and remove
      duplicated layout decisions from `ArticleLayout.astro` and article route
      composition.
- [x] Refactor homepage, article archive, category index, category detail,
      search, and generic Markdown pages to use the browsing/prose body
      primitives where appropriate.
- [x] Ensure support CTAs, category discovery, related reading, archive links,
      and tags are placed through named reusable surfaces rather than ad hoc
      per-page markup.
- [x] Ensure category detail pages, article archive pages, category index pages,
      and search pages share the same browsing body and archive/list section
      primitives unless the design doc explicitly justifies a difference.
- [x] Ensure article pages and generic Markdown pages share prose/readability
      primitives without coupling generic pages to article-only metadata or
      article-only endcaps.
- [x] Remove obsolete one-off width, spacing, and grid patches after the shared
      anatomy primitives own those decisions.
- [x] Add or update catalog examples for every new or changed anatomy primitive.
- [x] Add render tests for new anatomy primitives proving semantic structure,
      slots, required labels, heading levels, and empty/missing-content states.
- [x] Add Playwright invariants proving reading pages preserve readable measure,
      browsing pages preserve comfortable listing width, and both page-body
      types remain consistent across mobile, tablet, desktop, wide desktop, and
      short viewport heights.
- [x] Add Playwright invariants proving shared anatomy prevents regressions:
      no horizontal overflow, no duplicated critical landmarks, no competing
      sidebars/mobile menus, support/discovery surfaces keep intended order,
      and centered content stays centered when sidebars are present.
- [x] Confirm implementation still matches `docs/SITE_ANATOMY.md`; update the
      design doc before implementation if a route cannot fit either
      `ReadingBody` or `BrowsingBody`.

## Milestone 25: Category Dropdown Discovery

- [x] Implement only after Milestones 16, 17, and 18 are complete.
- [x] Add or update `src/components/navigation/DiscoveryMenu.astro`,
      `CategoryDropdown.astro`, and `CategoryPreviewList.astro` according to
      the documented component contracts.
- [x] Use the documented HTML `popover` desktop disclosure pattern unless a
      focused proof shows it cannot satisfy accessibility, browser, or layout
      requirements.
- [x] Move primary desktop category discovery from the left category sidebar
      into the site-wide navigation while keeping a normal `/categories/` link
      and direct category links reachable.
- [x] Ensure the mobile menu exposes equivalent category discovery without
      rendering a competing desktop sidebar at mobile/tablet widths.
- [x] Source dropdown data from the shared navigation/content boundary rather
      than fetching or shaping article data inside visual components.
- [x] Show category labels, a restrained set of recent or featured article
      previews where the design calls for them, and a clear View All link.
- [x] Do not render the full archive inside the header dropdown.
- [x] Ensure every dropdown destination remains accessible through normal links
      when JavaScript is disabled.
- [x] Ensure dropdown controls are keyboard reachable, dismissible, focus-safe,
      pointer/touch usable, and named correctly for assistive technology.
- [x] Add catalog examples for desktop, mobile, long category labels, many
      categories, empty preview data, dark mode, light mode, and no-JavaScript
      fallback behavior.
- [x] Add render tests for semantic structure, labels, links, empty preview
      behavior, and stable data boundaries.
- [x] Add Playwright keyboard/focus/pointer tests before using the dropdown in
      production navigation.
- [x] Add Playwright responsive invariants proving category discovery does not
      collide with the header, does not create horizontal overflow, and does not
      duplicate visible desktop/mobile controls.
- [x] Remove or disable the old desktop category sidebar as a category discovery
      surface after the dropdown and fallback category paths are working.
- [x] Update affected component one-pagers and `docs/COMPONENT_ARCHITECTURE.md`
      after implementation if the final behavior differs from the design docs.

## Milestone 26: Article Table Of Contents Margin Sidebar

- [x] Implement only after Milestones 16, 17, and 19 are complete.
- [x] Create or refactor the shared margin/sidebar layout primitive so the left
      margin can host article-local navigation without affecting the centered
      reading measure.
- [x] Replace the old category-sidebar usage on article pages with the article
      table-of-contents surface.
- [x] Keep category discovery available through the site navigation, mobile
      menu, footer/homepage discovery, and category pages after the article TOC
      replaces the desktop sidebar.
- [x] Build a heading extraction boundary in `src/lib/` or the article view
      model so visual TOC components receive normalized heading data and do not
      parse content themselves.
- [x] Use Astro-rendered heading metadata as the source of truth for TOC links;
      do not query rendered DOM or parse article Markdown source in visual
      components.
- [x] Include only the heading levels chosen in the design doc and preserve
      stable heading IDs for hash links.
- [x] Handle duplicate heading text deterministically and add tests for the
      generated labels/links.
- [x] Do not render an empty TOC sidebar when an article has no headings or too
      few headings for useful local navigation.
- [x] Add a visible hide button for the TOC with keyboard support, accessible
      name, sensible focus return, and the smallest practical client-side
      behavior.
- [x] Start hide/show with native `details`/`summary`; add JavaScript only for
      explicitly approved progressive enhancements such as active-section
      highlighting or persistence.
- [x] Ensure hiding the TOC does not reflow the reading column in a way that
      makes the article jump or lose scroll position.
- [x] If active-section highlighting is implemented, keep it progressive:
      static hash links must work without JavaScript, and the enhancement must
      not block reading.
- [x] Add catalog examples for article TOC with many headings, no headings, long
      headings, duplicate headings, hidden state, short viewport, mobile,
      tablet, desktop, and wide desktop.
- [x] Add render tests for TOC structure, heading-link normalization,
      no-headings behavior, hidden-state markup, and accessible labels.
- [x] Add Playwright invariants proving the TOC stays below the sticky header,
      never overlays prose, never creates horizontal overflow, and keeps the
      reading column centered.
- [x] Add Playwright interaction tests for hide/show behavior, keyboard
      navigation, hash-link navigation, focus-visible states, and mobile/tablet
      absence or compact behavior.
- [x] Remove obsolete category-sidebar tests, catalog examples, docs, or route
      wiring that no longer match the new category navigation plus article TOC
      architecture.

## Milestone 27: Article References Data Path Proof

- [x] Implement only after the article-local reference portions of Milestones
      20 and 21 are complete.
- [x] Add focused fixtures for one Markdown article and one MDX article that use
      canonical `note-*` and `cite-*` labels with rich definition content.
- [x] Prove whether `render(entry).remarkPluginFrontmatter` can carry
      normalized note/citation data and a rich JSON-serializable definition
      model from the Markdown pipeline to `ArticleLayout`.
- [x] Document the result in `docs/remark-plugins/article-references.md`,
      including the exact data shape available to article routes/layouts.
- [x] Choose the component-rendered metadata path because the proof can preserve
      rich serializable definitions safely.
- [x] Confirm the documented AST-injection fallback is not needed unless a
      future requirement cannot be represented in the serializable model.
- [x] Keep the proof isolated from the published article corpus; do not enable
      release-blocking validation or edit article content in this milestone.
- [x] Add focused tests for the proof path so future Astro upgrades cannot
      silently break reference data transport.

## Milestone 28: Article References Model And Pure Normalization

- [x] Add `src/lib/article-references/` with the smallest useful split for
      `model.ts`, `normalize.ts`, `validate.ts`, and ID/display-label helpers.
- [x] Model references with discriminated, type-safe shapes for notes,
      citations, definitions, source markers, generated IDs, display labels,
      and diagnostics.
- [x] Make the normalized model JSON-serializable: no Astro components,
      functions, JSX, rendered component instances, live Markdown AST nodes, or
      other values that cannot safely pass through
      `remarkPluginFrontmatter`.
- [x] Make invalid states unrepresentable after normalization: unknown label
      kind, malformed slug, duplicate definitions, missing definitions,
      unreferenced definitions, repeated notes, ID collisions, and ambiguous
      classification should not survive as renderable data.
- [x] Implement label classification for `note-*` and `cite-*` labels using
      lowercase ASCII slug rules.
- [x] Implement deterministic first-reference ordering and deterministic IDs
      for note entries, citation entries, source markers, and citation backrefs.
- [x] Implement display-label extraction only for a valid leading `[@...]`
      marker at the first inline position of `note-*` or `cite-*`
      definitions.
- [x] Preserve rich definition children as typed serializable content nodes
      after removing leading display-label metadata; do not flatten definitions
      to plain strings too early.
- [x] Keep pure helpers independent of Astro so they can be tested without
      building the site.
- [x] Add table-driven unit tests for accepted and rejected labels, duplicate
      detection, missing reference/definition detection, ordering, repeated
      citation handling, repeated note failure, ID generation, display-label
      extraction, and rich definition preservation.

## Milestone 29: Article References Remark Plugin

- [x] Add direct dependencies where needed instead of relying on transitive
      packages: `unist-util-visit`, explicit mdast types if needed, and
      `remark`/`remark-gfm` for isolated plugin tests if those tests require
      them.
- [x] Add `src/remark-plugins/articleReferences.ts` as a thin unified remark
      transformer that orchestrates the pure article-reference helpers.
- [x] Visit every `footnoteReference` and `footnoteDefinition` node through the
      parsed Markdown AST rather than regexing source text or post-render HTML.
- [x] Classify labels by `note-*` and `cite-*`; fail on any other published
      article footnote label once validation is enabled.
- [x] Extract optional leading display labels from valid note/citation
      definitions and preserve later `[@...]` text as ordinary definition
      content.
- [x] Preserve rich Markdown definition content as the normalized serializable
      model, including emphasis, links, inline code, punctuation, and GFM
      continuation blocks.
- [x] Suppress or replace Astro/GFM's default combined footnote output so custom
      note and bibliography sections do not duplicate it.
- [x] Replace inline footnote reference nodes with accessible marker links, or
      produce equivalent accessible marker links while storing marker metadata
      in the normalized serializable model.
- [x] Use `file.fail(...)` for blocking errors and `file.message(...)` only for
      review-only warnings; messages must be author-readable and include how to
      fix the problem.
- [x] Add plugin integration tests using `remark`, `remark-gfm`, and the plugin
      for valid notes, valid citations, mixed notes/citations, repeated
      citations, repeated-note failure, display labels, malformed display
      labels, invalid legacy labels, missing definitions, unreferenced
      definitions, duplicate definitions, and rich definitions.
- [x] Wire the plugin into `astro.config.ts` under `markdown.remarkPlugins`
      only after isolated plugin tests pass.
- [x] Verify MDX inherits the same plugin behavior as Markdown.

## Milestone 30: Article Reference Rendering Components

- [x] Implement only after Milestones 27, 28, and 29 establish the data path and
      normalized serializable model.
- [x] Implement `src/components/articles/ArticleReferences.astro` according to
      `docs/components/articles/ArticleReferences.md`.
- [x] Implement `src/components/articles/ArticleFootnotes.astro` according to
      `docs/components/articles/ArticleFootnotes.md`.
- [x] Implement `src/components/articles/ArticleBibliography.astro` according
      to `docs/components/articles/ArticleBibliography.md`.
- [x] Implement `src/components/articles/ArticleReferenceBacklinks.astro`
      according to `docs/components/articles/ArticleReferenceBacklinks.md`.
- [x] Keep visual components data-driven: they must not parse Markdown, inspect
      article source, fetch global content, or infer citations from inline
      prose links.
- [x] Render from the normalized serializable model produced by the plugin; do
      not expect components, JSX, functions, or live AST nodes from
      `remarkPluginFrontmatter`.
- [x] Render nothing for no references, only notes for notes-only articles, only
      bibliography for citation-only articles, and notes before bibliography
      when both exist.
- [x] Render notes as numbered article footnotes by default while preserving
      optional note display labels as metadata.
- [x] Render citations numerically by default and with explicit display labels
      when the normalized citation data provides them.
- [x] Render stable entry IDs and accessible backlinks from each note/citation
      entry to the originating inline marker or markers.
- [x] Keep reference sections in the article reading measure, with long labels,
      titles, URLs, and many backlinks wrapping without horizontal overflow.
- [x] Use semantic headings, ordered lists, links, and Tailwind semantic tokens;
      do not create extra landmarks or CTA/card styling for reference
      apparatus.
- [x] Add catalog examples for no references, notes only, citations only, both,
      repeated citations, display labels, long URLs, rich definitions, dark
      mode, light mode, mobile, desktop, and wide desktop.
- [x] Add Astro render tests for empty states, section ordering, default
      headings, ordered-list output, stable IDs, backlinks, accessible labels,
      long content, and preserved rich definition content rendered from the
      serializable model.

## Milestone 31: Article Reference Article Integration And Gates

- [x] Wire normalized article reference data from
      `render(article).remarkPluginFrontmatter` into `ArticleLayout` or the
      article route without making route files parse Markdown or inspect
      article source.
- [x] Place `ArticleReferences` after `ArticleEndcap` and before `ArticleTags`
      on article pages.
- [x] Verify article end ordering remains prose, support CTA, more-in-category
      and related discovery, notes/bibliography, then tags as the final article
      surface.
- [x] Ensure article pages do not render Astro's default combined GFM footnote
      section alongside custom note/bibliography sections.
- [x] Add Astro integration tests for `.md` and `.mdx` article content running
      through the plugin.
- [x] Add route/build tests proving invalid published article references fail
      only after the corpus is normalized or explicitly excepted.
- [x] Add Playwright checks that reference markers and backlinks are keyboard
      focusable links, have visible focus states, and navigate to the intended
      entry/marker targets.
- [x] Add accessibility checks for sensible headings, no duplicate IDs, no
      competing landmarks, and readable links in light and dark mode.
- [x] Add responsive checks proving reference sections do not create horizontal
      overflow at mobile, tablet, desktop, wide desktop, and short viewport
      heights.
- [x] Update `docs/remark-plugins/article-references.md`,
      `docs/COMPONENT_ARCHITECTURE.md`, and component one-pagers if the final
      integration differs from the design.

## Milestone 32: Header Navigation And Articles Hub Design Update

- [x] Update `docs/SITE_ANATOMY.md` with the target header anatomy: left
      aligned brand, category dropdowns, `Articles`, and `About`; right aligned
      search reveal, theme toggle, and support CTA.
- [x] Update the relevant component one-pagers for `SiteHeader`, `PrimaryNav`,
      `SectionNav`, `CategoryDropdown`, `SearchForm`, `SupportLink`,
      `ThemeToggle`, and `MobileMenu` before implementation.
- [x] Define the desktop category dropdown contract: visible down chevron or
      equivalent dropdown affordance, opens on hover and keyboard focus, click
      on the category navigates to the category page, and the preview never
      becomes the only way to reach category content.
- [x] Define the touch and mobile navigation fallback for category dropdowns,
      search reveal, theme toggle, support CTA, `Articles`, and `About`.
- [x] Define the route consolidation contract: `/articles/` becomes the primary
      articles hub with category browsing and a clear `View all articles`
      destination, replacing `/categories/` as the top-level category index.
- [x] Decide and document the flat archive destination if it no longer owns
      `/articles/`, including route-conflict handling for any reserved slug
      such as `/articles/all/`.
- [x] Decide whether `/categories/` remains as a compatibility route, redirects
      to `/articles/`, or is removed from public navigation; category detail
      route behavior must be documented separately.
- [x] Document responsive invariants for the new header: one coherent desktop
      row until the mobile menu breakpoint, no collisions, no horizontal
      overflow, and no hidden controls that lack a mobile equivalent.
- [x] Document test coverage needed for hover, focus, click-through category
      links, search reveal, mobile fallback, route smoke tests, sitemap behavior,
      and browsing-page width consistency.

## Milestone 33: Header Navigation Redesign Implementation

- [x] Update navigation data helpers so categories, primary links, and utility
      actions are separate typed groups instead of one noisy nav list.
- [x] Refactor `SiteHeader`, `PrimaryNav`, and `SectionNav` into the approved
      two-row header: row 1 left search icon and light/dark toggle, center The
      Philosopher's Meme brand, right `Articles`, `About`, and `Support Us`;
      row 2 centered category dropdowns.
- [x] At mobile widths, collapse the header to one row: left sandwich menu,
      centered Philosopher's Meme brand, and right `Support Us`; move search
      and theme into the mobile menu or another reachable mobile surface as
      needed.
- [x] Keep RSS out of the primary header unless the design explicitly restores
      it; make RSS available through the footer or another low-noise surface.
- [x] Update `CategoryDropdown` to look and behave like a dropdown, including a
      chevron/down indicator, hover/focus preview, click-through category link,
      and accessible keyboard behavior.
- [x] Keep `CategoryDropdown` preview content concise: do not repeat the hovered
      category heading inside the dropdown; show article previews and the
      `View all <category>` link.
- [x] Make `CategoryDropdown` pointer behavior forgiving enough that moving
      from the category label to the preview surface does not close the
      dropdown through small hover gaps.
- [x] Implement the search button reveal with the smallest static-first
      interaction boundary that satisfies focus management and escape/close
      behavior.
- [x] Update `MobileMenu` so hidden desktop destinations remain reachable:
      categories, `Articles`, `About`, search, and theme toggle.
- [x] Keep `SupportLink` visible in the constrained-width header when the
      mobile menu replaces desktop category/primary navigation.
- [x] Remove RSS from `MobileMenu`; keep RSS in secondary surfaces such as the
      footer.
- [x] In mobile category disclosures, make the `View all <category>` category
      destination visually distinct from article links rather than highlighting
      the whole current category group.
- [x] Make the mobile menu panel scrollable for short viewport heights without
      letting it escape the viewport.
- [x] Remove any obsolete header/category navigation markup, CSS, catalog
      examples, and tests that preserve the old noisier navigation structure.
- [x] Add or update component render tests, catalog examples, Playwright
      interaction tests, accessibility checks, and responsive invariants for the
      new header and dropdown behavior.

## Milestone 34: Articles Hub And Archive Route Consolidation

- [x] Refactor `/articles/` into the primary articles hub: category browsing,
      a clear `View all articles` path, and useful browsing/discovery blocks.
- [x] Move or preserve the flat all-articles archive according to the approved
      route contract from Milestone 32, without creating ambiguous article slug
      conflicts.
- [x] Update `/categories/` according to the approved compatibility decision:
      remove from navigation, redirect, or keep only as a non-primary fallback.
- [x] Keep category detail pages reachable from category dropdowns, mobile
      navigation, article category links, article hub blocks, and footer
      discovery surfaces.
- [x] Rename the `memeculture` category display label to `Culture` through
      category metadata and update tests/docs/catalog examples programmatically
      so user-facing labels do not fork.
- [x] Reuse `BrowsingBody`, `PageFrame`, `SectionStack`,
      `CategoryOverviewBlock`, `ArchiveListBlock`, `ArticleList`, and
      `SupportBlock`; do not create new page-specific listing widths.
- [x] Update site header links, footer links, sitemap expectations, route smoke
      tests, Pagefind/search assumptions, and any catalog examples affected by
      the route consolidation.
- [x] Add tests proving `/articles/` exposes categories and `View all articles`,
      the flat archive route renders all published articles, category detail
      links still work, and no route conflicts are introduced.

## Milestone 35: Homepage Browsing Layout Alignment

- [x] Audit `src/pages/index.astro` and home blocks for any route-level width,
      gutter, or centering decisions that should belong to `BrowsingBody`,
      `PageFrame`, `SectionStack`, or block components.
- [x] Refactor the homepage to use the same browsing page anatomy and centered
      content measure as the articles hub, archive, category detail, and search
      pages.
- [x] Keep any deliberate hero-width or feature-block exceptions documented in
      the owning component, not as page-level layout patches.
- [x] Ensure homepage category browsing, archive links, and support blocks align
      with the same content column unless a component design explicitly
      documents a different width.
- [x] Remove obsolete homepage-specific layout hacks and duplicated container
      markup once shared browsing primitives own the geometry.
- [x] Add Playwright layout invariants proving the homepage body is centered,
      home blocks share the expected measure, support does not escape the
      content column, and mobile/tablet/desktop/wide layouts have no horizontal
      overflow.

## Milestone 36: Article Reference Corpus Normalization

- [ ] Implement only after Milestone 31 proves the canonical format and gates
      against fixtures; article-content edits require explicit instruction and
      careful manual verification.
- [ ] Add or update an audit script/test that inventories current article
      reference formats: explicit references sections, Markdown footnotes,
      bibliography footnotes, bracket-style entries, raw HTML links, MDX links,
      blockquote attributions, media credits, archive links, and prose links.
- [ ] Record every article that needs manual normalization and the exact legacy
      pattern it uses.
- [ ] Normalize one article-reference format at a time into canonical
      `note-*` and `cite-*` footnotes according to the approved article-content
      plan.
- [ ] Preserve author wording and article intent; only change reference syntax
      and section structure needed for the canonical parser.
- [ ] Keep ambiguous inline prose links out of bibliography data unless the
      article is explicitly edited to use a canonical `cite-*` reference.
- [ ] Add explicit exceptions only when an article cannot reasonably be
      normalized yet, and document why the exception is temporary or permanent.
- [ ] Enable release-blocking validation for published articles only after the
      normalized corpus and exceptions pass.
- [ ] Update author-facing article submission documentation with the canonical
      `note-*`, `cite-*`, and optional `[@Display Label]` syntax.

## Milestone 37: Global Bibliography Page Implementation

- [ ] Implement only after Milestones 20, 21, and 36 provide approved global
      bibliography requirements and normalized citation data.
- [ ] Add the `/bibliography/` route and footer navigation link without
      cluttering the primary header navigation.
- [ ] Build global bibliography data from normalized `cite-*` entries and
      source article metadata; do not infer sources from ordinary inline links.
- [ ] Preserve article back-links for every bibliography entry so readers can
      see which article used each source.
- [ ] Implement bibliography page UI components according to their one-pagers,
      such as `BibliographyPage`, `BibliographyList`, `BibliographyEntry`,
      `BibliographySourceArticles`, `BibliographyFilters`, and
      `BibliographyEmptyState` unless the design chooses better names.
- [ ] Add `src/components/bibliography/` for bibliography page components
      rather than mixing global bibliography UI into article-local reference
      components.
- [ ] Implement grouping, sorting, duplicate handling, non-URL source display,
      long source display, and empty states according to the approved global
      bibliography design.
- [ ] Avoid fuzzy global source deduplication unless explicit canonical source
      IDs are added; do not guess duplicates from prose.
- [ ] Add SEO, sitemap, Pagefind, canonical URL, and machine-readable metadata
      behavior according to the design.
- [ ] Add route data tests, render tests, accessibility tests, and Playwright
      tests for grouping, sorting, back-links, filters if present, no
      JavaScript behavior, long sources, duplicate sources, and no horizontal
      overflow.
- [ ] Update `CHECKLIST.md` with any remaining bibliography follow-up
      discovered during implementation.

## Milestone 38: Author Pages Implementation And Metadata Normalization

- [x] Implement only after Milestones 22 and 23 are complete.
- [x] Add the author metadata source and content schema chosen in the technical
      design.
- [x] Add `src/content/authors/` as the canonical author collection, with
      author IDs as stable entry slugs and Markdown body content available for
      long profile pages.
- [x] Normalize article author references only according to the approved
      article-content plan and preserve article wording and author intent.
- [x] Add `/authors/[author]/` routes for all public author profiles.
- [x] Add an `/authors/` index route because the component design includes it
      as a useful footer/discovery destination.
- [x] Implement `src/components/authors/AuthorLink.astro`,
      `AuthorByline.astro`, `AuthorBioBlock.astro`,
      `AuthorProfileHeader.astro`, `AuthorArticleList.astro`,
      `AuthorSocialLinks.astro`, `AuthorPage.astro`, and
      `AuthorsIndexPage.astro` according to their component one-pagers.
- [x] Link article bylines to author pages when author data is known and use the
      approved fallback behavior when it is not.
- [x] Reuse `AuthorByline` through `ArticleMeta`, `ArticleHeader`,
      `ArticleCard`, article lists, author pages, and related-reading surfaces
      so author display does not fork by page type.
- [x] Render optional article-page author bio surfaces only when approved
      profile metadata exists; do not render placeholder author copy.
- [x] Add author metadata to JSON-LD, RSS, canonical metadata, and other
      machine-readable surfaces according to the technical design.
- [x] Add schema, relationship, route smoke, render, accessibility, RSS, JSON-LD,
      and Playwright tests defined by the design milestones.
- [x] Update author-facing article submission documentation with author
      reference and metadata guidance.
- [x] Update `CHECKLIST.md` with any remaining author metadata follow-up
      discovered during implementation.

## Milestone 39: Article Anchor Navigation Alignment

- [x] Audit article heading anchors, generated heading IDs, TOC links, sticky
      header height, scroll margins, and any scroll-padding behavior that
      affects direct hash navigation.
- [x] Fix anchor navigation so loading an article with a hash URL and clicking
      an article TOC link positions the target heading fully visible below the
      sticky header, with sensible breathing room.
- [x] Add progressive current-section highlighting to the article table of
      contents so the active heading link uses the standard link/primary color
      while preserving static hash-link behavior without JavaScript.
- [x] Implement the fix in the owning article/prose/layout component or shared
      token rather than as a route-specific patch.
- [x] Add Playwright coverage for direct hash navigation and TOC click
      navigation across desktop, tablet, and mobile widths.
- [x] Include a regression case for headings near the top of an article and for
      articles with no hero image, where sticky-header offset mistakes are most
      visible.

## Milestone 40: Overlay Positioning And Navigation Breakpoint Hardening

- [x] Audit dropdown, popover, and mobile-menu panels for assumptions about
      trigger horizontal position.
- [x] Refactor menu panels so they are viewport-constrained by default and
      cannot fall off-screen merely because the trigger is near an edge.
- [x] Keep mobile-menu search and theme controls in the top control area of the
      panel while preserving all reachable destinations.
- [x] Move the category-discovery desktop breakpoint to the least aggressive
      standard Tailwind breakpoint that avoids collisions and horizontal
      overflow.
- [x] Update component docs, catalog examples, render tests, and Playwright
      responsive invariants for the hardened panel positioning and breakpoint
      contract.

## Milestone 41: Anchored Positioning System Design

- [x] Audit current header, search, dropdown, mobile menu, and hover-image
      popup behavior for positioning assumptions, including vertical gaps,
      incorrect center alignment, header overlap, viewport overflow, and
      trigger/panel alignment mismatches.
- [x] Add `docs/navigation/anchored-positioning-system.md` as the canonical
      technical design for reusable anchored positioning primitives.
- [x] Define the shared vocabulary: trigger, anchor, panel, placement context,
      block-axis snap, inline-axis alignment, viewport boundary, safe gutter,
      collision fallback, and panel ownership.
- [x] Define context-specific placement rules for header category dropdowns,
      search reveal, mobile navigation panels, and article hover-image panels.
- [x] Define which behavior belongs in pure geometry helpers, Astro
      components, processed browser scripts, and component-specific wrappers.
- [x] Define implementation constraints: no unpositioned top-layer popovers, no
      page-specific pixel offsets, no centered fallback unless a context
      explicitly asks for center alignment, no header overlap, and no
      horizontal overflow.
- [x] Define accessibility, keyboard, pointer, hover, focus, reduced-motion,
      resize, scroll, short-viewport, and no-JavaScript requirements.
- [x] Define component catalog examples, render tests, unit tests, and
      Playwright invariants required before implementation is complete.
- [x] Add a testing plan to the design covering unit tests for geometry
      decisions, render tests for component contracts, and e2e tests for
      browser behavior, component relationships, viewport boundaries, layering,
      resizing, scrolling, keyboard, pointer, hover, focus, and theme states.
- [x] Critically review the design for ambiguous rules, edge cases, and
      conflicts with Astro static-first and Tailwind-first architecture, then
      revise it until it is ready for development.

## Milestone 42: Anchored Positioning Engine And Adapter Foundation

- [x] Implement only after Milestone 41 is complete.
- [x] Add a pure `src/lib/` anchored positioning engine with typed rectangles,
      placements, placement operations, deterministic collision fallback,
      sizing results, and explicit placement state.
- [x] Implement placement operations as small testable functions:
      `initialPlacement`, `offset`, `flipSide`, `flipAlignment`,
      `shiftIntoBoundary`, `sizeToBoundary`, and `detectDetach`.
- [x] Add preset definitions for `header-dropdown`, `header-search-start`,
      `header-search-end`, `mobile-shell-panel`, and
      `inline-hover-preview`.
- [x] Document the required migration scope in code/docs: `CategoryDropdown`,
      `SearchReveal`, `MobileMenu`, and article hover-image previews are the
      required consumers; ordinary sticky rails, in-flow disclosures, controls,
      media, references, and document-flow content must stay outside the
      anchored system unless they become trigger-attached floating surfaces.
- [x] Add unit tests for every placement operation, every preset, split
      block/inline anchors, edge triggers, collision fallback, sizing,
      clamping, detach states, and subpixel tolerance.
- [x] Add the smallest processed browser adapter needed to bind anchored roots,
      triggers, and panels, publish measured geometry as CSS custom
      properties, and update on open, resize, scroll, header-size changes,
      font/layout changes, and visual viewport changes where applicable.
- [x] Keep the DOM adapter generic: it measures, calls the pure engine, writes
      CSS variables and data attributes, and does not own content, route data,
      open-state semantics, or component-specific visuals.
- [x] Keep the DOM adapter Lighthouse-sensitive: one shared processed script,
      no hydration boundary, no eager measurement of closed surfaces, no
      polling, delegated/passive listeners where practical, batched
      read/write work with `requestAnimationFrame`, and cleanup for
      disconnected surfaces.
- [x] Add thin `AnchoredRoot`, `AnchoredTrigger`, and `AnchoredPanel`
      primitives if they make the shared data-attribute and CSS-variable
      contract harder to misuse.
- [x] Add render tests proving anchored primitives emit the shared attributes,
      CSS variable hooks, accessible semantics, and preset names expected by
      the design.
- [x] Add a minimal catalog section showing each preset's default, edge,
      constrained, light-mode, dark-mode, hover, focus, and open states.
- [x] Update `docs/navigation/anchored-positioning-system.md` if
      implementation proves any design detail needs clarification.

## Milestone 43: Header Search, Category Dropdown, And Mobile Menu Fixes

- [x] Refactor `SearchReveal`, `CategoryDropdown`, and `MobileMenu` to use the
      shared anchored positioning primitives and presets instead of
      component-local fixed, centered, or magic-offset positioning.
- [x] Keep `SiteHeader`, `SearchForm`, `ThemeToggle`, `SupportLink`, sticky
      layout rails, and in-flow `details`/`summary` navigation out of the
      anchored system because they are not trigger-attached floating surfaces.
- [x] Fix the desktop search reveal so its top edge snaps to the bottom of the
      sticky header with no visible gap.
- [x] Fix the desktop search reveal so it horizontally aligns to the search
      trigger's logical edge: start-aligned when the trigger is on the left,
      end-aligned when the trigger is on the right.
- [x] Fix desktop category dropdowns so their top edges snap to the bottom of
      the sticky header and their inline edges align with the category trigger
      according to the documented `header-dropdown` fallback rules.
- [x] Ensure category dropdowns never fall back to viewport centering unless a
      future preset explicitly allows centering.
- [x] Preserve category trigger behavior: hover and focus reveal the dropdown,
      pointer movement from trigger to panel is forgiving, keyboard access
      works, and clicking the category still navigates to the category page.
- [x] Keep the mobile menu viewport-safe, attached to the sticky header,
      internally scrollable on short screens, and independent of the horizontal
      position of the sandwich trigger.
- [x] Keep the mobile support button outside the panel when visible, omit RSS
      from the mobile panel, and keep search/theme controls in the panel's top
      utility area.
- [x] Add Playwright regression tests that fail against the known broken nav
      behavior: centered category panels, search panel gap, search panel wrong
      side, header overlap, off-screen mobile panel, and short-viewport mobile
      overflow.
- [x] Add render tests proving header/search/mobile components emit anchored
      presets and no longer emit component-local centered fixed wrappers or
      final positioning styles.
- [x] Update component one-pagers and header/navigation docs with the final
      anchored positioning contract.

## Milestone 44: Native Astro Hover Image Preview

- [x] Reimplement article hover-image previews with Astro components and the
      `inline-hover-preview` anchored preset instead of React, Radix, or a
      hydrated shadcn hover card.
- [x] Confirm no other production component still needs the anchored system
      before removing React/Radix hover-card dependencies; future candidates
      such as citation previews or share panels should be deferred until those
      features exist.
- [x] Preserve the existing author-facing MDX API for hover-image links unless
      article-specific work is explicitly approved separately.
- [x] Preserve the existing hover-image author-facing MDX API while migrating
      existing imports to the canonical `src/components/articles/` namespace.
- [x] Preserve hover-image semantics: inline prose trigger, real link fallback
      to the image source, useful alt text on the preview image, focus-visible
      access, and readable no-JavaScript behavior.
- [x] Preserve the existing `expanded` behavior as a size variant that affects
      preview dimensions without changing the positioning algorithm.
- [x] Ensure previews remain visually tethered to their inline trigger, never
      become centered viewport overlays, avoid covering the trigger, and fit
      within viewport gutters when possible.
- [x] Add unit tests for the `inline-hover-preview` preset's side flip,
      clamping, sizing, and detach behavior.
- [x] Add render tests for hover-image components proving they emit anchored
      attributes, preserve link semantics, preserve alt text, and avoid React
      hydration directives.
- [x] Add Playwright coverage for hover-image previews near the left edge,
      right edge, top of viewport, bottom of viewport, after scroll, in light
      mode, and in dark mode.
- [x] Remove the shadcn/Radix hover-card primitive and React hover-image card
      only after no production component imports them.
- [x] Remove `@astrojs/react`, `react`, `react-dom`, `@types/react`,
      `@types/react-dom`, and `radix-ui` only if no remaining approved feature
      uses them.
- [x] Update hover-image component docs, the component inventory, package
      script docs if needed, and the catalog example for article previews.

## Milestone 45: Anchored Surface Regression Suite And Documentation

- [x] Add shared Playwright geometry helpers such as
      `expectTopAlignedToBottom`, `expectInlineStartAligned`,
      `expectInlineEndAligned`, `expectViewportGutters`,
      `expectPanelBelowHeader`, `expectTopmostAtPanelPoints`,
      `expectNoVisibleGap`, `expectRelationshipPreserved`, and
      `expectPlacementState`.
- [x] Replace scattered raw coordinate assertions with named relationship
      helpers so the tests read like design invariants.
- [x] Test anchored surfaces across mobile, short mobile, tablet, constrained
      laptop widths, desktop, and wide desktop viewports.
- [x] Test first, middle, last, and edge-positioned triggers for category
      dropdowns, search reveal, mobile menu, and hover-image previews where
      applicable.
- [x] Test anchored behavior after scroll, after resize, after theme changes,
      and after moving between mobile and desktop layout modes.
- [x] Test that no anchored surface creates page-level horizontal overflow.
- [x] Add regression coverage or review checks proving closed anchored
      surfaces are not eagerly measured on page load and that the adapter does
      not introduce unexpected client JavaScript growth.
- [x] Add component catalog examples for every anchored preset and every
      meaningful placement state, including constrained and clamped states.
- [x] Update affected component one-pagers, navigation docs, catalog docs, and
      testing docs so future developers know which relationships are public
      invariants.

## Milestone 46: Playwright Screenshot Inspection Pass

- [x] Build the site and run it through Playwright for manual screenshot-based
      inspection after Milestones 42-45 are complete.
- [x] Capture desktop, constrained laptop, tablet, mobile, short-mobile, and
      wide-desktop screenshots for the home page, articles hub, category page,
      search page, representative article page, catalog page, and author page.
- [x] Capture screenshots at the top, mid-scroll, near footer, with the sticky
      header visible, and with relevant anchored surfaces open.
- [x] Capture light-mode and dark-mode screenshots for representative pages and
      anchored surfaces.
- [x] Inspect screenshots for visual gaps, overlap, off-screen panels, wrong
      stacking, inconsistent widths, excessive whitespace, unreadable contrast,
      broken focus/current states, horizontal overflow, and cramped short
      viewport behavior.
- [x] Convert any issue found during screenshot review into a specific
      checklist item or fix it before marking the milestone complete.
- [x] Update component docs or tests when screenshot review reveals an
      invariant that should be permanently enforced.

## Milestone 47: Article TOC Responsive Rail And Centering Contract

- [x] Audit the article reading layout, table-of-contents rail, and margin
      sidebar behavior across tablet, constrained laptop, desktop, and wide
      desktop widths.
- [x] Decide whether the TOC issue is caused by rail width, responsive rail
      sizing, breakpoint timing, article-grid anatomy, or a combination of
      those constraints.
- [x] Adjust the TOC rail so it can narrow or collapse gracefully as available
      width changes, using layout relationships rather than one-off breakpoint
      guesses.
- [x] Preserve the invariant that the article content column remains visually
      centered in the reading area whether the TOC is visible or hidden.
- [x] Ensure hiding or collapsing the TOC does not cause the article body to
      jump, drift left/right, or inherit a browsing-page width.
- [x] Document the intended article/TOC rail relationship in the relevant
      component one-pagers and site anatomy docs.
- [x] Add Playwright layout invariants for representative articles proving the
      reading column stays centered with the TOC visible, with the TOC narrowed
      or hidden by responsive constraints, and after toggling the TOC
      disclosure.

## Milestone 48: Header Height Lock And Category Overflow Contract

- [x] Define the intended desktop and mobile header height contract in the
      header/navigation component docs, including what happens when categories
      have less inline space than expected.
- [x] Refactor the category row so category links shrink, compress, or
      gracefully hide behind the existing disclosure behavior instead of
      wrapping into an extra row or changing the header height.
- [x] Ensure the sticky header keeps a stable height across desktop,
      constrained laptop, tablet, mobile, zoomed text, long category labels,
      and light/dark modes.
- [x] Add Playwright layout invariants proving category navigation never
      creates horizontal overflow, never wraps into a third header row, and
      keeps the header height within the documented contract.

## Milestone 49: Image-Only Hover Preview Styling

- [x] Refine the native Astro hover-image preview so it displays the image
      itself without a card-like background.
- [x] Keep only media-appropriate treatment such as a subtle shadow, optional
      outline, and sensible image radius if needed for contrast.
- [x] Ensure the image-only preview still uses the anchored positioning system,
      remains viewport-contained, preserves useful alt text, and does not
      introduce layout shift.
- [x] Update hover-image component docs, catalog examples, and Playwright
      screenshots/tests to reflect the image-only visual contract.

## Milestone 50: Header Category Nav Proportions And Constrained Scaling

- [x] Revisit the Milestone 48 category-row implementation and restore the
      earlier desktop visual rhythm as the default: normal category spacing,
      normal label proportions, and no compressed equal-width tab look.
- [x] Preserve full category labels at every desktop/tablet width where the
      category row is visible; category names must not truncate into strings
      such as `Philos...`.
- [x] When inline space becomes constrained, proportionally compact the
      category row's typography, chevrons, and spacing as one visual system,
      preserving label text and relationships rather than rearranging items,
      changing proportions, using transform-based scaling that breaks anchored
      panels, or truncating individual labels.
- [x] Choose a clear fallback point where the full-label category row is no
      longer viable and switch to the mobile navigation pattern instead of
      wrapping, overflowing, or ellipsizing labels.
- [x] Update the header/navigation component docs to describe the visual
      rhythm, proportional shrink behavior, full-label invariant, and fallback
      behavior.
- [x] Add Playwright coverage across constrained laptop, tablet, and desktop
      widths proving the category row keeps full labels, preserves the locked
      header height, avoids overflow, and switches to mobile navigation before
      labels need truncation.
- [x] Apply the same constrained-space principle to the primary header row:
      preserve the normal brand, utility, and support sizing where possible,
      then scale or constrain the row before any brand/support overlap can make
      `The Philosopher's Meme` unreadable.
- [x] Add mobile-width Playwright coverage proving the brand and Support Us
      button do not overlap at iPhone-width resolutions and the primary row
      remains readable without horizontal overflow.

## Milestone 51: Mobile Header Full-Brand Fit Hardening

- [x] Restore the mobile header's visual brand text to
      `The Philosopher's Meme`; do not use `TPM` as a normal responsive
      fallback.
- [x] Make the header's mobile-width budget explicit: keep the existing
      centered three-column anatomy, compact adjacent controls before the
      brand, preserve edge inset, and shrink rather than overlap when space is
      constrained.
- [x] Use a stable header font so local and CI font differences do not decide
      whether the mobile brand fits.
- [x] Let the mobile brand use bounded row-container typography instead of
      adding finicky width breakpoints or putting size containment on the
      auto-sized brand item.
- [x] Preserve the full brand at the `md` desktop-header boundary by using a
      centered grid contract that cannot collapse the brand slot to zero.
- [x] Keep `Support Us` visible in the mobile header unless measurement proves
      it cannot coexist with the full brand at supported phone widths; any
      support-label fallback must be scoped to the header only.
- [x] Update component docs and tests so the contract is full brand first,
      no overlap, no horizontal overflow, and no desktop category row on
      mobile.
- [x] Verify the header at 320px and modern phone widths with Playwright
      before marking the milestone complete.

## Milestone 52: Header Brand Centering Invariant Hardening

- [x] Make the primary header row center the brand by construction at mobile,
      tablet, desktop, and wide desktop widths.
- [x] Compact adjacent utility, navigation, and support controls within their
      side tracks instead of changing the brand's horizontal center.
- [x] Add Playwright invariants proving the brand is visible, untruncated,
      horizontally centered in the header, non-overlapping, and overflow-free
      at the 768px boundary and the rest of the header viewport matrix.
- [x] Update the component documentation so future header work treats brand
      centering as a structural contract, not a breakpoint-specific visual
      adjustment.

## Milestone 53: Header Priority Layout Design

- [x] Design a no-JavaScript priority inline layout primitive for
      start/center/end header anatomy.
- [x] Specify how side slots align outward, compact before collision, and
      preserve a small minimum gap before the centered identity shrinks.
- [x] Specify how the centered brand remains geometrically centered and as
      large as the row height and available inline space allow.
- [x] Specify reusable component boundaries, slot contracts, responsive rules,
      catalog examples, and e2e/unit invariants for the header redesign.
- [x] Critically review the design for ambiguity, blocker risks, brittle CSS,
      accessibility regressions, and unnecessary JavaScript before marking it
      ready for implementation.

## Milestone 54: Header Priority Layout Primitives

- [x] Add `src/components/layout/PriorityInlineRow.astro` as a layout-only
      start/center/end primitive with named slots and pass-through attributes.
- [x] Add `src/components/ui/ActionCluster.astro` as a layout-only one-line
      action grouping primitive with explicit alignment and gap variants.
- [x] Add render tests proving the primitives expose stable data hooks, named
      slot output, alignment variants, nowrap behavior, and no product-specific
      semantics.
- [x] Add catalog metadata and catalog examples covering balanced rows,
      constrained side content, mobile header anatomy, and action clusters.

## Milestone 55: Site Header Priority Row Refactor

- [x] Refactor `SiteHeader.astro` to compose the primary row with
      `PriorityInlineRow` and `ActionCluster` instead of bespoke grid/flex
      wrappers.
- [x] Preserve the current header product behavior: desktop search/theme left,
      centered full brand, primary/support right, centered category row below,
      and mobile menu/full brand/support in one row.
- [x] Preserve existing data attributes and accessibility semantics used by
      anchored surfaces, tests, skip navigation, theme, and search behavior.
- [x] Update header/component docs if implementation clarifies any primitive or
      SiteHeader contract detail.

## Milestone 56: Header Priority Layout Verification

- [x] Strengthen render and Playwright checks so header tests assert the
      primitive-backed row relationship, not incidental class names.
- [x] Verify the header at 320px, 390px, 768px, constrained laptop, desktop,
      and wide desktop widths for visible full brand, no overlap, no horizontal
      overflow, stable row height, and correct desktop/mobile mode exposure.
- [x] Verify search reveal, category dropdowns, mobile menu, and theme changes
      do not move the centered brand or violate the anchored-surface contracts.
- [x] Run focused quality checks for the changed components, catalog, docs,
      unit tests, and e2e invariants before marking the milestone complete.

## Milestone 57: Anchored Disclosure Interaction Design

- [x] Design a shared disclosure behavior primitive for anchored surfaces that
      need hover, focus, touch tap, outside-dismiss, and Escape behavior.
- [x] Specify the separation between anchored positioning and disclosure state
      so placement math stays reusable and product components only declare
      relationships.
- [x] Specify touch-screen behavior for category previews and article
      hover-image previews without making hover the required interaction.
- [x] Specify accessibility, no-JavaScript fallback, responsive behavior,
      input-modality rules, testing requirements, and failure modes.
- [x] Critically review the design for ambiguity, brittle browser assumptions,
      accessibility regressions, unnecessary JavaScript, and implementation
      blockers before marking it ready for development.

## Milestone 58: Anchored Disclosure Primitive

- [x] Add the shared disclosure runtime under `src/scripts/` with event
      delegation for tap/click toggle, focus open/close, outside dismiss,
      sibling dismiss, Escape close, and disclosure state-change events.
- [x] Extend the anchored-positioning runtime so `data-disclosure-open="true"`
      is treated as an open anchored surface and disclosure state changes
      schedule placement.
- [x] Extend `AnchoredRoot` to opt into disclosure behavior through a narrow
      typed prop while preserving the existing anchored-positioning contract.
- [x] Add unit/render tests covering disclosure state, ARIA synchronization,
      outside dismiss, focus behavior, Escape close, and primitive markup.
- [x] Update primitive documentation to describe the disclosure contract and
      its relationship to anchored positioning.

## Milestone 59: Category Dropdown Disclosure Migration

- [x] Refactor `CategoryDropdown` so the category title remains a normal link
      and an adjacent chevron button owns explicit tap/click disclosure.
- [x] Replace ungated hover/focus visibility classes with disclosure data-state
      classes plus fine-pointer hover enhancement.
- [x] Preserve current anchored placement, current-page state, preview content,
      `View all <category>`, and no-JavaScript category navigation.
- [x] Add render and Playwright coverage for touch tap open, outside tap close,
      category-link navigation, keyboard focus, Escape close, mouse hover, and
      existing placement invariants.
- [x] Update category/dropdown/navigation design docs if implementation
      clarifies the final interaction contract.

## Milestone 60: Hover Image Disclosure Migration

- [x] Refactor `HoverImageCard` so touch tap opens the preview while mouse
      click keeps the normal full-image link behavior.
- [x] Keep the trigger inline, preserve no-JavaScript image-link fallback, and
      make the preview image itself link to the full image for touch users.
- [x] Replace ungated hover/focus visibility classes with disclosure data-state
      classes plus fine-pointer hover enhancement.
- [x] Add render and Playwright coverage for touch tap open, outside tap close,
      mouse hover, keyboard focus, viewport containment, image-only panel
      styling, and full-image fallback semantics.
- [x] Update hover-image component docs with the final mouse/touch/keyboard
      interaction contract.

## Milestone 61: Anchored Disclosure Verification

- [x] Run focused checks for disclosure runtime, anchored positioning,
      `AnchoredRoot`, `CategoryDropdown`, `HoverImageCard`, and their e2e
      suites.
- [x] Run full quality gates after the focused checks pass.
- [x] Review generated output for avoidable client-script regressions,
      horizontal overflow, duplicated classes, inaccessible controls, and
      stale documentation references.

## Milestone 62: Targeted Astro Prefetch

- [x] Enable Astro's built-in prefetch with explicit opt-in behavior and no
      global `prefetchAll`.
- [x] Add typed prefetch support to shared link primitives without changing
      external-link, hash-link, RSS, support, or media-link behavior.
- [x] Apply prefetch only to high-intent internal navigation: article cards,
      primary navigation, brand/home navigation, homepage archive CTAs,
      category overview links, and category-preview links.
- [x] Add focused tests proving prefetch attributes appear on intended links
      and stay off excluded links.
- [x] Run focused config/component checks and update the milestone when the
      implementation is verified.

## Milestone 63: Remaining High-Intent Prefetch

- [x] Add prefetch to dynamic search result links without relying on Astro's
      static link scan for post-load DOM content.
- [x] Add hover prefetch to author profile links, article-header category
      links, article-card category chips, same-category CTAs, and 404 recovery.
- [x] Add tap prefetch to dense mobile/sidebar category-tree links so scanning
      disclosures does not waste network traffic.
- [x] Keep footer, RSS, support/external, citation/reference, table of
      contents, hash-only, and media links un-prefetched.
- [x] Add focused tests proving the intended links prefetch and excluded link
      classes remain untouched.
- [x] Run focused checks plus the relevant quality gates before marking the
      milestone complete.

## Milestone 64: minify-html Research

- [x] Research `minify-html`, `@minify-html/node`, and the one-pass variant
      from upstream documentation.
- [x] Document whether one-pass should be a production candidate, an
      experiment-only path, or out of scope.
- [x] Document every `minify-html` configuration option, what it does, and the
      hard blockers for enabling it in this repo.
- [x] Define production blockers around validation, search, structured data,
      article prose fidelity, accessibility, Lighthouse-sensitive behavior,
      cross-platform CI, and gzip/Brotli-relevant size.
- [x] Add an initial conservative candidate configuration and the follow-up
      questions that must be answered by experiments.

## Milestone 65: minify-html Adoption Plan

- [x] Add a documented adoption plan that separates research, measurement,
      standard-library experiments, one-pass feasibility, and production
      integration.
- [x] Define the exact build, validation, e2e, a11y, coverage, search, and
      structured-data gates that every production candidate must pass.
- [x] Define how experiment results should be recorded before a production
      configuration is chosen.
- [x] Keep the plan ambitious about output size while rejecting noncompliant or
      behavior-changing output unless explicitly approved.

## Milestone 66: Payload Measurement Harness

- [x] Add a read-only payload reporting script for `dist` that reports raw,
      gzip, and Brotli sizes by asset type, with focused HTML totals and top
      contributors.
- [x] Add package scripts for baseline payload reporting and document them in
      `PACKAGE_SCRIPTS.md`.
- [x] Add tests for payload size aggregation, gzip/Brotli measurement,
      deterministic sorting, quiet output, and failure handling for missing
      build output.
- [x] Capture a baseline payload report before any post-build minification
      experiment changes production output.

## Milestone 67: minify-html Experiment Harness And Results

- [x] Add `@minify-html/node` as a dev dependency only after the measurement
      harness exists.
- [x] Add an explicit experiment script that can minify copied build output
      with named configurations without obscuring the baseline.
- [x] Add a reproducible suite script that runs all minify-html scenarios,
      validates each copied output, measures raw/gzip/Brotli deltas, writes a
      Markdown report, and can be rerun when the site or requirements change.
- [x] Test conservative, inline-JS, optional-tag, and noncompliant measurement
      configurations against the same baseline.
- [x] Check one-pass feasibility and record whether it has a maintained,
      cross-platform, Bun-friendly path that is worth testing.
- [x] Record raw/gzip/Brotli deltas, validation failures, and conclusions in
      generated `docs/performance/minify-html-experiments.md`.
- [x] Choose the smallest configuration that passes every required gate, or
      reject production adoption if savings do not justify the new dependency.

## Milestone 68: Production HTML Minification Integration (Deferred)

- [x] Defer production integration because Milestone 67 found no
      production-safe `minify-html` configuration.
- [ ] Reopen only after a future reproducible suite run identifies a
      production-safe
      configuration.
- [ ] Add the production post-build HTML minification script using the chosen
      explicit configuration.
- [ ] Run minification after Astro build and Pagefind indexing so final
      generated HTML is optimized while search indexing stays stable.
- [ ] Ensure production output remains plain static files; do not add `.gz` or
      `.br` sidecars for GitHub Pages.
- [ ] Update `bun run build`, verification scripts, package script docs, and
      tests so minification is deterministic, quiet on success, and
      release-blocking on failure.
- [ ] Verify the full release gate passes with minified output before marking
      the milestone complete.

## Milestone 69: Vite/Oxc Build Optimization Experiments

- [x] Research the installed Astro/Vite build-option surface, current Vite
      docs, and Oxc/Rolldown direction before changing production config.
- [x] Add a reproducible Vite build experiment harness that generates
      temporary Astro configs, builds each scenario, runs Pagefind, validates
      HTML, verifies generated output, and measures raw/gzip/Brotli payloads.
- [x] Test candidate and measurement-only scenarios against the same baseline,
      including current Oxc minification feasibility.
- [x] Record results and adoption conclusions in
      `docs/performance/vite-build-experiments.md`.
- [x] Update package script documentation and focused tests for the new
      experiment harness.
- [x] Adopt no production Vite config changes unless a scenario passes every
      gate and shows meaningful compressed-payload savings.

## Milestone 70: Asset Inlining Delivery Strategy Follow-Up

- [ ] Design whether `assetsInlineLimit: 0` is desirable despite changing
      Astro processed scripts from inlined page scripts into external static
      assets.
- [ ] Evaluate the tradeoff with Lighthouse, browser network waterfalls,
      repeat-page cache behavior, no-JavaScript fallback behavior, and existing
      static-page client-script verification policy.
- [ ] If the delivery model is approved, update build verification to encode
      the new allowed script contract instead of treating the extra scripts as
      accidental hydration.
- [ ] Rerun `bun run payload:vite:experiments`, browser tests, accessibility
      tests, and release checks before adopting the config.

## Milestone 71: Standalone Post-Build Optimization Experiments

- [x] Research standalone generated-output optimizers that do not require
      direct Astro/Vite integration, including Oxc JS minification, Lightning
      CSS, SVGO, and the already-tested HTML minification path.
- [x] Add a documented plan for standalone post-build optimization, including
      adoption gates and why JS output requires browser behavior proof.
- [x] Add a reproducible experiment harness that copies `dist/`, applies named
      standalone transforms, validates HTML, verifies build output, and measures
      raw/gzip/Brotli payload deltas.
- [x] Test standalone CSS, SVG, conservative Oxc JS, combined safe-stack, and
      aggressive Oxc measurement scenarios against the same baseline.
- [x] Record results and recommendations in
      `docs/performance/post-build-optimization-experiments.md`.
- [x] Update package script documentation and focused tests for the new
      standalone optimizer experiment harness.
- [x] Adopt no production post-build optimization until an optimized output
      passes full browser, accessibility, release, and payload gates.

## Milestone 72: Production Post-Build Optimization Adoption Follow-Up

- [x] Decide to adopt the passing `safe-stack` standalone transform stack:
      Lightning CSS, SVGO, and conservative Oxc JS whitespace optimization.
- [x] Add a deterministic post-build script that runs after Astro build and
      Pagefind without mutating source files or emitting `.gz`/`.br` sidecars.
- [x] Add tests proving the production optimizer is quiet on success, preserves
      required SVG `viewBox` data, keeps console behavior under conservative JS
      optimization, emits no compressed sidecars, and fails clearly when build
      output is missing.
- [x] Follow up on Oxc JS optimization by investigating whether the current
      verification failure is a real behavior issue or a syntactic verifier
      limitation around Astro's prefetch runtime.
- [x] If Oxc output is behavior-equivalent, replace brittle exact-string
      runtime checks with behavior-oriented or AST-aware verification before
      rerunning browser, accessibility, release, and payload gates.
- [x] Rerun standalone post-build experiments and confirm conservative Oxc JS
      and the combined safe-stack pass generated-output verification.
- [x] Serve the optimized safe-stack output directly and verify browser e2e and
      axe accessibility checks pass against optimized JavaScript/CSS/SVG.
- [x] Verify the full release gate passes with the production optimizer wired
      into `bun run build`.
- [x] Add a fresh release preview script that builds optimized output, verifies
      generated output, validates HTML, and then serves the release-like
      `dist/`.

## Milestone 73: Scripts Folder Organization Design And Refactor

- [x] Audit every script in `scripts/` and group it by responsibility:
      build/output optimization, content verification, asset verification,
      test/quality orchestration, payload experiments, and maintenance helpers.
- [x] Design a target folder structure that keeps package scripts stable where
      practical, uses thin root-level wrappers only when they improve
      compatibility, and avoids breaking CI or author-facing commands.
- [x] Move scripts with `git mv` where paths change, update imports, tests,
      package scripts, docs, CI references, and accountability coverage.
- [x] Add or update tests that lock the script entrypoint contract so future
      organization work cannot silently break package scripts.
- [x] Run the normal and release quality gates after the refactor.

## Milestone 74: Legacy Article Component Compatibility Cleanup

- [x] Audit `src/components/article/` compatibility wrappers and every import
      path that still references the legacy singular article namespace.
- [x] If no published Markdown/MDX or source module requires the compatibility
      wrappers, remove the legacy `src/components/article/` files and their
      mirrored tests.
- [x] Update catalog metadata, component docs, test-accountability coverage,
      and dead-code expectations so `src/components/articles/` is the single
      article component namespace.
- [x] Run focused component, catalog, dead-code, and release checks after the
      cleanup.

## Milestone 75: Flat Editorial Article List Redesign

- [x] Update the `ArticleCard` and `ArticleList` component design docs before
      implementation to specify a flatter editorial row treatment for archive,
      category, search, author, related-reading, and homepage list surfaces.
- [x] Define the shared row anatomy: date or compact metadata column, main text
      column, optional bounded image/media column, and separator rhythm without
      card boxes or nested framed containers.
- [x] Extend the normalized article-list data model only if needed for preview
      image metadata, keeping route construction, image choice, and fallback
      policy outside visual components where practical.
- [x] Design the no-image fallback explicitly: text should expand into the
      available row space without leaving an awkward empty media hole, while
      preserving alignment with image-backed rows in dense lists.
- [x] Implement the flat list through reusable `ArticleList`/`ArticleCard`
      variants or replacement primitives, not page-specific archive/search
      styling patches.
- [x] Update archive, category, author, search, homepage, `More in Category`,
      and related-reading surfaces to share the same list primitive unless a
      surface has a documented functional reason to differ.
- [x] Update catalog examples to show image-backed rows, no-image rows, long
      titles, long bylines, dense lists, single-item lists, light and dark
      themes, and mobile/tablet/desktop behavior.
- [x] Add or update component, unit, and e2e invariant tests for row alignment,
      bounded image sizing, no-image expansion, separator consistency, no
      horizontal overflow, link focus states, Pagefind/search-result behavior,
      and cross-surface reuse.
- [x] Verify search-result highlighting still renders safely and accessibly
      inside the flatter result layout.
- [x] Run focused component/catalog/browser checks and the normal release gate
      after the redesign.

## Milestone 76: Condensed Editorial Article Row Responsiveness

- [x] Update `ArticleCard` and `ArticleList` design docs to refine the flat
      row into a condensed editorial index pattern across mobile, tablet, and
      desktop.
- [x] Move date/category metadata into the main text column so mobile remains a
      concise version of the desktop row instead of switching to a separate
      stacked article teaser.
- [x] Use optional right-side thumbnails when image metadata exists: square and
      compact on small screens, rectangular on larger screens, vertically
      centered against clamped text.
- [x] Keep no-image rows from reserving media space while preserving the same
      scannable rhythm and minimum row height.
- [x] Clamp title and description text to sensible defaults so dense article
      lists remain uniform enough to scan without hiding the primary link.
- [x] Update dynamic search-result styling to follow the same concise,
      clamped, non-card list rhythm when no thumbnail data is available.
- [x] Update catalog examples and e2e/component tests for mobile two-column
      rows, desktop rectangular thumbnails, no-image fallback, row containment,
      and clamped text behavior.
- [x] Run focused component/catalog/browser checks and the normal release gate
      after the refinement.

## Milestone 77: Article List Title Fit Behavior

- [x] Document that article-list titles should shrink through stable density
      variants before the two-line ellipsis fallback applies.
- [x] Add a pure, tested title-fit helper so long article-list titles can use
      smaller type without adding browser measurement JavaScript.
- [x] Wire `ArticleCard` and dynamic search result rows to the same title-fit
      helper while leaving article-page headings unchanged.
- [x] Keep row layout stable when a title shrinks: metadata, excerpt, byline,
      and optional thumbnail should stay aligned and vertically centered.
- [x] Update component/catalog/browser tests for normal, dense, compact,
      minimum emergency, and hard-clamped article-list titles.
- [x] Run focused checks and the release gate before marking the milestone
      complete.

## Milestone 78: Article List Description Fit Behavior

- [x] Document that article-list descriptions should shrink through stable
      density variants before the three-line ellipsis fallback applies.
- [x] Add pure, tested description-fit behavior so long article-list excerpts
      can use tighter density without browser measurement JavaScript.
- [x] Wire `ArticleCard` and dynamic search result excerpts to the shared
      description-fit helper while preserving sanitized search highlight
      rendering.
- [x] Increase article-list and search-result row rhythm so the three-line
      description budget has real layout space instead of only a looser clamp.
- [x] Keep row layout stable when a description shrinks: title, metadata,
      byline, and optional thumbnail should stay aligned and vertically
      centered.
- [x] Update component and script tests for default, compact, tight,
      highlighted, and hard-clamped description behavior.
- [x] Run focused checks and the release gate before marking the milestone
      complete.
