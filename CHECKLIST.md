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
- [ ] Manually inspect the component catalog in light and dark mode.
- [ ] Manually inspect long titles, missing excerpts, missing images, empty
      search, category pages, article endcaps, and support CTAs.
- [ ] Verify likely LCP images are eager only when appropriate and below-fold
      media lazy-loads.
- [ ] Verify media and embeds reserve stable space and do not cause layout
      shift.
- [ ] Verify JSON-LD, Open Graph, canonical URLs, sitemap, RSS, and Pagefind
      still work after the component extraction.

## Milestone 13: Component Design One-Pagers

- [ ] Add `docs/components/README.md` describing the component design
      one-pager standard and where new component designs must be documented
      before implementation.
- [ ] Structure `docs/components/` to mirror `src/components/`, including
      subfolders such as `ui/`, `media/`, `layout/`, `navigation/`,
      `articles/`, `pages/`, `blocks/`, and `islands/` where corresponding
      component folders exist.
- [ ] Add a reusable component one-pager template covering purpose, public
      contract, composition relationships, layout behavior, responsive behavior,
      layering/z-index behavior, interaction states, accessibility semantics,
      content edge cases, theme behavior, and testable invariants.
- [ ] Inventory every public component in `src/components/` and every page-level
      block in `src/components/blocks/`, grouped by UI primitive, layout,
      navigation, article, page, media, and homepage responsibility.
- [ ] Create a one-page design doc for every existing public component and
      block, using the template and keeping each doc specific to the actual
      component rather than generic design guidance.
- [ ] For each component one-pager, document its intended relationships to
      sibling and parent components: alignment, shared dimensions, spacing,
      containment, ordering, visibility exclusivity, sticky/fixed behavior, and
      what should happen during scrolling and resizing.
- [ ] For each component one-pager, document all meaningful states and variants:
      default, hover, focus-visible, active, disabled, current, selected,
      expanded/collapsed, empty, loading, error, missing content, long content,
      and dense content where applicable.
- [ ] For each layout-sensitive component one-pager, document the mobile base
      behavior, tablet behavior, desktop behavior, wide behavior, short-viewport
      behavior, wrapping rules, overflow rules, and container/viewport
      dependencies.
- [ ] For each interactive component one-pager, document keyboard behavior,
      pointer behavior, touch behavior, focus order, accessible names, ARIA or
      native semantic requirements, and no-JavaScript fallback expectations.
- [ ] For each media/content component one-pager, document image sizing,
      aspect-ratio behavior, caption relationships, fallback behavior, loading
      policy, and how content should avoid layout shift.
- [ ] For each component one-pager, list the specific invariant, render,
      accessibility, interaction, and visual checks that should exist in tests.
- [ ] Record brittle or questionable implementation decisions discovered during
      documentation in the relevant one-pager with a follow-up note, instead of
      silently treating the current implementation as the design contract.
- [ ] Move or create the component architecture source of truth at
      `docs/COMPONENT_ARCHITECTURE.md`, keeping agent-specific summaries out of
      the project design-doc tree.
- [ ] Update `docs/COMPONENT_ARCHITECTURE.md` to state that new
      component work starts with a one-pager, then catalog examples, then
      implementation, then tests.

## Milestone 14: Component Invariant Documentation And Tests

- [ ] Use the Milestone 13 one-pagers as the source of truth for component
      intentions, and update a one-pager first if a missing or unclear
      invariant is discovered while writing tests.
- [ ] Add reusable Playwright layout helpers under `tests/e2e/helpers/` for
      bounding boxes, overlap detection, visible dimensions, viewport matrices,
      scroll positions, focus state, z-order checks, and element-relative
      assertions.
- [ ] Add component-catalog e2e coverage that exercises canonical component
      examples in light mode and dark mode without depending on production-only
      pages.
- [ ] Add invariant tests for UI primitives: buttons, link buttons, icon
      buttons, text links, inputs, badges, separators, cards, containers, and
      sections.
- [ ] Test primitive relationships where meaningful: equal heights, consistent
      alignment, stable dimensions across variants, disabled and focus-visible
      states, text wrapping, and no accidental low-contrast states.
- [ ] Add invariant tests for site layout: header, shell, main frame, sidebar,
      footer, skip link, and page frame composition.
- [ ] Test layout relationships across scrolling and resizing: sticky elements
      do not overlap incorrectly, fixed-height regions remain stable, sidebars
      stay below headers, footers do not cover content, and content never gains
      unintended horizontal overflow.
- [ ] Add invariant tests for navigation components: brand link, primary nav,
      support link, theme toggle, search form, mobile menu, category tree,
      category groups, and category sidebar.
- [ ] Test navigation behavior across viewports: desktop and mobile surfaces do
      not both expose conflicting controls, hidden surfaces are truly hidden,
      disclosure state does not cause unwanted navigation, keyboard focus order
      remains usable, and touch-size targets remain practical.
- [ ] Add invariant tests for article components: article header, metadata,
      tags, prose wrapper, article cards, article lists, more-in-category,
      related/discovery placeholders, and article endcaps.
- [ ] Test article relationships: prose measure remains readable, hero/media
      placement does not shift surrounding content, article cards align in
      grids, metadata remains associated with titles, and endcap/support blocks
      do not compete visually with article content.
- [ ] Add invariant tests for media and embed components: responsive images,
      hover-card images, iframes, embeds, captions, and missing-media states.
- [ ] Test media behavior across viewports: media stays centered where intended,
      aspect ratios are preserved, previews stay related to their trigger,
      embeds reserve space, and images do not exceed their containing measure.
- [ ] Add invariant tests for homepage and archive blocks: hero, announcement,
      latest article, featured/start-here, category overview, archive links,
      search results, support block, and footer discovery surfaces.
