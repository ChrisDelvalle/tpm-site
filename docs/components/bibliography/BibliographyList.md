# Bibliography List

Source: `src/components/bibliography/BibliographyList.astro`

## Purpose

`BibliographyList` renders normalized global bibliography entries as a
scannable browsing list.

It must not group, sort, filter, or deduplicate entries itself.

## Public Contract

- `entries: readonly BibliographyEntry[]`

Entries arrive already sorted and grouped by the data boundary or page
component.

## Composition Relationships

```text
BibliographyPage
  BibliographyList
    BibliographyEntry
```

`BibliographyPage` owns empty state and filter placement. `BibliographyList`
owns list semantics and spacing.

## Layout And Responsiveness

Use one vertical list. Avoid multi-column layout for source entries because
citations can be long and uneven.

## Layering And Scrolling

No layering.

## Interaction States

Support one entry, many entries, and long entry content.

## Accessibility Semantics

Render a semantic list. Do not use table semantics unless structured source
metadata exists and the design is updated.

## Content Edge Cases

Handle empty arrays defensively, many entries, long source text, and entries
with many source articles.

## Theme Behavior

Use semantic separator/border tokens if entries need separation.

## Testable Invariants

- Renders one `BibliographyEntry` per entry.
- Preserves supplied order.
- Does not render its own empty state.
- Does not overflow horizontally.

## Follow-Up Notes

- Sorting belongs outside this component so tests can target ordering logic
  separately.
