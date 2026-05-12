# Author Link

Source: `src/components/authors/AuthorLink.astro`

## Purpose

`AuthorLink` renders one author name as a link to the author's profile page
when structured author data exists, or as plain text for explicit fallback
states.

It must not resolve free-text legacy bylines by itself.

## Public Contract

- `author: AuthorSummary`
- `fallback?: "text" | "link"`

`AuthorSummary` includes stable ID, display name, href when available, and
author type.

## Composition Relationships

```text
AuthorByline
  AuthorLink
```

`AuthorByline` owns multi-author punctuation. `AuthorLink` owns one author's
link/text rendering.

## Layout And Responsiveness

Inline by default. Long names wrap naturally without breaking metadata rows.

## Layering And Scrolling

No layering.

## Interaction States

Support linked, unlinked, hover, focus-visible, visited where appropriate, and
long-name states.

## Accessibility Semantics

Use a normal anchor when linked. Do not add title-only accessible labels.

## Content Edge Cases

Handle anonymous authors, organizations, collectives, pseudonyms, long names,
and missing hrefs.

## Theme Behavior

Use semantic link tokens and inherit surrounding metadata size.

## Testable Invariants

- Links to author href when present.
- Renders plain text when fallback requires no link.
- Does not invent author URLs.
- Keeps focus-visible state readable.

## Follow-Up Notes

- Author resolution belongs to the author data boundary, not this component.
