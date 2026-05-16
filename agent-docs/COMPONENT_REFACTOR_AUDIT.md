# Component Refactor And Consistency Audit

## Purpose

This audit identifies component refactor opportunities that improve visual
consistency, maintainability, configurability, and future platform reuse without
starting implementation. The site is stable enough that refactors should now be
chosen by architecture value, not by whichever component was edited most
recently.

The target is a general-purpose static editorial/blogging platform with a TPM
configuration layered on top. That means components should make common
publication patterns easy to assemble, while route files and site-specific
config choose content, labels, routes, and feature flags.

## Audit Method

Evidence came from:

- Inventorying `src/components`, `src/layouts`, `src/pages`, `src/lib`, and
  relevant docs.
- Inspecting repeated Tailwind class clusters and component patterns.
- Reviewing large and high-risk components such as `ArticleLayout`,
  `ArticleCard`, `ArticleHeader`, `HomeFeaturedCarousel`, `CategoryRailBlock`,
  `ArticleCitationMenu`, and `ArticleShareMenu`.
- Checking for catalog-only or legacy components that are no longer used by
  public routes.
- Comparing current implementation against the target architecture in
  `agent-docs/COMPONENT_ARCHITECTURE.md`.

The repeated-class scan is only a signal, not a refactor prescription. Exact
class duplication often indicates a missing primitive, but some duplication is
healthier than forcing unrelated UI into one abstraction.

## Executive Summary

The current component foundation is much better than the early prototype. The
site already has useful primitives for buttons, links, layout bodies, section
stacks, anchored popovers, article lists, publication metadata, horizontal
rails, and support CTAs. The next improvements should be consolidation work,
not a rewrite.

The highest-value silent refactors are:

1. Add a shared section heading/section-action primitive.
2. Consolidate compact publishable-entry lists used by homepage panels,
   announcements, start-here lists, and recent lists.
3. Extract generic horizontal rail behavior from category-specific rail cards.
4. Add a higher-level action popover/menu primitive over the existing anchored
   primitives.
5. Consolidate button/link variant class maps.
6. Consolidate metadata/kicker rendering across article cards, flat lists,
   featured slides, bibliography source rows, and home panels.
7. Split article header actions into a small action-row/trigger layer without
   merging cite, share, and PDF domain behavior.

The highest-value non-silent or design-sensitive work is:

1. Standardize section header rhythm across article endcaps, archive pages,
   homepage panels, bibliography, and browse pages.
2. Decide the canonical compact list style for publishable entries and use it
   across announcements, collections, article index side panels, and future
   platform blocks.
3. Create a platform-facing homepage recipe so TPM can configure content
   without baking labels, support/social choices, or block ordering into
   components.
4. Decide whether unused/catalog-only prototype blocks should be retired,
   replaced by current components, or kept as intentional catalog fixtures.

The highest-risk areas should not be refactored broadly yet:

- `ArticleImage` and PDF/image-inspector behavior.
- `ArticleTableOfContents` and generated references/bibliography behavior.
- `SiteHeader` mobile/desktop priority layout.
- `HomeFeaturedCarousel` internals beyond small control/list primitives.
- `ArticleLayout` orchestration until smaller primitives exist.

This does not mean those areas are frozen. It means the parent system should
not be reorganized until smaller child boundaries are obvious and tested.
Behavior-preserving sub-component extraction is still encouraged when it
removes duplicated implementation detail or isolates a clear invariant.

## Ideal Direction

The component system should move toward this shape:

```text
Routes
  load content, config, and view models
  compose page layouts and blocks

Layouts
  define page shells and reading/browsing constraints

Blocks
  define publication sections such as hero, archive list, support, rails

Domain Components
  render entries, metadata, actions, references, menus, and media

UI Primitives
  render buttons, links, popovers, rails, section headers, panels, and surfaces
```

The main goal is not fewer files. The goal is fewer places where a developer has
to remember the same responsive, accessible, or configurable behavior by hand.

## Abstraction And Subcomponent Policy

Use two complementary refactor moves:

1. Generalize repeated components into a shared primitive when several
   components independently implement the same design contract.
2. Split a complex component into sub-components when a child concern has a
   clear name, stable inputs, independent states, and useful tests or catalog
   examples.

Both moves are valid. The project should avoid two opposite failure modes:

- leaving every behavior embedded in page-sized components, which makes
  regressions likely and future platform configuration expensive;
- extracting vague mega-components that hide domain rules behind boolean props
  and make the UI harder to reason about.

Good abstraction candidates usually satisfy most of these conditions:

- The extracted piece has a product/design name, such as section header,
  compact entry row, metadata line, scroll rail, action menu item, brand CTA,
  panel surface, or table-of-contents link.
- The component owns a real invariant: containment, wrapping, focus ring,
  disabled state, empty state, long-label handling, image aspect ratio, panel
  placement, or responsive collapse.
- The API can be typed with a small prop surface and optional slots, not a
  cluster of unrelated booleans.
- The component can be tested in the catalog or with focused unit/e2e tests.
- The extraction preserves semantic HTML and accessibility behavior.
- The component can accept site-specific labels, routes, assets, or feature
  flags from a route/view-model boundary instead of importing TPM config
  directly.

Poor abstraction candidates usually have one or more of these traits:

