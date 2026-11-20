# Static site

- `next build` writes every page as HTML (`output: "export"` in `next.config.ts`); nothing runs on a server afterwards. No request-time code: no Server Actions (`"use server"`), no route handler that reads the request, no `cookies()`, `headers()`, `searchParams` in a page, `redirect()` that depends on a visitor, or auth on the site itself. A form posts to an outside service.
- A page's data is read while it is built. `export const dynamic = "force-dynamic"`, `revalidate`, and `next/image`'s optimizer do not work in a static export: use `<img>`.
- A route handler (`route.ts`) only makes a file at build time (`sitemap.xml`): it has `export const dynamic = "force-static";` and a `GET` that takes no request.
- No secrets in the code or in `NEXT_PUBLIC_*` variables: everything in the build is public.
- Content changes reach the site by rebuilding.
- Root-absolute paths (`/uploads/...`, `/app-icon.svg`) assume the site is served at `/`.
