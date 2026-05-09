# Main Frame

Source: `src/components/layout/MainFrame.astro`

## Purpose

`MainFrame` owns the main landmark and the page body's relationship to optional
margin/sidebar regions. It is the bridge between persistent site chrome and
page-specific reading or browsing bodies.

It must not render category trees, article tables of contents, archive cards,
or article metadata directly.

## Public Contract

- `id?: string`
- default slot for page body content
- optional named slot `left-rail`
- optional named slot `right-rail`
- optional `bodyType?: "reading" | "browsing" | "plain"`

The final implementation may split rail behavior into `MarginSidebarLayout`,
but `MainFrame` remains the named owner of the main landmark.

## Composition Relationships

```text
SiteShell
  MainFrame
    ReadingBody | BrowsingBody | PageFrame
```

`SiteShell` owns chrome ordering. `MainFrame` owns the main landmark and should
delegate detailed body constraints to `ReadingBody`, `BrowsingBody`, or
`PageFrame`.

## Layout And Responsiveness

The main frame is mobile-first and single-column by default. It may expose rail
slots only when the child body and viewport have enough space.

Rules:

- no page body may overflow horizontally;
- rails never squeeze the reading column below its readable measure;
- rails disappear, collapse, or move after content before they overlap content;
- browsing pages should not inherit article rail behavior.

## Layering And Scrolling

`MainFrame` does not own sticky behavior. Sticky rail behavior belongs to
`MarginSidebarLayout`. Header offsets are consumed as design tokens or CSS
variables, not guessed locally.

## Interaction States

`MainFrame` has no direct interaction. It must preserve focus order for slotted
content and rails.

## Accessibility Semantics

Render as the single page `<main>` with the skip-link target. Rail slots should
not create landmarks unless their child component has a specific labeled
navigation role.

## Content Edge Cases

Handle empty main content for 404/catalog test states, very long articles,
wide browsing lists, and absent rail slots.

## Theme Behavior

Use semantic background and border tokens only when the frame visually separates
page regions. Avoid decorative framing around the entire main region.

## Testable Invariants

- Renders exactly one main landmark.
- Works with no rail slots.
- Does not create horizontal overflow with rails present.
- Keeps reading content centered when a left rail is present.
- Does not let sticky descendants slide under the sticky header.
- Preserves focus order: header, rail if first in DOM by design, main content,
  footer.

## Follow-Up Notes

- The current prototype uses a category sidebar inside the frame. That should
  be removed from `MainFrame`; category discovery belongs to navigation and
  browsing surfaces, while article-local TOC belongs to `MarginSidebarLayout`.
