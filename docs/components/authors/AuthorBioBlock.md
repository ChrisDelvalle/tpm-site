# Author Bio Block

Source: `src/components/authors/AuthorBioBlock.astro`

## Purpose

`AuthorBioBlock` renders a concise author bio surface near article endcaps or
on author pages when profile metadata exists.

It must not render placeholder biography text.

## Public Contract

- `author: AuthorProfile`
- `context?: "article" | "profile"`

The component should render nothing when there is no useful bio, social, or
profile content for the chosen context.

## Composition Relationships

Article usage:

```text
ArticleEndcap or EndcapStack
  AuthorBioBlock
```

Profile usage:

```text
AuthorPage
  AuthorBioBlock
```

`AuthorProfileHeader` owns primary profile identity. `AuthorBioBlock` owns
supporting biography content.

## Layout And Responsiveness

Use the parent body measure. Do not become wider than article prose or browsing
content. Avoid large profile-card treatment unless the page design calls for it.

## Layering And Scrolling

No layering.

## Interaction States

Support missing bio, short bio, long bio excerpt, social links, hover, and
focus-visible states.

## Accessibility Semantics

Use a heading only when the block renders visible content. Links use normal
anchor semantics.

## Content Edge Cases

Handle no bio, long bio, anonymous authors, group authors, no socials, long
social labels, and missing avatar.

## Theme Behavior

Use secondary semantic tokens. Bio surfaces should feel editorial, not
promotional.

## Testable Invariants

- Renders nothing when no useful profile content exists.
- Does not render placeholder copy.
- Keeps links focusable and readable.
- Fits parent measure in article and profile contexts.

## Follow-Up Notes

- Public personal metadata requires explicit approval before being added.
