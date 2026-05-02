# Site Header

Source: `src/components/layout/SiteHeader.astro`

## Purpose

`SiteHeader` owns the persistent publication header. It composes brand,
category discovery, durable top-level navigation, search access, theme, support,
and the constrained-width mobile menu.

It implements the header contract in
`docs/navigation/header-and-articles-hub.md`; route files should not rebuild
header geometry.

## Public Contract

- `currentPath: string`
- `categoryItems: readonly SectionNavItem[]`
- `primaryItems: readonly PrimaryNavItem[]`
- optional semantic props for support/search labels and hrefs only when needed

Public props should remain narrow and semantic. Do not add broad configuration
objects or boolean clusters when a named variant or a smaller component would
make invalid states harder to express.

## Composition Relationships

```text
SiteHeader
  row 1
    left utility cluster
      SearchReveal
      ThemeToggle
    centered brand
      BrandLink
    right navigation cluster
      PrimaryNav
      SupportLink
      MobileMenu
  row 2
    centered category discovery
      DiscoveryMenu
        CategoryDropdown[]
  MobileMenu
```

It composes local navigation data helpers, `BrandLink`, `CategoryDropdown`,
`PrimaryNav`, `SearchReveal`, `SupportLink`, `ThemeToggle`, and `MobileMenu`.
Children should not patch header spacing or stacking from outside.

## Layout And Responsiveness

Desktop: two rows. Row 1 has search and theme aligned left, brand centered, and
`Articles`, `About`, and `Support Us` aligned right. Row 2 centers category
dropdowns. This separates utilities, identity, durable pages, and section
discovery instead of forcing every control into one crowded row.

Mobile/constrained: one row with mobile menu left, brand centered, and visible
`Support Us` right. Search, theme, categories, `Articles`, and `About` remain
available in `MobileMenu`; footer-only RSS stays out of the menu.

Tablet and wider: desktop controls return and categories appear in the second
row. This uses the standard `md` Tailwind breakpoint so category discovery is
not hidden too aggressively on ordinary laptop split-screen widths.

The center of the row is flexible space, not a permanent search slot. The
header must not depend on fragile breakpoint guesses to prevent brand,
category, search, and support collision.

## Layering And Scrolling

The component should avoid creating a stacking context unless it owns an overlay,
sticky region, or popover. Any `z-index`, sticky offset, fixed size, or scroll
container is part of this component's public design and needs an invariant test.

## Interaction States

Represent default, long category lists, long category names, open dropdown,
search-open, mobile-open, hover, focus-visible, current page, and light/dark
states in the catalog.

## Accessibility Semantics

Use a labeled site navigation landmark. Use links for destinations and buttons
only for actions such as opening search or mobile navigation. Do not use ARIA
menu patterns for ordinary navigation links. `aria-current="page"` belongs on
the current destination link.

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
- does not create extra main/content landmarks.
- prevents sticky/fixed chrome from covering visible content during scroll.
- category text clicks navigate to category pages while hover/focus exposes
  preview content.
- search opens without moving header links into overlap.
- desktop and mobile navigation are not simultaneously exposed as competing
  controls.

## Follow-Up Notes

- Do not re-create the prototype row with permanent search input, Topics, RSS,
  theme, and support all competing for the same space.
- RSS belongs in secondary surfaces such as footer/mobile menu unless a later
  design explicitly promotes it.