- The only reason to extract is line count.
- The new component would be named after styling rather than intent, such as
  "box", "wrapper", or "thing".
- It would require callers to understand the parent component's internal
  layout algorithm.
- It would combine unrelated domains, such as article PDF image selection and
  browser image inspection, just because both involve images.
- It would make one current use case cleaner while making likely future
  platform configuration harder.

Prefer layered extraction:

```text
Stable UI primitive
  -> Domain component
  -> Block
  -> Layout/Page composition
```

Do not jump from a large component straight to a fully generic platform API.
Extract the stable child pieces first, then revisit the parent once the smaller
contracts are proven.

## Developer Handoff: First Implementation Pass

The first implementation pass should be a behavior-preserving foundation
refactor. It should not change visual design, page information architecture,
content rules, routing, or feature policy.

Recommended branch scope:

1. `SectionHeader`
2. Button/link variant maps
3. `BrandButton`
4. Article action row/trigger extraction
5. Metadata-line extraction only if it remains small and behavior-preserving

Do not include compact lists, rails, article images, TOC, homepage recipe work,
or `ArticleLayout` view-model extraction in the first pass. Those are follow-up
milestones.

### A1: Add `SectionHeader`

Create:

- `src/components/ui/SectionHeader.astro`

Suggested public API:

```ts
interface Props {
  actionAriaLabel?: string | undefined;
  actionHref?: string | undefined;
  actionLabel?: string | undefined;
  class?: string | undefined;
  description?: string | undefined;
  eyebrow?: string | undefined;
  headingId: string;
  headingLevel?: 1 | 2 | 3 | 4;
  layout?: "stacked" | "split";
  prefetch?: "hover" | "load" | "tap" | "viewport" | boolean;
  size?: "page" | "section" | "compact";
  title: string;
}
```

Slots:

- default slot is not needed for the first pass.
- named `action` slot is acceptable if the link props are too limiting.

First migration targets:

- `src/components/articles/NextArticleBlock.astro`
- `src/components/articles/MoreInCategoryBlock.astro`
- `src/components/articles/RelatedArticlesBlock.astro`
- `src/components/articles/ArticleBibliography.astro`

Leave these for a later migration:

- `src/components/blocks/ArchiveListBlock.astro`
- `src/components/blocks/TermOverviewBlock.astro`
- `src/components/articles/FlatArticleList.astro`
- `src/components/pages/PageHeader.astro`

Acceptance criteria:

- Existing heading ids are preserved.
- Existing action labels and URLs are preserved.
- The article endcap still renders the same block order.
- The bibliography heading still renders "View Site Bibliography" only when
  bibliography is enabled.
- Mobile wrapping remains readable and does not introduce horizontal overflow.
- The component does not import `siteConfig`.

Stop conditions:

- If a migrated component needs a bespoke layout exception, do not expand
  `SectionHeader` with a one-off prop. Stop and either narrow the migration or
  leave that component unchanged.

### A2: Extract Button And Link Variant Maps

Create one helper, preferably:

- `src/components/ui/button-variants.ts`

Migrate first:

- `src/components/ui/Button.astro`
- `src/components/ui/LinkButton.astro`

Do not migrate on the first pass unless it is obviously clean:

- `src/components/ui/IconButton.astro`
- `src/components/ui/TextLink.astro`

Keep separate Astro wrappers for semantic elements. Do not replace `Button` and
`LinkButton` with a polymorphic component.

Acceptance criteria:

- `button` remains a native `button`.
- `LinkButton` remains a native `a`.
- Disabled and `aria-disabled` behavior remain distinct.
- `_blank` safety behavior remains in `LinkButton`.
- Class output is intentionally equivalent, except for harmless ordering
  changes from class composition.

Stop conditions:

- If supporting `IconButton` or `TextLink` makes the helper abstract over
  unrelated concepts, keep the helper limited to button-like controls.

### A3: Add `BrandButton`

Create:

- `src/components/ui/BrandButton.astro`

Migrate wrappers:

- `src/components/ui/PatreonButton.astro`
- `src/components/ui/DiscordButton.astro`

Suggested public API:

```ts
interface Props extends HTMLAttributes<"a"> {
  asset: ImageMetadata | string;
  backgroundClass?: string | undefined;
  href: string;
  hoverBackgroundClass?: string | undefined;
  label: string;
  logoClass?: string | undefined;
}
```

The exact prop names can change, but the wrapper components should remain thin
and brand-specific. The low-level primitive should know how to render a branded
link frame; it should not know TPM's Patreon or Discord URLs.

Acceptance criteria:

- Patreon and Discord buttons keep the same dimensions, radius, focus behavior,
  and decorative image alt behavior.
- Brand wrappers remain the public imports used by support/home blocks.
- External link safety behavior is preserved.

Stop conditions:

- If the primitive needs brand-specific conditionals, keep the duplication
  until a cleaner API is obvious.

### A4: Extract Article Action Row/Trigger

Create one or both:

- `src/components/articles/ArticleActionRow.astro`
- `src/components/articles/ArticleActionTrigger.astro`

First migration targets:

- the cite trigger in `src/components/articles/ArticleCitationMenu.astro`;
- the share trigger in `src/components/articles/ArticleShareMenu.astro`;
- the PDF link in `src/components/articles/ArticleHeader.astro`, only if the
  same trigger primitive can support link semantics cleanly.

