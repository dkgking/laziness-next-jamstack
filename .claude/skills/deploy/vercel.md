# Deploy to Vercel

`vercel.json` makes Vercel build the site and serve `out/`:

```json
{
	"framework": null,
	"buildCommand": "bun run build",
	"outputDirectory": "out",
	"cleanUrls": true,
	"trailingSlash": false
}
```

- `"framework": null` keeps it a plain static deployment: Vercel builds with `bun run build` and serves the files of `out/` as they are, as every other host does.
- `cleanUrls` serves `posts.html` at `/posts` (and redirects `/posts.html` to `/posts`).
- `trailingSlash: false` redirects `/posts/` to `/posts`; the CMS is then at `/admin`, which finds its config through the absolute `cms-config-url` link in `public/admin/index.html`.
- Unknown paths get `404.html` with a 404 status.

## Deploy

Import the repository in Vercel (or `bunx vercel`). Nothing to fill in: `vercel.json` holds the settings. Add `NEXT_PUBLIC_SITE_URL` under Settings → Environment Variables. Vercel installs with bun because of `bun.lock`.

Preview deployments get their own URLs; `NEXT_PUBLIC_SITE_URL` should stay the production address.
