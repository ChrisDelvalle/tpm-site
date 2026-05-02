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
- [x] Move or wrap the existing article components from
      `src/components/article/` into the long-term
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
- [x] Add `scripts/verify-component-catalog.ts` to scan
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
- [x] Add `src/components/navigation/CategoryTree.astro`,
      `CategoryGroup.astro`, and `CategorySidebar.astro`.
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

- [ ] Implement only after Milestones 16 and 17 are complete.
- [ ] Create or refactor the reusable layout primitives named in the design:
      site shell, main frame, page frame, reading body, browsing body, section
      stack, content rail, endcap stack, and margin/sidebar layout as needed.
- [ ] Add `src/components/layout/ReadingBody.astro`,
      `BrowsingBody.astro`, `SectionStack.astro`, `ContentRail.astro`,
      `EndcapStack.astro`, and `MarginSidebarLayout.astro` according to their
      component one-pagers.
- [ ] Make layout primitives own reusable constraints: content measure, gutters,
      vertical rhythm, sidebar/margin placement, sticky offsets, overflow rules,
      and responsive breakpoints.
- [ ] Keep route files thin: each route should load data, choose the correct
      page body, pass normalized props, and avoid implementing custom layout
      structure inline.
- [ ] Refactor article detail pages to use the reading-body anatomy and remove
      duplicated layout decisions from `ArticleLayout.astro` and article route
      composition.
- [ ] Refactor homepage, article archive, category index, category detail,
      search, and generic Markdown pages to use the browsing/prose body
      primitives where appropriate.
- [ ] Ensure support CTAs, category discovery, related reading, archive links,
      and tags are placed through named reusable surfaces rather than ad hoc
      per-page markup.
- [ ] Ensure category detail pages, article archive pages, category index pages,
      and search pages share the same browsing body and archive/list section
      primitives unless the design doc explicitly justifies a difference.
- [ ] Ensure article pages and generic Markdown pages share prose/readability
      primitives without coupling generic pages to article-only metadata or
      article-only endcaps.
- [ ] Remove obsolete one-off width, spacing, and grid patches after the shared
      anatomy primitives own those decisions.
- [ ] Add or update catalog examples for every new or changed anatomy primitive.
- [ ] Add render tests for new anatomy primitives proving semantic structure,
      slots, required labels, heading levels, and empty/missing-content states.
- [ ] Add Playwright invariants proving reading pages preserve readable measure,
      browsing pages preserve comfortable listing width, and both page-body
      types remain consistent across mobile, tablet, desktop, wide desktop, and
      short viewport heights.
- [ ] Add Playwright invariants proving shared anatomy prevents regressions:
      no horizontal overflow, no duplicated critical landmarks, no competing
      sidebars/mobile menus, support/discovery surfaces keep intended order,
      and centered content stays centered when sidebars are present.
- [ ] Confirm implementation still matches `docs/SITE_ANATOMY.md`; update the
      design doc before implementation if a route cannot fit either
      `ReadingBody` or `BrowsingBody`.

## Milestone 25: Category Dropdown Discovery

- [ ] Implement only after Milestones 16, 17, and 18 are complete.
- [ ] Add or update `src/components/navigation/DiscoveryMenu.astro`,
      `CategoryDropdown.astro`, and `CategoryPreviewList.astro` according to
      the documented component contracts.
- [ ] Use the documented HTML `popover` desktop disclosure pattern unless a
      focused proof shows it cannot satisfy accessibility, browser, or layout
      requirements.
- [ ] Move primary desktop category discovery from the left category sidebar
      into the site-wide navigation while keeping a normal `/categories/` link
      and direct category links reachable.
- [ ] Ensure the mobile menu exposes equivalent category discovery without
      rendering a competing desktop sidebar at mobile/tablet widths.
- [ ] Source dropdown data from the shared navigation/content boundary rather
      than fetching or shaping article data inside visual components.
- [ ] Show category labels, a restrained set of recent or featured article
      previews where the design calls for them, and a clear View All link.
- [ ] Do not render the full archive inside the header dropdown.
- [ ] Ensure every dropdown destination remains accessible through normal links
      when JavaScript is disabled.
- [ ] Ensure dropdown controls are keyboard reachable, dismissible, focus-safe,
      pointer/touch usable, and named correctly for assistive technology.
