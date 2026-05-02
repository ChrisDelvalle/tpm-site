# Search Reveal

Source: `src/components/navigation/SearchReveal.astro`

## Purpose

`SearchReveal` renders the compact header search action and reveals the shared
`SearchForm` on demand. Use it when a permanent search input would compete with
category navigation, support, and brand space.

## Public Contract

- `label?: string`
- `popoverId?: string`

Public props should remain narrow and semantic. Do not add route-specific
layout props; the parent header owns placement.

## Composition Relationships

```text
SiteHeader
  SearchReveal
    SearchForm
```

`SearchReveal` owns open/close disclosure. `SearchForm` owns form semantics.

## Layout And Responsiveness

The trigger is compact and belongs in the desktop header utility cluster. The
popover surface must stay within the viewport and should not push header links
into collision. Its vertical offset should come from `--site-header-height`
rather than a fixed pixel value.

At constrained widths, `MobileMenu` should render `SearchForm` directly rather
than using the compact reveal.

## Layering And Scrolling

Uses native `popover` so the browser owns basic close behavior, including
escape and outside-click behavior where supported. A tiny external processed
script moves focus into the revealed search input after opening; it must not
take over popover state or layout.

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
- Search remains available in mobile navigation when this desktop reveal is
  hidden.

## Follow-Up Notes

- Do not replace this with a permanent desktop search input unless the header
  information architecture is redesigned again.
