# Editorial Article Images

## Purpose

Article authors should use ordinary Markdown image syntax:

```md
![Descriptive alt text](../../../assets/articles/example/image.png)
```

The site should turn standalone article images into a consistent editorial
reading experience:

- the preview participates in normal article flow;
- the preview is full prose width but cannot become taller than the square
  reading frame;
- the image remains optimized by Astro's normal image pipeline;
- the reader can inspect the full image on demand;
- Markdown authors do not need to choose components or per-image settings.

This design intentionally simplifies the older shape-bucket model. The core
product requirement is not "style every aspect ratio differently." It is
"do not let images get too tall in the reading flow, while preserving a clean
way to inspect the full image."

## Pipeline

Astro's Markdown pipeline is powered by unified:

```text
Markdown source
  remark plugins
    article image marker plugin
  remark-rehype
  rehype plugins
    article image wrapper plugin
  Astro Markdown image optimizer
  HTML output
```

The article-image feature uses a small two-phase plugin pair:

- `remarkArticleImageMarkers` marks images that are the only meaningful content
  in a paragraph;
- `rehypeArticleImages` wraps only those marked images in article figure
  anatomy before Astro optimizes the image element.

The marker pass prevents inline images, emoji, and mixed prose images from
being promoted into block figures. The rehype pass owns HTML anatomy because
the output is a figure, optional caption, inspect trigger, and stable
data/class contract around an image node that Astro can still optimize.

## Astro Image Integration

This feature does not replace Astro's image handling. Astro still owns:

- optimized responsive output files;
- `srcset`;
- lazy loading;
- async decoding;
- constrained image dimensions;
- static build-time image processing.

The project sets `image.layout: "constrained"` in `astro.config.ts`. The plugin
must preserve the `img` element so Astro can transform it later.

The project keeps `image.responsiveStyles: false` because Tailwind owns layout
and because Astro-generated responsive styles can compete with Tailwind 4's
cascade layers. Astro should generate sources; project components should own
the editorial box.

The plugin must set accurate preview `sizes` for generated Markdown images so
the browser selects a candidate that matches the article preview width instead
of assuming the image is viewport- or intrinsic-width. The full-screen
inspector changes the dialog image to `sizes="100vw"` only after the reader
opens it, letting the browser request a larger candidate on demand.

## Default Preview Contract

All standalone unlinked article images use the same preview contract:

```text
figure:       normal article rhythm, no prose styling leak
trigger:      full prose width, visible focus, no card treatment
preview:      max-height: min(70svh, 34rem)
image fit:    object-contain, centered
sizes:        min(prose width, viewport minus gutters)
interaction:  click/focus-visible opens the full-screen inspector
```

The image must not crop by default. Memes, diagrams, screenshots, and quoted
text images often rely on their edges and internal layout. If the image is
taller than the square-height frame, the preview becomes a contained image
inside that frame and the full-screen inspector gives the reader the complete
view.

The preview should not carry a visible card background. A subtle focus ring and
hover affordance are enough. The interaction should feel like inspecting the
image, not opening a separate UI card.

## Linked Images

If an author explicitly wraps an image in a Markdown link, the link is the
author's chosen click behavior and must be preserved. Do not hijack linked
images for the inspector and do not create nested interactive elements.

Linked standalone images should still receive the normal bounded figure/frame
contract when possible, but their click target remains the author's link.

## Full-Screen Inspector

The inspector is a progressive enhancement:

- no React island;
- one small browser script;
- no hidden full-size image on page load;
- one native dialog-like full-screen viewer;
- dark backdrop;
- image centered and unconstrained by article prose;
- no card background around the image;
- top-right icon-only close button;
- `Escape` and backdrop dismissal where supported;
- focus restoration to the trigger after close.

On open, the script copies the already-rendered preview image's optimized
`src`, `srcset`, `alt`, and caption text into the inspector image, then sets
`sizes="100vw"`. That keeps page load light and lets the browser request a
larger candidate only after the reader asks to inspect the image.

