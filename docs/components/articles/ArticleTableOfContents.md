# Article Table Of Contents

Source: `src/components/articles/ArticleTableOfContents.astro`

## Purpose

`ArticleTableOfContents` renders article-local heading navigation in the margin
rail. It helps readers stay oriented inside long articles after global category
navigation moves into site navigation.

It must not parse Markdown source, fetch article content, or render global
category discovery.

## Public Contract

- `headings: readonly ArticleHeading[]`
- `label?: string`
- `initiallyOpen?: boolean`

`ArticleHeading` should be normalized outside this component and include:

- stable heading ID;
- display text;
- heading depth;
- normalized nesting level;
- original order.

Render nothing when there are too few useful headings.

## Composition Relationships

```text
ReadingBody
  MarginSidebarLayout
    ContentRail
      ArticleTableOfContents
        TableOfContentsToggle
        TableOfContentsItem
```

`ArticleLayout` or the article route passes normalized headings. The TOC owns
article-local navigation markup. `MarginSidebarLayout` and `ContentRail` own
rail geometry and sticky behavior.

## Layout And Responsiveness

Mobile base: no persistent side rail. The TOC should be absent or rendered as a
compact in-flow disclosure only if a later design chooses that.

Desktop: render in the left margin rail only when at least two useful headings
exist. The rail must not squeeze or overlap article prose.

Short viewport: the rail must stay below the sticky header and become scrollable
if its content is taller than available space.

## Layering And Scrolling

The TOC does not own sticky positioning directly; `ContentRail` does. Links use
hash navigation to existing heading IDs. Global scroll-margin behavior should
keep heading targets below the sticky header.

## Interaction States

Use native `details`/`summary` for hide/show where possible:

- open;
- collapsed;
- focus-visible summary;
- long-heading wrapping;
- current section if progressive active highlighting is later added.

Do not require JavaScript for basic navigation or hide/show behavior.

## Accessibility Semantics

Render a labeled navigation region such as `aria-label="Article contents"`.
Use normal anchor links. Do not use app-menu roles.

The summary/toggle text must be visible and keyboard reachable. If active
section highlighting is added, it must not replace `aria-current` on the
current article link; use a scoped state such as `aria-current="location"` only
if testing confirms it is appropriate for in-page anchors.

## Content Edge Cases

Handle:

- no headings;
- one heading;
- many headings;
- duplicate heading text;
- long heading text;
- skipped heading levels;
- headings with punctuation;
- heading links after article images or embeds;
- browser zoom and narrow desktop widths.

## Theme Behavior

Use quiet semantic tokens. TOC text should be readable but secondary to article
prose. Current/focus states must be visible in light and dark mode.

## Testable Invariants

- Renders nothing when heading count is below the useful threshold.
- Uses normalized heading IDs without generating its own slugs.
- Preserves article heading order.
- Does not include article title/H1.
- Keeps long headings inside rail width.
- Hide/show works without JavaScript.
- Rail never overlaps prose or hides under the sticky header.
- Links navigate to visible heading targets.

## Follow-Up Notes

- Active-section scrollspy is optional progressive enhancement. Do not block the
  static TOC on scrollspy work.
