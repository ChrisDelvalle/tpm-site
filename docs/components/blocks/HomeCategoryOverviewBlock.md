# Home Category Overview Block

Source: `src/components/blocks/HomeCategoryOverviewBlock.astro`

## Purpose

`HomeCategoryOverviewBlock` provides homepage category discovery while staying
inside the same comfortable content measure as the surrounding homepage
sections.

## Public Contract

- `items: readonly SectionNavItem[]`
- `title?: string`

Public props should remain narrow and semantic. Do not add broad configuration
objects or boolean clusters when a named variant or a smaller component would
make invalid states harder to express.

## Composition Relationships

It composes local components: `../../lib/navigation`, `./CategoryOverviewBlock`. Parent blocks should pass normalized props and slots rather than asking this component to fetch global content directly.

## Layout And Responsiveness

The block uses the compact category grid variant while inheriting its width from
`BrowsingBody`. It aligns with homepage featured, archive, and support sections
because the shared browsing body owns the page measure. It should not introduce
its own max-width or inherit a denser archive/category-page grid unless the
homepage layout is explicitly redesigned around that wider content measure.

## Layering And Scrolling

The component should avoid creating a stacking context unless it owns an overlay,
sticky region, or popover. Any `z-index`, sticky offset, fixed size, or scroll
container is part of this component's public design and needs an invariant test.

## Interaction States

Default, long-content, missing optional content, hover, focus-visible, and dark-mode states should be represented in the catalog when relevant. Empty lists, missing image/description, many tags, one-item lists, and dense lists should have catalog examples or tests where applicable.

## Accessibility Semantics

Use semantic HTML first, preserve heading order when headings are rendered, and
keep focus-visible states intact for any interactive descendants. This wrapper
sets the reusable category overview heading to `h2` so the homepage keeps a
single `h1`.

## Content Edge Cases

Test or catalog long titles, long words, dense content, empty content, missing
optional fields, and unusual punctuation whenever this component renders user or
author-provided content.

## Theme Behavior

Use semantic color tokens and Tailwind utilities. Light and dark mode must keep
text readable, borders visible when they communicate structure, focus rings
visible, and CTAs distinguishable from neutral actions.

## Testable Invariants

- renders without horizontal overflow at mobile, tablet, desktop, and wide desktop widths.
- preserves readable text and visible focus/hover states in light and dark themes.
- handles long content without clipping or overlapping neighboring components.
- aligns with the homepage support and archive-link measure.
- never renders the four-column archive grid on the homepage.
- renders empty and missing-content states without throwing or leaving broken layout.

## Follow-Up Notes

- No component-specific brittle decision is known yet; add one here when implementation review finds a questionable or fragile choice.
