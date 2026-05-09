# Component Design One-Pagers

This directory mirrors `src/components/`. Each public component or page-level
block has a short design one-pager that documents what the component is for,
what it may render, how it relates to parent and sibling components, and what
must remain true when the implementation changes.

New component work should start here:

1. Add or update the one-pager.
2. Add or update the component catalog example.
3. Implement the component.
4. Add render, invariant, accessibility, and interaction tests that match the
   documented intent.

One-pagers are design contracts, not implementation transcripts. If the current
implementation is brittle or provisional, document that clearly in the
component's follow-up notes instead of treating the brittle behavior as the
desired design.

Mirrored folders:

- `articles/`: article display, metadata, lists, prose, and after-article
  discovery.
- `blocks/`: page-level editorial sections.
- `layout/`: page shells and persistent site regions.
- `media/`: embeds, iframes, and media stability components.
- `navigation/`: brand, primary navigation, category discovery, search, theme,
  mobile menu, and support links.
- `pages/`: non-article Markdown page surfaces.
- `seo/`: machine-readable metadata components.
- `ui/`: low-level primitives.
