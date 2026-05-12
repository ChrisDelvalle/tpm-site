---
title: Theme Contract
description: Understand how a site instance customizes colors, typography, radius, and shadows.
date: 2026-05-08
author: Platform Team
tags:
  - reference
  - theme
  - customization
---

The platform owns reusable component structure. The site instance owns concrete
theme values through `theme.css`.

## File Location

```text
site/theme.css
```

The docs site uses:

```text
examples/docs-site/theme.css
```

## Token Pattern

Components use semantic tokens:

```css
:root {
  --background: oklch(0.98 0.01 90);
  --foreground: oklch(0.22 0.02 80);
  --primary: oklch(0.5 0.14 45);
  --primary-foreground: oklch(0.98 0.02 85);
  --radius-sm: 0.25rem;
}
```

Dark mode uses the same token names:

```css
:root[data-theme="dark"] {
  --background: oklch(0.18 0.02 80);
  --foreground: oklch(0.94 0.01 90);
}
```

## Rule

Change site-owned visual identity in `theme.css`, site assets, or content
frontmatter. Do not hard-code one site's palette into platform components.