Acceptance criteria:

- Cite/share popover target attributes and data hooks are preserved.
- PDF remains a normal link with the same accessibility label and download
  behavior.
- The article action row still wraps safely on small screens.
- No action component imports citation/share view-model code.

Stop conditions:

- If one primitive cannot support both button triggers and link actions without
  muddying semantics, split into `ArticleActionButton` and `ArticleActionLink`
  or keep PDF unchanged.

### A5: Metadata-Line Extraction

This is optional in the first pass. Start only if A1-A4 are clean.

Create:

- `src/components/ui/MetadataLine.astro` or
  `src/components/articles/EntryMetaLine.astro`

First migration targets:

- `src/components/articles/FlatArticleTeaser.astro`
- `src/components/blocks/HomeFeaturedSlide.astro`

Do not migrate first:

- `src/components/articles/ArticleCard.astro`
- `src/components/articles/ArticleMeta.astro`

Acceptance criteria:

- Separator style is explicit.
- Missing metadata items do not leave dangling separators.
- Linked and unlinked items are both supported.
- Wrapping remains readable at narrow widths.

Stop conditions:

- If the primitive needs to understand article authors, categories, dates,
  bibliography sources, and counts all at once, it is too broad. Narrow the
  first pass to one metadata family.

### First-Pass Verification

Minimum checks:

- `bun --silent run format`
- `bun --silent run lint`
- `bun --silent run typecheck`
- `bun --silent run check`

Add targeted tests when behavior is touched:

- article header/action e2e checks if cite/share/PDF markup changes;
- component catalog examples for new primitives;
- a11y checks if focus, popover triggers, or link/button semantics change.

Manual review targets:

- one article with cite/share/PDF actions;
- one article with bibliography;
- homepage support CTA row;
- article endcap support/next/more-in-category blocks;
- mobile width around 320px and tablet width around 768px.

Do not declare the first pass complete if a visual difference is found but not
documented as intentional.

## Ranked Refactor Candidates

### 1. Section Header And Section Action Primitive

Status: silent refactor candidate.

Value: very high.

Risk: low.

Evidence:

- `src/components/articles/NextArticleBlock.astro`
- `src/components/articles/MoreInCategoryBlock.astro`
- `src/components/articles/RelatedArticlesBlock.astro`
- `src/components/articles/ArticleBibliography.astro`
- `src/components/articles/FlatArticleList.astro`
- `src/components/blocks/ArchiveListBlock.astro`
- `src/components/blocks/TermOverviewBlock.astro`
- `src/components/pages/PageHeader.astro`

These components repeatedly solve the same job: render a title, optional
description/eyebrow, optional right-side link, stable heading id, and responsive
spacing. The repeated fragment `flex min-w-0 flex-wrap items-end
justify-between gap-3` appears enough to justify a primitive.

Recommended shape:

- `src/components/ui/SectionHeader.astro`
- Props: `title`, `headingLevel`, `headingId`, `eyebrow`, `description`,
  `actionHref`, `actionLabel`, `actionAriaLabel`, `size`, `layout`.
- Slots: optional `action` slot for non-link actions.
- It should own heading typography, link alignment, wrapping, and ids.

Benefits:

- Keeps "View more", "View category", and "View Site Bibliography" visually
  consistent.
- Reduces heading drift across archive, homepage, article endcap, and
  bibliography surfaces.
- Makes future blocks easier for platform users and agents to assemble.

Verification:

- Unit/catalog examples for heading-only, heading plus action, heading plus
  description, long heading, and mobile wrap.
- Existing e2e/layout checks around article endcap and homepage should remain
  unchanged.

### 2. Compact Publishable Entry List Family

Status: silent refactor candidate with later visible consistency potential.

Value: very high.

Risk: medium.

Evidence:

- `src/components/articles/FlatArticleList.astro`
- `src/components/articles/FlatArticleTeaser.astro`
- `src/components/blocks/HomeRecentPostsBlock.astro`
- `src/components/blocks/HomeStartHerePanel.astro`
- `src/components/blocks/HomeCurrentPanel.astro`
- `src/pages/index.astro`

The site has several compact list variants for the same conceptual entity:
publishable entries. Announcements, start-here items, current links, featured
links, and recent article rows each render title, href, category/date/author
metadata, empty state, and optional panel description.

Recommended shape:

- `src/components/articles/CompactEntryList.astro`
- `src/components/articles/CompactEntryRow.astro`
- `src/components/articles/EntryMetaLine.astro`
- Optional wrapper block: `src/components/blocks/CompactEntryPanel.astro`

This should not become a giant article card. Keep the existing full-width
`ArticleList` and `ArticleCard` for rich article rows. The compact family should
own dense lists where thumbnails are absent and the reader is choosing from a
small curated set.

Benefits:

- Announcements and start-here collections can use the same list renderer.
- Future collections, side panels, author pages, and platform homepage blocks
  can reuse a known entry list.
- Empty-state wording, metadata separators, and link prefetch behavior become
  consistent.

Verification:

- Component catalog examples for articles, announcements, external/current
  links, empty states, long titles, missing metadata, and hidden categories.
