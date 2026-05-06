# Bibliography Entry

Source: `src/components/bibliography/BibliographyEntry.astro`

## Purpose

`BibliographyEntry` renders one normalized cited source on the global
bibliography page.

It must not decide whether two sources are duplicates.

## Public Contract

- `entry: BibliographyEntry`

The entry includes stable ID, parsed source display fields, fallback citation
text, optional external source links, and source article backlinks.

## Composition Relationships

```text
BibliographyList
  BibliographyEntry
    BibliographySourceArticles
```

This component owns source content display and delegates source article usage
links to `BibliographySourceArticles`.

## Layout And Responsiveness

Source content appears first, source article usage appears after it as secondary
metadata. Long URLs and source titles wrap. Outer vertical spacing belongs to
`BibliographyList`, so a standalone entry does not encode first/last list-item
spacing.

## Layering And Scrolling

No layering. Entry IDs may be hash targets and should work with global
scroll-margin behavior.

## Interaction States

Support default, hover/focus for links, target state, long source, non-URL
source, and many source articles.

## Accessibility Semantics

Use semantic article/list item markup if useful. Preserve link semantics inside
generated citation display content. The source article backlinks should have
clear text.

## Content Edge Cases

Handle bare URLs, non-URL sources, very long titles, punctuation, repeated use
across articles, missing authors, missing years, and incomplete optional BibTeX
fields.

## Theme Behavior

Use semantic text, muted, border, and link tokens. Do not style source entries
as promotional cards.

## Testable Invariants

- Renders generated citation display content without exposing raw BibTeX.
- Renders one source article backlink group when source articles exist.
- Long URLs wrap.
- Entry ID is stable and unique.
- Focus states are visible for all links.

## Follow-Up Notes

- If structured source IDs are added later, this component can show additional
  metadata, but parsing that metadata remains outside the component.
