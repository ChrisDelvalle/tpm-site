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
- Do not edit `site/content/articles/` unless the current task explicitly asks
  for article-content changes.

### Milestone 103: Cloudflare Workers Static Hosting Migration

- [x] Add a static-only Cloudflare Workers deployment contract with Wrangler,
      no Astro SSR adapter, no Worker-first routing, and a custom 404 asset
      policy.
- [x] Generate Cloudflare `_redirects` from article and announcement
      `legacyPermalink` metadata so redirects stay content-derived and do not
      require hand-maintained deploy-target files.
- [x] Wire GitHub Actions to deploy the verified `dist/` artifact to
      Cloudflare Workers using GitHub-provided Cloudflare secrets while keeping
      the existing GitHub Pages deploy available during the transition.
- [x] Update package-script docs, migration docs, and focused config/script
      tests, then verify the new deployment contract before marking complete.
      Implemented static Workers assets config in `wrangler.toml`, Wrangler
      package scripts, generated `dist/_redirects` from content
      `legacyPermalink` metadata, Cloudflare deploy CI that consumes the
      verified build artifact, and migration documentation that keeps
      canonical host redirects in Cloudflare Redirect Rules instead of
      `_redirects`. Verified with `bun --silent run check`,
      `bun --silent run build`, `bun --silent run build:cloudflare`,
      `bun --silent run verify`, `bun --silent run validate:html`,
      `bun --silent run lint:markdown`, and `git diff --check`.

### Milestone 104: Publishable Feed, Article Continuity, And Embed Design

- [x] Define RSS behavior for article and announcement publishables, including
      `visibility.feed` defaults and opt-outs.
- [x] Define the end-of-article continuity block that chooses the immediate
      newer article, falling back to the immediate older article for the newest
      article.
- [x] Define reusable embed primitives and provider-specific wrappers so
      SoundCloud audio embeds do not inherit video aspect-ratio behavior.
- [x] Review the design for platform reuse, authoring simplicity, responsive
      behavior, PDF fallback behavior, and focused test coverage before
      implementation begins. Documented in
      `docs/PUBLISHABLE_FEED_ARTICLE_CONTINUITY_AND_EMBEDS.md`.

### Milestone 105: Publishable RSS Feed Entries

- [x] Include announcements in RSS when `features.feed` and `visibility.feed`
      allow them.
- [x] Preserve article feed behavior, author output, social-preview enclosure
      generation, and newest-first feed ordering.
- [x] Add focused tests for announcement inclusion, feed opt-outs, and source
      wiring before marking complete. Verified with
      `bun test tests/src/lib/feed.test.ts tests/pages/feed.test.ts tests/src/pages/feed.xml.test.ts`.

### Milestone 106: Chronological Article Continuity Block

- [x] Add a reusable next/previous article block above the support block at the
      end of article pages.
- [x] Select the immediate newer article, and fall back to the immediate older
      article only when the current article is the newest published article.
- [x] Add component/helper/browser coverage for ordering, fallback, omission
      when no neighbor exists, and article-end layout relationships. Verified
      with
      `bun test tests/src/lib/article-continuity.test.ts tests/src/catalog/examples/article.examples.test.ts`,
      `bun --silent run test:astro -- NextArticleBlock ArticleEndcap ArticleLayout`,
      `bun --silent run build`, and
      `bunx playwright test tests/e2e/component-invariants.pw.ts -g "article end surfaces"`.

### Milestone 107: Reusable Embed Layout Primitives

- [x] Add a shared embed classifier/layout contract consumed by Astro embed
      components and Markdown iframe transforms.
- [x] Add SoundCloud and YouTube wrapper components over the generic embed
      primitive for future MDX use.
- [x] Fix raw SoundCloud iframe rendering to reserve compact audio-player
      height rather than video aspect-ratio space.
- [x] Add tests for provider classification, rendered component output, raw
      iframe transforms, and the affected SoundCloud article layout. Verified
      with
      `bun test tests/src/lib/embed-media.test.ts tests/src/rehype-plugins/articleImages.test.ts tests/src/catalog/examples/ui.examples.test.ts`,
      `bun --silent run test:astro -- ResponsiveIframe EmbedFrame SoundCloudEmbed YouTubeEmbed`,
      `bun --silent run build`, and
      `bunx playwright test tests/e2e/component-invariants.pw.ts -g "SoundCloud article embeds"`.

