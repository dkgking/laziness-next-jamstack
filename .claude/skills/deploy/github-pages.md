# Deploy to GitHub Pages

The build is already static (`out/`). Pages needs only a workflow.

**Prefer a user/org page (`<user>.github.io`) or a custom domain**, where the site is served at `/`. A project page (`<user>.github.io/<repo>/`) needs the base-path fixes below.

## Workflow

`.github/workflows/pages.yml`:

```yaml
name: Deploy to GitHub Pages
on:
  push:
    branches: [main]
  workflow_dispatch:
permissions:
  contents: read
  pages: write
  id-token: write
concurrency:
  group: pages
  cancel-in-progress: false
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: oven-sh/setup-bun@v2
      - run: bun install --frozen-lockfile
      - run: bun run build
        env:
          NEXT_PUBLIC_SITE_URL: https://<user>.github.io
      - uses: actions/upload-pages-artifact@v4
        with:
          path: out
  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - id: deployment
        uses: actions/deploy-pages@v4
```

Repository → Settings → Pages → Source: **GitHub Actions**. Pages serves `posts.html` at `/posts` and `404.html` for unknown paths.

## Project page under `/<repo>/` (only if not served at `/`)

1. `next.config.ts`: `basePath: process.env.BASE_PATH || ""`, and set `BASE_PATH: /<repo>` (no trailing slash) in the build step. `next/link` (so `LocalizedLink`) and the built assets take it by themselves.
2. Root-absolute content paths (`/uploads/...` in `cover`, `avatar`, and post HTML) need the base prefixed where they are read (`src/server/posts.ts`, `src/server/authors.ts`): `base + path` for paths starting with a single `/`.
3. Prefix `/app-icon.svg` and `/site.webmanifest` in `src/app/(site)/layout.tsx`, `/app-icon.svg` in `public/admin/index.html` and `logo.src` in `public/admin/config.yml`, and the `cms-config-url` link in `public/admin/index.html`.

Test: `BASE_PATH=/my-repo bun run build`, then serve `out/` under `/my-repo/`.

## Caveats

- An unknown post slug (`/posts/missing`) shows the 404 page: every page must exist at build time.
