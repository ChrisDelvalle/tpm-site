# TPM Site Instance

This directory is the site-owner and author-facing surface for the current
The Philosopher's Meme site.

The long-term goal is that most publication-specific choices live here while
the reusable blogging platform handles the technical work. Future admin UI work
should read and write the same files.

Current editable areas:

- `config/site.json`: site identity, canonical URL, feature switches,
  content-type defaults, navigation, support links, and share attribution.
- `config/site.schema.json`: generated editor and future-GUI schema for
  `config/site.json`. Update it with `bun run site:schema`.
- `theme.css`: site-owned semantic theme tokens for colors, fonts, radius, and
  shadows. The platform reads these through stable CSS variables.
- `content/`: Markdown, MDX, and JSON content collections for articles,
  announcements, authors, categories, collections, and pages.
- `assets/`: project-owned images and SVGs that should go through Astro's asset
  pipeline.
- `public/`: files copied directly to the site root, such as `favicon.svg`,
  `robots.txt`, and `CNAME`.
- `unused-assets/`: parked historical assets that are intentionally kept out of
  the generated site.

Run `bun run site:doctor` after config changes to catch relationship mistakes
such as disabled features still appearing in navigation or homepage collections
pointing at missing files.

Run `bun run author:check` after ordinary content or site-instance edits. It
wraps the content, tag, asset, config, and schema checks authors and webmasters
need most often. Run `bun run author:fix` only when tag normalization is the
reported repair.
