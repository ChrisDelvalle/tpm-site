# Home Hero Block

Source: `src/components/blocks/HomeHeroBlock.astro`

## Purpose

`HomeHeroBlock` renders the homepage identity artwork, tagline, and primary
calls to action.

## Public Contract

- `lightImage: ImageMetadata`
- `darkImage: ImageMetadata`
- `imageAlt: string`
- `tagline: string`

Public props should remain narrow and semantic. Do not add broad configuration
objects or boolean clusters when a named variant or a smaller component would
make invalid states harder to express.

## Composition Relationships

It composes `../media/ThemedImage` and `../ui/LinkButton`. Parent routes should
pass normalized props rather than asking this component to fetch global content
directly.

## Layout And Responsiveness

The block should size itself from content, use the shared page measure unless
intentionally wider, and remain composable in the homepage flow. The themed
hero image should fill the block width without creating layout shift between
light and dark variants.

## Layering And Scrolling

The component should avoid creating a stacking context unless it owns an overlay,
sticky region, or popover. Any `z-index`, sticky offset, fixed size, or scroll
container is part of this component's public design and needs an invariant test.

## Interaction States

Default, long-content, missing optional content, hover, focus-visible, and dark-mode states should be represented in the catalog when relevant. Empty lists, missing image/description, many tags, one-item lists, and dense lists should have catalog examples or tests where applicable.

## Accessibility Semantics

Use semantic HTML first, preserve heading order when headings are rendered, and keep focus-visible states intact for any interactive descendants.

## Content Edge Cases

Test or catalog long titles, long words, dense content, empty content, missing
optional fields, and unusual punctuation whenever this component renders user or
author-provided content.

## Theme Behavior

Use semantic color tokens and Tailwind utilities. Light and dark mode must keep
text readable, borders visible when they communicate structure, focus rings
visible, and CTAs distinguishable from neutral actions. Artwork changes belong
to `ThemedImage`; CTA and prose colors should still come from semantic tokens.

## Testable Invariants

- renders without horizontal overflow at mobile, tablet, desktop, and wide desktop widths.
- preserves readable text and visible focus/hover states in light and dark themes.
- handles long content without clipping or overlapping neighboring components.
- aligns with the intended page measure or documents why it is wider.
- renders empty and missing-content states without throwing or leaving broken layout.
- shows the light hero image in light mode and the dark hero image in dark mode.

## Follow-Up Notes

- No component-specific brittle decision is known yet; add one here when implementation review finds a questionable or fragile choice.
