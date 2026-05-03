# AnchoredTrigger

Source: `src/components/ui/AnchoredTrigger.astro`

## Purpose

`AnchoredTrigger` marks the semantic element that an anchored panel relates to.
It owns only the `data-anchor-trigger` marker and native element forwarding.

## Public Contract

- Supports `as="a"`, `as="button"`, `as="span"`, and `as="summary"`.
- Defaults to `span`.
- Accepts native attributes for the rendered element.
- Renders slot content unchanged.

## Composition Relationships

Use inside `AnchoredRoot` with a sibling `AnchoredPanel`. Parent components
choose whether the trigger is a link, button, summary, or inline prose element.

## Layout And Responsiveness

The trigger inherits layout from its parent. It must be allowed to wrap or
shrink according to the owning component's responsive design.

## Layering And Scrolling

The trigger does not create an overlay or stacking context.

## Interaction States

The owning component must style hover, focus-visible, active, current, and
disabled states according to the trigger's semantics.

## Accessibility Semantics

Choose the correct native element. Use links for navigation, buttons for
actions, summaries for `details`, and spans only for non-interactive inline
anchors that are paired with a separate accessible fallback.

## Content Edge Cases

Must preserve long text, punctuation, inline prose flow, and accessible names.

## Theme Behavior

No theme styling by default. Owning components should use semantic tokens.

## Testable Invariants

- Emits `data-anchor-trigger`.
- Preserves the selected semantic element.
- Forwards native attributes such as `href`, `type`, and ARIA attributes.
- Does not add JavaScript or final positioning styles.

## Follow-Up Notes

Do not add popup behavior to this component. Keep it a marker primitive.