- Existing homepage e2e checks should assert no wrap/overflow in the compact
  homepage column.

### 3. Horizontal Rail Primitive

Status: silent refactor candidate.

Value: high.

Risk: medium.

Evidence:

- `src/components/blocks/CategoryRailBlock.astro`
- `src/components/blocks/HomeCategoryOverviewBlock.astro`
- `src/pages/articles/index.astro`
- `src/scripts/horizontal-scroll.ts`

`CategoryRailBlock` contains both generic horizontal scrolling behavior and
category-specific card rendering. The fade behavior, scroll buttons, sizing,
overflow containment, and accessibility controls are reusable. The category
card itself is only one possible rail item.

Recommended shape:

- `src/components/ui/ScrollRail.astro`
- `src/components/ui/ScrollRailControls.astro` if needed.
- `src/components/blocks/TermRailBlock.astro` or `CategoryRailBlock` composed
  from `ScrollRail`.

The rail primitive should own:

- left/right controls;
- edge fade behavior;
- scroll-region accessibility;
- button disabled states;
- data hooks used by `horizontal-scroll.ts`;
- minimum item sizing contracts.

The term/category card should own:

- title;
- count;
- href;
- centered or left-aligned card content;
- pluralization.

Benefits:

- The article page and homepage can share the same rail behavior.
- Future author, collection, tag, or "featured topics" rails can avoid
  re-solving the same edge fading and scroll controls.
- Reduces future horizontal overflow regressions.

Verification:

- E2e coverage for keyboard/click controls, left/right end-state fades, touch
  scroll, and item visibility at rail boundaries.
- Component catalog examples for few items, many items, long labels, and empty
  state.

### 4. Action Popover And Menu Primitive

Status: silent refactor candidate.

Value: high.

Risk: medium.

Evidence:

- `src/components/articles/ArticleCitationMenu.astro`
- `src/components/articles/ArticleShareMenu.astro`
- `src/components/articles/ArticleShareActionRow.astro`
- `src/components/navigation/CategoryDropdown.astro`
- `src/components/navigation/SearchReveal.astro`
- `src/components/ui/AnchoredRoot.astro`
- `src/components/ui/AnchoredTrigger.astro`
- `src/components/ui/AnchoredPanel.astro`

The anchored primitives are a good foundation. The missing layer is a
publication action-menu primitive that captures the trigger style, panel
surface, action row sizing, copy status, and icon/label alignment.

Recommended shape:

- Keep `AnchoredRoot`, `AnchoredTrigger`, and `AnchoredPanel` low-level.
- Add `ActionPopover.astro`, `ActionMenu.astro`, or `PopoverActionList.astro`
  for article header actions.
- Add `ActionMenuItem.astro` for icon plus label rows.

Benefits:

- Citation, share, and future actions such as "copy DOI", "download
  citation", "print", or "report issue" can share interaction styling.
- Makes panel placement and overflow fixes harder to accidentally diverge.
- Keeps the low-level anchored system reusable for category dropdowns and
  search while avoiding copy-pasted article action classes.

Verification:

- E2e checks for citation and share panel positioning, keyboard focus,
  popover close behavior, and mobile width.
- Unit tests for share target view models should remain independent from UI.

### 5. Button, LinkButton, IconButton Variant Consolidation

Status: silent refactor candidate.

Value: high.

Risk: low to medium.

Evidence:

- `src/components/ui/Button.astro`
- `src/components/ui/LinkButton.astro`
- `src/components/ui/IconButton.astro`
- `src/components/ui/TextLink.astro`

`Button` and `LinkButton` intentionally mirror each other, but they currently
duplicate size/tone/variant maps. Duplication is manageable now, but it becomes
platform risk as new variants and branded CTAs are added.

Recommended shape:

- Extract shared class maps into a TypeScript helper such as
  `src/lib/ui-variants.ts` or `src/components/ui/button-variants.ts`.
- Keep Astro wrappers separate for semantic elements.
- Avoid a polymorphic mega-component that obscures native `a` and `button`
  semantics.

Benefits:

- One source for tone, size, radius, focus, and disabled styling.
- Easier to add future platform themes without auditing every button wrapper.
- Keeps code readable while preserving semantic HTML.

Verification:

- Component tests/catalog snapshots for all tone/variant/size combinations.
- Existing a11y checks should confirm links remain links and buttons remain
  buttons.

### 6. Metadata And Kicker Primitive

Status: silent refactor candidate.

Value: high.

Risk: medium.

Evidence:

- `src/components/articles/ArticleMeta.astro`
- `src/components/articles/ArticleCard.astro`
- `src/components/articles/FlatArticleTeaser.astro`
- `src/components/blocks/HomeFeaturedSlide.astro`
- `src/components/blocks/HomeRecentPostsBlock.astro`
- `src/components/bibliography/BibliographySourceArticles.astro`

The site repeatedly renders small metadata lines with category, date, author,
source, count, and separators. The style differs by context, but the underlying
problem is the same.

Recommended shape:

- `src/components/articles/EntryMetaLine.astro` or
  `src/components/ui/MetadataLine.astro`
- Props for items, separator style, uppercase, muted/primary tone, wrapping,
  and optional link prefetch.
- Keep article author rendering in `ArticleMeta` if author-specific behavior is
  richer than generic metadata.

