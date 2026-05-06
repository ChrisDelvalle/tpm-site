# Deferred Work

The milestone blocks below were copied from the previous `CHECKLIST.md` so
deferred work keeps its exact original wording and checkbox state.

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

## Citation Occurrence Metadata And Locators

Reason deferred: page/chapter/range locators are a real gap in the citation
domain model, but they need a careful syntax and renderer design before
implementation.

Resume trigger: resume when citation rendering is revisited, especially before
normalizing articles that already use prose citations with page references.

- [ ] Design citation occurrences as structured uses of a source, separate from
      the BibTeX/source record.
- [ ] Support occurrence-level locator metadata such as `p. 70`,
      `pp. 251-252`, chapters, sections, figures, or other source positions.
- [ ] Ensure multiple occurrences of the same source still group under one
      bibliography entry.
- [ ] Design authoring syntax for locators that is easy to write and hard to
      confuse with the source key.
- [ ] Define rendering for numeric and author-year citation styles, including
      examples such as `[4, p. 70]` and `[Knobe 2015, p. 70]`.
- [ ] Add parser, renderer, bibliography, and regression tests before enabling
      article migrations that depend on locator metadata.

## Visible Source Appendices With Structured Bibliography Data

Reason deferred: some articles contain author-owned appendices or source-list
sections that should remain visible prose while optionally feeding the
structured bibliography. This needs a separate design from inline citation
markers.

Resume trigger: resume before converting or normalizing article appendices,
source lists, or bibliography-like sections that are part of the article's
visible structure.

- [ ] Design an authoring model for visible source appendices that preserves the
      original article section and heading.
- [ ] Decide whether appendix entries can be auto-generated from structured
      data, manually written as prose plus hidden data, or both.
- [ ] Ensure appendix/source-list entries can contribute to the global
      bibliography without inventing inline citation occurrences.
- [ ] Define how generated article bibliography sections interact with
      author-owned appendices so readers do not see duplicate or confusing
      source lists.
- [ ] Add parser, rendering, bibliography aggregation, and regression tests
      before migrating article appendices into this model.
