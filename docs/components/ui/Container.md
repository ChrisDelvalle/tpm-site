# Container

Source: `src/components/ui/Container.astro`

## Purpose

`Container` serves as a low-level UI primitive with no article, route, or content-collection knowledge.

## Public Contract

- `as?: "article" | "div" | "main" | "section"`
- `gutters?: "default" | "none" | "narrow"`
- `size?: "full" | "lg" | "md" | "prose" | "xl"`

Public props should remain narrow and semantic. Do not add broad configuration
objects or boolean clusters when a named variant or a smaller component would
make invalid states harder to express.

## Composition Relationships

It should not depend on sibling internals beyond normal slot/prop composition. Parents may align it with siblings, but the primitive owns its own variant dimensions, radius, focus ring, and theme contrast.

## Layout And Responsiveness

The primitive should fit normal inline or block flow, preserve stable size for each variant, accept parent composition through `class`, and never require page-level CSS to avoid overflow.

## Layering And Scrolling

The component should avoid creating a stacking context unless it owns an overlay,
sticky region, or popover. Any `z-index`, sticky offset, fixed size, or scroll
container is part of this component's public design and needs an invariant test.

## Interaction States

Default, long-content, missing optional content, hover, focus-visible, and dark-mode states should be represented in the catalog when relevant.

## Accessibility Semantics

Use semantic HTML first, preserve heading order when headings are rendered, and keep focus-visible states intact for any interactive descendants.

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
- variants keep stable dimensions and contrast.
- disabled/current/pressed states are visible and semantically accurate where supported.

## Follow-Up Notes

- No component-specific brittle decision is known yet; add one here when implementation review finds a questionable or fragile choice.