Benefits:

- Prevents separator drift (`/`, border bar, gap-only, commas).
- Makes category/date/author metadata responsive and accessible by default.
- Helps future publishable types share a display vocabulary.

Verification:

- Component examples for missing category, missing date, multiple authors,
  linked and unlinked items, long metadata labels, and mobile wrapping.

### 7. Article Action Row And Action Trigger Primitive

Status: silent refactor candidate.

Value: medium-high.

Risk: low to medium.

Evidence:

- `src/components/articles/ArticleHeader.astro`
- `src/components/articles/ArticleCitationMenu.astro`
- `src/components/articles/ArticleShareMenu.astro`
- PDF action link in the article header.

The article header has several action affordances that should remain visually
aligned: cite, share, PDF, and likely future actions such as copy canonical URL,
print, issue report, or citation export. Some of this is covered by the action
popover candidate, but the trigger/action-row itself is also a distinct
sub-component opportunity.

Recommended shape:

- `src/components/articles/ArticleActionRow.astro`
- `src/components/articles/ArticleActionTrigger.astro` or a UI-level
  `InlineAction.astro`
- Use the existing citation/share menu components as children instead of
  merging their domain behavior.

Benefits:

- Keeps article header actions visually consistent as features change.
- Prevents PDF/link actions from drifting away from popover triggers.
- Gives the platform an obvious place to add or remove article actions based on
  configuration.

Verification:

- E2e checks for action row wrapping at mobile/tablet/desktop widths.
- Catalog examples for one action, several actions, disabled/missing PDF, and
  long localized labels.

### 8. Surface And Panel Primitive Consolidation

Status: mostly silent refactor candidate, but visual consistency should be
reviewed.

Value: medium-high.

Risk: low to medium.

Evidence:

- `src/components/ui/Card.astro`
- `src/components/blocks/HomeCurrentPanel.astro`
- `src/components/blocks/HomeStartHerePanel.astro`
- `src/components/blocks/SupportBlock.astro`
- `src/components/blocks/TermOverviewBlock.astro`
- `src/components/bibliography/BibliographyEmptyState.astro`
- Repeated class fragment:
  `border-border bg-muted/30 grid min-w-0 content-start gap-4 rounded-sm border p-4`.

The site has a few framed surfaces that are legitimate cards or panels, plus
some page sections that should stay flat. A reusable surface primitive can help
if it does not encourage wrapping every section in a card.

Recommended shape:

- Keep `Card.astro` for repeated item cards.
- Add a narrowly named `Panel.astro` or extend `Card.astro` with explicit
  `surface="muted|plain|popover"` variants only if real repeated panels remain.
- Do not create a vague `.box` abstraction.

Benefits:

- Makes empty states, compact panels, and support blocks consistent.
- Keeps radius/border/background tokens centralized.

Verification:

- Visual review on homepage, support blocks, empty states, and term index
  pages.

### 9. External Brand CTA Primitive

Status: silent refactor candidate.

Value: medium.

Risk: low.

Evidence:

- `src/components/ui/PatreonButton.astro`
- `src/components/ui/DiscordButton.astro`
- `src/components/blocks/SupportBlock.astro`
- `src/components/blocks/HomeHeroBlock.astro`

Patreon and Discord buttons now share almost identical dimensions, shape,
focus, and asset behavior. The implementation should keep brand assets separate
but centralize the shared CTA frame.

Recommended shape:

- `src/components/ui/BrandButton.astro`
- Props: `href`, `ariaLabel`, `background`, `hoverBackground`, `asset`,
  `assetAlt=""`, `target`, `rel`, `size`.
- `PatreonButton` and `DiscordButton` can remain thin wrappers around it.

Benefits:

- Adds future YouTube, Instagram, newsletter, or platform-specific CTAs without
  class drift.
- Keeps official brand assets decorative while preserving accessible labels.
- Makes webmaster configuration easier later.

Verification:

- Visual review on homepage and article support block.
- E2e or catalog examples for button row shrink behavior.

### 10. Page Body And Layout Shell Consolidation

Status: design-sensitive refactor candidate.

Value: medium-high.

Risk: medium.

Evidence:

- `src/components/layout/PageFrame.astro`
- `src/components/layout/BrowsingBody.astro`
- `src/components/layout/ReadingBody.astro`
- `src/components/layout/SectionStack.astro`
- `src/components/layout/EndcapStack.astro`
- `src/layouts/ArticleLayout.astro`
- `src/pages/index.astro`
- `src/pages/articles/index.astro`

The project has good layout primitives, but page routes still choose spacing,
grid gaps, and layout width directly in several places. That is reasonable
during active design, but long-term platform reuse benefits from a smaller set
of named layout recipes.

Recommended shape:

- Keep `ReadingBody` and `BrowsingBody`; they encode real product differences.
- Audit `PageFrame` and `BrowsingBody` overlap before adding new page shells.
- Use `SectionStack` and `EndcapStack` consistently for vertical rhythm.
- Consider a `PageSection.astro` wrapper only after `SectionHeader` exists.

Benefits:

- Page routes become easier for agents and platform users to compose safely.
- Spacing regressions around article endcaps, support blocks, and browse pages
  become less likely.

Verification:

- Visual regression checks for homepage, article pages, article index, tags,
  collections, authors, bibliography, and search.

