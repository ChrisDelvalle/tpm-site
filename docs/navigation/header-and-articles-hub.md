# Header Navigation And Articles Hub Design

## Purpose

This design defines the next navigation and browsing-page structure for The
Philosopher's Meme. It replaces the noisy prototype header and resolves the
route ambiguity between article archive pages and category discovery.

The goal is simpler reader behavior:

- choose a category from the header when browsing by subject;
- use `Articles` as the main archive gateway;
- use search, theme, and support as compact utility actions;
- keep the homepage, article hub, category pages, and search pages aligned to
  the same browsing layout system.

## Product Position

The site should feel like an editorial publication with clear sections, closer
to a magazine or newspaper archive than a documentation sidebar. Category names
are high-value publication sections, so they deserve first-class header
placement on desktop. Low-frequency utility links such as RSS should not compete
with category discovery and support in the primary header.

Support remains important, but it should be a dignified utility action rather
than a layout-breaking banner.

## Header Anatomy

Target desktop anatomy:

```text
SiteHeader
  left cluster
    BrandLink
    CategoryDropdown[]  // Memeculture, Metamemetics, ...
    PrimaryNav          // Articles, About
  right cluster
    SearchReveal
    ThemeToggle
    SupportLink
```

The desktop header is one coherent row. The left cluster is aligned to the
left. The right utility cluster is aligned to the right. The center is flexible
space, not a layout slot that must hold search.

This intentionally removes `Topics`, `RSS`, and a permanently visible search
input from the primary desktop row:

- `Topics` is replaced by category dropdowns.
- `RSS` belongs in the footer or another secondary surface.
- Search begins as an icon/button and reveals the search form when requested.

The header should not contain the article-local table of contents, global
category sidebars, or footer-only destinations.

## Category Dropdown Contract

Each category name in the desktop header is a normal category link with a
dropdown affordance.

Required behavior:

- visually reads as a dropdown, including a chevron or equivalent down marker;
- hover opens the preview on pointer devices;
- keyboard focus opens or exposes the preview without trapping focus;
- clicking the category text navigates to the category page;
- preview links are ordinary links, not ARIA menu items;
- preview content is a short discovery surface, not a full archive;
- every dropdown has a no-JavaScript path to its category page.

The preferred structure is a link plus a sibling disclosure/preview surface, or
a native `details`/`summary` pattern only if click-to-category can remain clear.
Do not make the only category text a button if the user's click expectation is
navigation. If a separate trigger is needed, keep it small and adjacent to the
category link.

Use ordinary navigation semantics. Do not use `role="menu"` or `menuitem` for
site links.

Preview content should include:

- a direct category link;
- a short list of recent or featured articles;
- a `View all <category>` link;
- a useful empty state if no preview articles exist.

## Search Reveal Contract

Desktop search starts as a compact icon/button in the right utility cluster.
Activating it reveals a search form without pushing category links into
collision.

Acceptable implementation paths, in order:

1. Native `details`/`summary` or `popover` if it satisfies focus, keyboard, and
   layout needs without client JavaScript.
2. A small processed Astro script or custom element if closing behavior,
   focus-return, or escape handling needs minimal browser logic.
3. A hydrated island only if the interaction becomes substantially more complex.

Required behavior:

- search remains reachable from keyboard and touch;
- the search input has a real label;
- opening search does not create horizontal overflow;
- closing search returns focus predictably when possible;
- mobile menu includes a full-width search form so hidden desktop search is not
  the only path.

## Mobile Navigation Contract

At constrained widths, use a complete mobile menu rather than progressively
dropping controls without replacement.

The mobile menu must include:

- category discovery;
- `Articles`;
- `About`;
- search;
- theme toggle;
- support;
- secondary links such as RSS if they are not in the desktop header.

Desktop dropdown previews may be hidden on mobile. Category links and article
links must remain available through mobile navigation and page content.

The desktop header and mobile menu must not be simultaneously exposed as
competing controls for the same purpose at the same viewport.

## Articles Hub Route Contract

`/articles/` becomes the primary articles hub.

The articles hub should answer:

- What categories exist?
- What should I read next?
- How do I see the full archive?

Required hub sections:

- page header for `Articles`;
- category overview/discovery;
- selected featured, latest, or recent article blocks if useful;
- a clear `View all articles` link;
- optional support block aligned to the browsing measure.

The flat chronological article archive should move to `/articles/all/` unless a
different route is explicitly approved. `all` must be reserved and cannot be a
public article slug. Add a route-conflict test so a future article cannot claim
that slug.

Category detail pages remain at `/categories/<category>/` for now because those
URLs are clear, stable, and already separate category archives. They should be
reachable from:

