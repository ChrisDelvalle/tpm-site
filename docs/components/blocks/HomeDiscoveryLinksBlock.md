# Home Discovery Links Block

Source: `src/components/blocks/HomeDiscoveryLinksBlock.astro`

## Purpose

`HomeDiscoveryLinksBlock` is a thin navigation-literacy strip. It quietly points
to a few secondary browsing surfaces without making those links major homepage
sections.

## Public Contract

- `links`: ordered `{ label, href }` list.
- Optional `title`, default `More`.

## Composition Relationships

It appears under homepage categories and before the longer article feed.

## Layout And Responsiveness

The strip wraps naturally on narrow screens. It should never become a card or a
large block.

## Layering And Scrolling

No layering or custom scrolling is intended.

## Interaction States

Links use `TextLink`. Internal paths may prefetch on hover; external links must
not.

## Accessibility Semantics

The component is a `nav` with an explicit accessible label.

## Content Edge Cases

Many links wrap. Long labels stay text-sized and do not force horizontal
overflow.

## Theme Behavior

Uses semantic foreground, muted, border, and focus tokens.

## Testable Invariants

- Homepage usage includes All articles, Authors, and Tags.
- Tags are represented only as a link to `/tags/`, not enumerated.
- Homepage usage excludes GitHub and RSS.
- The strip wraps without horizontal overflow.
