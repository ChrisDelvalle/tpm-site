# Category Dropdown

Source: `src/components/navigation/CategoryDropdown.astro`

## Purpose

`CategoryDropdown` renders one category disclosure in the desktop discovery
menu. It gives readers a small preview of a category and a direct path to the
category page.

It must not fetch articles, infer previews, or render a complete category
archive.

## Public Contract

- `category: CategoryDiscoveryItem`
- `currentPath?: string`
- `popoverId: string`

`CategoryDiscoveryItem` should include category title, href, optional
description, optional preview articles, and a View All href.

## Composition Relationships

```text
DiscoveryMenu
  CategoryDropdown
    CategoryPreviewList
```

`DiscoveryMenu` owns category ordering. `CategoryDropdown` owns disclosure
markup. `CategoryPreviewList` owns preview list semantics.

## Layout And Responsiveness

Use a compact trigger in the section navigation row. The dropdown surface should
align visually with the header/navigation system and cap its width to a
readable preview measure.

At constrained widths, hide the desktop dropdown and let `MobileMenu` own
category discovery.

## Layering And Scrolling

Use HTML `popover` for the desktop disclosure when possible:

```html
<button popovertarget="category-memeculture">Memeculture</button>
<div id="category-memeculture" popover>...</div>
```

The popover must not overlap the sticky header in a way that hides the trigger
or content. It should not require client-side JavaScript for basic open/close
behavior.

## Interaction States

Support default, hover, focus-visible, active, current, open, and empty-preview
states.

The category title itself should remain reachable as a normal link inside the
dropdown, even if the trigger is a button.

## Accessibility Semantics

The trigger needs an accessible name. The popover content should use normal
document links and headings. Do not use `menu`, `menuitem`, or complex ARIA
menu patterns for ordinary navigation links.

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

- Trigger opens the popover without JavaScript.
- Popover contains a direct category link.
- Preview list never renders more than the chosen preview count.
- Empty preview state still offers View All.
- Focus ring is visible on trigger and links.
- Surface stays within viewport and does not create horizontal overflow.

## Follow-Up Notes

- If browser support or accessibility testing rejects native popover, update
  this design before switching to a small island.
