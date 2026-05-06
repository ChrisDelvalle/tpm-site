# Homepage Redesign

## Purpose

The homepage is TPM's editorial front page. It should quickly give readers a
reason to keep reading, show what is current, and make support/community paths
visible without feeling like a marketing landing page.

The design priority is a flat, quiet, easily scannable page. Use short section
labels, real article links, stable spacing, and minimal explanatory copy. The
homepage should feel dense enough to be useful on the first screen, but calm
enough that it does not compete with the reading experience.

## Current Problems

- The first redesign is too cluttered: too many framed boxes, too much
  explanatory copy, and a three-column masthead that gives equal weight to
  secondary material.
- The page uses "essays" in places where the site language is "articles".
- GitHub is not first-impression homepage material and should stay in footer or
  platform-facing docs.
- Homepage promotions are too generic. Featured articles should inherit article
  metadata, while non-article features need one simple link interface.
- Announcements should behave like article-like content, but they should not
  intermingle with the normal article library, categories, related articles, or
  Recent feed.
- The category block is too spacious for homepage use; it should be concise,
  single-row, and horizontally scrollable with real controls.

## Target Anatomy

Desktop homepage:

```text
Lead grid
  Row 1
    Wide cell: Hero / Support / Discord
    Thin cell: Start Here

  Row 2
    Wide cell: Featured carousel
    Thin cell: Announcements

Then single-column flow
Categories, one-row horizontal rail

More Ways To Browse: All Articles, Authors, Tags

Recent, chronological normal articles
```

Mobile homepage:

```text
Hero / Support / Discord
Featured
Start Here
Announcements
Categories
More Ways To Browse
Recent
```

Tablet may use two-column groupings where space allows, but it must preserve
the same priority order and avoid horizontal overflow.

## Editorial Rules

- Use "articles", never "essays".
- Prefer concise headings:
  - `Announcements`
  - `Featured`
  - `Start Here`
  - `Categories`
  - `More`
  - `Recent`
- Do not enumerate tags on the homepage.
- Do not include GitHub on the homepage.
- Keep obvious explanations out of visible copy.
- Prefer flat lists with separators over cards, panels, and nested boxes.
- Feature one item at a time; do not render a row of competing promo cards.
- Keep homepage categories to one concise row with working scroll buttons
  rather than a tall grid.

## Content Model

The homepage is assembled by `src/pages/index.astro` because it needs article,
announcement, category, and featured-item data. Writer-owned configuration lives
in content files.

### Homepage Page Frontmatter

`src/content/pages/index.md` owns stable homepage configuration that belongs to
the page itself:

```yaml
title: The Philosopher's Meme
description: The philosophy of memes, cyberculture, and the Internet.
startHere:
  - what-is-a-meme
  - memes-are-not-jokes-they-are-diagram-games
```

`startHere` is a curated list of normal article IDs. Missing IDs fail the build.
The Start Here component may fill with deterministic fallbacks when fewer than
the display limit are configured.

### Announcements

Announcements are article-like content in a separate collection:

```text
src/content/announcements/*.md
```

They use the same author-facing frontmatter shape as normal articles:

```yaml
title: Join the TPM Discord
description: Talk with readers about memes, media, and Internet culture.
author: The Philosopher's Meme
date: 2026-05-05
tags: []
draft: false
```

Announcements have their own routes:

```text
/announcements/
/announcements/[slug]/
```

Announcements are separate from the normal article library:

- not in `/articles/`;
- not in normal Categories;
- not in normal Recent;
- not in related articles;
- not in the top category navigation;
- only in the homepage Announcements slot and announcement routes.

This separation is intentional. It makes accidental intermingling difficult and
keeps announcements available as full reading pages when needed.

### Featured Items

Featured items live in:

```text
src/content/home-featured/*.md
```

The collection uses a small discriminated interface.

Article feature:

```yaml
kind: article
slug: what-is-a-meme
order: 10
active: true
```

The Markdown body is optional editorial copy explaining why the article is
featured. The page inherits title, description, href, author, date, category,
and image from the referenced normal article.

Link feature:

```yaml
kind: link
title: The TPM Reader
link: https://example.com
linkLabel: Get the Book
order: 20
active: true
```

The Markdown body is optional supporting copy. `link` may be an external URL or
an absolute site path. Link features cover books, events, Patreon drives,
Discord, internal pages, and any other non-article feature without adding
bespoke feature kinds.

The homepage normalizes both feature kinds into one render model before the
carousel receives props.

## Component Hierarchy

```text
src/pages/index.astro
  loads home page, articles, announcements, categories, and featured entries
  validates curated IDs and referenced feature slugs
  normalizes data into display models
  composes:
    HomeLeadGrid
      HomeLeadHeroCell
      HomeHeroBlock
      HomeLeadFeaturedCell
      HomeFeaturedCarousel
        HomeFeaturedItem
      HomeLeadStartCell
        FlatArticleList title="Start Here"
      HomeLeadAnnouncementsCell
        FlatArticleList title="Announcements"
    HomeCategoryOverviewBlock
    HomeDiscoveryLinksBlock
    ArticleList title="Recent"
```

Reusable primitives:

```text
FlatArticleTeaser
  one compact article or announcement link with optional meta

FlatArticleList
  section heading plus FlatArticleTeaser items

HomeFeaturedCarousel
  one visible featured item at a time, static first item without JS

HomeCategoryOverviewBlock
  one-row category rail with native horizontal scrolling and progressive
  previous/next icon buttons
```

