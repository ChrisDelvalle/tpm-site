# Brand Link

Source: `src/components/navigation/BrandLink.astro`

## Purpose

`BrandLink` serves as a navigation component for site discovery, wayfinding, search, category browsing, or support actions.

## Public Contract

- `href?: string`
- `label?: string`

Public props should remain narrow and semantic. Do not add broad configuration
objects or boolean clusters when a named variant or a smaller component would
make invalid states harder to express.

## Composition Relationships

It composes local components: `../../lib/routes`, `../ui/TextLink`. It must remain interchangeable between header, mobile menu, sidebar, and footer contexts where the public contract allows it.

## Layout And Responsiveness

The component must remain usable in constrained containers, preserve touch and
keyboard targets, and avoid horizontal overflow. In the mobile header, it lives
in the flexible center slot between the menu trigger and support CTA, so it must
accept contextual typography and width classes without forcing overlap.
The visual brand should remain the full publication title wherever the header
can reasonably support it; compact adjacent controls before replacing the
brand text with an abbreviation.
Desktop-only surfaces must have an equivalent mobile or fallback navigation
path.

## Layering And Scrolling

The component should avoid creating a stacking context unless it owns an overlay,
sticky region, or popover. Any `z-index`, sticky offset, fixed size, or scroll
container is part of this component's public design and needs an invariant test.

## Interaction States

Default, long-content, missing optional content, hover, focus-visible, and dark-mode states should be represented in the catalog when relevant. Disabled, invalid, pressed/current, active, and keyboard states should be visible where the component supports them.

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
- can be constrained by a parent without overlapping neighboring header
  controls.
- preserves readable text and visible focus/hover states in light and dark themes.
- handles long content without clipping or overlapping neighboring components.
- keeps desktop and mobile controls from exposing conflicting visible states.
- supports keyboard disclosure and focus order.

## Follow-Up Notes

- No component-specific brittle decision is known yet; add one here when implementation review finds a questionable or fragile choice.