### Milestone 108: Article Page Reading Navigation

- [x] Add compact reading navigation links above individual article headers,
      aligned with the article content measure.
- [x] Reuse the homepage reading destinations without rendering the leading
      `Read /` label.
- [x] Verify the links stay one-line, left-aligned, and contained at article
      desktop and mobile widths. Verified with
      `bun --silent run test:astro -- CategoryRailBlock HomeCategoryOverviewBlock ArticlesIndexPage ReadingNavigationLinks HomeDiscoveryLinksBlock ArticleLayout`,
      `bun --silent run build`,
      `bunx playwright test tests/e2e/component-invariants.pw.ts -g "articles hub keeps category discovery|article body starts close|article end surfaces|homepage flat front page"`,
      and `bun --silent run check`.

### Milestone 109: Articles Page Category Rail

- [x] Replace the `/articles/` category grid with the same one-row horizontal
      category rail pattern used on the homepage.
- [x] Preserve category links and counts while reducing the vertical space used
      by the Articles page category section.
- [x] Verify the rail scroll controls, edge fades, containment, and no-wrap
      behavior on the Articles page. Verified with
      `bun --silent run test:astro -- CategoryRailBlock HomeCategoryOverviewBlock ArticlesIndexPage ReadingNavigationLinks HomeDiscoveryLinksBlock ArticleLayout`,
      `bun --silent test tests/src/catalog/examples/archive.examples.test.ts tests/src/catalog/examples/home.examples.test.ts tests/src/catalog/examples/navigation.examples.test.ts`,
      `bun --silent run build`,
      `bunx playwright test tests/e2e/component-invariants.pw.ts -g "articles hub keeps category discovery|article body starts close|article end surfaces|homepage flat front page"`,
      `bunx playwright test tests/e2e/site.pw.ts -g "articles hub links category discovery"`,
      and `bun --silent run check`.

### Milestone 110: SEO Scan Cleanup

- [x] Fix the known manually repairable broken links from Bing and the local
      link scan: canonicalize the five bad same-site dated article URLs, fix the
      malformed Facebook URL, and remove linked source-asset image targets that
      resolve to missing `/assets/...` paths.
- [x] Add a meaningful fallback for article preview image alt text so archive,
      author, category, and tag pages do not render article thumbnails with
      empty alt text when `imageAlt` is omitted.
- [x] Generate compatibility icons from the site favicon and publish
      `/favicon.ico`, `/apple-touch-icon.png`, and
      `/apple-touch-icon-precomposed.png`, with an explicit
      `apple-touch-icon` link in the base layout and narrow asset-location
      allow-list entries for these required root files.
- [x] Verify with a production build, build verification, HTML validation, and
      focused built-output scans for the repaired links, article preview alt
      fallback, and generated icon files.
      Verified with `bun --silent run build`,
      `bun --silent run verify`, `bun --silent run validate:html`,
      `bun test tests/src/lib/archive.test.ts`,
      `bun --silent run test:astro -- BaseLayout ArticleCard`,
      `bun --silent run lint:markdown`, `bun --silent run check`, focused source
      and `dist` link-pattern scans, a built article-card alt audit, and `file`
      checks for the generated icon outputs.

### Milestone 111: Article Reference Hover Previews

- [x] Define the progressive-enhancement design for inline citation/note
      previews and backlink source-context previews.
- [x] Add stable data hooks to generated reference markers, note/bibliography
      entries, and reference backlinks without changing normal anchor
      navigation.
- [x] Add one delegated article-reference preview controller that reuses the
      existing anchored positioning contract, opens only for resolvable
      non-empty previews, stays viewport-contained, and keeps the preview UI
      content-only so the original marker/backlink remains the navigation
      affordance.
