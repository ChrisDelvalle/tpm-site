# Margin Sidebar Layout

Source: `src/components/layout/MarginSidebarLayout.astro`

## Purpose

`MarginSidebarLayout` places optional side content in page margin space while
preserving the centered primary content measure.

Its first production use should be article-local table of contents. It should
not be used to keep the old global category sidebar on article pages.

## Public Contract

- default slot for primary content
- optional named slot `left`
- optional named slot `right`
- `leftVisibility?: "auto" | "always" | "never"`
- `rightVisibility?: "auto" | "always" | "never"`

Visibility options describe layout behavior, not business semantics. The caller
decides whether there is useful rail content.

## Composition Relationships

```text
ReadingBody
  MarginSidebarLayout
    left: ContentRail
      ArticleTableOfContents
    content: ArticleLayout
```

`ReadingBody` owns the reading page. `MarginSidebarLayout` owns rail geometry.
`ContentRail` owns sticky/overflow details. Child navigation components own
semantics.

## Layout And Responsiveness

Mobile and tablet base: render only the primary content, with rail content
hidden, collapsed, or moved according to the child component design. The
primary content column stays centered even when a rail slot exists but is not
currently visible.

Desktop: rails occupy margin space outside the primary content measure as soon
as there is enough room for a symmetric reading grid. The rail starts narrow and
may widen on very large screens. The primary content must not shift
unexpectedly when a rail is toggled.

Wide desktop: rails may become wider if useful, but whitespace remains
acceptable. Do not stretch the reading column.

Short viewport: sticky rails must account for header height and allow their own
scrolling.

## Layering And Scrolling

The layout may coordinate sticky offsets through CSS variables/tokens but
should not create arbitrary stacking contexts. Rail content must stay below the
sticky header and must not overlap prose.

## Interaction States

No direct interaction. Rail child components own hide/show, current state, and
focus behavior.

## Accessibility Semantics

Do not create landmarks directly. If a rail contains navigation, the child
navigation component must provide an accessible label.

## Content Edge Cases

Handle:

- no left rail;
- no right rail;
- both rails;
- long TOC items;
- no useful TOC;
- hidden rail state;
- very wide and very narrow viewports;
- browser zoom.

## Theme Behavior

Rails should use quiet border/muted tokens. The layout should not draw a large
decorative frame around the article.

## Testable Invariants

- Primary content stays centered when the left rail is present.
- Primary content stays centered when an automatic rail is hidden by responsive
  constraints.
- Rail does not reduce reading measure below the intended content width.
- Rail never overlaps article prose.
- Rail stays below sticky header during scroll.
- No blank rail space appears when no rail content exists.
- No horizontal overflow at mobile, tablet, desktop, or wide desktop widths.

## Follow-Up Notes

- This is the key replacement for the prototype category sidebar. Treat any
  attempt to put global discovery back into article rails as a design change
  requiring review.
