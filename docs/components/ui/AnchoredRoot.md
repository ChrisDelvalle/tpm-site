# AnchoredRoot

Source: `src/components/ui/AnchoredRoot.astro`

## Purpose

`AnchoredRoot` declares one trigger-attached floating-surface relationship. It
owns the shared `data-anchor-root` and `data-anchor-preset` contract, but it
does not own open state, route data, visual styling, or placement math.

## Public Contract

- Requires a typed `preset` matching `src/lib/anchored-positioning.ts`.
- Accepts `disclosure="hover-focus-tap"` when the root should opt into the
  shared anchored disclosure runtime.
- Accepts native `div` attributes and forwards them to the root element.
- Renders the default slot, which should contain exactly one logical trigger
  and one logical panel.

## Composition Relationships

The root wraps `AnchoredTrigger` and `AnchoredPanel`. Parent components choose
the preset and interaction semantics; the shared browser adapter measures the
relationship and writes CSS variables to the panel. When `disclosure` is set,
the root also emits `data-disclosure-root` and loads the shared disclosure
runtime. Disclosure state is separate from placement state.

## Layout And Responsiveness

The root must not add page-level positioning assumptions. It may be inline,
block, or grouped by a parent component, and the panel must remain responsible
for its own width and overflow rules.

## Layering And Scrolling

The root is not a stacking context by default. Floating behavior belongs to the
panel and the shared adapter.

## Interaction States

The root should work with hover, focus, `details[open]`, native popover-open
descendants, and disclosure-owned `data-disclosure-open` state. It must not
make hover-only content inaccessible.

## Accessibility Semantics

The root is a structural wrapper. Accessibility semantics belong to the trigger
and panel content.

## Content Edge Cases

The root must tolerate long trigger text, constrained containers, edge triggers,
and nested content without changing the positioning contract.

## Theme Behavior

The root has no color styling. Child components should use semantic tokens.

## Testable Invariants

- Emits `data-anchor-root`.
- Emits the typed `data-anchor-preset` value.
- Emits `data-disclosure-root` only when opted into disclosure behavior.
- Loads the shared processed anchoring script once through Astro bundling.
- Loads the shared processed disclosure script only when disclosure behavior is
  requested.
- Does not force centered or viewport-specific positioning.

## Follow-Up Notes

Do not add component-specific placement behavior here. Add new presets to the
pure positioning engine instead.