- [x] Add focused component/script/e2e coverage, verify the feature, and update
      this milestone after completion.
      Verified with `bun test tests/src/scripts/article-reference-previews.test.ts tests/src/remark-plugins/articleReferences.test.ts tests/scripts/build/build-verifier.test.ts`,
      `bun --silent run test:astro -- ArticleReferences ArticleReferenceBacklinks ArticleReferenceDefinitionContent ArticleBibliography ArticleFootnotes`,
      `bun --silent run lint`, `bun --silent run typecheck`,
      `bun --silent run format`, `bun --silent run build`,
      `bun --silent run verify`, `bun --silent run validate:html`, and
      `bun --silent run test:catalog -- --grep "catalog article references expose citation"`.

### Milestone 112: Component Refactor And Consistency Audit

- [x] Audit reusable components, blocks, layouts, interactive controllers, and
      repeated Tailwind class clusters for maintainability, visual consistency,
      accessibility, performance, and future platform configurability.
- [x] Identify and rank silent refactor candidates, intentional consistency
      changes, configurability pressure points, and areas to inspect critically
      but not refactor yet.
- [x] Document findings with concrete file-level evidence, recommended
      milestones, implementation risk, and verification expectations before
      any refactor implementation begins.
      Documented in `agent-docs/COMPONENT_REFACTOR_AUDIT.md` and iterated with
      explicit sub-component extraction policy, risky-system child extraction
      candidates, developer handoff guidance, first-pass migration order,
      acceptance criteria, stop conditions, and development readiness criteria.

### Milestone 113: Foundation Refactor Design Lock

- [x] Confirm the first implementation pass is behavior-preserving and limited
      to reusable foundation primitives from the component refactor audit.
- [x] Confirm the first pass excludes compact lists, rails, article images,
      TOC, homepage recipe work, and broad `ArticleLayout` orchestration.
- [x] Confirm implementation order, acceptance criteria, stop conditions, and
      verification targets are specific enough for development handoff.
      Design locked in `agent-docs/COMPONENT_REFACTOR_AUDIT.md`.

### Milestone 114: Section Header Primitive

- [x] Add a reusable `SectionHeader` primitive for section headings, optional
      actions, responsive wrapping, heading ids, and focus-safe action links.
- [x] Migrate article endcap/bibliography section headings first:
      `NextArticleBlock`, `MoreInCategoryBlock`, `RelatedArticlesBlock`, and
      `ArticleBibliography`.
- [x] Verify the migration is behavior-preserving and does not import
      `siteConfig` into the primitive. Verified with
      `bun --silent run test:astro -- tests/src/components/ui/SectionHeader.vitest.ts tests/src/components/articles/NextArticleBlock.vitest.ts tests/src/components/articles/MoreInCategoryBlock.vitest.ts tests/src/components/articles/RelatedArticlesBlock.vitest.ts tests/src/components/articles/ArticleBibliography.vitest.ts`
      and `bun --silent run test:catalog`.

### Milestone 115: Button And Brand CTA Primitive Consolidation

- [x] Extract shared button/link button variant classes without changing native
      `button` and `a` semantics.
- [x] Add a shared `BrandButton` frame and keep Patreon/Discord wrappers
      brand-specific.
- [x] Verify UI primitive tests/catalog examples still cover button semantics
      and branded CTA rendering. Verified with
      `bun --silent run test:astro -- tests/src/components/ui/Button.vitest.ts tests/src/components/ui/LinkButton.vitest.ts tests/src/components/ui/BrandButton.vitest.ts tests/src/components/ui/PatreonButton.vitest.ts tests/src/components/ui/DiscordButton.vitest.ts`
      and
      `bun --silent test tests/scripts/quality/verify-component-catalog.test.ts tests/src/catalog/examples/ui.examples.test.ts`.

### Milestone 116: Article Header Action Primitives

- [x] Add article action row/trigger primitives for cite/share/PDF header
      actions without merging citation, share, or PDF domain behavior.
- [x] Preserve popover target attributes, data hooks, link semantics, download
      behavior, and small-width wrapping.
- [x] Verify article header/menu tests and focused layout checks. Verified
      with
      `bun --silent run test:astro -- tests/src/components/articles/ArticleHeader.vitest.ts tests/src/components/articles/ArticleCitationMenu.vitest.ts tests/src/components/articles/ArticleShareMenu.vitest.ts`,
      `bun --silent test tests/scripts/quality/verify-component-catalog.test.ts`,
      and
      `bunx playwright test tests/e2e/component-invariants.pw.ts -g "article citation menu stays in header flow"`.

