# Search Form

Source: `src/components/navigation/SearchForm.astro`

## Purpose

`SearchForm` owns search form semantics: label, input, action, query value, and
submit behavior. It does not own whether search is permanently visible,
revealed by a header control, or displayed inside the mobile menu.

## Public Contract

- `action?: string`
- `inputId?: string`
- `label?: string`
- `placeholder?: string`

Public props should remain narrow and semantic. Do not add broad configuration
objects or boolean clusters when a named variant or a smaller component would
make invalid states harder to express.

## Composition Relationships

It composes local components such as `../ui/Input`. `SiteHeader` or a future
`SearchReveal` wrapper owns open/close behavior. `MobileMenu` may render the
same form full-width.

## Layout And Responsiveness

The form must fill the space its parent gives it without forcing header
collision. In a header reveal surface, it should use a compact, bounded width.
In mobile navigation, it should use the full available menu width.

## Layering And Scrolling

The component should avoid creating a stacking context unless it owns an overlay,
sticky region, or popover. Any `z-index`, sticky offset, fixed size, or scroll
container is part of this component's public design and needs an invariant test.

## Interaction States

Represent empty query, populated query, focus-visible, disabled submit if used,
light/dark, and narrow parent states in the catalog.

## Accessibility Semantics

Always provide a real accessible label for the input. Placeholder text is not a
label. Submit controls need an accessible name. If a wrapper reveals the form,
the wrapper owns focus return and escape/close behavior.

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
- label and input remain associated.
- query submission targets the configured search route.
- long placeholder or query text does not resize the header row.

## Follow-Up Notes

- Search should be available from header/mobile navigation, but it should not
  force the desktop header into fragile collision behavior. A compact search
  entry or dedicated search page is preferable to a permanent oversized field
  when horizontal space is constrained.
