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

### Milestone 68: Full Site Instance Migration Design

- [x] Define the final in-repo `site/` shape for config, content, assets,
      public files, and unused assets.
- [x] Specify the site-instance path resolver contract, including default
      in-repo paths and future `SITE_INSTANCE_ROOT` support.
- [x] Specify migration invariants for route stability, Markdown image paths,
      MDX import escape hatches, Astro asset processing, scripts, and tests.
- [x] Critically review blockers before file moves begin.
      Verified in `docs/SITE_INSTANCE_MIGRATION.md` with the follow-up link in
      `docs/PLATFORM_SITE_BOUNDARY.md`.

### Milestone 69: Site Instance Path Resolver

- [x] Add a typed resolver for site-instance paths and update site config to
      consume it.
- [x] Add focused resolver tests for default in-repo paths and external
      instance roots.
- [x] Verify the resolver before moving production content or assets.
      Verified with
      `bun test tests/src/lib/site-instance.test.ts tests/src/lib/site-config.test.ts`.

### Milestone 70: In-Repo Site Content And Asset Move

- [x] Move `src/content` to `site/content` with `git mv`.
- [x] Move `src/assets` to `site/assets` with `git mv`.
- [x] Move `public` to `site/public` with `git mv`.
- [x] Move `unused-assets` to `site/unused-assets` with `git mv`.
- [x] Update Astro content collections, Astro/Vite config, and site asset
      aliases to consume resolver-backed paths.
- [x] Update platform imports, MDX imports, docs, and tests needed by the move
      without changing public routes.
- [x] Verify build/content/image behavior before marking complete.
      Verified with focused site-instance/config/route tests, focused asset
      script tests, `bun --silent run typecheck`,
      `bun --silent run verify:content -- --quiet`,
      `bun --silent run assets:locations -- --quiet`,
      `bun --silent run assets:shared -- --quiet`, and
      `bun --silent run build`.

### Milestone 71: Site-Aware Tooling

- [x] Convert content, asset, PDF, build verification, Pagefind, HTML
      validation, and accountability path assumptions to the resolver-backed
      `site/` layout.
- [x] Keep package scripts stable where practical while moving path knowledge
      into scripts or shared config.
- [x] Verify the full local release toolchain after script migration.
      Verified with focused content/asset/PDF/build script tests,
      `bun --silent run check`, and the full `bun --silent run check:release`.

### Milestone 72: External Site Instance Proof

- [x] Add a small fixture site instance outside the platform source roots.
- [x] Prove core config/content/path code can operate against
      `SITE_INSTANCE_ROOT`.
- [x] Document limitations that remain for external production instances,
      especially MDX imports and theme delivery.
      Verified with `tests/fixtures/site-instance/`,
      `tests/src/lib/site-instance.test.ts`, and
      `docs/SITE_INSTANCE_MIGRATION.md`.

### Milestone 73: Full Migration Verification

- [x] Run release-relevant checks after the full site migration.
- [x] Confirm public routes and generated output expectations remain stable.
- [x] Update docs and checklist with final verification notes.
      Verified with `bun --silent run check:release`, including accountability,
      content and asset checks, Astro/tool type checks, lint, format, deadcode,
      catalog verification, unit tests, production build, build verification,
      HTML validation, e2e tests, catalog e2e tests, audit, and secrets scan.

### Milestone 74: Remaining Platform/Site Split Design

- [x] Refresh platform split docs so they describe the current `site/`
      migration rather than stale pre-move phases.
- [x] Define the remaining production boundary work: config-owned redirects,
      config/content-owned homepage choices, a full external site-instance
      build proof, generic platform assets, and fixture-backed tests.
- [x] Critically review the plan for author/admin UX, external-instance
      ergonomics, Astro asset behavior, maintainability, and overgeneralization
      before implementation begins.
      Verified in `docs/PLATFORM_SITE_BOUNDARY.md`,
      `docs/SITE_INSTANCE_MIGRATION.md`, and
      `docs/PLATFORMIZATION_AUDIT.md`.

### Milestone 75: Site-Owned Redirect Config

- [x] Move TPM legacy redirect data out of `astro.config.ts` into
      site-instance config.
- [x] Add typed redirect validation with path-aware failures and focused tests.
- [x] Verify Astro config still receives the same redirects for the live site.
      Verified with
      `bun test tests/src/lib/site-redirects.test.ts tests/src/lib/site-instance.test.ts tests/config/astro.config.test.ts`.

