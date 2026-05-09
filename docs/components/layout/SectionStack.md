# Section Stack

Source: `src/components/layout/SectionStack.astro`

## Purpose

`SectionStack` owns vertical rhythm between page sections. It prevents pages
from hand-tuning margins between blocks.

It must not decide page width, card styling, or section content.

## Public Contract

- default slot
- `spacing?: "compact" | "normal" | "relaxed"`

Spacing values must map to shared rhythm tokens. Do not add route-specific
spacing names.

## Composition Relationships

```text
BrowsingBody | ReadingBody
  SectionStack
    Section or block components
```

`BrowsingBody` owns width. `SectionStack` owns vertical relationships. Child
blocks own their internal layout.

## Layout And Responsiveness

Mobile base uses normal vertical flow. Larger viewports may increase section
spacing only through the named spacing variants.

The stack should not collapse margins unpredictably; prefer explicit gap-based
layout.

## Layering And Scrolling

No sticky, fixed, overlay, or `z-index` behavior is intended.

## Interaction States

No direct interaction.

## Accessibility Semantics

`SectionStack` should not create landmarks. It may render a neutral wrapper
only. Child sections own headings and semantics.

## Content Edge Cases

Handle empty slots defensively, single section pages, dense many-section pages,
and sections with long headings or empty states.

## Theme Behavior

No visual styling by default. Child sections own surfaces.

## Testable Invariants

- Applies consistent vertical rhythm between children.
- Does not add extra landmarks.
- Does not create horizontal overflow.
- Handles one child and many children without special page patches.

## Follow-Up Notes

- Use this before adding local `mt-*` chains between homepage/archive/search
  blocks.