The existing full `ArticleList` remains appropriate for large chronological
feeds. The new flat list primitive is for thin homepage rails and compact
sidebars.

## Carousel Behavior

The Featured carousel is progressive enhancement.

No JavaScript state:

- render the first active featured item as ordinary static HTML;
- include all item data in static markup where possible;
- if only one item exists, render no controls and no carousel script.

JavaScript enhancement for multiple items:

- show one item at a time;
- provide previous, next, and position controls as real buttons;
- auto-rotate on a calm interval only when motion is allowed;
- pause on hover, focus, touch/pointer interaction, and manual control use;
- respect `prefers-reduced-motion` by disabling auto-rotation;
- avoid layout shift by keeping a stable content region;
- do not require React or shadcn.

The carousel should feel like an editorial feature slot, not an advertising
widget.

## Layout Requirements

- The lead grid uses a 2:1 desktop split.
- The wide desktop track owns the primary path: Hero in row 1 and Featured in
  row 2.
- The thin desktop track owns orientation and current-status material: Start
  Here in row 1 and Announcements in row 2.
- Source order matches mobile visual order: Hero, Featured, Start Here,
  Announcements. Desktop placement may move Start Here beside Hero and
  Announcements beside Featured, but it must not require DOM-order hacks.
- The hero is wide, centered, and visually calm. It contains logo art plus
  `Support Us` and `Join Discord`; the CTAs should not reduce the artwork's
  horizontal measure.
- The hero artwork should use most of the wide desktop track before hitting its
  maximum width.
- The Announcements heading should vertically align with the Featured heading
  on desktop because both are row-2 grid cells. Do not achieve this with margin
  offsets, fixed heights on Start Here, or JavaScript measurement.
- The Featured carousel should keep a stable viewport height so slide changes
  do not resize the lead grid.
- Announcement, Featured, Start Here, and Recent surfaces use flat article
  treatments with separators rather than cards.
- Categories render as one horizontal rail, never wrap into a second row, and
  expose working previous/next icon buttons when the list overflows.
- More Ways To Browse is a thin row containing only All Articles, Authors, and
  Tags.
- Recent is chronological newest-first normal articles only.
- The homepage must not duplicate announcement entries inside Recent.
- The homepage must not have horizontal overflow at mobile, tablet, desktop, or
  wide desktop widths.

## Accessibility Requirements

- The page has one `h1`.
- Each major row has a concise section heading.
- Announcement, Start Here, Featured, Categories, More, and Recent landmarks are
  reachable in logical DOM order.
- Carousel controls are keyboard reachable and named.
- Inactive carousel items are not keyboard reachable and are hidden from screen
  readers.
- Auto-rotation pauses for focus, hover, touch/pointer interaction, and manual
  control use.
- Reduced-motion users do not get auto-rotation.
- Focus states use existing semantic tokens and remain visible in light and
  dark mode.
- External links have clear labels.

## Performance Requirements

- The hero image stays optimized through Astro images with stable dimensions.
- Announcement and Start Here rails are static HTML.
- Carousel JavaScript is small, page-local, and only needed when multiple
  featured items are active.
- Category rail JavaScript is small, page-local, and only enhances native
  horizontal scrolling with button controls.
- The first featured item renders before JavaScript so the page remains useful
  if scripts fail.
- Carousel rotation must not cause layout shift.
- No new framework island is required.
- Homepage changes should not regress Lighthouse through new LCP, CLS, or
  unnecessary JavaScript.

## Testable Invariants

- Desktop lead grid lays out a wide primary track to the left of a thin
  secondary track.
- Hero and Start Here share the first desktop row; Featured and Announcements
  share the second desktop row.
- The Featured and Announcements headings align vertically on desktop.
- The primary lead track takes roughly two thirds of the lead grid, and the hero
  artwork fills most of that track before reaching its maximum width.
- Mobile order is Hero, Featured, Start Here, Announcements, Categories, More,
  Recent without responsive order hacks.
- The Featured carousel height does not change when the active feature changes.
- The first viewport contains at least one announcement link when announcements
  exist, one support link, one Discord link, one featured link, and one Start
  Here link.
- Featured item references fail clearly when an article slug is stale.
- A single featured item renders statically without carousel controls.
- Multiple featured items render controls, rotate when motion is allowed, and
  pause on interaction.
- Reduced-motion disables auto-rotation.
- Categories render one horizontal row with working scroll controls when the
  rail overflows.
- More Ways To Browse contains All Articles, Authors, and Tags, and excludes
  GitHub and RSS.
- Recent is newest-first normal articles only and excludes announcements.
- `/announcements/` lists announcements newest-first.
- Announcement detail pages use article-like semantics without appearing in
  normal article routes.
- The homepage uses "articles" language and does not include "essays".
- There is no horizontal overflow across key viewport widths.

## Critical Review

The redesigned model intentionally replaces `homePromos`. Featured items need a
clearer interface than the first promo model: `kind: article` should be thin
and inherit article metadata, while `kind: link` should cover every non-article
feature without adding marketing-specific types.

Announcements are separate from articles even though they share article-like
frontmatter. A hidden category would be easier initially, but it would make
leakage into article browsing too easy. A separate collection and route family
make the desired separation explicit and testable.

The carousel is the only new interactive behavior. It is justified because the
feature slot should show one editorial feature at a time without making the
homepage noisy. The implementation must stay static-first and accessible; if
that cannot be satisfied, the fallback is a single static featured item.
