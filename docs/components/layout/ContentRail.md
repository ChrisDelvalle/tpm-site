# Content Rail

Source: `src/components/layout/ContentRail.astro`

## Purpose

`ContentRail` constrains secondary side content such as article TOC, compact
metadata, or future article-local tools.

It must not be used as a global category sidebar on article pages.

## Public Contract

- default slot
- `position: "left" | "right"`
- `sticky?: "none" | "below-header"`
- `label?: string` when the rail contains navigation

The rail receives already-normalized child content. It does not fetch
categories, headings, or articles.

## Composition Relationships

```text
MarginSidebarLayout
  ContentRail
    ArticleTableOfContents
```

`MarginSidebarLayout` owns whether the rail appears. `ContentRail` owns rail
measure, sticky offset, and overflow behavior. Child components own semantics.

## Layout And Responsiveness

Rails are absent on narrow screens. They appear only when the page has enough
margin space for the symmetric reading grid. Automatic rails should start at a
compact width and may widen on larger screens; the rail must adapt before the
reading column is allowed to drift.

If sticky, the rail must have a max height and internal scroll behavior when
the viewport is short.

## Layering And Scrolling

Optional sticky behavior must use the shared header offset. The rail should not
overlay the reading column and should not introduce arbitrary `z-index` values.

## Interaction States

No direct interaction. Child TOC or controls own focus, current, and hide/show
states.

## Accessibility Semantics

If the rail contains navigation, child navigation must be labeled. The rail
wrapper itself should not create an unlabeled complementary landmark by default.

## Content Edge Cases

Handle long heading lists, no heading list, narrow margin space, short viewport,
and hidden rail state.

## Theme Behavior

Use secondary tokens. Rails should be visually quiet and must not compete with
article prose.

## Testable Invariants

- Does not render visible rail space when empty.
- Stays below the sticky header when sticky.
- Uses the shared responsive rail breakpoint so sticky behavior and visibility
  begin together.
- Does not cover or squeeze reading prose.
- Handles short viewport with internal scroll or non-sticky fallback.
- Provides no global category discovery on article pages.

## Follow-Up Notes

- The category sidebar prototype should not be migrated into `ContentRail`.
  Category discovery belongs to navigation and browsing surfaces.
