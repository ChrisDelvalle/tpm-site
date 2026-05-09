# Unused Assets

This directory contains image and media files that are not currently referenced
by the site.

Do not reference files from this directory in articles, layouts, or components.
If an asset becomes useful again, move it into the appropriate folder under
`src/assets/` first:

- `src/assets/articles/<article-slug>/` for assets owned by one article.
- `src/assets/shared/` for assets reused by multiple articles or pages.
- `src/assets/site/` for homepage, layout, and other site UI assets.

After moving an asset, update the article or component reference to point at the
new `src/assets/...` location so Astro can validate and process it during build.