### Milestone 76: Homepage Config And Content Boundary

- [x] Move homepage collection IDs and list limits into validated site config.
- [x] Move homepage hero images into page frontmatter instead of platform
      route imports.
- [x] Replace TPM-named featured fallback image imports with a generic rendered
      fallback that works for any configured site.
- [x] Update focused homepage/content-schema tests and docs.
      Verified with focused content-schema/site-config/home tests and
      `bun --silent run test:astro -- HomeFeaturedSlide HomeHeroBlock index`.

### Milestone 77: Generic Platform Brand Assets

- [x] Make built-in Patreon, Discord, and YouTube button assets platform-owned
      rather than required site-instance files.
- [x] Keep CTA behavior and visual output stable for the TPM site.
- [x] Update component tests and docs to reflect reusable platform ownership.
      Verified with
      `bun --silent run test:astro -- DiscordButton PatreonButton YouTubeButton SupportBlock HomeFeaturedSlide HomeHeroBlock index`.

### Milestone 78: Full External Site Instance Build Proof

- [x] Expand `tests/fixtures/site-instance/` into a complete minimal site
      instance with config, redirects, content, assets, and public files.
- [x] Add a repeatable Bun script that builds with
      `SITE_INSTANCE_ROOT=tests/fixtures/site-instance`.
- [x] Verify the external instance through the normal production build path.
      Verified with `bun --silent run test:site-instance`.

### Milestone 79: Final Platform Split Verification

- [x] Run focused config/home/site-instance/component tests.
- [x] Run release-relevant checks after the split changes.
- [x] Update docs/checklist with final verification notes and any explicit
      remaining deferred work.
      Verified with focused Bun/Astro tests for redirects, site config, home
      data, content schemas, feed/content fallbacks, component CTAs, and PDF
      generation; `bun --silent run assets:locations -- --quiet`;
      `bun --silent run test:site-instance`; `bun --silent run check`;
      `bun --silent run build`; `bun --silent run verify`;
      `bun --silent run validate:html`; `bun --silent run review:markdown`;
      and the full `bun --silent run check:release`.

### Milestone 80: Site Defaults And Feature Config Design

- [x] Refresh platform docs around the current completed split and define the
      next config tranche without stale completed work.
- [x] Design serializable `features` and `contentDefaults` config surfaces for
      future GUI use by webmasters and authors.
- [x] Define the layering contract: platform defaults, site defaults,
      content-type defaults, and per-entry frontmatter overrides.
- [x] Review the design for author UX, route/tooling risk, overgeneralization,
      and compatibility with existing content.
      Documented in `docs/PLATFORM_SITE_BOUNDARY.md`,
      `docs/PLATFORMIZATION_AUDIT.md`, `docs/HOMEPAGE_CONTENT_MODEL.md`, and
      `site/README.md`.

### Milestone 81: Configurable Content Defaults

- [x] Add validated site config defaults for article and announcement draft,
      visibility, and PDF behavior.
- [x] Wire content schemas and publishable normalization through those defaults
      so authors only write frontmatter overrides for exceptions.
- [x] Update tests and docs for current TPM defaults and non-TPM fixture
      defaults.
      Verified with focused site-config, content-schema, publishable, PDF, PDF
      generator, and build-verifier tests.

### Milestone 82: Feature Flags For Core UI Surfaces

- [x] Add validated feature flags for platform-level surfaces such as support,
      search, theme toggle, categories, authors, collections, tags, feed,
      bibliography, and PDF.
- [x] Use those flags in the high-value UI seams that already compose these
      surfaces without attempting unsupported route removal.
- [x] Update component/helper tests for enabled and disabled feature behavior.
      Verified with focused Astro component tests for header, footer, support
      links, support block, home hero block, and homepage composition.

### Milestone 83: Config Tranche Verification

- [x] Run focused site-config, content-schema, publishable, PDF, navigation,
      header/footer/home, and fixture-instance tests.
- [x] Run release-relevant checks after the config tranche.
- [x] Update checklist/docs with final verification notes and any explicit
      remaining platformization work.
      Verified with focused Bun tests, focused Astro component tests,
      `bun --silent run typecheck`, `bun --silent run format`,
      `bun --silent run check`, `bun --silent run test:site-instance`,
      `bun --silent run build`, `bun --silent run verify`, and
      `bun --silent run validate:html`.
