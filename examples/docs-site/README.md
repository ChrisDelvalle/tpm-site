# TPM Platform Docs Site

This is a real example site instance for the reusable blogging platform.

It is intentionally not a TPM clone. The content, `theme.css`, navigation, and
site config are neutral documentation-site material so platform changes are
checked against a second consumer.

Run the example site checks from the repository root:

```sh
bun run test:docs-site
```

The check validates the site config contract and builds the example site with
`SITE_INSTANCE_ROOT=examples/docs-site`.
