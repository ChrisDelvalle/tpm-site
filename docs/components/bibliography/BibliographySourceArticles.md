# Bibliography Source Articles

Source: `src/components/bibliography/BibliographySourceArticles.astro`

## Purpose

`BibliographySourceArticles` lists the articles that cite one bibliography
entry.

It helps readers move from a source back into the publication archive.

## Public Contract

- `sources: readonly BibliographySourceArticle[]`

Each source includes article title, href, category, publication date, and marker
IDs where useful.

## Composition Relationships

```text
BibliographyEntry
  BibliographySourceArticles
```

The parent owns source entry content. This component owns source article link
list semantics.

## Layout And Responsiveness

Render compact article backlinks below the source. Many source articles should
wrap or stack without overflowing.

## Layering And Scrolling

No layering.

## Interaction States

Support one article, many articles, hover, focus-visible, visited where
appropriate, and long article titles.

## Accessibility Semantics

Use a semantic list with a visible or screen-reader label such as "Cited by".
Links should point to the article, optionally with fragment IDs if the source
marker target is stable.

## Content Edge Cases

Handle many articles, long titles, identical article titles in different
categories, missing category metadata, and source markers that cannot be
fragment-linked.

## Theme Behavior

Use muted metadata tokens and normal link tokens. Backlinks should be visible
but secondary to the source itself.

## Testable Invariants

- Renders one link per source article.
- Preserves supplied order.
- Uses clear label text.
- Keeps long article titles inside width.
- Handles empty array defensively without broken markup.

## Follow-Up Notes

- If fragment links into article citation markers prove brittle, link to the
  article page first and add fragment targeting later.
