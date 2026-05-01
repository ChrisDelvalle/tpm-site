# Site Header

Source: `src/components/layout/SiteHeader.astro`

## Purpose

`SiteHeader` owns the top publication header layout and composes brand, navigation, search, theme, and support controls

## Public Contract

- `currentPath: string`
- `navigationItems: readonly SectionNavItem[]`

Public props should remain narrow and semantic. Do not add broad configuration
objects or boolean clusters when a named variant or a smaller component would
make invalid states harder to express.

## Composition Relationships

It composes local components: `../../lib/navigation`, `../navigation/BrandLink`, `../navigation/MobileMenu`, `../navigation/PrimaryNav`, `../navigation/SearchForm`, `../navigation/SupportLink`, `../navigation/ThemeToggle`. It defines region relationships for children; children should not patch its spacing or stacking from outside.

## Layout And Responsiveness

The component owns structural relationships between regions. It must maintain skip-link access, avoid content being covered by sticky chrome, and preserve a single coherent main content flow at every viewport.

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
- maintains exactly one reachable main region.
- prevents sticky/fixed chrome from covering visible content during scroll.

## Follow-Up Notes

- The prototype header had brittle collision behavior. Future changes should prefer simpler information architecture, responsive disclosure, and explicit layout invariants over width-specific patches.