Oversized images should be viewport-safe: the viewer may scroll when an image
is taller than the viewport, but it should not horizontally overflow. The close
button must remain reachable.

## Author Escape Hatches

Plain Markdown covers ordinary authoring. Authors should not have to choose a
component for normal article images.

Allowed escape hatches:

- MDX may use `ArticleImage` for explicit component-controlled images.
- `heightPolicy="natural"` may disable the square-height cap for rare,
  deliberate full-height figures.
- Linked Markdown images preserve the author's explicit link behavior.

Do not add broad Markdown configuration objects or class-name conventions unless
the default model fails a real article requirement.

## Component Hierarchy

```text
ArticleLayout
  ArticleProse
    rendered Markdown figure markup
    ArticleImageInspectorScript

MDX article
  ArticleProse
    ArticleImage
      optimized Image
      inspect trigger
```

`ArticleProse` owns whether the shared inspector script is installed for an
article. The rehype plugin owns generated Markdown image anatomy. `ArticleImage`
owns the same contract for explicit MDX images. Route files should only pass
serializable render metadata; they should not parse Markdown or inspect image
paths.

## Accessibility

- Images preserve author-provided alt text.
- Inspect triggers are real buttons with labels such as
  `View full image: <alt>`.
- Icon-only controls must have accessible labels.
- Focus-visible states are required for the image trigger and close button.
- `Escape` closes the viewer.
- Closing restores focus to the original trigger.
- Captions stay visible in article flow and can be mirrored in the inspector.
- Hover-only affordances are enhancements; keyboard and touch users can still
  open the image.

## Performance

The performance contract is:

- preview image loads through Astro's optimized responsive output;
- preview `sizes` matches the prose-width preview frame;
- loading remains lazy unless an image is intentionally above-the-fold and
  separately prioritized;
- no full-screen image candidate is preloaded on page load;
- full-screen image loading starts only when the reader opens the inspector;
- remote image metadata is never fetched during build.

This keeps the simple authoring model while avoiding unnecessary large image
downloads for readers who keep reading.

## Test Plan

Unit tests:

- local image dimension parsing for PNG, JPEG, GIF, and WebP headers;
- local path resolution relative to Markdown file paths;
- preview policy output for default and natural modes;
- generated figure anatomy for unlinked Markdown images;
- linked Markdown images preserve link behavior and are not inspectable;
- inline Markdown images and emoji are not promoted into block figures;
- article image render metadata reports whether an inspector script is needed.

Component tests:

- `ArticleImage` renders the default bounded inspectable preview;
- `ArticleImage` preserves captions and alt text;
- `ArticleImage heightPolicy="natural"` renders without the height cap and
  without inspector behavior;
- `ArticleProse` installs the inspector script only when requested.

Browser/script tests:

- clicking an image trigger opens the viewer;
- close icon, `Escape`, and backdrop dismissal close it;
- focus returns to the trigger;
- the inspector copies optimized `src`, `srcset`, `sizes`, alt text, and
  caption only on open;
- unrelated clicks and incomplete markup fail safely.

E2E tests:

- standalone Markdown images render as bounded article figures;
- preview images stay within the square-height cap at mobile, tablet, desktop,
  and wide widths;
- clicking an unlinked image opens the full-screen inspector;
- linked images keep their link behavior;
- inline paragraph images stay inline;
- no horizontal overflow appears.

Catalog:

- show default Markdown-like, explicit `ArticleImage`, linked image, natural
  escape hatch, captioned, long-alt, and unknown/remote examples.
- include light/dark and mobile/desktop invariant coverage.

## Critical Review

This design deliberately removes shape-specific visual buckets because they are
not necessary for the actual requirement. A single preview frame is easier to
test, easier to explain, and less likely to drift across Markdown, MDX, and
catalog examples.

The only meaningful complexity left is justified:

- a Markdown transform is needed because Astro does not provide project-specific
  editorial figure anatomy for normal Markdown images;
- a small script is needed because full-screen image inspection is a runtime
  interaction;
- preview `sizes` are needed because Astro cannot infer project prose-width
  layout from the generated Markdown image alone.
