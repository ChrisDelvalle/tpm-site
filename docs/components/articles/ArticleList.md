# Article List

Source: `src/components/articles/ArticleList.astro`

## Purpose

`ArticleList` renders a reusable list of article summaries.

It is the shared display primitive for archive pages, category pages, author
pages, search results, homepage sections, and article-end discovery. Filtering,
sorting, and route construction happen before data reaches this component.

## Public Contract

- `items: readonly ArticleListItem[]`
- `pagefindIgnore?: boolean`

Public props should remain narrow and semantic. Do not add broad configuration
objects or boolean clusters when a named variant or a smaller component would
make invalid states harder to express.

## Composition Relationships

```text
Archive / Category / Search / Author / Discovery block
  ArticleList
    ArticleCard[]
```

`ArticleList` owns list semantics, spacing, empty-state handling, and optional
Pagefind opt-out behavior. It does not fetch content, filter by category,
filter by author, or infer routes.

## Layout And Responsiveness

The component must respect a readable prose measure, keep metadata visually subordinate to the article title/body, and allow long titles, author names, tags, and images to wrap without layout collision.

## Layering And Scrolling

The component should avoid creating a stacking context unless it owns an overlay,
sticky region, or popover. Any `z-index`, sticky offset, fixed size, or scroll
container is part of this component's public design and needs an invariant test.

## Interaction States

Default, long-content, missing optional content, hover, focus-visible, and dark-mode states should be represented in the catalog when relevant. Empty lists, missing image/description, many tags, one-item lists, and dense lists should have catalog examples or tests where applicable.

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
- keeps article title, metadata, tags, and links semantically associated.
- keeps article body, continuation, and support surfaces in the intended order.
- can be reused by `AuthorArticleList` with prefiltered author-specific data.
- renders a useful empty state only when the parent supplies one or the design
  chooses a default for that page type.

## Follow-Up Notes

- Keep this component boring and reusable. Page-specific section headings,
  filters, and explanatory copy belong in parent browsing blocks.
