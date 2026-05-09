# Bibliography Filters

Source: `src/components/bibliography/BibliographyFilters.astro`

## Purpose

`BibliographyFilters` provides optional browsing controls for the global
bibliography page when the source list becomes large enough to need them.

It must not be added as inert UI. If filters are not implemented, omit the
component.

## Public Contract

- `categories?: readonly FilterOption[]`
- `authors?: readonly FilterOption[]`
- `query?: string`
- `resultCount: number`

The exact filters depend on available structured data. Do not expose filters
that cannot be applied accurately.

## Composition Relationships

```text
BibliographyPage
  BibliographyFilters
  BibliographyList
```

`BibliographyPage` owns whether filters appear and how filtered state maps to
entries. This component owns labels and controls.

## Layout And Responsiveness

Mobile controls stack. Desktop controls may align in a compact row if they fit
without crowding.

## Layering And Scrolling

No overlay or sticky behavior by default.

## Interaction States

Support default, focused, active filter, no results, and no-JavaScript behavior.

For a static site, prefer GET query parameters or prebuilt category/author
links over client-only state.

## Accessibility Semantics

Controls must be labeled and associated with the result list or result count.
Use native form controls.

## Content Edge Cases

Handle no categories, long category names, no results, many filter options, and
missing structured author/source metadata.

## Theme Behavior

Use the same form/input tokens as site search. Active filters need visible
contrast in light and dark mode.

## Testable Invariants

- Does not render filters with no usable options.
- Controls have accessible labels.
- Result count is announced or visible.
- No-JavaScript behavior remains useful.
- Does not overflow on mobile.

## Follow-Up Notes

- Initial bibliography implementation may omit filters. Add this component only
  when the data and routes can support it honestly.
