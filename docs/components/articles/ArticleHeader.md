# Article Header

Source: `src/components/articles/ArticleHeader.astro`

## Purpose

`ArticleHeader` renders the uncluttered article opening: category context,
title, description, and date/author metadata.

## Public Contract

- `author?: string | undefined`
- `authors?: readonly AuthorSummary[] | undefined`
- `category?: ArticleCategory | undefined`
- `date?: Date | undefined`
- `description?: string | undefined`
- `formattedDate?: string | undefined`
- `legacyAuthor?: string | undefined`
- `title: string`

Public props should remain narrow and semantic. Do not add broad configuration
objects or boolean clusters when a named variant or a smaller component would
make invalid states harder to express.

## Composition Relationships

```text
ArticleLayout
  ArticleHeader
    category TextLink
    ArticleMeta
      AuthorByline
```

`ArticleHeader` owns the page H1 and visible article opening. It should receive
normalized category and author summaries from the article route/view model; it
must not query collections directly.

## Layout And Responsiveness

The component must respect a readable prose measure, keep metadata visually
subordinate to the article title/body, and allow long titles and author names to
wrap without layout collision. It should not reserve space for hero media; hero
or article media spacing belongs to an explicit media component.

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
- keeps article title, metadata, and category links semantically associated.
- does not create an awkward header-to-body gap when no hero image is rendered.
- links known authors through `AuthorByline` and preserves legacy byline text
  when structured author data is not available.

## Follow-Up Notes

- No component-specific brittle decision is known yet; add one here when implementation review finds a questionable or fragile choice.
- Article TOC heading extraction must exclude the article title rendered here.
  The article title remains the page H1; Markdown body headings should begin
  below it.