- [ ] Add catalog examples for desktop, mobile, long category labels, many
      categories, empty preview data, dark mode, light mode, and no-JavaScript
      fallback behavior.
- [ ] Add render tests for semantic structure, labels, links, empty preview
      behavior, and stable data boundaries.
- [ ] Add Playwright keyboard/focus/pointer tests before using the dropdown in
      production navigation.
- [ ] Add Playwright responsive invariants proving category discovery does not
      collide with the header, does not create horizontal overflow, and does not
      duplicate visible desktop/mobile controls.
- [ ] Remove or disable the old desktop category sidebar as a category discovery
      surface after the dropdown and fallback category paths are working.
- [ ] Update affected component one-pagers and `docs/COMPONENT_ARCHITECTURE.md`
      after implementation if the final behavior differs from the design docs.

## Milestone 26: Article Table Of Contents Margin Sidebar

- [ ] Implement only after Milestones 16, 17, and 19 are complete.
- [ ] Create or refactor the shared margin/sidebar layout primitive so the left
      margin can host article-local navigation without affecting the centered
      reading measure.
- [ ] Replace the old category-sidebar usage on article pages with the article
      table-of-contents surface.
- [ ] Keep category discovery available through the site navigation, mobile
      menu, footer/homepage discovery, and category pages after the article TOC
      replaces the desktop sidebar.
- [ ] Build a heading extraction boundary in `src/lib/` or the article view
      model so visual TOC components receive normalized heading data and do not
      parse content themselves.
- [ ] Use Astro-rendered heading metadata as the source of truth for TOC links;
      do not query rendered DOM or parse article Markdown source in visual
      components.
- [ ] Include only the heading levels chosen in the design doc and preserve
      stable heading IDs for hash links.
- [ ] Handle duplicate heading text deterministically and add tests for the
      generated labels/links.
- [ ] Do not render an empty TOC sidebar when an article has no headings or too
      few headings for useful local navigation.
- [ ] Add a visible hide button for the TOC with keyboard support, accessible
      name, sensible focus return, and the smallest practical client-side
      behavior.
- [ ] Start hide/show with native `details`/`summary`; add JavaScript only for
      explicitly approved progressive enhancements such as active-section
      highlighting or persistence.
- [ ] Ensure hiding the TOC does not reflow the reading column in a way that
      makes the article jump or lose scroll position.
- [ ] If active-section highlighting is implemented, keep it progressive:
      static hash links must work without JavaScript, and the enhancement must
      not block reading.
- [ ] Add catalog examples for article TOC with many headings, no headings, long
      headings, duplicate headings, hidden state, short viewport, mobile,
      tablet, desktop, and wide desktop.
- [ ] Add render tests for TOC structure, heading-link normalization,
      no-headings behavior, hidden-state markup, and accessible labels.
- [ ] Add Playwright invariants proving the TOC stays below the sticky header,
      never overlays prose, never creates horizontal overflow, and keeps the
      reading column centered.
- [ ] Add Playwright interaction tests for hide/show behavior, keyboard
      navigation, hash-link navigation, focus-visible states, and mobile/tablet
      absence or compact behavior.
- [ ] Remove obsolete category-sidebar tests, catalog examples, docs, or route
      wiring that no longer match the new category navigation plus article TOC
      architecture.

## Milestone 27: Article References Data Path Proof

- [ ] Implement only after the article-local reference portions of Milestones
      20 and 21 are complete.
- [ ] Add focused fixtures for one Markdown article and one MDX article that use
      canonical `note-*` and `cite-*` labels with rich definition content.
- [ ] Prove whether `render(entry).remarkPluginFrontmatter` can carry
      normalized note/citation data and rich renderable definition content from
      the Markdown pipeline to `ArticleLayout`.
- [ ] Document the result in `docs/remark-plugins/article-references.md`,
      including the exact data shape available to article routes/layouts.
- [ ] Choose the component-rendered metadata path if it can preserve rich
      definitions safely.
- [ ] Choose the documented AST-injection fallback only if the proof shows the
      metadata path cannot preserve renderable definition content.
- [ ] Keep the proof isolated from the published article corpus; do not enable
      release-blocking validation or edit article content in this milestone.
- [ ] Add focused tests for the proof path so future Astro upgrades cannot
      silently break reference data transport.

## Milestone 28: Article References Model And Pure Normalization

