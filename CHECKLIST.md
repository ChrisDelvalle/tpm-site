# Active Checklist

This file tracks active implementation milestones and useful recent context.
Deferred or explicitly postponed work belongs in
[DEFERRED.md](./DEFERRED.md) so active work stays easy to scan.

Completed milestones may remain here when their context is still useful. Older
historical detail can be trimmed during periodic cleanup; durable architecture,
design, and implementation rationale lives in `agent-docs/`, `docs/`, source
tests, and git history.

## Working Rules

- Keep this file focused on milestone tracking.
- Move postponed work to `DEFERRED.md` with a resume trigger instead of leaving
  stale unchecked milestones here.
- Move deferred work back into this file before implementation begins.
- Add or update design docs before implementing new components, substantial
  layout behavior, or non-component technical systems.
- Verify each milestone before marking it complete.
- Do not edit `src/content/articles/` unless the current task explicitly asks
  for article-content changes.

## Active Milestones

## Milestone 35: Cite This Article Component Design

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

## Milestone 36: BibTeX Citation Authoring Design

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

## Milestone 37: Cite This Article Implementation

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

## Milestone 38: BibTeX Article Reference Parser And Plugin Implementation

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

## Milestone 39A: Article Reference Corpus Audit Design

- [x] Add a technical design doc for article-reference corpus auditing that
      defines detected legacy patterns, manual-review criteria, output shape,
      tests, and the boundary between non-content tooling and article-content
      normalization.
- [x] Review the design for ambiguity around ordinary prose links versus true
      bibliographic citations, then update it until it is ready for
      implementation.

## Milestone 39: Article Reference Corpus Audit And Normalization

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
- [ ] Normalize one article-reference format at a time into canonical
      `note-*` footnotes and `cite-*` markers with `tpm-bibtex` source entries
      according to the approved article-content plan.
- [ ] Preserve author wording and article intent; only change reference syntax
      and section structure needed for the canonical parser.
- [ ] Keep ambiguous inline prose links out of bibliography data unless the
      article is explicitly edited to use a canonical `cite-*` marker plus
      BibTeX source entry.
- [ ] Add explicit exceptions only when an article cannot reasonably be
      normalized yet, and document why the exception is temporary or permanent.
- [ ] Enable release-blocking validation for published articles only after the
      normalized corpus and exceptions pass.
- [x] Update author-facing article submission documentation with the canonical
      `note-*`, `cite-*`, and `tpm-bibtex` syntax.

## Milestone 40: Global Bibliography Page Implementation

- [x] Implement only after Milestone 38 provides normalized parsed BibTeX
      citation data and Milestone 39 records corpus status or approved
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
