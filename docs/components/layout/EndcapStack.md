# Endcap Stack

Source: `src/components/layout/EndcapStack.astro`

## Purpose

`EndcapStack` owns the order and spacing of surfaces that appear after a
primary reading or browsing task.

It prevents support, related reading, references, tags, and footer handoff from
being arranged ad hoc by each route.

## Public Contract

- default slot
- `spacing?: "normal" | "relaxed"`
- optional named slots if implementation needs fixed ordering:
  `support`, `discovery`, `references`, `metadata`

Prefer explicit slots when ordering must be guaranteed.

## Composition Relationships

Article usage:

```text
ArticleLayout
  EndcapStack
    ArticleEndcap
    ArticleReferences
    ArticleTags
```

Browsing usage:

```text
BrowsingBody
  EndcapStack
    SupportBlock
    HomeArchiveLinksBlock or footer handoff
```

Child components own their own content; the stack owns order and rhythm.

## Layout And Responsiveness

The stack follows the parent body's measure. It should not become wider than
article prose or browsing content.

On mobile, surfaces stack. On larger screens, layout may become denser only if
the child components own that layout.

## Layering And Scrolling

No sticky, fixed, overlay, or `z-index` behavior is intended.

## Interaction States

No direct interaction. Descendant links and controls own focus and hover states.

## Accessibility Semantics

Do not create a footer landmark. Article pages already have site-level
contentinfo through `SiteFooter`; article end surfaces should use sections or
asides with appropriate headings.

## Content Edge Cases

Handle missing support, no related articles, no references, no tags, one-item
lists, dense related links, and long bibliography sections.

## Theme Behavior

Use semantic tokens. Support CTAs may be visually stronger than references and
tags, but all surfaces must stay within one coherent visual system.

## Testable Invariants

- Maintains article end order: support/discovery, references, tags.
- Keeps support blocks aligned with the parent body measure.
- Does not create extra contentinfo landmarks.
- Handles missing optional surfaces without awkward gaps.
- Does not create horizontal overflow with long endcap content.

## Follow-Up Notes

- If `ArticleLayout` keeps direct ordering without an `EndcapStack` component,
  tests must still assert the same ordering contract.
