# Themed Image

Source: `src/components/media/ThemedImage.astro`

## Purpose

`ThemedImage` renders a single semantic image whose visual asset changes with
the active site theme. Use it when light and dark mode need different artwork
for the same content, such as the homepage hero.

It should not choose artwork, fetch assets, or infer theme-specific alt text.

## Public Contract

- `lightImage: ImageMetadata`
- `darkImage: ImageMetadata`
- `alt: string`
- `layout?: "constrained" | "fixed" | "full-width"`
- `loading?: "eager" | "lazy"`
- `fetchpriority?: "auto" | "high" | "low"`
- `priorityVariant?: "light" | "dark" | "both"`
- `sizes?: string`
- `class?: string`

The light and dark images must represent the same semantic content. If the two
images would require different alt text, they are not a good fit for this
component.

## Composition Relationships

```text
HomeHeroBlock or another media-owning block
  ThemedImage
    Image light variant
    Image dark variant
```

Parents own image selection, surrounding figure/caption semantics, and layout
measure. `ThemedImage` owns only the theme switch and Astro image optimization.

## Layout And Responsiveness

The component passes `layout`, `sizes`, and shared classes to both optimized
images. It does not add a wrapper, spacing, caption, or page measure. Parent
components must provide stable sizing such as `layout="full-width"`, an
accurate `sizes` value, and `w-full` when the image should fill its container.

## Layering And Scrolling

No layering, sticky, fixed, overlay, or scroll behavior is intended.

## Interaction States

No direct interaction. The active image follows the document `data-theme` state
through Tailwind's dark variant.

## Accessibility Semantics

Both variants use the same `alt` value. The inactive image is hidden with
theme-specific display utilities, so assistive technology should encounter only
the visible themed variant.

Decorative themed images should still pass `alt=""` explicitly.

## Content Edge Cases

Handle:

- identical dimensions across light and dark variants;
- different intrinsic dimensions without layout shift through a parent-owned
  stable layout;
- decorative images with empty alt text;
- eager above-the-fold hero images;
- lazy lower-priority images.
- one prioritized variant for above-the-fold themed artwork so the hidden
  variant does not compete with the default light-mode LCP candidate.

## Theme Behavior

The light image is visible by default. The dark image is visible when the root
document has `data-theme="dark"`. This matches the project's Tailwind dark
variant and manual theme toggle behavior.

## Testable Invariants

- Renders both optimized image variants.
- Light variant has `dark:hidden`.
- Dark variant has `hidden dark:block`.
- Both variants receive the same alt text, layout, `sizes`, and class
  treatment.
- When the parent marks the image eager/high priority, only `priorityVariant`
  keeps that eager/high treatment; the inactive variant falls back to lazy/low.
- The component does not create a wrapper or additional landmark.

## Follow-Up Notes

- This component may load both image resources depending on browser behavior.
  Use it only when theme-specific artwork is required. Do not use it for simple
  color adjustments that semantic tokens or CSS can handle.
