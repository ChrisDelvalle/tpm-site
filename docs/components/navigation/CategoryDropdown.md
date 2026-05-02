# Category Dropdown

Source: `src/components/navigation/CategoryDropdown.astro`

## Purpose

`CategoryDropdown` renders one desktop header category link with a restrained
article preview. It gives readers both a direct path to the category page and a
quick sense of recent or featured material in that category.

It must not fetch articles, infer previews, or render a complete category
archive. The preview should not repeat the category heading already visible in
the trigger; it shows article previews plus the `View all <category>` link.

## Public Contract

- `category: CategoryDiscoveryItem`
- `currentPath?: string`
- `previewId: string`

`CategoryDiscoveryItem` should include category title, href, optional
description, optional preview articles, and a View All href.

## Composition Relationships

```text
SiteHeader or DiscoveryMenu
  CategoryDropdown
    CategoryPreviewList
```

The parent owns category ordering. `CategoryDropdown` owns the category link,
chevron affordance, preview surface, hover/focus disclosure behavior, and
current-page state. `CategoryPreviewList` owns preview list semantics.

## Layout And Responsiveness

Use a compact inline header item that visually reads as a dropdown, including a
chevron or equivalent down marker. The category text is a normal link to the
category page. If a separate disclosure trigger is needed, keep it small and
adjacent to the link.

The dropdown surface should align visually with the header/navigation system
and cap its width to a readable preview measure.

At constrained widths, hide the desktop dropdown and let `MobileMenu` own
category discovery.

## Layering And Scrolling

The current implementation uses CSS `group-hover` and `group-focus-within`.
Hover/focus exposes preview content and clicking the category text navigates.
Do not replace the category link with a button-only trigger.

The preview surface must not overlap the sticky header in a way that hides the
trigger or content. It should not require client-side JavaScript for basic
open/close behavior.

## Interaction States

Support default, hover, focus-visible, active, current, open, empty-preview, and
touch/no-hover states.

Hover-open behavior is a desktop enhancement. Keyboard users must be able to
reach the category link and preview links. Touch users must have an obvious
category link without relying on hover.

## Accessibility Semantics

The preview surface should use normal document links and headings. Do not use
`menu`, `menuitem`, or complex ARIA menu patterns for ordinary navigation
links.

If the category is the current page, use `aria-current="page"` on the category
link, not on the disclosure button.

## Content Edge Cases

Handle:

- category with no preview articles;
- long category name;
- long article title;
- one preview;
- many preview candidates trimmed before rendering;
- current category;
- external or missing description.

## Theme Behavior

Use `popover`, `border`, `muted`, `foreground`, and `primary` semantic tokens.
Open and focus states must be visible in light and dark mode.

## Testable Invariants

- The component provides a no-JavaScript path to the category page.
- Preview surface contains a `View all <category>` link without repeating the
  trigger heading.
- Preview list never renders more than the chosen preview count.
- Empty preview state still offers View All.
- Focus ring is visible on trigger and links.
- Surface stays within viewport and does not create horizontal overflow.
- Clicking category text navigates to the category page.
- Hover and keyboard focus expose the preview where the chosen implementation
  supports preview disclosure.

## Follow-Up Notes

- If browser support or accessibility testing rejects native popover, update
  this design before switching to a small island.
- Do not replace the category link with a button-only trigger; that breaks the
  expected click behavior.
