# Deploy to Netlify

`netlify.toml`:

```toml
[build]
  command = "bun run build"
  publish = "out"
```

Netlify serves `posts.html` at `/posts` and the root `404.html` for unknown paths, with a 404 status. `/admin` redirects to `/admin/`.

## Deploy

- **From Git**: Netlify → Add new site → Import an existing project. The build settings come from `netlify.toml`. Add `NEXT_PUBLIC_SITE_URL` under Site configuration → Environment variables.
- **From your machine**: `bun run build && bunx netlify deploy --dir out --prod`.

## Check locally

```bash
bun run build && bunx netlify dev --offline --dir out
```
