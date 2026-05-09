# ReadingNavigationLinks

Source: `src/components/navigation/ReadingNavigationLinks.astro`

## Purpose

`ReadingNavigationLinks` renders a compact one-line set of high-level reading
destinations such as Articles, Archive, Authors, Collections, and Tags.

## Intentions

- Keep quick navigation small enough to sit above dense editorial content.
- Support the homepage `Read /` prefix and article-page usage without that
  prefix from one shared primitive.
- Prefer truncation and one-line containment over wrapping into a second row.

## Invariants

- Internal links prefetch on hover.
- The row is intrinsic-width, left-aligned, and never uses horizontal border
  bars.
- When `showTitle` is false, the title and slash separator are both omitted.
