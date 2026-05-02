# Bibliography Page

Source: `src/components/bibliography/BibliographyPage.astro`

## Purpose

`BibliographyPage` composes the global bibliography browsing page from
normalized citation data.

It must not parse article Markdown or infer sources from inline links.

## Public Contract

- `entries: readonly BibliographyEntry[]`
- optional `filters: BibliographyFilterState`

Entries are produced by the bibliography data boundary from canonical `cite-*`
references.

## Composition Relationships

```text
BrowsingBody
  BibliographyPage
    PageHeader
    optional BibliographyFilters
    BibliographyList
      BibliographyEntry
        BibliographySourceArticles
    BibliographyEmptyState
```

`BrowsingBody` owns page width. `BibliographyPage` owns bibliography page
section order. Child components own list, filter, entry, and empty rendering.

## Layout And Responsiveness

Use the standard browsing measure. Entries stack in a scannable list. Do not use
a wide table for the default presentation; source text and article backlinks
need to wrap.

## Layering And Scrolling

No sticky, fixed, overlay, or `z-index` behavior is intended.

## Interaction States

Support default, empty, filtered-empty, many entries, long entries, and
no-JavaScript states. Filters, if present, must degrade to useful links or a
server/static route strategy; do not require client routing.

## Accessibility Semantics

Use a clear page H1, section headings where useful, and semantic lists. Filters
must be labeled and associated with the result count/list.

## Content Edge Cases

Handle no citations, one citation, many citations, duplicate-looking sources,
long URLs, non-URL sources, rich Markdown citation content, and many source
articles for one entry.

## Theme Behavior

Use semantic tokens. Bibliography pages should feel like archive browsing, not
article prose or promotional cards.

## Testable Invariants

- Uses `BrowsingBody` width.
- Renders empty state when no entries exist.
- Does not infer entries from inline links.
- Keeps long sources inside content width.
- Links every source entry to source article usage.
- No horizontal overflow in supported viewports.

## Follow-Up Notes

- If filters are deferred, keep the page structure ready for them without
  rendering disabled or fake controls.
