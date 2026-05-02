# Mobile Menu

Source: `src/components/navigation/MobileMenu.astro`

## Purpose

`MobileMenu` provides the complete constrained-layout navigation fallback. Any
destination hidden from the desktop header at smaller widths must remain
reachable here.

## Public Contract

- `currentPath?: string`
- `categories: readonly SectionNavItem[]`
- `primaryItems: readonly PrimaryNavItem[]`
- `label?: string`

Public props should remain narrow and semantic. Do not add broad configuration
objects or boolean clusters when a named variant or a smaller component would
make invalid states harder to express.

## Composition Relationships

It composes local navigation data helpers, `CategoryTree` or `SectionNav`,
`PrimaryNav`, `SearchForm`, `SupportLink`, and `ThemeToggle`.

`SiteHeader` owns when the mobile menu is shown. `MobileMenu` owns the contents
and internal grouping of the constrained-width navigation surface.

## Layout And Responsiveness

The component must remain usable in constrained containers, preserve touch and
keyboard targets, and avoid horizontal overflow. It may be a disclosure,
popover, drawer, or simple expanded panel, but it must be the single complete
fallback rather than a partial mirror of desktop navigation.

## Layering And Scrolling

The component should avoid creating a stacking context unless it owns an overlay,
sticky region, or popover. Any `z-index`, sticky offset, fixed size, or scroll
container is part of this component's public design and needs an invariant test.

## Interaction States

Default, long-content, missing optional content, hover, focus-visible, and dark-mode states should be represented in the catalog when relevant. Expanded/collapsed, current, selected, and persisted state should be explicit and testable.

## Accessibility Semantics

Use a labeled navigation landmark or labeled disclosure region. Use links for
destinations and buttons only for toggles. `aria-current="page"` belongs on
current links. Do not use ARIA menu patterns for ordinary document navigation.

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
- includes categories, `Articles`, `About`, search, theme, support, and
  secondary links such as RSS when those links are not visible in the desktop
  header.

## Follow-Up Notes

- Mobile menu is the complete constrained-width navigation fallback. It should
  expose future bibliography/authors links when those destinations become part
  of the site without relying on desktop dropdowns.
