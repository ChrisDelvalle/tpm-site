# Authors Index Page

Source: `src/components/authors/AuthorsIndexPage.astro`

## Purpose

`AuthorsIndexPage` renders a browsing page for all public authors.

It is useful as a footer/discovery destination and a recovery path from author
links.

## Public Contract

- `authors: readonly AuthorIndexItem[]`

Each item includes author summary, article count, optional short bio, and href.

## Composition Relationships

```text
BrowsingBody
  AuthorsIndexPage
    PageHeader
    author list/grid
```

The page may reuse `AuthorLink` and article-count metadata. It should not
duplicate `AuthorProfileHeader`.

## Layout And Responsiveness

Use standard browsing width. A simple list is preferred over a decorative grid
until profile metadata is rich enough to justify cards.

## Layering And Scrolling

No layering.

## Interaction States

Support no authors, one author, many authors, missing bios, long names, and
anonymous/organization authors.

## Accessibility Semantics

Use a page H1 and semantic list. Article counts should be readable text, not
only badges.

## Content Edge Cases

Handle authors with no profile metadata, authors with one article, group
authors, anonymous authors, and long display names.

## Theme Behavior

Use browsing page tokens and article archive density.

## Testable Invariants

- Renders one entry per author.
- Preserves supplied sort order.
- Shows article counts.
- Does not require bios or avatars.
- Provides useful empty state.

## Follow-Up Notes

- Authors index is worth implementing because it supports browsing and footer
  discovery without complicating article pages.