### 11. Article Layout View-Model Boundary

Status: not first, but important.

Value: high.

Risk: high if done before smaller primitives.

Evidence:

- `src/layouts/ArticleLayout.astro`

`ArticleLayout` does a lot: social image optimization, author profile lookup,
category lookup, related/continuity selection, citation view model, share view
model, reading navigation, scholar metadata, pagefind visibility, layout
composition, and rendering.

Recommended shape:

- First complete smaller UI extractions.
- Then move pure data shaping into a typed helper such as
  `src/lib/article-page-view-model.ts`.
- Keep the Astro layout focused on composing article header, body, references,
  and endcaps.

Benefits:

- Easier to test article page behavior without rendering Astro.
- Future platform options such as disabling citations, PDFs, references, tags,
  support, or related articles become simpler.
- Reduces risk when article-specific features are added.

Verification:

- Unit tests for the article page view model.
- Existing article e2e, build, feed, PDF, and SEO tests.

## Non-Silent Consistency Candidates

These could improve the product, but they should be treated as design work
instead of silent refactors.

### Canonical Section Header Rhythm

The site should decide one canonical section header pattern for:

- article endcap blocks;
- homepage rail/list sections;
- archive/list pages;
- bibliography subheadings;
- search and browse pages.

The current differences are mostly reasonable, but the design would benefit
from a documented set of header sizes and action-link placement rules.

### Canonical Compact List Style

Announcements, start-here entries, compact recent lists, and current/project
links are similar enough that the reader should not have to relearn their
structure. Choose a canonical compact list style and let variants tune density,
not markup.

### Canonical Term Surfaces

Categories, tags, collections, authors, and possibly future series are all
browse-entry surfaces. They should not be forced into one domain model, but
their index cards/rails can share size, count, empty, and long-label behavior.

### Branded CTA Consistency

The site now uses official Patreon and Discord buttons in multiple contexts.
If future platform users configure socials, the CTAs should come from a common
brand/social configuration rather than ad hoc component imports.

### Popover/Menu Visual Language

Citation, share, category previews, search reveal, and image inspectors all
need floating UI. They should remain semantically distinct, but panel radius,
border, shadow, spacing, focus, close behavior, and mobile width should follow
one documented visual language.

## Configurability Pressure Points

The repo has already moved many TPM-specific decisions into `site/config`.
That is the right direction. Remaining pressure points:

### Hardcoded Component Defaults

Several components still contain user-facing default strings such as
"Featured Articles", "Start Here", "Items will appear here", "No categories are
available yet", "View more", "View category", "Related Articles", and
"View Site Bibliography".

Defaults are useful for component catalog examples, but platform routes should
prefer passing labels from configuration or typed view models.

### Direct Site Config Imports In Visual Components

Some components import `siteConfig` directly:

- `src/components/layout/SiteHeader.astro`
- `src/components/layout/SiteFooter.astro`
- `src/components/navigation/SupportLink.astro`
- `src/components/authors/AuthorLink.astro`
- `src/components/articles/ArticleBibliography.astro`
- `src/components/blocks/HomeHeroBlock.astro`
- `src/components/blocks/SupportBlock.astro`

This is acceptable for application-level shell components such as header and
footer. It is less ideal for reusable blocks. Long term, reusable blocks should
accept explicit props from route/view-model code, while shell components may
read global config.

### Homepage Recipe Still Lives In Route Composition

`src/pages/index.astro` is much cleaner than a prototype page, but it still
hardcodes the home page block order and grid placement. That may be right for
TPM, but a reusable platform eventually needs a homepage recipe model that can
choose blocks and content sources without requiring route edits.

Do not solve this too early. First consolidate the component families used by
the homepage.

### Feature Flags Are Good But Need Component Boundaries

`siteConfig.features` is strong. It already gates announcements, categories,
collections, support, search, tags, bibliography, feed, and PDFs. The next
platform step is making sure hidden features do not leave empty UI shells or
force components to know global feature policy.

## Catalog-Only Or Legacy Surface Risk

The current codebase contains components referenced only by the component
catalog or docs, not by public routes:

- `src/components/blocks/HomeRecentPostsBlock.astro`
- `src/components/blocks/HomeAnnouncementBlock.astro`
- `src/components/blocks/HomeLatestArticleBlock.astro`
- `src/components/blocks/HomeFeaturedArticlesBlock.astro`
- `src/components/blocks/HomeMastheadBlock.astro`
- `src/components/blocks/HomeArchiveLinksBlock.astro`
- `src/components/ui/YouTubeButton.astro`
- `src/components/ui/Separator.astro`
- `src/components/ui/Section.astro`
- `src/components/articles/ArticleImage.astro`
- `src/components/navigation/SectionNav.astro`
- `src/components/media/EmbedFrame.astro`
- `src/components/media/YouTubeEmbed.astro`

This does not mean they should be deleted. The catalog is a valid consumer.
However, catalog-only components should be explicitly classified as one of:

1. Current primitive intentionally kept for future use.
2. Deprecated prototype kept temporarily for visual comparison.
3. Real dead code to remove.

Recommendation: add a small "component lifecycle" note to the catalog docs or
component comments so future agents know whether catalog-only means "available"
or "stale".

