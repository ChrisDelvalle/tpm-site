# TPM Site Instance

This directory is the site-owner and author-facing surface for the current
The Philosopher's Meme site.

The long-term goal is that most publication-specific choices live here while
the reusable blogging platform handles the technical work. Future admin UI work
should read and write the same files.

Current editable areas:

- `config/site.json`: site identity, canonical URL, navigation, support links,
  and share attribution.

Content and assets still live under `src/content/` and `src/assets/` during the
first platformization pass. They will move here only after content loading,
Markdown images, MDX imports, PDFs, search, RSS, and build verification are
ready for the new root.
