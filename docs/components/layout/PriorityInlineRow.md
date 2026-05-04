# Priority Inline Row

Source: `src/components/layout/PriorityInlineRow.astro`

## Purpose

`PriorityInlineRow` is a no-JavaScript layout primitive for three-part inline
anatomy:

```text
start slot | centered slot | end slot
```

It exists for header-like layouts where the center item is identity-critical,
must remain geometrically centered, and side content should compact before it
collides with the center.

This primitive should replace bespoke three-column header grids when the
relationship between left, center, and right content matters more than the
individual controls.

## Public Contract

- named slots: `start`, `center`, `end`
- optional `class?: string`
- optional `data-*`/ARIA attributes only when passed through deliberately
- no layout JavaScript

The component should not know about site navigation, support links, search, or
branding. It owns only the spatial contract. Product-specific choices belong in
`SiteHeader`, `BrandLink`, `PrimaryNav`, `MobileMenu`, and related navigation
components.

## Composition Relationships

```text
SiteHeader
  PriorityInlineRow
    start
      ActionCluster
        SearchReveal + ThemeToggle
        or MobileMenu
    center
      BrandLink
    end
      ActionCluster
        PrimaryNav + SupportLink
        or SupportLink
  HeaderCategoryRow / DiscoveryMenu
```

`PriorityInlineRow` may later be reused by other dense UI surfaces that need a
stable centered identity with outward-aligned side controls.

## Layout Contract

The row uses CSS Grid:

```text
minmax(0, 1fr) auto minmax(0, 1fr)
```

The center track is intrinsically sized and geometrically centered by equal side
tracks. Side slots occupy the remaining inline space and align outward:

- start slot: `justify-self: start`
- center slot: `justify-self: center`
- end slot: `justify-self: end`

The center slot must not be a size container. Size containment on the auto track
makes the brand's intrinsic width disappear from grid sizing, which reintroduces
off-center and zero-width states.

The row itself may be a named container for bounded typography and density
rules. Children can use that row container to scale text, padding, and gaps
without measuring layout in JavaScript.

## Priority Rules

The layout priority is:

1. Keep the center slot geometrically centered.
2. Keep side slots outward-aligned.
3. Preserve the minimum gap between side content and center content.
4. Compact side slot content first.
5. Shrink center typography only after side content reaches its useful minimum.
6. Switch to a simpler responsive mode before labels wrap, overlap, or truncate
   in a way that harms navigation.

This is not a procedural algorithm. It is encoded with intrinsic sizing,
`minmax(0, 1fr)`, `min-w-0`, `clamp()`, container queries, nowrap clusters, and
explicit minimums. JavaScript measurement is not part of the design.

## Header Application

Desktop/tablet:

- start slot contains search and theme controls;
- center slot contains the full `The Philosopher's Meme` brand;
- end slot contains `Articles`, `About`, and `Support Us`;
- category discovery remains in a second centered row.

Mobile:

- start slot contains the mobile menu trigger;
- center slot contains the full brand whenever supported;
- end slot contains the header support CTA;
- search, theme, primary links, and category links move into `MobileMenu`.

The support CTA may compact its padding and text size in the header context, but
it should keep the `Support Us` label at supported phone widths unless a later
measured design proves the label cannot coexist with the full brand.

## Responsive Behavior

Use mobile-first classes and named row/container queries.

Minimum supported checks:

- `320px`: full brand visible, support visible, no overlap, no horizontal
  overflow.
- `390px`: full brand gets more room without changing the anatomy.
- `768px`: desktop/tablet header is centered; this boundary is historically
  fragile and must stay explicit in tests.
- `900px`, `1024px`, `1280px`, wide desktop: normal desktop rhythm returns
  progressively.

The row should avoid magic breakpoint patches. If a width breaks, first inspect
the primitive contract: intrinsic center sizing, side-slot shrink behavior,
minimum gaps, and whether any child has an accidental unshrinkable width.

## Accessibility Semantics

`PriorityInlineRow` should not add landmarks or ARIA roles. It is layout only.
Children preserve their native semantics:

- links remain links;
- disclosure buttons remain buttons or native summaries;
- navigation landmarks stay inside navigation components;
- the brand link retains its accessible label.

Visual reordering must not create a confusing keyboard order. Source order is
start, center, end, matching visual order.

## Theme Behavior

No colors belong in this primitive. It should inherit typography and color from
children and parent surfaces.

## Testable Invariants

For the header usage:

- center slot is visible and horizontally centered within the header;
- brand label is full text and not horizontally clipped at supported widths;
- start, center, and end visible boxes do not overlap;
- side clusters stay inside the header;
- header has no horizontal overflow;
- mobile and desktop category/navigation surfaces are not both exposed in
  conflicting modes;
- second-row category dropdowns remain centered, one-line, full-label, and
  hover/focus/click usable at tablet and desktop widths;
- search, mobile menu, category dropdowns, and theme changes do not move the
  centered brand.

For the primitive itself:

- empty start or end slots do not move the center slot;
- long side content is constrained to its side track instead of pushing the
  center off-center;
- center content is not size-contained by accident.

## Catalog Examples

Add catalog examples for:

- balanced header-like row;
- long start/end content showing side compaction;
- mobile header row with menu, full brand, and support CTA;
- empty start/end slot cases proving center stability.

## Critical Review

This design intentionally avoids exact procedural "shrink side A, then side B,
then center" measurement. CSS cannot express that as a full algorithm without
JavaScript. For this static publication header, the content set is known and
bounded, so the better engineering choice is declarative CSS plus strong
geometry tests.

Potential failure modes to guard against:

- applying `@container` to the auto-sized center item;
- adding `min-w-0` to the brand primitive by default;
- adding unshrinkable side labels without corresponding compact states;
- using transforms to visually scale controls, which can break popover
  anchoring and hit testing;
- hiding navigation behind mobile UI too early just to avoid solving density.

The implementation is ready when the primitive, header composition, docs,
catalog, and tests make these failure modes difficult to reintroduce.
