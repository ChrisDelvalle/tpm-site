# Author Article List

Source: `src/components/authors/AuthorArticleList.astro`

## Purpose

`AuthorArticleList` renders the articles associated with one author.

It is the main value of author pages and must work even when no bio metadata
exists.

## Public Contract

- `articles: readonly ArticleListItem[]`
- `author: AuthorSummary`

Articles should arrive already filtered and sorted.

## Composition Relationships

```text
AuthorPage
  AuthorArticleList
    ArticleList
      ArticleCard
```

This component may wrap existing article list/card components rather than
duplicating archive UI.

## Layout And Responsiveness

Use browsing page list/card behavior. Do not invent a separate author-page card
style unless the design proves it necessary.

## Layering And Scrolling

No layering.

## Interaction States

Support no articles, one article, many articles, long titles, missing excerpts,
and focus-visible links.

## Accessibility Semantics

Use a visible heading such as "Articles by Seong-Young Her" and semantic list
structure.

## Content Edge Cases

Handle anonymous authors, group authors, multiple-author articles, long titles,
missing descriptions, and article dates.

## Theme Behavior

Reuse article archive/list tokens.

## Testable Invariants

- Renders articles in supplied order.
- Reuses article list/card semantics.
- Empty state is useful and not broken.
- Long titles wrap.
- Links remain focusable.

## Follow-Up Notes

- Filtering articles by author belongs to the author data boundary, not this
  component.