- [ ] Fix and test the homepage bottom support block so its bounding box aligns
      with the same content measure/container as the surrounding homepage
      sections instead of spanning wider than the rest of the content.
- [ ] Test dynamic behavior where it represents component intent: theme
      persistence, search result highlighting renders as real markup rather than
      escaped text, search empty states, mobile menu disclosure, category
      disclosure, and hover/focus/touch alternatives for interactive previews.
- [ ] Prefer stable `data-*` test anchors for structural relationships that are
      hard to select semantically, and avoid tests coupled to incidental class
      strings unless the class is the public contract being tested.
- [ ] Record brittle or questionable implementation decisions discovered during
      invariant review in `docs/COMPONENT_ARCHITECTURE.md` or a focused
      follow-up checklist item instead of hiding them in tests.
- [ ] Keep invariant tests useful rather than screenshot-only: assert explicit
      relationships, states, dimensions, visibility, stacking, focus behavior,
      overflow, and interaction outcomes.
- [ ] Update `PACKAGE_SCRIPTS.md` if new invariant-specific test scripts or
      catalog test commands are added.

## Milestone 15: Regression Hardening And Reliability Gates

- [ ] Add a "new component readiness" policy to
      `docs/COMPONENT_ARCHITECTURE.md`: every new public component needs
      a catalog example, render test, documented invariants, invariant e2e tests
      when layout-sensitive, and keyboard/a11y tests when interactive.
- [ ] Add or update reusable hostile fixtures for catalog and tests: long
      titles, long unbroken words, missing images, missing excerpts, many tags,
      empty states, dense lists, one-item lists, many-item lists, narrow
      containers, short viewport heights, unusual punctuation, and both themes.
- [ ] Audit component state modeling and replace brittle boolean clusters with
      discriminated states where a component can be `empty`, `ready`, `error`,
      `loading`, `expanded`, `collapsed`, `selected`, or otherwise mutually
      exclusive.
- [ ] Keep internal URL construction centralized in `src/lib/routes.ts` or
      similarly explicit route helpers; remove hand-built internal URLs from
      components where a route helper should be used.
- [ ] Add route-helper tests for every public helper, including trailing-slash
      behavior, article paths, category paths, page paths, RSS/feed paths, and
      canonical URL composition.
- [ ] Add content schema and published-filter tests for required frontmatter,
      invalid dates, invalid image references, unpublished content exclusion,
      duplicate article slugs, missing category metadata, and category/article
      count consistency.
- [ ] Add route-level smoke coverage for every generated page and endpoint:
      homepage, articles, categories, Markdown pages, RSS/feed, sitemap, search,
      and representative article/category detail pages.
- [ ] Add semantic document tests for key routes: one `main`, valid skip-link
      target, sensible heading order, labeled navigation landmarks, footer
      landmark, accessible names for links/buttons, and no duplicate critical
      landmarks.
- [ ] Add focused visual-regression coverage for stable surfaces: homepage,
      article page, component catalog overview, header/nav, sidebar, support
      block, article cards, search results, and mobile menu.
- [ ] Keep visual-regression tests targeted and reviewable; do not replace
      explicit invariant assertions with broad screenshot tests where a
      relationship can be tested directly.
- [ ] Add build-output guards for no accidental catalog route in production, no
      unexpected client JavaScript growth, no unexpected hydration boundaries,
      no source maps unless deliberately enabled, no broken internal links, and
      no escaped markup where real HTML is intended.
- [ ] Add asset-integrity checks for referenced local images, required alt text
      or documented alt exceptions, approved `public/` files only, and
      project-owned images living under `src/assets/`.
- [ ] Add design-token enforcement or review checks for hard-coded colors,
      border radii, shadows, and spacing in first-party UI when semantic tokens
      or component variants should be used instead.
- [ ] Add theme-matrix checks for key components so light and dark mode both
      preserve readable text, visible borders, visible focus rings, and correct
      CTA contrast.
- [ ] Add interaction-state checks for hover, focus-visible, active, disabled,
      current, selected, expanded, and collapsed states where those states are
      part of a component contract.
- [ ] Add content-relationship tests so article cards link to the correct
      routes, article metadata remains associated with titles, category counts
      match published article data, and archive/search/RSS use the same
      published-content filter.
- [ ] Add review-only performance budget checks for page weight, client
      JavaScript size/count, image sizing, LCP candidate sanity, and
      CLS-sensitive layout shifts.
- [ ] Maintain a documented exception ledger for intentionally untested,
      untestable, or deliberately rule-breaking cases, with a clear reason and
      explicit handoff note.
- [ ] Establish a regression policy: every layout, accessibility, routing,
      content, or interaction bug fix should add a focused invariant or
      contract test for the underlying intention.
- [ ] Update `PACKAGE_SCRIPTS.md`, CI workflow comments, and agent docs if new
      reliability scripts, review-only checks, or release gates are added.

## Milestone 16: Optional Category Dropdown Discovery

- [ ] Revisit category dropdowns only after `SectionNav`, `CategoryTree`,
      homepage discovery blocks, and footer discovery are stable.
- [ ] Decide whether dropdowns use native `details`/`summary`, HTML `popover`,
      or a small Radix/shadcn island based on accessibility and browser testing.
- [ ] Add `src/components/navigation/DiscoveryMenu.astro`,
      `CategoryDropdown.astro`, and `CategoryPreviewList.astro` only if the
      basic section nav needs richer discovery.
- [ ] Limit dropdown content to a few recent or featured article previews and a
      View All link.
- [ ] Do not render the full archive inside the header.
- [ ] Ensure every dropdown destination remains accessible through normal links
      when JavaScript is disabled.
- [ ] Add catalog examples and Playwright keyboard/focus tests for dropdown
      behavior before using it in production navigation.
