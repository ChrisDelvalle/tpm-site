# Discovery Menu

Source: `src/components/navigation/DiscoveryMenu.astro`

## Purpose

`DiscoveryMenu` is the site-wide category discovery surface for larger
viewports. It helps readers move from "what is this publication?" to "what
should I read?" without putting a global category sidebar on article pages.

It must not render the full archive or replace category pages.

## Public Contract

- `items: readonly CategoryDiscoveryItem[]`
- `currentPath?: string`
- `label?: string`

Each item should include:

- category title;
- category href;
- optional description;
- optional preview articles;
- optional "view all" href.

Data must be shaped outside this component by the navigation/content boundary.

## Composition Relationships

```text
SiteHeader
  DiscoveryMenu
    CategoryDropdown
      CategoryPreviewList
```

`SiteHeader` owns where discovery appears. `DiscoveryMenu` owns the category
list and one-dropdown-at-a-time interaction contract. `CategoryDropdown` owns
the disclosure primitive. `CategoryPreviewList` owns preview article rendering.

Equivalent category discovery must also exist in `MobileMenu`, homepage
category overview, category pages, and `SiteFooter`.

## Layout And Responsiveness

Mobile base: do not show desktop discovery menu; use `MobileMenu`.

Tablet and wider: show category labels in a compact section navigation row. The
standard breakpoint is intentionally not over-aggressive; category discovery
should remain visible on ordinary laptop split-screen widths.

The category row is a single-line contract. Labels use their intrinsic width
and normal spacing by default; items are not equal-width tabs. As available
space gets tighter, compact typography, chevrons, and spacing together so the
row reads like the same object at a smaller size. Do not use CSS transforms for
this behavior because transformed ancestors break fixed anchored dropdown
positioning. Do not truncate category names.

If full category discovery truly no longer fits, the responsive fallback is the
mobile menu at smaller breakpoints, not a taller desktop header, hidden
overflow, or ellipsized labels.

The menu should not force brand, search, support, and every category into one
fragile row.

## Layering And Scrolling

Desktop category previews use `CategoryDropdown` with the shared anchored
disclosure runtime. Fine-pointer hover is an enhancement; focus, touch tap,
outside dismiss, and Escape close use the shared primitive. Avoid a hydrated
menu library unless tests prove semantic links plus native disclosure cannot
satisfy accessibility and browser requirements.

Preview surfaces must layer above normal content and below any truly modal
surface. They must not hide under the sticky header or create horizontal
overflow.

## Interaction States

Support:

- default;
- current category;
- hover;
- focus-visible;
- active;
- open;
- empty preview data;
- reduced motion;
- no JavaScript.

Only one category preview should be visibly open at a time if the chosen
primitive permits that without brittle scripting. If native behavior cannot
enforce exclusivity, overlapping popovers must still be impossible.

## Accessibility Semantics

Use a labeled navigation region. Category names should remain normal links to
category pages with a visible dropdown affordance.

The preview content should contain normal links, not application-menu roles.
This is document navigation, not a desktop app menu.

## Content Edge Cases

Handle:

- no categories;
- many categories;
- long category names;
- category with no previews;
- long preview titles;
- current category;
- narrow desktop widths;
- touch input on tablets.

## Theme Behavior

Use semantic tokens for header, popover, borders, muted text, and active links.
Preview surfaces should feel editorial and calm, not like floating marketing
cards.

## Testable Invariants

- Does not render on mobile when `MobileMenu` owns category discovery.
- Every category has a direct normal link.
- Preview opens with keyboard focus and pointer hover.
- Preview links are reachable by keyboard.
- No horizontal overflow at desktop or wide desktop widths.
- Category labels stay full, stay on one row, and do not increase header
  height.
- Constrained desktop/tablet widths proportionally compact the row rather than
  rearranging or truncating individual category items.
- Preview content does not include the full archive.
- Footer/homepage/category pages remain fallback discovery paths.

## Follow-Up Notes

- If native popover behavior proves insufficient, prefer a tiny targeted island
  over a broad Radix/shadcn navigation rewrite.