### Milestone 117: Metadata Primitive Scope Decision And Final Verification

- [x] Decide whether a narrow metadata-line extraction is safe for this pass;
      implement only if it stays behavior-preserving and does not absorb
      `ArticleCard` fit logic.
      Implemented the narrow `EntryMetaLine` primitive for `FlatArticleTeaser`
      and `HomeFeaturedSlide`, leaving `ArticleCard` and `ArticleMeta` out of
      this pass.
- [x] Run the final foundation-refactor checks and update milestone completion
      notes with the exact verification commands. Verified with
      `bun --silent run test:astro -- tests/src/components/articles/EntryMetaLine.vitest.ts tests/src/components/articles/FlatArticleTeaser.vitest.ts tests/src/components/blocks/HomeFeaturedSlide.vitest.ts tests/src/components/blocks/HomeFeaturedCarousel.vitest.ts`,
      `bun --silent test tests/scripts/quality/verify-component-catalog.test.ts tests/src/catalog/examples/article.examples.test.ts`,
      `bun --silent run typecheck`, `bun --silent run format:write`,
      `bun --silent run check`, `bun --silent run test:catalog`, and
      `bun --silent run build`.

### Milestone 118: Compact Entry List Design Lock

- [x] Confirm the compact publishable-entry primitive owns dense
      thumbnail-free lists only: title link, metadata, separators, empty state,
      long-title behavior, and prefetch consistency.
- [x] Confirm `ArticleCard` and rich article rows stay outside this abstraction.
- [x] Confirm minor visible standardization is allowed when it improves
      homepage/start-here/announcement/recent-list consistency, with focused
      catalog and homepage verification. Design locked in
      `agent-docs/COMPONENT_REFACTOR_AUDIT.md`.

### Milestone 119: Compact Entry List Primitive

- [x] Add compact entry list/row primitives and migrate the current compact
      publishable-entry lists onto them.
- [x] Preserve or intentionally standardize homepage panel density, metadata
      rhythm, empty states, and long-title wrapping.
- [x] Verify with focused component/catalog checks and homepage route coverage.
      Added `CompactEntryRow`, `CompactEntryList`, and `CompactEntryPanel`,
      then migrated flat article lists, start-here/current panels, and recent
      posts onto the shared primitive. Verified with focused compact-list Astro
      tests, `bun --silent test tests/src/components/articles/compact-entry.test.ts`,
      catalog example tests, `bun --silent run test:catalog`,
      `bunx playwright test tests/e2e/component-invariants.pw.ts -g "articles hub keeps category discovery|homepage flat front page|article citation menu stays in header flow"`,
      `bun --silent run check`, and `bun --silent run build`.

### Milestone 120: Scroll Rail And Term Surface Design Lock

- [x] Confirm the scroll rail primitive owns generic rail behavior: controls,
      edge fades, disabled states, overflow containment, accessibility hooks,
      data hooks, and item sizing contracts.
- [x] Confirm category/term cards own only title/count/href/pluralization and
      alignment.
- [x] Confirm the homepage and Articles page category rails share the same rail
      contract, with minor visible standardization allowed for consistency.
      Design locked in `agent-docs/COMPONENT_REFACTOR_AUDIT.md`.

### Milestone 121: Scroll Rail And Term Surface Primitives

- [x] Add generic scroll rail primitives and rebuild category/term rails on
      top of them.
- [x] Preserve rail endpoint visibility, keyboard/click controls, touch scroll,
      empty state behavior, and script data-hook compatibility.
- [x] Verify with focused component/script/e2e checks and visual review targets.
      Added `ScrollRail` and `TermRailCard`, then rebuilt category rails on the
      shared rail/term-card contract. Verified with focused rail Astro tests,
      `bun test tests/src/scripts/horizontal-scroll-rail.test.ts`, catalog
      example tests, `bun --silent run test:catalog`,
      `bunx playwright test tests/e2e/component-invariants.pw.ts -g "articles hub keeps category discovery|homepage flat front page|article citation menu stays in header flow"`,
      `bun --silent run check`, and `bun --silent run build`.

