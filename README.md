# The Philosopher's Meme

Astro migration of The Philosopher's Meme.

## Requirements

- Bun

## Development

```sh
bun install
bun run dev
```

The dev server serves the Astro site. Legacy Markdown source stays in `docs/`;
`bun run sync:content` creates an ignored Astro-readable mirror in
`src/content/legacy/`.

## Build

```sh
bun run check
bun run build
bun run verify
```

`bun run build` generates the static site into `dist/` and then builds the
Pagefind search index in `dist/pagefind/`.

## Content

- Articles are sourced from dated Markdown files in `docs/`.
- Canonical article routes are `/articles/:slug/`.
- Topic pages are generated at `/topics/:topic/`.
- Old dated redirects are handled outside this repo, currently through
  Cloudflare.

## Deployment

Configure the host to:

1. Install dependencies with `bun install`.
2. Build with `bun run build`.
3. Publish the `dist/` directory.

The production site origin is configured in `astro.config.mjs`.
