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

Desktop and wider: show category labels in a section navigation row or compact
category group. Long category labels may wrap only if the whole row still
remains deliberate and readable; otherwise use fewer visible labels plus a
clear Categories entry.

The menu should not force brand, search, support, and every category into one
fragile row.

## Layering And Scrolling

Desktop category previews should use HTML `popover` for no-JavaScript light
dismissal and escape behavior where supported. Avoid a hydrated menu library
unless tests prove native popover cannot satisfy accessibility and browser
requirements.

Popover surfaces must layer above normal content and below any truly modal
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
category pages. The preview disclosure control should be keyboard reachable and
have an accessible name such as "Browse Memeculture articles".

The popover content should contain normal links, not application-menu roles.
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
- Popover opens with keyboard and pointer.
- Popover links are reachable by keyboard.
- No horizontal overflow at desktop or wide desktop widths.
- Preview content does not include the full archive.
- Footer/homepage/category pages remain fallback discovery paths.

## Follow-Up Notes

- If native popover behavior proves insufficient, prefer a tiny targeted island
  over a broad Radix/shadcn navigation rewrite.
