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

### Milestone 62: Article Share Menu UI And Script

- [x] Add `ArticleShareMenu` using shared anchored popover primitives and a
      compact secondary trigger beside `Cite` and `PDF`.
- [x] Add a tiny local copy-link enhancement with `aria-live` status and manual
      fallback copy text, without native share or third-party SDKs.
- [x] Thread the share model through `ArticleLayout` and `ArticleHeader`,
      keeping article header actions printable/PDF-excluded and responsive.
- [x] Add component and browser-script tests for render structure, copy success,
      copy failure, idempotent installation, and ignored unrelated clicks.
      Verified with focused share-target/script/anchored/catalog Bun tests,
      focused ArticleShareMenu/ArticleHeader/ArticleLayout Astro tests, and
      `bun --silent run typecheck`.

### Milestone 63: Share Menu Verification And Documentation

- [x] Update component architecture/docs and package/test documentation where
      needed so the share menu contract is discoverable.
- [x] Add or update e2e coverage for article header actions, share popover
      viewport containment, expected share-link hosts, and absence of third-party
      scripts.
- [x] Run focused tests plus release-relevant checks before marking complete.
      Verified with focused share-target/script/anchored/catalog Bun tests,
      focused ArticleShareActionRow/ArticleShareMenu/ArticleHeader/ArticleLayout
      Astro tests, `bun --silent run check`, `bun --silent run test:e2e`,
      `bun --silent run test:a11y`, `bun --silent run verify`, and
      `bun --silent run validate:html`.

### Milestone 64: Platform And Site Boundary Design Refresh

- [x] Refresh the platformization audit around the newer publishable-entry,
      homepage, collection, PDF, social-preview, and share-menu systems.
- [x] Define the root-level `site/` directory as the file-based user interface
      for site owners and authors, separate from reusable platform internals.
- [x] Specify the first validated site-config surface, including identity,
      routes, navigation, support CTAs, and share attribution.
- [x] Define import boundaries, author/admin UX requirements, future-GUI
      compatibility rules, and testable invariants before implementation.
- [x] Critically review the design for overgeneralization, hidden technical
      burden, future content-root migration risk, and platform maintainability.
      Verified in `docs/PLATFORM_SITE_BOUNDARY.md` and
      `docs/PLATFORMIZATION_AUDIT.md`.

### Milestone 65: Root Site Config Surface

- [x] Add a root-level `site/` directory with an author/admin-facing README and
      a JSON site config that owns current TPM identity, route, navigation,
      support, and share-attribution values.
- [x] Add a typed config adapter and schema that validates the JSON config,
      exports normalized config, and provides clear path-aware errors.
- [x] Add tests for valid config parsing, invalid config failure, path/href
      validation, and current TPM config values.
      Verified with
      `bun test tests/src/lib/site-config.test.ts tests/src/lib/navigation.test.ts tests/src/lib/share-targets.test.ts tests/src/lib/routes.test.ts tests/src/lib/seo.test.ts`.

### Milestone 66: Config-Backed Core Site Surfaces

- [x] Replace first-pass hard-coded TPM identity, canonical site URL, primary
      navigation, footer navigation, support links, support block copy, homepage
      CTA links, share attribution, and article title suffixes with config-backed
      values.
- [x] Keep rendered TPM behavior unchanged while making these surfaces render
      from typed site config.
- [x] Add or update focused component/helper/page tests so non-content platform
      surfaces no longer need TPM literals embedded directly in reusable code.
      Verified with focused config/helper tests and
      `bun --silent run test:astro -- SupportLink SupportBlock HomeHeroBlock SiteFooter SiteHeader BaseLayout ArticleLayout SearchResultsBlock AuthorsIndexPage BibliographyPage HomeFeaturedSlide SiteHead ArticleJsonLd`.

### Milestone 67: Platform Boundary Verification

- [x] Run focused config, route, navigation, support, share, layout, and
      homepage tests after the refactor.
- [x] Run release-relevant typecheck/build verification that is practical for
      this milestone.
- [x] Update the checklist only after each milestone is verified or after any
      explicit blocker is documented.
      Verified with focused config/helper tests, focused Astro component and
      page tests, `bun --silent run check`, `bun --silent run build`,
      `bun --silent run verify`, `bun --silent run validate:html`,
      `bun --silent run test:accountability:release`,
      `bun --silent run test:a11y`, and `bun --silent run test:e2e`.