- [ ] Add `src/lib/article-references/` with the smallest useful split for
      `model.ts`, `normalize.ts`, `validate.ts`, and ID/display-label helpers.
- [ ] Model references with discriminated, type-safe shapes for notes,
      citations, definitions, source markers, generated IDs, display labels,
      and diagnostics.
- [ ] Make invalid states unrepresentable after normalization: unknown label
      kind, malformed slug, duplicate definitions, missing definitions,
      unreferenced definitions, repeated notes, ID collisions, and ambiguous
      classification should not survive as renderable data.
- [ ] Implement label classification for `note-*` and `cite-*` labels using
      lowercase ASCII slug rules.
- [ ] Implement deterministic first-reference ordering and deterministic IDs
      for note entries, citation entries, source markers, and citation backrefs.
- [ ] Implement display-label extraction only for a valid leading `[@...]`
      marker at the first inline position of `note-*` or `cite-*`
      definitions.
- [ ] Preserve rich definition children after removing leading display-label
      metadata; do not flatten definitions to plain strings too early.
- [ ] Keep pure helpers independent of Astro so they can be tested without
      building the site.
- [ ] Add table-driven unit tests for accepted and rejected labels, duplicate
      detection, missing reference/definition detection, ordering, repeated
      citation handling, repeated note failure, ID generation, display-label
      extraction, and rich definition preservation.

## Milestone 29: Article References Remark Plugin

- [ ] Add direct dependencies where needed instead of relying on transitive
      packages: `unist-util-visit`, explicit mdast types if needed, and
      `remark`/`remark-gfm` for isolated plugin tests if those tests require
      them.
- [ ] Add `src/remark-plugins/articleReferences.ts` as a thin unified remark
      transformer that orchestrates the pure article-reference helpers.
- [ ] Visit every `footnoteReference` and `footnoteDefinition` node through the
      parsed Markdown AST rather than regexing source text or post-render HTML.
- [ ] Classify labels by `note-*` and `cite-*`; fail on any other published
      article footnote label once validation is enabled.
- [ ] Extract optional leading display labels from valid note/citation
      definitions and preserve later `[@...]` text as ordinary definition
      content.
- [ ] Preserve rich Markdown definition content, including emphasis, links,
      inline code, punctuation, and GFM continuation blocks.
- [ ] Suppress or replace Astro/GFM's default combined footnote output so custom
      note and bibliography sections do not duplicate it.
- [ ] Replace inline footnote reference nodes with accessible marker links, or
      produce the equivalent renderable marker representation chosen in
      Milestone 27.
- [ ] Use `file.fail(...)` for blocking errors and `file.message(...)` only for
      review-only warnings; messages must be author-readable and include how to
      fix the problem.
- [ ] Add plugin integration tests using `remark`, `remark-gfm`, and the plugin
      for valid notes, valid citations, mixed notes/citations, repeated
      citations, repeated-note failure, display labels, malformed display
      labels, invalid legacy labels, missing definitions, unreferenced
      definitions, duplicate definitions, and rich definitions.
- [ ] Wire the plugin into `astro.config.ts` under `markdown.remarkPlugins`
      only after isolated plugin tests pass.
- [ ] Verify MDX inherits the same plugin behavior as Markdown.

## Milestone 30: Article Reference Rendering Components

- [ ] Implement only after Milestones 27, 28, and 29 establish the data path and
      normalized model.
- [ ] Implement `src/components/articles/ArticleReferences.astro` according to
      `docs/components/articles/ArticleReferences.md`.
- [ ] Implement `src/components/articles/ArticleFootnotes.astro` according to
      `docs/components/articles/ArticleFootnotes.md`.
- [ ] Implement `src/components/articles/ArticleBibliography.astro` according
      to `docs/components/articles/ArticleBibliography.md`.
- [ ] Implement `src/components/articles/ArticleReferenceBacklinks.astro`
      according to `docs/components/articles/ArticleReferenceBacklinks.md`.
- [ ] Keep visual components data-driven: they must not parse Markdown, inspect
      article source, fetch global content, or infer citations from inline
      prose links.
- [ ] Render nothing for no references, only notes for notes-only articles, only
      bibliography for citation-only articles, and notes before bibliography
      when both exist.
- [ ] Render notes as numbered article footnotes by default while preserving
      optional note display labels as metadata.
