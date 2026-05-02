# Section Nav

Source: `src/components/navigation/SectionNav.astro`

## Purpose

`SectionNav` renders a simple category/section link list when a plain
no-dropdown navigation surface is needed. It is useful for footer category
links, mobile menu category sections, and fallback category discovery.

It should not own desktop category previews; `CategoryDropdown` owns that
behavior.

## Public Contract

- `heading?: string`
- `items: readonly SectionNavItem[]`
- `label?: string`

Public props should remain narrow and semantic. Do not add broad configuration
objects or boolean clusters when a named variant or a smaller component would
make invalid states harder to express.

## Composition Relationships

It composes local navigation data and may compose `CategoryTree` where a nested
article list is intentionally needed. It must remain a plain navigation
surface, not a popover/dropdown manager.

## Layout And Responsiveness

The component must remain usable in constrained containers, preserve touch and
keyboard targets, and avoid horizontal overflow. It should support vertical and
compact inline presentations through explicit variants only if implementation
needs both.

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
- renders ordinary links with correct current state.
- does not render dropdown preview surfaces.

## Follow-Up Notes

- Section navigation should expose publication categories as normal links.
  Preview dropdown composition belongs to `CategoryDropdown`; this component
  should stay usable as a simple no-JavaScript category link row.
