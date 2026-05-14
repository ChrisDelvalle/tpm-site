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
