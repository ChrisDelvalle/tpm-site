# Component Architecture Implementation Checklist

This checklist translates `agent-docs/COMPONENT_ARCHITECTURE.md` into
developer-ready implementation milestones.

Scope rules:

- Do not edit `src/content/articles/` for these milestones unless a future task
  explicitly asks for article-content work.
- Keep each milestone independently buildable and reviewable.
- Prefer structure-preserving extraction before visual redesign.
- Keep normal production builds static and free of internal catalog routes.

## Milestone 1: Component Directory Foundation And UI Primitives

- [ ] Create the target component folders that do not already exist:
      `src/components/ui/`, `src/components/media/`,
      `src/components/layout/`, `src/components/navigation/`,
      `src/components/articles/`, `src/components/pages/`,
      `src/components/blocks/`, and `src/components/islands/`.
- [ ] Move or wrap the existing article components from
      `src/components/article/` into the long-term
      `src/components/articles/` namespace, preserving imports and behavior.
- [ ] Add `src/components/ui/Button.astro` for button actions with typed
      `variant`, `size`, and `tone` props.
- [ ] Add `src/components/ui/LinkButton.astro` for link-shaped CTAs such as
      Support links.
- [ ] Add `src/components/ui/IconButton.astro` with a required accessible label.
- [ ] Add `src/components/ui/TextLink.astro` for inline and navigation links
      that need shared focus/hover behavior.
- [ ] Add `src/components/ui/Input.astro` for shared native input styling.
- [ ] Add `src/components/ui/Badge.astro`,
      `src/components/ui/Separator.astro`, `src/components/ui/Container.astro`,
      `src/components/ui/Section.astro`, and `src/components/ui/Card.astro`.
- [ ] Add `src/components/media/ResponsiveIframe.astro` for stable,
      accessible iframe sizing with required titles.
- [ ] Add `src/components/media/EmbedFrame.astro` for external embeds with
      stable spacing, fallback content, and loading policy.
- [ ] Ensure primitives use semantic Tailwind tokens such as
      `bg-background`, `text-foreground`, `border-border`, `bg-card`,
      `text-muted-foreground`, and `text-primary`.
- [ ] Keep primitive class strings statically visible to Tailwind through
      `class:list` in Astro or complete class-string maps where needed.
- [ ] Add or update lightweight render examples in comments or tests only where
      the component contract would otherwise be ambiguous.

## Milestone 2: Component Catalog Foundation

- [ ] Add `src/catalog/catalog.config.ts` with explicit catalog metadata and an
      ignore list for intentionally uncatalogued public components.
- [ ] Add `src/catalog/ComponentCatalog.astro`,
      `src/catalog/CatalogSection.astro`, and
      `src/catalog/CatalogExample.astro`.
- [ ] Add `src/catalog/examples/ui.examples.ts` with realistic examples for
      the UI primitives from Milestone 1.
- [ ] Add a tracked `.env.catalog` file that sets
      `TPM_COMPONENT_CATALOG=true` and `ASTRO_TELEMETRY_DISABLED=1`.
- [ ] Add `src/pages/catalog/[...path].astro` and gate `getStaticPaths()` behind
      `TPM_COMPONENT_CATALOG=true`.
- [ ] Return no catalog paths when `TPM_COMPONENT_CATALOG` is not enabled, and
      return the top-level `/catalog/` path when it is enabled.
- [ ] Treat `TPM_COMPONENT_CATALOG` as `false` when it is unset, empty, or any
      value other than `true`.
- [ ] Ensure normal `bun run build` output does not include `dist/catalog`.
- [ ] Add `scripts/verify-component-catalog.ts` to scan
      `src/components/**/*.{astro,tsx}` for public components.
- [ ] Require every public component to have a catalog example or an ignore-list
      entry with a short reason.
- [ ] Add package scripts:
      `catalog:dev`, `catalog:build`, `catalog:preview`,
      `catalog:preview:fresh`, and `catalog:check`.
- [ ] Ensure `catalog:*` scripts opt into the catalog with
      `bun --env-file=.env.catalog` instead of relying on Astro dev mode.
- [ ] Do not use POSIX-only inline environment-variable syntax like
      `TPM_COMPONENT_CATALOG=true astro build`.
- [ ] Add a production-build guard to fail if `dist/catalog` appears in normal
      build output.
- [ ] Document the catalog scripts in `PACKAGE_SCRIPTS.md`.

## Milestone 3: Astro Component Render Test Harness

- [ ] Add Vitest and Astro Container API test support for isolated `.astro`
      component rendering.
- [ ] Add a Vitest config that uses Astro's `getViteConfig()` and keeps tests
      compatible with the static Astro/Bun project.
- [ ] Add `tests/components/ui/` render tests for the primitive components.
- [ ] Test semantic output for links, buttons, icon labels, slots, variants, and
      disabled or missing-content states where applicable.
