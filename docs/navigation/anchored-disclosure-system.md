# Anchored Disclosure System

## Purpose

Anchored disclosure is the shared interaction primitive for floating surfaces
that already use the anchored-positioning system and need to open, stay open,
and dismiss predictably across mouse, keyboard, and touch input.

Current consumers:

- desktop category preview dropdowns;
- article hover-image previews.

The goal is to make hover-only access impossible to ship for anchored surfaces.
Hover remains a desktop enhancement, but every useful surface must also have a
deliberate tap/click and keyboard path.

## Source Notes

Modern platform guidance shapes the contract:

- CSS `:hover` is unreliable on touch screens. Browsers may never match it,
  match only briefly, or keep it sticky after touch.
- CSS `hover`, `pointer`, `any-hover`, and `any-pointer` media features can
  distinguish input capability for progressive enhancement.
- Pointer Events expose `pointerType`, allowing runtime behavior to distinguish
  mouse, pen, and touch interactions.
- WCAG 1.4.13 expects content opened by hover or focus to be dismissible,
  hoverable, and persistent.
- WAI disclosure navigation guidance recommends ordinary links/buttons for
  site navigation instead of ARIA `menu`/`menuitem` patterns.

References:

- [MDN: `:hover`](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Selectors/:hover)
- [MDN: `hover` media feature](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/%40media/hover)
- [MDN: `pointer` media feature](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/%40media/pointer)
- [MDN: `PointerEvent.pointerType`](https://developer.mozilla.org/en-US/docs/Web/API/PointerEvent/pointerType)
- [WAI: Disclosure Navigation Example](https://www.w3.org/WAI/ARIA/apg/patterns/disclosure/examples/disclosure-navigation/)
- [WCAG: Content on Hover or Focus](https://www.w3.org/WAI/WCAG22/Understanding/content-on-hover-or-focus.html)

## Design Principles

- Keep positioning and disclosure separate. Positioning answers where the panel
  belongs; disclosure answers whether it is open and why.
- Keep navigation as navigation. Use links for destinations and buttons for
  explicit toggles.
- Treat hover as an enhancement for fine pointers, not the core interaction.
- Use one small processed Astro browser script, not React hydration, Radix, or a
  component-specific island.
- Keep the reusable controller in `src/lib/anchored-disclosure.ts`; keep
  `src/scripts/anchored-disclosure.ts` as the tiny browser entrypoint that
  installs it.
- Make open state declarative through data attributes so CSS, tests, and the
  positioning adapter observe the same truth.
- Preserve no-JavaScript fallbacks: category links still navigate and
  hover-image links still open the image.
- Prefer one open disclosure surface at a time unless a future product
  requirement explicitly needs multiple open surfaces.

## Primitive Contract

The primitive extends anchored markup with disclosure attributes:

```html
<div
  data-anchor-root
  data-anchor-preset="header-dropdown"
  data-disclosure-root
  data-disclosure-mode="hover-focus-tap"
>
  <a data-anchor-trigger href="/categories/culture/">Culture</a>
  <button data-disclosure-trigger aria-controls="culture-preview">
    <span class="sr-only">Show category preview</span>
  </button>
  <div id="culture-preview" data-anchor-panel data-disclosure-panel>...</div>
</div>
```

Runtime-owned state:

- `data-disclosure-open="true"` on the root;
- `aria-expanded="true|false"` on every disclosure trigger;
- a custom `anchored-disclosure-change` event whenever state changes.

CSS may reveal panels with `group-data-[disclosure-open=true]:...`.
Fine-pointer hover may also reveal panels with `pointer-fine:group-hover:...`.
Do not use ungated `group-hover` for touch-sensitive surfaces because sticky
mobile hover can outlive the intended state.

## Component Responsibilities

`AnchoredRoot` may expose a small prop such as
`disclosure="hover-focus-tap"`. When present it emits the data contract and
loads the shared disclosure script. The script imports the typed controller
from `src/lib/anchored-disclosure.ts` so the behavior can be unit tested without
coupling tests to the script entrypoint side effect.

`AnchoredTrigger` continues to mark the element used for geometry. It may also
be a disclosure trigger when the same element owns both roles, such as
hover-image links.

Product components choose the exact trigger semantics:

- Category dropdown: category text stays a normal link; the adjacent chevron
  button is the explicit tap/click disclosure trigger.
- Hover-image preview: the inline text remains a link to the full image for
  no-JavaScript fallback; touch tap opens the preview, and the preview image is
  also a link to the full image.

`AnchoredPanel` remains a placement primitive. Product components add
`data-disclosure-panel` when the panel participates in disclosure state.

## Input Behavior

### Mouse And Trackpad

- Fine-pointer hover opens category and hover-image previews through CSS.
- Focus opens previews through the shared controller.
- Clicking category text navigates to the category page.
- Clicking the category chevron toggles the preview.
- Clicking a hover-image text link opens the image as a normal link.
- Moving from trigger to panel must not close the panel prematurely.

### Touch And Coarse Pointer

- Tapping a category text link navigates to that category.
- Tapping the adjacent category chevron opens or closes the preview.
- Tapping a hover-image text link opens the preview instead of depending on
  hover.
- Tapping the preview image opens the full image.
- Tapping outside an open disclosure closes it.
- Tapping another disclosure trigger closes the previous open surface and opens
  the new one.

### Keyboard

- Tabbing into a disclosure root opens the panel.
- Focus can move from trigger into the panel without closing it.
- Tabbing out closes the panel.
- Escape closes the open panel. If focus is inside the panel, focus should
  return to the disclosure trigger without immediately reopening.

## Dismissal Rules

Outside click/tap is desirable and required. It is the expected light-dismiss
behavior for non-modal floating surfaces and prevents open surfaces from
accumulating.

Dismissal rules:

1. Interaction inside an open root does not close it.
2. Interaction outside all open roots closes them.
3. Interaction on another disclosure trigger closes the old root before opening
   the new one.
4. Escape closes the currently open root.
5. Resize, scroll, and theme changes do not close a root by themselves; they
   recompute placement through the anchored-positioning adapter.

Native `popover="auto"` surfaces may continue to rely on browser light dismiss.
This primitive mirrors that behavior for CSS/data-open anchored surfaces.

## Accessibility

- Do not use ARIA `menu` or `menuitem` for ordinary site navigation.
- Use `aria-expanded` on explicit disclosure triggers.
- Use `aria-controls` when a stable panel id exists.
- Keep focus indicators visible on category links, disclosure buttons, preview
  links, and hover-image triggers.
- Hidden panels must not trap focus. Escape close should not leave focus in
  visually hidden content.
- Touch-only behavior must not remove keyboard behavior.

## No-JavaScript Behavior

No-JavaScript fallback may be less rich but must remain useful:

- category text links still navigate to category pages;
- hover-image text links still open the full image;
- desktop fine-pointer CSS hover may reveal previews if the static CSS supports
  it;
- touch users without JavaScript still have the destination links.

The preview interaction itself is progressive enhancement.

## Performance Guardrails

- Use a single shared processed Astro script for disclosure behavior.
- Use event delegation rather than per-component listeners.
- Do not measure layout in the disclosure controller.
- Dispatch a state-change event so the existing anchored-positioning adapter
  can measure the newly open surface.
- Do not add a dependency for this narrow behavior.
- Do not hydrate React for category previews or hover-image previews.

## Testing Requirements

Unit tests for the disclosure script:

- button triggers toggle open state and `aria-expanded`;
- coarse/touch activation on link triggers can open preview state without
  requiring CSS hover;
- outside click/tap closes open roots;
- opening one root closes the previous open root;
- focus opens and focus leaving closes;
- Escape closes and does not immediately reopen due to focus restoration;
- state-change events are dispatched for the positioning adapter.

Render tests:

- `AnchoredRoot` emits the disclosure contract when opted in;
- `CategoryDropdown` emits a category link, separate disclosure button, panel
  relationship, and `data-disclosure-*` hooks;
- `HoverImageCard` emits disclosure hooks while preserving the image link
  fallback and image-only preview styling.

Playwright tests:

- category chevron opens the preview with touch input;
- tapping category text still navigates;
- tapping outside closes category preview;
- hover behavior still works for mouse users;
- keyboard focus and Escape work;
- hover-image touch tap opens the preview without navigating away;
- tapping outside closes hover-image preview;
- preview remains anchored, viewport-contained, and image-only after touch
  activation.

## Critical Review

This design deliberately avoids making the category text itself perform two
different actions on touch. A separate chevron disclosure button costs one
small control but keeps navigation predictable.

Hover-image links are different because the author-facing MDX API exposes only
one inline phrase. The phrase remains a real link for no-JavaScript and mouse
clicks. Touch activation opens the preview, and the preview image links to the
full image so users still have a direct path to the destination.

The main implementation risk is focus state fighting with close state. The
controller must own focus-open state through `data-disclosure-open` rather than
relying on ungated `group-focus-within` CSS. That gives Escape and outside
dismiss one source of truth.

The design is ready for implementation when the checklist separates the shared
primitive, category migration, hover-image migration, and verification work.
