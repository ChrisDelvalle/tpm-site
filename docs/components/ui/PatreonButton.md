# Patreon Button

Source: `src/components/ui/PatreonButton.astro`

## Purpose

`PatreonButton` renders the branded Patreon support link used in support and
homepage surfaces.

## Public Contract

- `href: string`
- Native anchor attributes, including optional `target`, `rel`, `class`, and
  `aria-label`.

The visible lockup is decorative because the accessible name comes from
`aria-label`.

## Composition Relationships

Used beside `DiscordButton` and other external CTAs. Parent blocks own the
button group layout; this component owns Patreon brand color, lockup sizing,
focus ring, and safe external-link defaults.

## Layout And Responsiveness

The button has stable CTA dimensions, can shrink in a flex row, and keeps the
lockup centered without wrapping.

## Layering And Scrolling

No layering or scroll behavior.

## Interaction States

Supports default, hover, focus-visible, external target, and narrow-container
states.

## Accessibility Semantics

Use a native anchor with a useful accessible name. The logo image has empty alt
text to avoid repeating the label.

## Content Edge Cases

Handle missing `target`, caller-provided `rel`, narrow support rows, and dark or
light page backgrounds.

## Theme Behavior

Uses Patreon brand color rather than semantic theme tokens. Focus rings remain
semantic and visible in both themes.

## Testable Invariants

- External `_blank` links default to `rel="noreferrer"` unless the caller
  provides `rel`.
- Lockup stays centered and contained.
- The accessible name is present.
- The button aligns with sibling branded CTA buttons.

## Follow-Up Notes

- If Patreon brand guidance changes, update the local SVG lockup and this
  component together.
