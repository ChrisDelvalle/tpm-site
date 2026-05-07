# TPM Site Instance

This directory is the site-owner and author-facing surface for the current
The Philosopher's Meme site.

The long-term goal is that most publication-specific choices live here while
the reusable blogging platform handles the technical work. Future admin UI work
should read and write the same files.

Current editable areas:

- `config/site.json`: site identity, canonical URL, feature switches,
  content-type defaults, navigation, support links, and share attribution.
- `content/`: Markdown, MDX, and JSON content collections for articles,
  announcements, authors, categories, collections, and pages.
- `assets/`: project-owned images and SVGs that should go through Astro's asset
  pipeline.
- `public/`: files copied directly to the site root, such as `favicon.svg`,
  `robots.txt`, and `CNAME`.
- `unused-assets/`: parked historical assets that are intentionally kept out of
  the generated site.
