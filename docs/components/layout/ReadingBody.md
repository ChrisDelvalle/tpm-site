# Reading Body

Source: `src/components/layout/ReadingBody.astro`

## Purpose

`ReadingBody` is the standard body primitive for one primary long-form text. It
protects reading measure, vertical rhythm, article-local orientation, and
article-end surfaces.

It must not be used for archive, search, category, or other browsing pages.

## Public Contract

- default slot for the primary reading surface
- optional named slot `toc` for article-local table of contents
- optional named slot `endcap` if the implementation chooses to separate end
  surfaces from the main slot
- `tocState?: "absent" | "available"` if the body needs to reserve rail logic

Prefer slots over broad configuration. Article-specific data belongs to
`ArticleLayout` and descendants.

## Composition Relationships

```text
MainFrame
  ReadingBody
    MarginSidebarLayout
      toc slot
      content slot
```

`ReadingBody` owns the readable center column. `MarginSidebarLayout` owns rail
placement. `ArticleLayout` owns article header/prose/end ordering.

## Layout And Responsiveness

Mobile base: one column with shared gutters.

Tablet/desktop: preserve readable measure first. Add a left rail only when
there is enough margin space for a symmetric grid. When the rail is hidden by
responsive constraints, the article column must remain centered rather than
falling back to the left edge of a full-width grid. Wide desktop may increase
outer whitespace, not article measure.

Short viewport: sticky TOC must remain scrollable or non-sticky; it must not
hide under the header.

## Layering And Scrolling

`ReadingBody` itself has no sticky behavior. It passes header offset tokens to
`MarginSidebarLayout` when needed.

## Interaction States

No direct interaction. TOC hide/show and reference links are owned by descendant
components.

## Accessibility Semantics

Do not create a landmark. The parent `MainFrame` owns `<main>`. Reading content
should preserve heading hierarchy and hash-target behavior.

## Content Edge Cases

Handle:

- article with no headings;
- article with many headings;
- article with no hero image;
- article with very wide inline media;
- article with long footnotes or bibliography entries;
- article with no tags or no references.

## Theme Behavior

Use semantic background and text tokens. Reading body should not look like a
card. The article content should remain the visual focus in light and dark mode.

## Testable Invariants

- Keeps article prose within readable measure.
- Does not reserve blank TOC space when no TOC exists.
- Keeps the reading column centered when a rail exists.
- Keeps the reading column centered when an available rail is hidden or
  collapsed.
- Does not create horizontal overflow with wide media or long words.
- Preserves scroll target visibility below the sticky header.

## Follow-Up Notes

- If future essays outside `src/content/articles/` need article-like reading
  behavior, use `ReadingBody` with generic page components rather than copying
  `ArticleLayout`.
