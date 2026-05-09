# Site Shell

Source: `src/components/layout/SiteShell.astro`

## Purpose

`SiteShell` owns persistent publication chrome around every public page:
header, main frame, and footer. It should make the document feel like one
coherent publication while letting the page body choose reading or browsing
anatomy.

It must not know article, category, author, or bibliography rendering details.

## Public Contract

- `currentPath: string`
- `navigationItems: readonly SectionNavItem[]`
- default slot for page body content

`SiteShell` may fetch or receive normalized navigation data, but the preferred
long-term contract is props from `BaseLayout` or a route-level shell boundary.

## Composition Relationships

```text
BaseLayout
  SiteShell
    SiteHeader
    MainFrame
      slot
    SiteFooter
```

`BaseLayout` owns document/head/theme/skip-link setup. `SiteShell` owns chrome
ordering. `MainFrame` owns the relationship between the main landmark and the
page body slot.

Children must not patch shell gutters, sticky offsets, or footer spacing from
inside page-specific components.

## Layout And Responsiveness

`SiteShell` is a vertical document stack. Header, main content, and footer keep
stable order at every viewport.

The shell should support:

- mobile single-column pages;
- desktop category/navigation disclosure;
- article pages with optional margin rails;
- browsing pages with comfortable shared listing width;
- short viewport heights without hiding content behind sticky chrome.

## Layering And Scrolling

`SiteShell` may participate in sticky-header offset coordination, but it should
not create arbitrary stacking contexts. Header layering belongs to
`SiteHeader`; page-body rail layering belongs to `MarginSidebarLayout`.

## Interaction States

Interactive behavior is delegated to descendants: mobile navigation, search,
theme toggle, and support links. `SiteShell` only guarantees those controls
remain in stable document order.

## Accessibility Semantics

The shell must preserve:

- one reachable skip-link target in main content;
- one primary site header region;
- one main landmark;
- one contentinfo/site footer landmark;
- no duplicate unlabeled navigation landmarks.

## Content Edge Cases

Handle pages with no sidebar, long page titles, empty archives, short error
pages, long articles, and catalog-only internal pages without changing the
document structure.

## Theme Behavior

Use semantic background, foreground, border, and muted tokens. Theme changes
should not cause layout shifts or reduce CTA/focus contrast.

## Testable Invariants

- Exactly one main landmark is present.
- Header appears before main; footer appears after main.
- Skip link reaches the main content.
- No horizontal overflow at mobile, tablet, desktop, or wide desktop widths.
- Sticky header does not cover focused or hash-targeted content.
- Light and dark themes preserve visible text, borders, and focus rings.

## Follow-Up Notes

- If route-level data loading makes `SiteShell` too knowledgeable, introduce a
  separate shell data helper rather than letting `SiteShell` import unrelated
  content helpers.
