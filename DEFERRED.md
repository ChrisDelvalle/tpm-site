# Deferred Work

The milestone blocks below were copied from the previous `CHECKLIST.md` so
deferred work keeps its exact original wording and checkbox state.

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
