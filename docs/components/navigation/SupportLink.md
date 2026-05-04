# Support Link

Source: `src/components/navigation/SupportLink.astro`

## Purpose

`SupportLink` renders the publication support call to action in navigation
surfaces. It should feel visible and dignified without dominating the reading
or browsing task.

## Public Contract

- `href?: string`
- `label?: string`
- `compactLabel?: string`

Public props should remain narrow and semantic. Do not add broad configuration
objects or boolean clusters when a named variant or a smaller component would
make invalid states harder to express.

## Composition Relationships

It composes local components such as `../ui/LinkButton`. Header, mobile menu,
article endcap, homepage, and footer contexts may choose different surrounding
layout, but the CTA treatment should remain recognizable.

## Layout And Responsiveness

The component must remain usable in constrained containers, preserve touch and
keyboard targets, and avoid horizontal overflow. In the desktop header, it lives
in the right utility cluster. In the mobile header, it remains visible to the
right of the centered brand and may use compact mobile spacing, but it must not
overlap the brand or force horizontal overflow. Header contexts may pass
`compactLabel` to swap only the visible label at very narrow phone widths
(`360px` and below in the current header, implemented as `max-[22.5625rem]`
because Tailwind max variants are exclusive at the named threshold) without
changing the link destination or the global support CTA wording.

## Layering And Scrolling

The component should avoid creating a stacking context unless it owns an overlay,
sticky region, or popover. Any `z-index`, sticky offset, fixed size, or scroll
container is part of this component's public design and needs an invariant test.

## Interaction States

Default, long-content, missing optional content, hover, focus-visible, and dark-mode states should be represented in the catalog when relevant. Disabled, invalid, pressed/current, active, and keyboard states should be visible where the component supports them.

## Accessibility Semantics

Use a normal link. Do not use button semantics for navigation. The label should
be clear without depending on surrounding context.

## Content Edge Cases

Test or catalog long titles, long words, dense content, empty content, missing
optional fields, and unusual punctuation whenever this component renders user or
author-provided content.

## Theme Behavior

Use semantic color tokens and Tailwind utilities. Light and dark mode must keep
text readable, borders visible when they communicate structure, focus rings
visible, and CTAs distinguishable from neutral actions.

## Testable Invariants

- renders without horizontal overflow at mobile, tablet, desktop, and wide desktop widths.
- preserves readable text and visible focus/hover states in light and dark themes.
- handles long content without clipping or overlapping neighboring components.
- keeps desktop and mobile controls from exposing conflicting visible states.
- uses primary CTA colors with readable text in light and dark themes.
- does not force header navigation collision.
- accepts contextual compact sizing from header/footer/layout parents without
  changing destination semantics.

## Follow-Up Notes

- Support should remain visible in the header, article endcaps, and footer, but
  it should not force navigation collision. The mobile header keeps it visible
  instead of moving it behind disclosure.
