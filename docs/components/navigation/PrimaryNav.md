# Primary Nav

Source: `src/components/navigation/PrimaryNav.astro`

## Purpose

`PrimaryNav` renders durable top-level publication links. In the desktop
header, that means `Articles` and `About`; category discovery, search, theme,
support, and RSS belong to other components or secondary surfaces.

## Public Contract

- `currentPath?: string`
- `gap?: "sm" | "md" | "lg"`
- `items?: readonly PrimaryNavItem[]`
- `label?: string`

Public props should remain narrow and semantic. Do not add broad configuration
objects or boolean clusters when a named variant or a smaller component would
make invalid states harder to express.

## Composition Relationships

It composes local components such as `../ui/TextLink`. It can appear in the
header, mobile menu, or footer, but each context should pass an explicit item
list rather than asking `PrimaryNav` to decide information architecture.

## Layout And Responsiveness

The component must remain usable in constrained containers, preserve touch and
keyboard targets, and avoid horizontal overflow. It should wrap or collapse
only through parent-owned navigation mode changes, not through local
breakpoint patches. Parent compositions can pass `gap` when the nav needs to
share rhythm with adjacent controls such as a header CTA.

## Layering And Scrolling

The component should avoid creating a stacking context unless it owns an overlay,
sticky region, or popover. Any `z-index`, sticky offset, fixed size, or scroll
container is part of this component's public design and needs an invariant test.

## Interaction States

Default, long-content, missing optional content, hover, focus-visible, and dark-mode states should be represented in the catalog when relevant.

## Accessibility Semantics

Use labeled navigation landmarks, native links/details where possible, keyboard-reachable controls, and `aria-current` only for the current destination.

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
- keeps desktop and mobile controls from exposing conflicting visible states.
- applies `aria-current="page"` only to the current destination link.
- header mode does not render categories, search, theme, support, or RSS.

## Follow-Up Notes

- If a later design promotes more top-level destinations, add them through the
  parent item list and update the navigation design first.
