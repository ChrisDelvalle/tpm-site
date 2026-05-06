# Site Footer

Source: `src/components/layout/SiteFooter.astro`

## Purpose

`SiteFooter` serves as a layout component that owns document regions, page framing, or persistent chrome.

## Public Contract

- `navigationItems: readonly SectionNavItem[]`

Public props should remain narrow and semantic. Do not add broad configuration
objects or boolean clusters when a named variant or a smaller component would
make invalid states harder to express.

## Composition Relationships

It composes local components: `../../lib/navigation`, `../../lib/routes`, `../navigation/SupportLink`, `../ui/TextLink`. It defines region relationships for children; children should not patch its spacing or stacking from outside.

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

- No component-specific brittle decision is known yet; add one here when implementation review finds a questionable or fragile choice.
- Footer category links are a required fallback discovery surface. If desktop
  dropdowns or mobile disclosure fail, readers should still be able to browse
  categories, articles, collections, announcements, featured articles, RSS,
  bibliography, authors, and support from the footer.
