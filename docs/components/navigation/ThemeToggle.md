# Theme Toggle

Source: `src/components/navigation/ThemeToggle.astro`

## Purpose

`ThemeToggle` owns the light/dark theme action. It is a compact utility
control, not a primary discovery item.

## Public Contract

- `label?: string`

Public props should remain narrow and semantic. Do not add broad configuration
objects or boolean clusters when a named variant or a smaller component would
make invalid states harder to express.

## Composition Relationships

It should not depend on sibling internals beyond normal slot/prop composition.
It can appear in the desktop header utility cluster and in `MobileMenu`.

## Layout And Responsiveness

The component must remain compact, keyboard reachable, and visually clear
without determining header breakpoints. Prefer an icon-sized control with a
stable accessible name.

## Layering And Scrolling

The component should avoid creating a stacking context unless it owns an overlay,
sticky region, or popover. Any `z-index`, sticky offset, fixed size, or scroll
container is part of this component's public design and needs an invariant test.

## Interaction States

Default, long-content, missing optional content, hover, focus-visible, and dark-mode states should be represented in the catalog when relevant. Expanded/collapsed, current, selected, and persisted state should be explicit and testable.

## Accessibility Semantics

Use native button/link semantics, visible focus, disabled or pressed state only when meaningful, and a stable accessible name.

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
- toggles the document theme state and exposes the correct accessible name or
  pressed/state text.
- remains visible against both header themes.

## Follow-Up Notes

- Theme toggle is a utility action, not a primary discovery item. It should
  remain compact and should not determine header layout breakpoints.
