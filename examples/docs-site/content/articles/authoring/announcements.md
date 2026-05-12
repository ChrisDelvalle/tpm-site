---
title: Announcements
description: Publish update-style content that stays separate from normal articles.
date: 2026-05-08
author: Platform Team
tags:
  - authoring
  - announcements
---

Announcements are publishable entries for updates, releases, notices, and other
content that should not be mixed into the normal article archive.

## File Location

```text
site/content/announcements/<announcement-slug>.md
```

The docs site uses:

```text
examples/docs-site/content/announcements/platform-docs-online.md
```

## Frontmatter

Announcements use the same authoring style as articles:

```yaml
---
title: Platform Docs Online
description: The documentation example site is now available.
date: 2026-05-08
author: Platform Team
tags:
  - updates
---
```

## Homepage Behavior

The homepage shows the newest visible announcements according to:

```json
{
  "homepage": {
    "announcementLimit": 2
  }
}
```

## Next

Use [Visibility And Drafts](/articles/visibility-and-drafts/) when an
announcement should exist but stay out of homepage, search, feed, or directory
surfaces.
