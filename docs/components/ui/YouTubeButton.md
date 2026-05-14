# YouTube Button

Source: `src/components/ui/YouTubeButton.astro`

## Purpose

`YouTubeButton` renders a branded YouTube channel link for surfaces that need a
compact external social CTA.

## Public Contract

- `href: string`
- Native anchor attributes, including optional `target`, `rel`, `class`, and
  `aria-label`.

The visible logo is decorative because the accessible name comes from
`aria-label`.

## Composition Relationships

May be used beside `PatreonButton` and `DiscordButton`. Parent blocks own
whether YouTube is appropriate for the surface; this component owns YouTube
brand color, logo sizing, focus ring, and safe external-link defaults.

## Layout And Responsiveness

The button has stable CTA dimensions, can shrink in a flex row, and keeps the
logo centered without wrapping.

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

Uses YouTube brand red rather than semantic theme tokens. Focus rings remain
semantic and visible in both themes.

## Testable Invariants

- External `_blank` links default to `rel="noreferrer"` unless the caller
  provides `rel`.
- Logo stays centered and contained.
- The accessible name is present.
- The button aligns with sibling branded CTA buttons when used.

## Follow-Up Notes

- This component can remain unused on the current homepage while still serving
  future social CTA surfaces.