## Do Not Refactor Broadly Yet

This section means "do not rewrite the whole parent system." It does not mean
"do not extract child pieces." The safest approach for these systems is to
identify stable sub-components, extract them behind behavior-preserving tests,
and leave the parent ownership model intact until the child pieces have proven
their value.

### Article Images And PDF/Image Inspector

This system touches Markdown rendering, Astro image optimization, PDF output,
remote/local image migration, lazy loading, article image overlays, and
accessibility. It is too easy to regress. Only extract narrowly repeated UI
pieces after behavior is stable.

Safe sub-component candidates:

- Image action button/overlay styling for inspect affordances.
- Figure/caption shell if it can preserve current Markdown output exactly.
- Fullscreen image inspector chrome, close button, and focus behavior.
- PDF-only image fallback helpers, as long as they stay separate from browser
  image inspection.
- Pure image metadata helpers that are covered by tests and do not alter the
  Markdown/MDX render path.

Avoid:

- Replacing the Markdown image transform pipeline without a dedicated design.
- Combining browser inspector behavior and PDF image sizing into one
  abstraction.
- Changing the source-selection policy while doing a visual cleanup.

Resume trigger: repeated image/media behavior appears outside article prose, or
PDF/image tests become stable enough to support a larger extraction.

### Article Table Of Contents

The TOC now handles sidebar, inline, generated reference sections, numbering,
sticky header offsets, and hidden/open behavior. It is a domain component, not a
generic disclosure. Avoid broad extraction until another hierarchical contents
component exists.

Safe sub-component candidates:

- TOC heading/header row.
- Show/hide trigger with compact hidden state.
- Numbered TOC list renderer.
- Individual TOC link item with active/current state.
- Placement shell for inline versus sidebar rendering, if it does not change
  heading extraction.

Avoid:

- Turning the TOC into a generic tree component before another tree-like
  consumer exists.
- Changing generated footnote/bibliography inclusion rules during styling
  cleanup.
- Changing sticky-header offset behavior without targeted anchor-navigation
  tests.

Resume trigger: a second page type needs hierarchical contents, or the TOC
styling must be shared with generated docs.

### Site Header Priority Layout

The header solved several difficult responsive invariants around centered logo,
side controls, support button, category row, touch menu, and tiny widths. Avoid
large structural refactors unless a header redesign is explicitly active.

Safe sub-component candidates:

- Header nav link primitive.
- Header action cluster wrapper.
- Mobile menu section and mobile menu item renderers.
- Category-row item renderer, as long as category dropdown behavior is not
  changed.
- Support link wrapper and responsive label selection.

Avoid:

- Rewriting the centered priority layout.
- Changing support-button shrink rules or logo sizing without re-running header
  invariants.
- Moving breakpoint policy into one-off page CSS.

Resume trigger: platform theming needs multiple header layouts, or header
responsive tests become brittle enough to justify a dedicated layout primitive
upgrade.

### Home Featured Carousel

The carousel has product-specific editorial behavior. Do not extract a general
carousel until another real carousel exists. Small primitives for controls,
dots, and fixed slide layout are reasonable if they prevent layout shifts.

Safe sub-component candidates:

- Carousel controls and indicator dots.
- Fixed slide frame.
- Featured entry metadata line.
- Featured image frame and fallback-image surface.
- Slide body layout, if it remains specific to featured publishable entries.

Avoid:

- Creating a fully generic carousel API before a second real carousel exists.
- Mixing collection selection/order logic into visual carousel components.
- Changing autoplay or rotation behavior during a visual extraction.

Resume trigger: collections, homepage, or media galleries need a second
carousel-like surface.

### ArticleCard Fit Logic

`ArticleCard` encodes real editorial list behavior: responsive image frames,
title-fit classes, description-fit classes, and metadata hierarchy. Avoid
generalizing it into a generic card until the compact-entry family and metadata
primitive are stable.

Safe sub-component candidates:

- Article image thumbnail frame.
- Article card kicker/metadata row.
- Title/description fit-class helpers as pure tested utilities.
- Article card text body shell if it preserves the current row contract.

Avoid:

- Turning `ArticleCard` into a universal content card before the publishable
  entry model is more explicit.
- Changing title/description fit thresholds while extracting markup.
- Moving image aspect-ratio policy into page-level callers.

Resume trigger: another content type needs the exact same rich row with
different data.

### ArticleLayout Orchestration

`ArticleLayout` is the right place to compose the article page, but it should
not permanently own every data-normalization detail.

Safe sub-component candidates:

- Article action row.
- Article endcap section composition.
- Reading navigation placement.
- Pure article page view-model helpers for author/category/continuity/share/PDF
  data.
- SEO/scholar metadata helpers that can be tested outside Astro rendering.

Avoid:

- Splitting the layout by file size alone.
- Moving IO or content collection reads into visual child components.
- Changing feature-flag behavior while extracting view-model helpers.

## Suggested Implementation Milestones

These are intentionally sequenced so each milestone lowers risk for the next.

### Milestone A: Silent UI Foundation

- Add `SectionHeader`.
- Extract button/link variant maps.
- Add `BrandButton` and keep Patreon/Discord wrappers.
- Add `ArticleActionRow`/`ArticleActionTrigger` if it can be done without
  changing cite/share/PDF behavior.
