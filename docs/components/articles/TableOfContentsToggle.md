# Table Of Contents Toggle

Source: `src/components/articles/TableOfContentsToggle.astro`

## Purpose

`TableOfContentsToggle` provides the visible hide/show control for article
contents.

It should make the TOC adaptable without requiring a hydrated component for the
basic collapsed/open behavior.

## Public Contract

- `label?: string`
- `openLabel?: string`
- `closedLabel?: string`

The preferred implementation is a native `summary` inside a parent `details`.
If the final implementation needs a separate button, update this one-pager
before adding JavaScript state.

## Composition Relationships

```text
ArticleTableOfContents
  details
    TableOfContentsToggle
    TableOfContentsItem list
```

`ArticleTableOfContents` owns the disclosure wrapper. This component owns the
visible label/icon styling and accessible text.

## Layout And Responsiveness

The toggle should be compact and touch-friendly. It must not shift the reading
column when opened or closed.

## Layering And Scrolling

No layering. It participates in the sticky rail controlled by `ContentRail`.

## Interaction States

Support:

- open;
- closed;
- hover;
- focus-visible;
- active;
- reduced motion.

Avoid animated height transitions unless they are clearly useful and respect
`prefers-reduced-motion`.

## Accessibility Semantics

Use native disclosure semantics through `summary` whenever possible. Visible
text should say what is being toggled, such as "Article contents".

## Content Edge Cases

Handle short labels, localized/long labels, icon absence, and browser default
summary marker differences.

## Theme Behavior

Use semantic foreground/muted/border tokens. Focus rings must be visible in
light and dark mode.

## Testable Invariants

- Toggle is keyboard reachable.
- Toggle changes disclosure state without JavaScript.
- Accessible name identifies article contents.
- Focus-visible state is clear.
- Open/closed state does not change primary content measure.

## Follow-Up Notes

- State persistence is intentionally not required. If persistence is requested,
  use the smallest possible client boundary and update this design first.
