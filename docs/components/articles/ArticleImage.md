# Article Image

Source: `src/components/articles/ArticleImage.astro`

## Purpose

`ArticleImage` renders explicit MDX/article images using the same editorial
image policy as default Markdown images.

Normal Markdown authors should not need this component. They should use standard
Markdown image syntax and let the article-image rehype plugin choose the
default presentation. `ArticleImage` exists for MDX articles, deliberate escape
hatches, captions that need component control, and cases where the author needs
to force a height policy.

## Public Contract

- `alt: string`
- `caption?: string | undefined`
- `heightPolicy?: "auto" | "contained" | "inspectable" | "natural"`
- `src: ImageMetadata`

Public props should remain narrow and semantic. Do not add broad configuration
objects or boolean clusters when a named variant or a smaller component would
make invalid states harder to express.

## Composition Relationships

```text
MDX article
  ArticleProse
    ArticleImage
      optimized Image
      optional inspect trigger
```

`ArticleImage` should call the shared article image policy helper rather than
duplicating aspect-ratio thresholds. It should not fetch content, inspect
Markdown source, or choose global image assets.

## Layout And Responsiveness

The component must mirror the default Markdown image policy:

- landscape images may use the full reading measure;
- square images are width-capped so they do not become oversized vertical
  blocks;
- portrait images are centered and narrower;
- tall images use a square-height preview with a full-image inspection action;
- extra-tall images render a narrower square-height inspectable preview by
  default;
- natural images are explicit escape hatches and may render at full natural
  height within the reading measure.

Images should preserve content with `object-contain` by default. Only
tall and extra-tall inspectable previews intentionally crop the image inside a
controlled preview frame.

## Layering And Scrolling

The component should avoid creating a stacking context unless it owns an
inspect trigger overlay. The full inspection viewer is owned by the shared
article image inspector script installed by `ArticleProse`, not by each image
instance.

## Interaction States

Default, contained, portrait, tall, inspectable, natural, captioned,
hover/focus, long-caption, and dark-mode states should be represented in the
catalog when relevant.

## Accessibility Semantics

Use `figure`/`figcaption` semantics. Required alt text must be preserved on the
image. Inspect triggers must have an accessible name and keep visible focus
states. The inspector must return focus to the trigger that opened it.

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
- uses the same shape policy as Markdown-rendered images.
- caps square and portrait images so they do not dominate the reading flow.
- renders tall and extra-tall images as inspectable previews unless explicitly
  told to use a different height policy.
- preserves caption and alt text semantics.
- keeps natural full-height display as an explicit escape hatch.

## Follow-Up Notes

- Keep this component aligned with
  `docs/rehype-plugins/article-images.md`. If either policy changes, update
  both documents and the shared helper tests.
