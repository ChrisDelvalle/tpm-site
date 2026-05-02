# Search Form

Source: `src/components/navigation/SearchForm.astro`

## Purpose

`SearchForm` serves as a navigation component for site discovery, wayfinding, search, category browsing, or support actions.

## Public Contract

- `action?: string`
- `inputId?: string`
- `label?: string`
- `placeholder?: string`

Public props should remain narrow and semantic. Do not add broad configuration
objects or boolean clusters when a named variant or a smaller component would
make invalid states harder to express.

## Composition Relationships

It composes local components: `../ui/Input`. It must remain interchangeable between header, mobile menu, sidebar, and footer contexts where the public contract allows it.

## Layout And Responsiveness

The component must remain usable in constrained containers, preserve touch and keyboard targets, and avoid horizontal overflow. Desktop-only surfaces must have an equivalent mobile or fallback navigation path.

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
- supports keyboard disclosure and focus order.

## Follow-Up Notes

- No component-specific brittle decision is known yet; add one here when implementation review finds a questionable or fragile choice.
- Search should be available from header/mobile navigation, but it should not
  force the desktop header into fragile collision behavior. A compact search
  entry or dedicated search page is preferable to a permanent oversized field
  when horizontal space is constrained.