### Milestone 122: Action Menu And Popover Design Lock

- [x] Confirm low-level anchored primitives stay generic while article action
      menus own trigger/panel surface, action row sizing, icon/label alignment,
      copy-status placement, focus behavior, and mobile width.
- [x] Confirm citation/share business logic stays outside the primitive and
      category dropdown/search reveal are not folded into this pass.
- [x] Confirm minor visible standardization is allowed if it improves
      cite/share consistency without changing behavior.
      Design locked in `agent-docs/COMPONENT_REFACTOR_AUDIT.md`.

### Milestone 123: Action Menu And Popover Primitives

- [x] Add article action-menu/popover primitives over the anchored layer and
      migrate citation/share panels onto them.
- [x] Preserve popover target attributes, copy behavior, external share
      opening, keyboard/focus behavior, and responsive panel containment.
- [x] Verify with focused component/e2e/a11y-adjacent checks plus the normal
      build/check gate.
      Added `ActionPopover` and `ActionMenuItem`, then migrated citation/share
      panel shells and share action rows onto them while keeping domain logic in
      article-specific components. Verified with focused action-menu Astro
      tests, catalog example tests, `bun --silent run test:catalog`,
      `bunx playwright test tests/e2e/component-invariants.pw.ts -g "articles hub keeps category discovery|homepage flat front page|article citation menu stays in header flow"`,
      `bun --silent run check`, and `bun --silent run build`.

### Milestone 124: Platform Config Boundary Design Lock

- [x] Confirm reusable block/component config boundaries for the remaining
      direct `siteConfig` imports: shell components may remain config-aware,
      while reusable article/home blocks receive explicit props or view-models.
- [x] Document which labels/actions are site-configured at route/view-model
      boundaries and which fallback strings are component/catalog defaults.
- [x] Confirm the implementation does not change public information
      architecture, feature-flag semantics, or authoring behavior.
      Design locked in `agent-docs/COMPONENT_REFACTOR_AUDIT.md`.

### Milestone 125: Platform Config Boundary Implementation

- [x] Add typed support/action view-model helpers and migrate reusable support,
      home hero, author link, and article bibliography surfaces away from
      direct `siteConfig` imports where practical.
- [x] Update callers, catalog examples, and focused component tests so
      reusable components consume explicit props from routes, layouts, or test
      fixtures.
- [x] Verify with focused Astro/unit checks before marking complete. Verified
      with
      `bun --silent test tests/src/lib/support.test.ts tests/src/lib/article-page-view-model.test.ts tests/src/lib/article-pdf.test.ts`
      and
      `bun --silent run test:astro -- SupportBlock HomeHeroBlock ArticleBibliography ArticleEndcap AuthorLink HomeMastheadBlock ArticleLayout ArticleMeta AuthorByline`.

### Milestone 126: Article Page View Model Design Lock

- [x] Confirm `ArticleLayout` remains the article page composition shell while
      build-time data preparation moves into a typed view-model helper.
- [x] Define the article page view-model contract for article metadata,
      social image, authors, category, continuity, share/citation/PDF data,
      reading navigation, references, support, tags, and search visibility.
- [x] Confirm the extraction is behavior-preserving and does not move content
      collection IO into visual child components.
      Design locked in `agent-docs/COMPONENT_REFACTOR_AUDIT.md`.

### Milestone 127: Article Page View Model Implementation

- [x] Add a tested article page view-model helper and migrate
      `ArticleLayout` to consume it.
- [x] Keep existing article rendering, SEO, Scholar metadata, support,
      references, tags, and reading navigation behavior intact.
- [x] Run focused article tests plus the release gate, fix any issues, and
      record verification before marking complete.
      Verified with
      `bun --silent run test:astro -- SupportBlock HomeHeroBlock ArticleBibliography ArticleEndcap AuthorLink HomeMastheadBlock ArticleLayout ArticleMeta AuthorByline`,
      `bun --silent run test:e2e:built -- -g "homepage flat front page exposes announcements"`,
      and `bun run check:release`.