- [ ] Keep Bun tests for pure TypeScript logic in `tests/lib/` and
      `tests/scripts/`; do not migrate those to browser tests.
- [ ] Add a `test:components` package script for Astro component render tests.
- [ ] Document `test:components` in `PACKAGE_SCRIPTS.md`.

## Milestone 4: Navigation Data Boundary

- [ ] Add `src/lib/navigation.ts`.
- [ ] Define normalized navigation data types such as `SectionNavItem` and
      `ArticleSummary`.
- [ ] Build category navigation data from existing content helpers in one place.
- [ ] Include display-ready `title`, `href`, `slug`, optional `description`,
      and article preview data.
- [ ] Preserve current category ordering and current-page active state.
- [ ] Replace ad hoc category shaping in `src/layouts/BaseLayout.astro` with the
      shared navigation helper.
- [ ] Add pure logic tests in `tests/lib/navigation.test.ts` for category
      ordering, article summary shape, href generation, and current item state.

## Milestone 5: Navigation Components And Discovery Surfaces

- [ ] Add `src/components/navigation/BrandLink.astro`.
- [ ] Add `src/components/navigation/PrimaryNav.astro` for high-level links
      such as Articles, About, Search, and Support.
- [ ] Add `src/components/navigation/SectionNav.astro` and
      `src/components/navigation/SectionNavItem.astro` for publication category
      links.
- [ ] Add `src/components/navigation/SearchForm.astro` using semantic search
      markup and accessible labels.
- [ ] Add `src/components/navigation/SupportLink.astro` using
      `LinkButton.astro`.
- [ ] Add `src/components/navigation/ThemeToggle.astro`.
- [ ] Move persistent theme browser logic into
      `src/components/islands/ThemeController.ts` if the toggle needs a
      separate processed script boundary.
- [ ] Add `src/components/navigation/MobileMenu.astro` with all core
      destinations and category discovery available at narrow sizes.
- [ ] Add `src/components/navigation/CategoryTree.astro`,
      `CategoryGroup.astro`, and `CategorySidebar.astro`.
- [ ] Use native `details`/`summary` for category disclosure unless a later test
      proves a small island is required.
- [ ] Keep RSS out of crowded header surfaces unless the final navigation design
      deliberately includes it.
- [ ] Add catalog examples for navigation states: desktop, mobile, current
      category, long article title, and keyboard-focus states.

## Milestone 6: Layout Shell Extraction

- [ ] Add `src/components/layout/SiteShell.astro` for the high-level page shell.
- [ ] Add `src/components/layout/MainFrame.astro` for main/sidebar layout
      composition.
- [ ] Add `src/components/layout/SiteHeader.astro` composed from navigation
      components.
- [ ] Add `src/components/layout/SiteFooter.astro` with useful publication
      links: Articles, categories, About, RSS, Discord/community, and Support.
- [ ] Add `src/components/layout/PageFrame.astro` for generic page layout
      spacing and optional sidebar regions.
- [ ] Move header, sidebar, footer, and mobile-menu markup out of
      `src/layouts/BaseLayout.astro`.
- [ ] Keep `src/layouts/BaseLayout.astro` focused on document structure, global
      CSS import, theme boot script, `SiteHead`, skip link, and slots.
- [ ] Preserve canonical metadata, favicon, theme default, and skip-link
      behavior during extraction.
- [ ] Add catalog examples for layout shells where useful.

## Milestone 7: Article Components And Article-End Discovery

- [ ] Keep `src/layouts/ArticleLayout.astro` as the article route-facing layout
      and extract article display pieces into `src/components/articles/`.
- [ ] Add `src/components/articles/ArticleHeader.astro` for title,
      description, author, dates, tags, and hero metadata.
- [ ] Add `src/components/articles/ArticleMeta.astro` for machine-readable
      `<time datetime>` output and compact metadata display.
- [ ] Keep or move `ArticleProse.astro` under `src/components/articles/` and
      make it the only prose wrapper for article Markdown/MDX output.
- [ ] Add `src/components/articles/ArticleTags.astro`.
- [ ] Add `src/components/articles/ArticleImage.astro` for future MDX/article
      images using Astro `Image` or `Picture` defaults.
- [ ] Add `src/components/articles/ArticleCard.astro` and
      `src/components/articles/ArticleList.astro`.
- [ ] Add `src/components/articles/MoreInCategoryBlock.astro`.
- [ ] Add `src/components/articles/RelatedArticlesBlock.astro` as a stable
      placeholder for future related-article logic; keep it simple if no real
      data exists yet.
- [ ] Add `src/components/articles/ArticleEndcap.astro` composed from
      more-in-category, related/discovery, and `SupportBlock`.
- [ ] Use the new article components in `src/pages/articles/[...slug].astro`,
      `src/pages/articles/index.astro`, and `src/pages/categories/[category].astro`.
- [ ] Preserve article body wording and rendered content.

## Milestone 8: Generic Markdown Page Components

- [ ] Add `src/components/pages/MarkdownPage.astro` for non-article Markdown
      surfaces.
