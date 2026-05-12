# Page Frame

Source: `src/components/layout/PageFrame.astro`

## Purpose

`PageFrame` is a compatibility and transition frame for generic pages. Long
term, most routes should prefer `ReadingBody` or `BrowsingBody`; `PageFrame`
remains useful for simple pages that do not need a named body family yet.

It must not become the place where every page invents a new width.

## Public Contract

- `size?: "prose" | "md" | "lg" | "xl"`
- `spacing?: "sm" | "md" | "lg"`
- default slot

The `size` options must map to semantic measures. Do not add arbitrary
page-specific sizes to satisfy one route.

## Composition Relationships

```text
MainFrame
  PageFrame
    PageHeader
    PageProse | page blocks
```

`PageFrame` may wrap generic Markdown and simple error pages. Browsing pages
with archive/list behavior should migrate to `BrowsingBody`. Article/prose
pages should migrate to `ReadingBody`.

## Layout And Responsiveness

Mobile base is full available width with shared gutters. Larger sizes cap the
content at named measures.

`PageFrame` should not own side rails. If a page needs rails, use
`MarginSidebarLayout` inside a `ReadingBody` or browsing-specific design.

## Layering And Scrolling

No sticky, fixed, overlay, or `z-index` behavior is intended.

## Interaction States

No direct interaction. Descendant links and controls own their states.

## Accessibility Semantics

`PageFrame` should not create landmarks. It only constrains content.

## Content Edge Cases

Handle very short pages, long headings, generic Markdown, empty 404 states, and
wide embedded content by constraining or wrapping rather than overflowing.

## Theme Behavior

Use no extra visual styling by default. The page body and child components own
backgrounds, borders, and section treatments.

## Testable Invariants

- Does not render a landmark.
- Keeps content within the selected semantic measure.
- Does not create horizontal overflow at narrow widths.
- Does not reserve sidebar or hero space.
- Does not override child component spacing with page-specific patches.

## Follow-Up Notes

- As `ReadingBody` and `BrowsingBody` become standard, audit remaining
  `PageFrame` use. Each use should be either a simple compatibility case or a
  candidate for a named body primitive.