- desktop category dropdowns;
- mobile category navigation;
- the `/articles/` hub category overview;
- article category links;
- footer category links.

`/categories/` should stop being a primary navigation destination. Preferred
behavior is to redirect `/categories/` to `/articles/` or leave it as a
non-primary compatibility page that uses the same category overview component.
Implementation should choose one behavior and test it explicitly. Do not keep
both `/articles/` and `/categories/` as competing top-level category indexes in
the main UI.

## Homepage Layout Contract

The homepage is a browsing page. It should use the same browsing anatomy as the
articles hub, category detail pages, search, and archive pages unless a
component-specific design documents an exception.

Required behavior:

- centered browsing content measure;
- category overview aligned with surrounding content;
- archive/discovery links aligned with surrounding content;
- support block aligned with surrounding content;
- no route-level one-off width patches;
- no block escaping the page measure unless the block owns and documents that
  exception.

Hero content may be visually stronger than archive pages, but it should not
break the shared body geometry.

## Component Ownership

The redesign should preserve these boundaries:

- `SiteHeader` owns row geometry, sticky behavior, and desktop/mobile switching.
- `BrandLink` owns only the brand link.
- `CategoryDropdown` owns one desktop category preview.
- `CategoryPreviewList` owns the preview list inside a dropdown.
- `PrimaryNav` owns durable top-level text links such as `Articles` and
  `About`.
- `SearchForm` owns form semantics; a future `SearchReveal` wrapper may own
  open/close behavior.
- `ThemeToggle` owns theme state and icon/button semantics.
- `SupportLink` owns CTA link presentation.
- `MobileMenu` owns the complete constrained-width fallback.
- `BrowsingBody` owns browsing-page measure and gutters.
- `PageFrame`/`SectionStack` own page rhythm and section containment.

Route files should not implement header internals or browsing widths.

## Accessibility Requirements

- Use ordinary links for navigation.
- Use buttons only for actions that open, close, or toggle state.
- Do not use ARIA menu patterns for document navigation.
- `aria-current="page"` belongs on current destination links.
- Dropdown triggers, category links, search reveal controls, theme toggle, and
  support links need visible focus states.
- Hover-open dropdowns must also work for keyboard users.
- Touch users must have category links without depending on hover.
- The mobile menu must have an accessible name and should not create duplicate
  visible primary navigation landmarks without labels.

## Responsive Requirements

- Mobile base: brand plus mobile menu entry, with all destinations inside the
  menu.
- Desktop enhancement: one row with left category/navigation cluster and right
  utility cluster.
- The header must not rely on brittle collision thresholds between search,
  categories, brand, and support.
- Category dropdown surfaces must stay within viewport width and below sticky
  header chrome.
- Search reveal must not push links into overlap or horizontal overflow.
- Long category names and long article preview titles must wrap or truncate
  inside their own surface, not affect the whole header row.

## Test Plan

Component tests:

- `SiteHeader` renders brand, category dropdowns, `Articles`, `About`, search
  reveal entry, theme toggle, and support in the correct clusters.
- `CategoryDropdown` renders a chevron, category link, preview links, and empty
  state.
- `PrimaryNav` renders only durable top-level links in header mode.
- `MobileMenu` includes every destination hidden from desktop at constrained
  widths.
- `SearchForm` keeps label/input/action semantics.

Playwright tests:

- desktop category dropdown opens on hover/focus and category click navigates;
- search reveal opens, focuses input, closes, and does not overflow;
- mobile menu exposes categories, articles, about, search, theme, and support;
- header does not overlap or collide at mobile, tablet, desktop, and wide
  desktop;
- `/articles/` renders category discovery and `View all articles`;
- `/articles/all/` renders the full archive;
- `/categories/<category>/` remains reachable;
- homepage browsing blocks align to the same centered measure as other browsing
  pages.

Accessibility tests:

- no serious/critical axe violations on header states and browsing routes;
- focus-visible styles exist in light and dark mode;
- no duplicate IDs from dropdown/popover surfaces;
- no competing unlabeled navigation landmarks.

## Open Decisions

Implementation must resolve these before completing Milestone 34:

- whether `/categories/` redirects to `/articles/` or stays as a non-primary
  compatibility page;
- whether the search reveal uses native `popover`, `details`, or a small
  processed script;
- whether category hover previews use CSS-only hover/focus behavior, native
  popover, or a minimal script for robust close behavior.

Recommended defaults:

- use `/articles/all/` for the flat archive;
- keep `/categories/<category>/` for category detail pages;
- remove `/categories/` from primary navigation and redirect it to `/articles/`
  if redirect support remains clean in static output;
- start with CSS/native dropdown behavior and add minimal JavaScript only if
  keyboard/focus behavior is not robust.
