# Markdown Page

Source: `src/components/pages/MarkdownPage.astro`

## Purpose

`MarkdownPage` serves as a generic page component for non-article Markdown content.

## Public Contract

- `description?: string | undefined`
- `title: string`

Public props should remain narrow and semantic. Do not add broad configuration
objects or boolean clusters when a named variant or a smaller component would
make invalid states harder to express.

## Composition Relationships

It composes local components: `./PageHeader`, `./PageProse`. Parent blocks should pass normalized props and slots rather than asking this component to fetch global content directly.

## Layout And Responsiveness

The component should follow normal flow, use Tailwind tokens, and keep responsive behavior local to the component.

## Layering And Scrolling

The component should avoid creating a stacking context unless it owns an overlay,
sticky region, or popover. Any `z-index`, sticky offset, fixed size, or scroll
container is part of this component's public design and needs an invariant test.

## Interaction States

Default, long-content, missing optional content, hover, focus-visible, and dark-mode states should be represented in the catalog when relevant.

## Accessibility Semantics

Use semantic HTML first, preserve heading order when headings are rendered, and keep focus-visible states intact for any interactive descendants.

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
- renders one page title and readable prose.
- does not inherit article-only metadata or article-only styling.

## Follow-Up Notes

- No component-specific brittle decision is known yet; add one here when implementation review finds a questionable or fragile choice.