- [ ] Add `src/components/pages/PageHeader.astro` for page title and optional
      description.
- [ ] Add `src/components/pages/PageProse.astro` for non-article prose using
      the shared typography rules without article metadata.
- [ ] Update `src/pages/about.astro` to compose the new page components while
      keeping page copy in `src/content/pages/` where possible.
- [ ] Ensure non-article pages do not import article-specific metadata or
      article-only endcap components.
- [ ] Add catalog examples for page prose and page headers.

## Milestone 9: Homepage Content Model And Blocks

- [ ] Add `src/content/pages/index.md` for homepage editorial prose and stable
      page data that authors may edit.
- [ ] Keep `src/pages/index.astro` as the homepage composer for dynamic article
      data and Astro image components.
- [ ] Add `src/components/blocks/HomeHeroBlock.astro`.
- [ ] Add `src/components/blocks/HomeAnnouncementBlock.astro`.
- [ ] Add `src/components/blocks/HomeLatestArticleBlock.astro`.
- [ ] Add `src/components/blocks/HomeFeaturedArticlesBlock.astro` or a
      start-here equivalent if featured data is available.
- [ ] Add `src/components/blocks/HomeCategoryOverviewBlock.astro`.
- [ ] Add `src/components/blocks/HomeArchiveLinksBlock.astro`.
- [ ] Add `src/components/blocks/SupportBlock.astro` for reusable support CTAs.
- [ ] Use `ArticleCard`, `ArticleList`, category navigation data, and shared
      media/image components inside homepage blocks.
- [ ] Remove repeated homepage section markup from `src/pages/index.astro`.
- [ ] Add catalog examples for each homepage block with normal, narrow, long
      title, and missing-content states where applicable.

## Milestone 10: Archive, Category, Search, And Footer Reuse

- [ ] Update `src/pages/articles/index.astro` to use shared archive/list
      components.
- [ ] Update `src/pages/categories/index.astro` to use
      `CategoryOverviewBlock.astro` or equivalent reusable category overview
      components.
- [ ] Update `src/pages/categories/[category].astro` to use shared category
      page framing and `ArticleList.astro`.
- [ ] Add `src/components/blocks/SearchResultsBlock.astro`.
- [ ] Update `src/pages/search.astro` so search UI is composed from
      `SearchForm.astro` and `SearchResultsBlock.astro`.
- [ ] Ensure `SiteFooter.astro` uses the same navigation/category data boundary
      as header, sidebar, and homepage category discovery.
- [ ] Keep Pagefind behavior working without hydrating unrelated page regions.
- [ ] Add catalog examples for archive lists, category overviews, search empty
      state, and footer layout.

## Milestone 11: Global CSS Cleanup And Token-Driven Styling

- [ ] Audit `src/styles/global.css` for component selectors such as `.button`,
      `.site-header`, `.sidebar`, `.category-*`, `.archive-*`,
      `.category-card`, and page-section classes.
- [ ] Move `.button` behavior into `Button.astro` and `LinkButton.astro`.
- [ ] Move header and mobile-menu styling into layout/navigation components via
      Tailwind classes.
- [ ] Move sidebar and category-tree styling into navigation components.
- [ ] Move archive/card/list styling into article and block components.
- [ ] Move page section spacing into `Container.astro`, `Section.astro`, and
      page/block components.
- [ ] Keep global CSS limited to Tailwind imports/plugins, theme tokens,
      light/dark variables, document base styles, focus behavior, skip link,
      prose defaults, and rare cross-cutting browser behavior.
- [ ] Replace hard-coded palette classes in first-party UI with semantic tokens
      unless a one-off editorial treatment is intentional and documented.
- [ ] Confirm border radius, shadows, spacing, and typography come from tokens
      or component variants rather than one-off global classes.

## Milestone 12: Responsive, Accessibility, And Browser Hardening

- [ ] Add or update Playwright checks for no horizontal overflow on key routes:
      `/`, `/articles/`, at least one article page, `/categories/`,
      one category page, `/about/`, and `/search/`.
- [ ] Add or update Playwright checks for mobile, tablet, desktop, wide
      desktop, and short viewport heights.
- [ ] Add or update checks for theme switching, focus visibility, mobile menu
      disclosure, category disclosure, and search behavior.
- [ ] Add or update axe checks for critical and serious accessibility issues.
- [ ] Manually inspect the component catalog in light and dark mode.
- [ ] Manually inspect long titles, missing excerpts, missing images, empty
      search, category pages, article endcaps, and support CTAs.
- [ ] Verify likely LCP images are eager only when appropriate and below-fold
      media lazy-loads.
- [ ] Verify media and embeds reserve stable space and do not cause layout
      shift.
- [ ] Verify JSON-LD, Open Graph, canonical URLs, sitemap, RSS, and Pagefind
      still work after the component extraction.

## Milestone 13: Optional Category Dropdown Discovery

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
