# Discord Button

Source: `src/components/ui/DiscordButton.astro`

## Purpose

`DiscordButton` renders the branded Discord call-to-action link used in support
and homepage surfaces.

## Public Contract

- `href: string`
- Native anchor attributes, including optional `target`, `rel`, `class`, and
  `aria-label`.

The visible logo is decorative because the accessible name comes from
`aria-label`.

## Composition Relationships

Used beside other external CTA buttons such as `PatreonButton`. Parent blocks
own row wrapping or shrinking; the button owns brand color, logo sizing, focus
ring, and safe external-link `rel` defaults.

## Layout And Responsiveness

The button has stable CTA dimensions, can shrink in a flex row, and keeps the
logo centered. It should not wrap text because the logo asset is the visible
label.

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

Uses Discord brand blue rather than semantic theme tokens. Focus rings remain
semantic and visible in both themes.

## Testable Invariants

- External `_blank` links default to `rel="noreferrer"` unless the caller
  provides `rel`.
- Logo stays centered and contained.
- The accessible name is present.
- The button aligns with sibling branded CTA buttons.

## Follow-Up Notes

- Keep brand assets in the component-local `assets/` folder unless a shared
  brand asset system is introduced.
