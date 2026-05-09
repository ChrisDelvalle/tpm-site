# Author Page

Source: `src/components/authors/AuthorPage.astro`

## Purpose

`AuthorPage` composes the author detail browsing page.

It helps readers understand who wrote an article and continue reading that
author's work.

## Public Contract

- `author: AuthorProfile`
- `articles: readonly ArticleListItem[]`

## Composition Relationships

```text
BrowsingBody
  AuthorPage
    AuthorProfileHeader
    optional AuthorBioBlock
    AuthorArticleList
```

`BrowsingBody` owns page width. `AuthorPage` owns profile page order.

## Layout And Responsiveness

Use the standard browsing measure. The article list should align with archive
and category list behavior.

## Layering And Scrolling

No sticky, fixed, overlay, or `z-index` behavior is intended.

## Interaction States

Support full profile, display-name-only profile, no socials, no bio, many
articles, one article, and no article fallback for internal states.

## Accessibility Semantics

Render one H1 through `AuthorProfileHeader`. Use section headings for bio and
article list. Do not add extra main landmarks.

## Content Edge Cases

Handle anonymous authors, collectives, organizations, long names, missing bios,
no social links, no avatar, and multiple-author article lists.

## Theme Behavior

Use browsing page tokens. Profile pages should be calm and archive-like.

## Testable Invariants

- Uses `BrowsingBody` width.
- Renders author identity and article list.
- Does not require bio/social/avatar metadata.
- Links article cards normally.
- Does not overflow with long names or article titles.

## Follow-Up Notes

- Author pages should be useful even before rich profile metadata exists.
