# Article Layout

Source: `src/layouts/ArticleLayout.astro`

## Purpose

`ArticleLayout` orchestrates one article page. It composes article header,
prose, endcap, references, tags, and article-local navigation data without
owning low-level layout geometry.

It must preserve article body wording and must not parse article Markdown
source directly.

## Public Contract

- `article: ArticleEntry`
- `content: rendered article content`
- normalized related/more-in-category data
- optional normalized article headings
- optional normalized article reference data

Exact prop names may change during implementation, but the layout should
receive normalized view-model data rather than creating it inside visual
components.

## Composition Relationships

```text
ReadingBody
  MarginSidebarLayout
    left: ArticleTableOfContents
    content:
      ArticleHeader
      ArticleProse
      EndcapStack
        ArticleEndcap
        ArticleReferences
        ArticleTags
```

`ArticleLayout` owns article surface ordering. `ReadingBody` owns page-body
measure. `MarginSidebarLayout` owns TOC rail geometry.

## Layout And Responsiveness

Article content uses the reading body measure. `ArticleLayout` should not set
bespoke page widths. If no hero exists, no blank hero space should be reserved.

## Layering And Scrolling

`ArticleLayout` should not create sticky or overlay behavior. Article-local
TOC sticky behavior is delegated to `ContentRail`.

## Interaction States

No direct interaction. Descendant components own TOC disclosure, reference
links, support links, and hover image behavior.

## Accessibility Semantics

Keep one article title as the page H1. Article prose headings should start below
that level. Article end surfaces should use sections/asides with sensible
headings and should not create extra contentinfo landmarks.

## Content Edge Cases

Handle:

- no article headings;
- no hero image;
- no description;
- no tags;
- no references;
- long titles;
- many references;
- long inline media.

## Theme Behavior

Use semantic tokens and let child components own their surfaces. Article layout
should not impose decorative frames.

## Testable Invariants

- Article body renders unchanged from content.
- Article heading/H1 order is valid.
- End order is prose, support/discovery, references, tags.
- TOC receives normalized headings, not raw Markdown.
- No blank hero gap appears when no hero exists.
- No horizontal overflow at supported viewport sizes.

## Follow-Up Notes

- If the final implementation keeps `ArticleLayout` in `src/layouts/`, this
  one-pager still applies because it is a route-facing component contract.
