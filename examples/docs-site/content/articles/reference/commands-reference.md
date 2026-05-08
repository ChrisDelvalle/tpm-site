---
title: Commands Reference
description: Choose the right Bun command for development, authoring, validation, and release checks.
date: 2026-05-08
author: Platform Team
tags:
  - reference
  - commands
---

The platform is Bun-first. Use `bun run` scripts for development, checks, and
site-instance operations.

## Development

```sh
bun run dev
bun run docs-site:dev
```

## Authoring

```sh
bun run author:check
bun run author:fix
```

## Docs Site

```sh
bun run test:docs-site
bun run docs-site:preview:fresh
```

## External Fixture

```sh
bun run test:site-instance
```

## Platform Checks

```sh
bun run platform:check
bun run check
```

## Release

```sh
bun run check:release
```

## Generated Contracts

```sh
bun run site:schema
bun run site:schema:check
```

Use [Validate Your Site](/articles/validate-site/) for the onboarding path and
[Troubleshooting](/articles/troubleshooting/) when a command fails.
