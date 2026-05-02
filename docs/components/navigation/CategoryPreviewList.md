# Category Preview List

Source: `src/components/navigation/CategoryPreviewList.astro`

## Purpose

`CategoryPreviewList` renders a restrained list of article previews inside a
category discovery dropdown.

It must not render a full archive, sort content, or fetch article data.

## Public Contract

- `articles: readonly ArticleSummary[]`
- `categoryHref: string`
- `categoryTitle: string`
- `maxItems?: number`

`articles` must be pre-sorted and pre-trimmed by the navigation/content
boundary. `maxItems` is a defensive display cap, not the primary data policy.

## Composition Relationships

```text
CategoryDropdown
  CategoryPreviewList
```

The dropdown owns heading and category link context. The preview list owns the
list semantics and preview item layout.

## Layout And Responsiveness

Previews stack vertically with compact rhythm. Long titles wrap. Metadata is
optional and should not make the dropdown feel dense.

The list must fit inside the dropdown's capped width and height.

## Layering And Scrolling

No layering. If the dropdown surface scrolls, that is owned by
`CategoryDropdown`.

## Interaction States

Support normal, hover, focus-visible, visited where appropriate, empty, one
item, and many-item states.

## Accessibility Semantics

Render a semantic list of links. Do not use card roles or menu roles. If there
are no previews, render a short empty message and keep the category View All
link available through the parent dropdown.

## Content Edge Cases

Handle:

- empty preview list;
- one preview;
- long title;
- missing description;
- long author name if metadata appears;
- unusual punctuation.

## Theme Behavior

Use semantic link and muted tokens. Preview links should be readable and
secondary to the category title.

## Testable Invariants

- Renders a list when articles exist.
- Renders a useful empty state when no articles exist.
- Does not render more than the allowed preview count.
- Keeps long titles inside the dropdown width.
- Provides visible focus states for every preview link.

## Follow-Up Notes

- If later data supports "featured" previews, select them before this component
  receives data. Do not add feature-selection logic here.
