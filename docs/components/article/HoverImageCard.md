# Hover Image Card

Source: `src/components/article/HoverImageCard.astro`

## Purpose

Compatibility wrapper for older MDX import paths. New component work should use
`src/components/articles/HoverImageCard.astro`.

## Public Contract

Forwards the `HoverImageCard` article-domain props unchanged:

- `image: ImageMetadata`
- `label: string`
- `alt?: string`
- `expanded?: boolean`

## Composition Relationships

```text
legacy MDX import path
  src/components/article/HoverImageCard.astro
    src/components/articles/HoverImageCard.astro
```

## Testable Invariants

- Preserves the legacy import path.
- Emits the same native anchored preview markup as the article-domain
  component.
- Does not change article wording or author-provided labels.