- Add metadata-line primitive if it can be done without touching
  `ArticleCard` fit logic.

Verification:

- Component catalog examples.
- `bun --silent run check`.
- Targeted e2e for article header/actions if touched.

### Milestone B: Compact Entry Lists

- Build `CompactEntryList`, `CompactEntryRow`, and optional
  `CompactEntryPanel`.
- Migrate `FlatArticleList` internals first.
- Then migrate homepage start-here/announcements/recent variants where the
  visual output can stay stable.

Verification:

- Homepage visual checks at mobile, tablet, desktop.
- Article/announcement/collection route smoke tests.
- Catalog examples for empty/long/missing metadata states.

### Milestone C: Rails And Term Surfaces

- Extract `ScrollRail`.
- Rebuild `CategoryRailBlock` on top of it.
- Reuse it on the articles page category section.
- Consider `TermRailCard` only if categories/tags/collections converge.

Verification:

- E2e horizontal scroll controls.
- Visual checks for both rail endpoints.
- Mobile/touch behavior.

### Milestone D: Action Menus And Popovers

- Build an action popover/menu layer over anchored primitives.
- Migrate share and citation triggers/panels only.
- Leave category dropdown and search reveal on low-level anchored primitives
  unless they naturally fit.

Verification:

- Share/cite e2e positioning and keyboard behavior.
- A11y check for buttons, labels, focus, and popover close behavior.

### Active B-D Implementation Decisions

The B-D implementation batch may make small visible consistency improvements,
but it should preserve information architecture and interaction contracts.

- Compact entry primitives should serve dense publishable-entry lists without
  thumbnails. They may standardize separator rhythm, empty-state text, and
  title/metadata wrapping across homepage panels and flat publishable lists.
  They should not absorb rich article-card image or description layout.
- Scroll rail primitives should own horizontal overflow behavior, edge fades,
  scroll controls, disabled states, accessibility hooks, and script data hooks.
  Category or term cards should stay as small domain wrappers over label,
  count, link, and pluralization.
- Action menu primitives should sit above `AnchoredRoot`, `AnchoredTrigger`,
  and `AnchoredPanel`, not replace them. Citation and share components should
  keep their format/share-target logic while delegating panel surface and menu
  item presentation to the shared action-menu layer.
- Category dropdown and search reveal stay on low-level anchored primitives for
  this pass. Article images, table of contents, header priority layout,
  carousel internals, and broad `ArticleLayout` orchestration are out of scope.

### Milestone E: Platform Config Boundaries

- Audit reusable blocks that import `siteConfig`.
- Move config reads toward route/view-model boundaries where practical.
- Keep shell components allowed to read global config.
- Document which labels are site-configurable and which are component defaults.

Verification:

- Unit tests for site config normalization.
- Build with a minimal fixture config if feasible.

### Milestone F: Article Page View Model

- Move pure data composition out of `ArticleLayout`.
- Keep rendering in Astro.
- Add tests for author/category/continuity/share/citation/PDF visibility data.

Verification:

- Article unit tests.
- `bun --silent run check`.
- `bun --silent run build`.
- `bun --silent run validate:html`.

## Development Readiness Criteria

Before implementing any milestone from this audit, make the milestone pass this
check:

- The proposed component has a clear design name and responsibility.
- The public props are small enough to explain in one short paragraph.
- Configuration enters from props or a view model unless the component is
  intentionally an application shell.
- Empty, long-content, narrow-width, keyboard, touch, and dark-mode states are
  identified.
- The refactor plan states whether the output must be pixel/markup stable or
  intentionally design-changing.
- The verification plan names concrete unit, catalog, e2e, a11y, build, or
  visual checks.
- The implementation can be reverted independently of unrelated milestones.

If a proposed extraction fails this check, either narrow it to a smaller
sub-component or leave it in the parent component for now.

## Known Blind Spots For Handoff

These are not blockers, but the next developer should keep them visible:

- Component catalog coverage exists, but catalog-only components are not yet
  classified as current, deprecated, or dead. Do not delete catalog-only
  components during foundation refactors unless that is the active milestone.
- The repo does not yet have a separate fixture site configuration for
  platform reuse. Config-boundary refactors should avoid assuming TPM is the
  only future consumer, but they should not invent a full fixture system during
  Milestone A.
- Visual regression protection is mostly targeted e2e plus manual review, not
  broad screenshot baselines. Silent refactors should keep migration scope
  small enough for manual visual verification to be realistic.
- MDX article components and article prose rendering may contain one-off
  editorial behavior. Do not fold MDX-specific behavior into generic list,
  section, or button primitives without checking real MDX usage.
- Some repeated classes are deliberate because the components are semantically
  different. Treat repeated Tailwind as evidence to inspect, not proof that a
  shared component is required.
- Platform configurability should flow from content/config/view models into
  components. Avoid making every primitive read `siteConfig`; that would reduce
  immediate prop plumbing but make future platform extraction harder.

## Recommended Next Step

Start with Milestone A only. It is low-risk and creates primitives that make the
larger refactors safer. Avoid touching article image, TOC, header, or carousel
internals until the foundation primitives are in place and verified.

After Milestone A, reassess whether Milestone B should be silent-only or include
a deliberate compact-list visual consistency pass.
