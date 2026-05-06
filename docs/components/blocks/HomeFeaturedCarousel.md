# HomeFeaturedCarousel

Source: `src/components/blocks/HomeFeaturedCarousel.astro`

## Purpose

`HomeFeaturedCarousel` owns the homepage Featured slot. It shows one featured
item at a time while keeping the first item available as static HTML when
JavaScript is unavailable.

## Intentions

- Keep Featured calm and editorial, not promotional clutter.
- Render no controls for zero or one item.
- Reveal controls only after the browser script is active.
- Use real buttons for previous, next, and item indicators.
- Keep the carousel region stable so rotation does not shift the page.
- Fit the homepage wide second-row lead cell without changing height when
  slides change.

## Interaction

When multiple featured items exist, `src/scripts/home-featured-carousel.ts`
enhances the static markup:

- rotates on a slow interval when motion is allowed;
- pauses on focus, hover, pointer interaction, and manual control use;
- disables auto-rotation for reduced-motion users;
- hides inactive slides from keyboard and screen readers;
- keeps enhanced inactive slides laid out invisibly in the same grid cell so
  the viewport height is based on the largest slide instead of the active
  slide.

## Invariants

- The first slide is visible in static HTML.
- Before enhancement, inactive slides are `hidden`; after enhancement, inactive
  slides are laid out invisibly, `aria-hidden`, and inert.
- Controls are keyboard reachable only when enhancement is active.
- The viewport height is owned by the carousel's layout contract, not by
  whichever slide is currently active.
- The heading aligns with the Announcements heading through the parent lead
  grid row, not through component-specific margin offsets.
- No React or framework island is required.
