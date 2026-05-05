# Editorial Article Images

## Purpose

Article authors should be able to use normal Markdown image syntax and receive
beautiful, robust editorial image behavior by default:

```md
![Descriptive alt text](../../../assets/articles/example/thread.png)
```

The site, not the author, should choose the default presentation for ordinary
article images. MDX or component usage is reserved for deliberate exceptions,
custom interactions, or article-specific composition that plain Markdown cannot
express.

This feature exists to preserve reading flow. Images should support the essay,
not create accidental scroll traps, oversized square blocks, or tiny unreadable
vertical artifacts. The default prose ceiling is approximately the height of a
square image in the reading measure. Tall artifacts such as diagrams, thread
screenshots, and long captures should be presented as inspectable figures:
enough is visible in the prose to preserve context, and a clear interaction
lets the reader take a temporary side journey to inspect the full image without
losing their reading position.

## Pipeline

Astro's Markdown pipeline is powered by unified:

```text
Markdown source
  remark plugins
    project article-image marker plugin
  remark-rehype
  project rehype plugins
  Astro rehype image optimizer
  heading IDs
  raw HTML/stringify
```

This project already uses a remark plugin for article references. Editorial
article images use a small two-phase plugin pair:

- a remark marker pass marks only images that are the sole meaningful content
  of a paragraph;
- a rehype transform turns only those marked image elements into editorial
  figure anatomy.

The marker pass is important because inline images and emoji can appear inside
real article paragraphs. Those must remain inline content. A rehype-only
transform cannot rely on tree shape after Astro's Markdown image handling has
prepared images for optimization.

The structural transform belongs in rehype because the desired output is HTML
around rendered image elements:

- `figure` wrappers;
- optional `figcaption` from Markdown image titles;
- data attributes for image shape and inspection behavior;
- wrapper/button markup for tall and extra-tall images;
- stable classes that Astro's later image optimizer preserves.

Project rehype plugins run before Astro's Markdown image optimizer. That is the
right boundary for wrapping: the plugin can inspect marked `img` nodes while
`src` still points to the author-written image path, wrap the image in
editorial markup, and leave the actual `img` element for Astro to optimize
afterward.

The implementation lives under `src/rehype-plugins/articleImages.ts` because
the feature's main responsibility is generated HTML anatomy. The companion
remark marker is intentionally tiny and exists only to preserve Markdown
semantics before rehype sees the tree.

## Astro Image Integration

This is not a custom replacement for Astro's image pipeline. The project uses
standard Markdown `![alt](src)` syntax for article images, which Astro supports
for local `src/` images and remote images. Local images under `src/assets` stay
on Astro's optimized Markdown path; images from `public/` remain intentionally
unoptimized because that is Astro's documented behavior.

`astro.config.ts` should set `image.layout: "constrained"` so Markdown images
receive responsive `srcset` and `sizes` output by default. That setting answers
the browser-source-selection problem. It does not answer editorial questions
such as figure anatomy, captions, shape buckets, square-height ceilings, or
full-image inspection. Those remain project policy and belong in this plugin
and the shared `ArticleImage` component.

Keep `image.responsiveStyles` disabled while Tailwind owns the image layout.
Astro's docs note that generated responsive image styles can outrank Tailwind 4
utilities because Tailwind uses cascade layers. This project deliberately lets
Astro generate optimized sources while Tailwind utilities define the visual
box, max height, overflow, focus, and inspection behavior.

The rehype plugin carries a serializable policy cache key in Astro config. This
is a defensive build-cache boundary: changes to imported helper-only image
policy should invalidate rendered Markdown content even when Astro's content
cache would otherwise see the same plugin function reference.

## Image Metadata

Images should be classified from intrinsic metadata when the Markdown pipeline
provides `width` and `height` on the image element. If those properties are not
available, local images under `src/assets` can still be classified at build
time by resolving the Markdown image `src` relative to the current Markdown/MDX
file path. The plugin should read dimensions from local image headers without
fetching remote URLs or depending on runtime browser measurement.

Supported local formats should include at least PNG, JPEG, GIF, and WebP. If a
dimension cannot be read, the image must use the `unknown` policy rather than
failing the article build.

Remote images should not block the build or fetch network data. They should use
available intrinsic `width`/`height` properties when the pipeline provides
them; otherwise they should use the `unknown` policy unless a later explicit
metadata convention is added.

## Shape Policy

Shape is determined by `height / width`.

| Shape        |                 Ratio | Default Intention                                                                                          |
| ------------ | --------------------: | ---------------------------------------------------------------------------------------------------------- |
| `landscape`  |               `< 0.7` | Fill the reading measure only for genuinely wide images. Landscapes are naturally shallow and can breathe. |
| `square`     |         `0.7 - < 1.2` | Cap width so square, near-square, and 4:3 images do not become oversized vertical blocks.                  |
| `portrait`   |         `1.2 - < 1.5` | Center and narrow the figure while preserving a normal editorial image feel.                               |
| `tall`       |         `1.5 - < 2.0` | Render a square-height preview with a full-image inspection action.                                        |
| `extra-tall` |              `>= 2.0` | Render a narrower square-height preview with a full-image inspection action.                               |
| `unknown`    |         no dimensions | Use a conservative contained figure that cannot overflow.                                                  |
| `natural`    | explicit escape hatch | Preserve natural height for rare author-approved cases.                                                    |

Default sizing should be expressed with Tailwind utilities and stable design
tokens. The exact values may be tuned, but the initial contract is:

```text
landscape:  max-width: 100%;             max-height: min(70svh, 34rem)
square:     max-width: min(100%, 34rem); max-height: min(70svh, 34rem)
portrait:   max-width: min(100%, 30rem); max-height: min(70svh, 34rem)
tall:       max-width: min(100%, 26rem); max-height: min(70svh, 34rem); inspectable
extra-tall: max-width: min(100%, 24rem); max-height: min(70svh, 34rem); inspectable
unknown:    max-width: min(100%, 34rem); max-height: min(70svh, 34rem)
natural:    max-width: 100%;             max-height: none
```

Normal image shapes should use `object-contain`; they must not crop author
content. Tall and extra-tall previews are the exception: the preview is
intentionally a cropped viewport into a larger artifact, top-aligned because
long screenshots, diagrams, and threads usually read top-down.

## Tall Image Interaction

Tall figures should communicate author intent without interrupting reading
flow:

- the article shows a controlled preview;
- the preview makes it clear that more image content exists;
- the figure exposes a visible inspect action, preferably with an expand icon
  and accessible label;
- activating the action opens an inspection view;
- closing returns the reader to the same article position and restores focus to
  the trigger.

The inspection view should be a progressive enhancement. The base HTML remains
readable without JavaScript, and the preview still appears in the article. With
JavaScript enabled, a small controller opens a native dialog-like viewer,
copies the optimized image source data from the preview, locks interaction to
the viewer, supports `Escape`, supports backdrop/close-button dismissal, and
restores focus.

Inline expansion should not be the default. It mutates article height, creates
scroll jumps, and makes returning to the exact reading position harder.

## Author Escape Hatches

Plain Markdown should cover ordinary authoring. Authors should not have to
choose components for normal images.

Escape hatches are allowed only when the default behavior cannot express the
author's intent:

- MDX may use `ArticleImage` with an explicit `heightPolicy`.
- `heightPolicy="natural"` is reserved for rare, deliberate full-height figures.
- `heightPolicy="inspectable"` may force the full-image viewer for an image
  that is not ratio-classified as tall.
- `heightPolicy="contained"` may force conservative contained sizing.

Do not add broad per-image configuration objects to Markdown. If a Markdown
escape hatch is later needed, prefer a narrow, documented convention with
validation over ad hoc class names in article content.

## Component Hierarchy

```text
ArticleLayout
  ArticleProse
    rendered Markdown figure markup
    article-image-inspector script

MDX article
  ArticleProse
    ArticleImage
      same policy and trigger attributes
```

`ArticleProse` owns the presence of the progressive enhancement script because
it is the wrapper for article Markdown/MDX output. The rehype plugin owns the
generated figure anatomy for plain Markdown images. `ArticleImage` owns the
same anatomy for MDX-authored explicit image components.

Visual components must not parse Markdown source. Route files must not inspect
image paths. The rehype plugin and pure policy helpers are the only layers that
classify raw Markdown image paths.

## Accessibility

- Every image must keep meaningful `alt` text or an explicit empty alt when
  decorative.
- Inspect triggers must have an accessible name that includes the image alt text
  when possible.
- Dialog inspection must restore focus to the trigger that opened it.
- `Escape` must close the viewer.
- The close button must be keyboard reachable and visibly focused.
- The image caption, if present, should be associated with the figure and remain
  visible in article flow.
- The preview must not rely on hover-only behavior.

## Performance

The default output should stay static-first:

- no React island;
- one small browser script for all article-image inspection;
- no network metadata fetching at build time;
- no duplicate eager image loading for hidden dialogs;
- Astro continues to optimize Markdown image `img` elements after the plugin
  wraps them.

The dialog should copy optimized source data from the already rendered preview
image when opened. This avoids rendering a second hidden image that browsers
might load before the reader asks to inspect it.

## Test Plan

Unit tests:

- pure shape classifier thresholds;
- local image dimension parsing for PNG, JPEG, GIF, and WebP headers;
- local path resolution relative to Markdown file paths;
- generated figure anatomy for each shape;
- linked Markdown images are not broken by wrapping;
- inline Markdown images and emoji are not promoted into block figures;
- unknown/remote images use conservative contained behavior;
- tall and extra-tall images get inspect trigger metadata.

Component tests:

- `ArticleImage` renders default, tall/inspectable, extra-tall/inspectable,
  natural, and captioned variants with the same shape data contract;
- `ArticleProse` includes the progressive enhancement hook/script while
  preserving prose rhythm and first-child behavior.

Browser/unit script tests:

- clicking an inspect trigger opens the viewer;
- close button, `Escape`, and backdrop dismissal close it;
- focus returns to the trigger;
- optimized `src`, `srcset`, `sizes`, and alt text are copied from preview to
  dialog image;
- unrelated clicks and missing images fail safely.

E2E tests:

- real article Markdown images render as standalone figures without invalid
  empty paragraphs or nested figures;
- tall previews do not exceed viewport/content bounds at mobile, tablet, and
  desktop widths;
- forced/catalog inspectable examples open and close the inspection dialog and
  restore focus;
- square and portrait images are not full prose width;
- inline paragraph images stay inline;
- no horizontal overflow appears.

Catalog:

- show landscape, square, portrait, tall, extra-tall, unknown, captioned, and
  natural/escape-hatch examples;
- include light/dark states and long alt/caption content.

## Blockers And Risks

- Markdown anchor links around images need careful handling. If an author wraps
  an image in a link, the transform should preserve intent and avoid invalid
  nested interactive elements.
- Astro's image optimizer only transforms `img` elements, not arbitrary anchor
  `href` values. The inspect dialog should therefore read optimized data from
  the rendered preview image rather than relying on the original Markdown path
  as a public URL.
- Remote images cannot be dimension-classified without network access. Treat
  them as `unknown`.
- Extra-tall interaction requires JavaScript. The non-JavaScript experience is
  the readable preview, not full inspection.
