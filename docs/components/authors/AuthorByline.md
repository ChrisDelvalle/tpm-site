# Author Byline

Source: `src/components/authors/AuthorByline.astro`

## Purpose

`AuthorByline` renders one or more authors in article metadata, article cards,
and author-aware lists.

It must preserve author order from article frontmatter.

## Public Contract

- `authors: readonly AuthorSummary[]`
- `legacyAuthor?: string`
- `mode?: "inline" | "stacked"`

Use `legacyAuthor` only during migration fallback when structured authors are
not available.

## Composition Relationships

```text
ArticleMeta
  AuthorByline
    AuthorLink
```

`ArticleMeta` owns date/category metadata. `AuthorByline` owns author ordering,
separator punctuation, and fallback display.

## Layout And Responsiveness

Inline mode should wrap without overflowing. Stacked mode may be used on author
pages or dense cards if it improves readability.

## Layering And Scrolling

No layering.

## Interaction States

Support one author, multiple authors, legacy fallback, linked and unlinked
authors, hover, focus-visible, and long-name states.

## Accessibility Semantics

Render human-readable punctuation between authors. Do not hide author names
behind icons.

## Content Edge Cases

Handle anonymous, organizations, collectives, two authors, many authors, long
names, and unknown legacy strings.

## Theme Behavior

Use metadata/muted tokens from the parent context. Links must remain readable in
light and dark mode.

## Testable Invariants

- Preserves supplied author order.
- Uses `AuthorLink` for structured authors.
- Falls back to legacy text only when structured authors are absent.
- Handles multiple authors without ambiguous punctuation.
- Does not overflow with long author names.

## Follow-Up Notes

- Once article frontmatter is normalized, legacy fallback should be removed or
  kept only behind an explicit compatibility branch.
