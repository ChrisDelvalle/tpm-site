# Author Social Links

Source: `src/components/authors/AuthorSocialLinks.astro`

## Purpose

`AuthorSocialLinks` renders approved public profile links for an author.

It must not infer or scrape social links.

## Public Contract

- `links: readonly AuthorSocialLink[]`

Each link includes label and href. Optional icon metadata may be added later.

## Composition Relationships

```text
AuthorProfileHeader | AuthorBioBlock
  AuthorSocialLinks
```

The parent decides placement. This component owns list semantics and link
presentation.

## Layout And Responsiveness

Links wrap inline or stack compactly depending on parent context. Long labels
must not overflow.

## Layering And Scrolling

No layering.

## Interaction States

Support no links, one link, many links, hover, focus-visible, visited where
appropriate, and long labels.

## Accessibility Semantics

Use normal links with visible labels. Icons are optional and must not be the
only accessible name.

## Content Edge Cases

Handle personal websites, publication pages, no links, duplicate labels, long
URLs, and external links.

## Theme Behavior

Use semantic link tokens. External link styling should stay subtle.

## Testable Invariants

- Renders nothing for empty links.
- Renders visible labels.
- Does not invent icons or links.
- Focus states are visible.
- Long labels wrap.

## Follow-Up Notes

- Social metadata is public author content and requires approval before adding.
