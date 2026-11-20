# Routing

- Pages live under `src/app/(site)/` (`(site)/about/page.tsx` → `/about`). Never create pages outside it, except what a site serves at its root: `src/app/sitemap.xml/`, `robots.txt/`, `site.webmanifest/` (route handlers built to files).
- `src/app/[locale]/` is generated from `(site)` by `scripts/locale-routes.ts` (run by `next.config.ts`; it exists only with two or more locales): never edit, create, or delete anything in it.
- A page or a layout takes `params: LocaleParams` and reads its locale with `await pageLocale(params)` (`#/libs/i18n-server`). The same file serves `/about` and `/vi/about`.
- A dynamic route (`posts/[slug]/page.tsx`) types its params with the locale (`params: Promise<{ locale?: string; slug: string }>`), says `export const dynamicParams = false;`, and names every page it has in `generateStaticParams` through `slugParams()` (`#/libs/static-params`): a page not named there is not in the built site. Copy `src/app/(site)/posts/[slug]/page.tsx`.
- Link internal pages with `LocalizedLink` from `#/libs/i18n` (`to="/posts"`, without a locale), never a bare `next/link` or `<a>`. Its `to` is a plain string: check the target page exists.
- A page's `generateMetadata` returns `seo({ site: getSite(locale), locale, path: "/its/path", title, … })` from `#/libs/seo`; its title and description come from its content file (`seo_title ?? title`), and the site's share picture is used when it passes no `image`. The site's own tags (icon, manifest, verification) are set once by `src/app/(site)/layout.tsx`. Never build a full URL by hand: use `addressIn()` from `#/libs/seo`.
- Pages render inside `AppLayout`, put around them by `src/app/(site)/layout.tsx`: a page never wraps itself in it.
- A page calls `notFound()` (`next/navigation`) for a missing item. An address no page matches shows `src/app/not-found.tsx` (built as `404.html`), an error while rendering in the browser shows `src/app/(site)/error.tsx`.
