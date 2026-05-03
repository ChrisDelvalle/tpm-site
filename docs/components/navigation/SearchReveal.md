# Search Reveal

Source: `src/components/navigation/SearchReveal.astro`

## Purpose

`SearchReveal` renders the compact header search action and reveals the shared
`SearchForm` on demand. Use it when a permanent search input would compete with
category navigation, support, and brand space.

## Public Contract

- `label?: string`
- `popoverId?: string`
- `align?: "start" | "end"`

Public props should remain narrow and semantic. Do not add route-specific
layout props. `align` is limited to the anchored-positioning relationship:
`start` means the panel starts at the trigger edge, and `end` means the panel
ends at the trigger edge.

## Composition Relationships

```text
SiteHeader
  SearchReveal
    SearchForm
```

`SearchReveal` owns open/close disclosure. `SearchForm` owns form semantics.
The reveal uses `AnchoredRoot`, `AnchoredTrigger`, and `AnchoredPanel` with the
`header-search-start` or `header-search-end` preset.

## Layout And Responsiveness

The trigger is compact and belongs in the desktop header utility cluster. The
popover surface must stay within the viewport and should not push header links
into collision. Its vertical offset should come from `--site-header-height`
rather than a fixed pixel value. The panel top edge snaps to the sticky header
bottom and its inline edge aligns to the trigger edge selected by `align`.

At constrained widths, `MobileMenu` should render `SearchForm` directly rather
than using the compact reveal.

## Layering And Scrolling

Uses the shared anchored-positioning adapter for geometry. CSS state owns
visibility. The adapter may write runtime CSS variables for measured position
and viewport limits, but it must not take over search form behavior.

## Interaction States

Represent default, open, focus-visible, light, and dark states in the catalog.

## Accessibility Semantics

The trigger is a button with an accessible label because it toggles state. The
revealed content contains a real search form with a real input label.

## Content Edge Cases

Handle narrow viewport widths, long placeholder text from `SearchForm`, and
multiple catalog examples with unique popover IDs.

## Theme Behavior

Use semantic tokens for trigger, popover, input, border, and focus states.

## Testable Invariants

- Trigger points at the configured popover ID.
- Popover contains a labeled `SearchForm`.
- Opening search does not create horizontal overflow.
- The panel top edge snaps to the sticky header bottom without a visual gap.
- The panel inline edge aligns with the configured trigger edge.
- Search remains available in mobile navigation when this desktop reveal is
  hidden.

## Follow-Up Notes

- Do not replace this with a permanent desktop search input unless the header
  information architecture is redesigned again.
