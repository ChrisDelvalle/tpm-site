# AnchoredPanel

Source: `src/components/ui/AnchoredPanel.astro`

## Purpose

`AnchoredPanel` is the floating surface primitive for trigger-attached panels.
It consumes shared CSS variables written by the anchoring adapter and leaves
visual styling to the owning component.

## Public Contract

- Emits `data-anchor-panel` and `data-floating-panel`.
- Accepts native `div` attributes, `class`, and optional inline `style`.
- Provides CSS hooks for `--anchor-x`, `--anchor-y`, `--anchor-max-width`, and
  `--anchor-max-height`.
- Renders slot content unchanged.

## Composition Relationships

Use inside `AnchoredRoot` with an `AnchoredTrigger`. Parent components own the
panel width, visual tone, scroll behavior, and open/closed visibility classes.

## Layout And Responsiveness

The panel is fixed-positioned and defaults to viewport-safe fallback values
until measured. Owning components should set width with responsive constraints
such as `w-[min(...)]`, `max-w-full`, and `overflow-y-auto` as needed.

## Layering And Scrolling

The panel is fixed. Owning components must choose an intentional `z-*` layer
and an internal scroll strategy for short viewports. It should not cause
page-level horizontal overflow.

## Interaction States

The panel can be shown through hover/focus groups, `details[open]`, native
popover state, or future small islands. Closed panels should not be eagerly
measured.

## Accessibility Semantics

Panel content must provide any needed roles, labels, headings, or fallback
links. The primitive itself intentionally stays semantic-neutral.

## Content Edge Cases

Must tolerate long article titles, dense lists, small viewports, scroll after
opening, resize, and edge-positioned triggers.

## Theme Behavior

The primitive has no color styling. Owning components should use semantic
tokens such as `bg-popover`, `text-popover-foreground`, and `border-border`.

## Testable Invariants

- Emits `data-anchor-panel` and `data-floating-panel`.
- Applies fixed positioning through CSS variables.
- Preserves caller-provided style without replacing the required anchor hooks.
- Exposes max-width and max-height hooks for viewport-safe surfaces.

## Follow-Up Notes

Do not encode component-specific offsets or alignments here. Those belong in
the pure positioning presets.
