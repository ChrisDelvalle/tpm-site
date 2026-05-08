# Platform Docs Site

This is a real example site instance for the reusable blogging platform.

It is intentionally not a clone of the live site. The content, `theme.css`,
navigation, and site config are neutral documentation-site material so platform
changes are checked against a second consumer.

Run the example site locally from the repository root:

```sh
bun run docs-site:dev
```

For a production-like local preview:

```sh
bun run docs-site:preview:fresh
```

Run the example site checks:

```sh
bun run test:docs-site
```

These scripts run the platform against the docs-site instance with
`SITE_INSTANCE_ROOT=examples/docs-site`. The check validates the site config
contract and builds the example site.
