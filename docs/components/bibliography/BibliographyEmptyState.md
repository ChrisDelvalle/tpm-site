# Bibliography Empty State

Source: `src/components/bibliography/BibliographyEmptyState.astro`

## Purpose

`BibliographyEmptyState` explains why the global bibliography has no entries or
why the current filter/search has no results.

It should help readers recover rather than showing a blank page.

## Public Contract

- `kind: "no-citations" | "no-results"`
- optional `resetHref`

Use a discriminated `kind` instead of booleans.

## Composition Relationships

```text
BibliographyPage
  BibliographyEmptyState
```

The parent decides when this state appears. The component owns message and
recovery link presentation.

## Layout And Responsiveness

Use the browsing page measure. Keep the message concise and avoid oversized
marketing-style composition.

## Layering And Scrolling

No layering.

## Interaction States

Support optional reset link hover/focus states.

## Accessibility Semantics

Use normal headings and links. If filters caused the empty state, the reset link
should be keyboard reachable and clearly labeled.

## Content Edge Cases

Handle no reset link, long reset labels, and future migration periods where
citations have not yet been normalized.

## Theme Behavior

Use muted and foreground tokens. Empty states should be calm, not alarming.

## Testable Invariants

- Distinguishes no citations from no filter results.
- Renders reset link only when provided.
- Does not imply missing content is an error when bibliography migration is
  incomplete.
- Fits within browsing width.

## Follow-Up Notes

- During migration, "no citations" may mean "no normalized citations yet", not
  "this publication has no sources."