- [ ] Render citations numerically by default and with explicit display labels
      when the normalized citation data provides them.
- [ ] Render stable entry IDs and accessible backlinks from each note/citation
      entry to the originating inline marker or markers.
- [ ] Keep reference sections in the article reading measure, with long labels,
      titles, URLs, and many backlinks wrapping without horizontal overflow.
- [ ] Use semantic headings, ordered lists, links, and Tailwind semantic tokens;
      do not create extra landmarks or CTA/card styling for reference
      apparatus.
- [ ] Add catalog examples for no references, notes only, citations only, both,
      repeated citations, display labels, long URLs, rich definitions, dark
      mode, light mode, mobile, desktop, and wide desktop.
- [ ] Add Astro render tests for empty states, section ordering, default
      headings, ordered-list output, stable IDs, backlinks, accessible labels,
      long content, and preserved rich definition content.

## Milestone 31: Article Reference Article Integration And Gates

- [ ] Wire normalized article reference data from `render(article)` into
      `ArticleLayout` or the article route without making route files parse
      Markdown or inspect article source.
- [ ] Place `ArticleReferences` after `ArticleEndcap` and before `ArticleTags`
      on article pages.
- [ ] Verify article end ordering remains prose, support CTA, more-in-category
      and related discovery, notes/bibliography, then tags as the final article
      surface.
- [ ] Ensure article pages do not render Astro's default combined GFM footnote
      section alongside custom note/bibliography sections.
- [ ] Add Astro integration tests for `.md` and `.mdx` article content running
      through the plugin.
- [ ] Add route/build tests proving invalid published article references fail
      only after the corpus is normalized or explicitly excepted.
- [ ] Add Playwright checks that reference markers and backlinks are keyboard
      focusable links, have visible focus states, and navigate to the intended
      entry/marker targets.
- [ ] Add accessibility checks for sensible headings, no duplicate IDs, no
      competing landmarks, and readable links in light and dark mode.
- [ ] Add responsive checks proving reference sections do not create horizontal
      overflow at mobile, tablet, desktop, wide desktop, and short viewport
      heights.
- [ ] Update `docs/remark-plugins/article-references.md`,
      `docs/COMPONENT_ARCHITECTURE.md`, and component one-pagers if the final
      integration differs from the design.

## Milestone 32: Article Reference Corpus Normalization

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

## Milestone 33: Global Bibliography Page Implementation

- [ ] Implement only after Milestones 20, 21, and 32 provide approved global
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

## Milestone 34: Author Pages Implementation And Metadata Normalization

- [ ] Implement only after Milestones 22 and 23 are complete.
- [ ] Add the author metadata source and content schema chosen in the technical
      design.
- [ ] Add `src/content/authors/` as the canonical author collection, with
      author IDs as stable entry slugs and Markdown body content available for
      long profile pages.
- [ ] Normalize article author references only according to the approved
      article-content plan and preserve article wording and author intent.
- [ ] Add `/authors/[author]/` routes for all public author profiles.
- [ ] Add an `/authors/` index route because the component design includes it
      as a useful footer/discovery destination.
- [ ] Implement `src/components/authors/AuthorLink.astro`,
      `AuthorByline.astro`, `AuthorBioBlock.astro`,
      `AuthorProfileHeader.astro`, `AuthorArticleList.astro`,
      `AuthorSocialLinks.astro`, `AuthorPage.astro`, and
      `AuthorsIndexPage.astro` according to their component one-pagers.
- [ ] Link article bylines to author pages when author data is known and use the
      approved fallback behavior when it is not.
- [ ] Reuse `AuthorByline` through `ArticleMeta`, `ArticleHeader`,
      `ArticleCard`, article lists, author pages, and related-reading surfaces
      so author display does not fork by page type.
- [ ] Render optional article-page author bio surfaces only when approved
      profile metadata exists; do not render placeholder author copy.
- [ ] Add author metadata to JSON-LD, RSS, canonical metadata, and other
      machine-readable surfaces according to the technical design.
- [ ] Add schema, relationship, route smoke, render, accessibility, RSS, JSON-LD,
      and Playwright tests defined by the design milestones.
- [ ] Update author-facing article submission documentation with author
      reference and metadata guidance.
- [ ] Update `CHECKLIST.md` with any remaining author metadata follow-up
      discovered during implementation.
