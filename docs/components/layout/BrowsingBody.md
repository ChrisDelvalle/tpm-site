# Browsing Body

Source: `src/components/layout/BrowsingBody.astro`

## Purpose

`BrowsingBody` is the standard body primitive for pages whose job is helping
readers choose what to read next.

It should be used for homepage, archives, category pages, search, author pages,
and the global bibliography page.

For the navigation redesign, it is the shared body primitive for `/`, the
`/articles/` hub, `/articles/all/`, `/categories/<category>/`, search, and
compatibility category pages.

## Public Contract

- default slot for browsing sections
- optional named slot `header`
- optional named slot `intro`
- `padding?: "normal" | "snug"` for pages whose first compact navigation
  element should sit directly under site chrome
- `width?: "standard" | "wide"` only if the design proves both are needed

Default to one standard browsing measure. Do not add route-specific width
variants.

## Composition Relationships

```text
MainFrame
  BrowsingBody
    PageHeader
    optional PageProse
    SectionStack
      browsing blocks
```

`BrowsingBody` owns page-level width and gutters. `SectionStack` owns vertical
rhythm between sections. Blocks own their own internal card/list/grid behavior.

Route files should not wrap individual browsing blocks in independent max-width
containers. The body owns the measure; blocks fill the measure they receive.

## Layout And Responsiveness

Mobile base: one column, comfortable gutters, no side rail.

Tablet/desktop: listings may use grids or denser rows if child blocks define
that behavior. The body width remains consistent across homepage, archive,
category, search, author, and bibliography pages.

Wide desktop: do not stretch text or cards to fill the screen. Use whitespace
deliberately.

The homepage may have stronger editorial blocks than archive pages, but those
blocks still align to the shared browsing measure unless a block one-pager
documents an intentional full-bleed exception.

## Layering And Scrolling

No sticky, fixed, overlay, or `z-index` behavior is intended.

## Interaction States

No direct interaction. Search fields, filters, pagination, and dropdowns belong
to child components.

## Accessibility Semantics

Do not create an extra landmark. Use semantic section headings through child
blocks. Filtering/search controls should have accessible labels and should be
associated with their result regions.

## Content Edge Cases

Handle:

- no articles;
- one article;
- many articles;
- long titles;
- long category names;
- empty search results;
- long bibliography entries;
- authors with no bio.

## Theme Behavior

Use semantic tokens. Browsing pages may use cards and separators, but should
avoid nesting cards inside cards.

## Testable Invariants

- Browsing routes share the same content width by default.
- Homepage, articles hub, flat archive, category detail, and search pages align
  to the same browsing measure.
- Support blocks align with the browsing measure.
- Category overview blocks align with the browsing measure.
- List/card grids do not overflow at mobile, tablet, desktop, or wide desktop.
- Empty states remain useful and visible.
- Search/filter controls remain associated with results.

## Follow-Up Notes

- Current archive, category, and search pages are too easy to make
  inconsistently wide. Refactor them to `BrowsingBody` before adding new
  page-specific width decisions.
