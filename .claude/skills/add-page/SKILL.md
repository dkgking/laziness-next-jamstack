---
name: add-page
description: Add a new localized page/route to this Next.js site (under src/app/(site)/), with its words in a content file the CMS edits and a nav link. Use when asked to create a page, screen, route or section such as /about or /contact.
---

# Add a page

Every page lives under `src/app/(site)/` so it works at `/about` and, once more languages are added, `/vi/about`, ... (the mirror under `src/app/[locale]/` is generated: never write there).

A page's words are **content**: they live in `content/pages/<page>.yaml`, so the site's owner edits them in the CMS (Pages) and Web Studio's Edit tool can change them. Never write them in the TSX (`.claude/rules/content.md`). The example below adds `/about`.

## 1. The page's words: `content/pages/about.yaml`

One field per piece of text; a repeated block is a list of objects.

```yaml
title: About us
intro: Who we are and what we do.
values:
  - title: Responsible sourcing
    body: Approved farms and fisheries, documented at lot level.
  - title: Quality commitment
    body: Measured specifications and a named owner for every batch.
```

## 2. Its schema: `src/content/pages.ts`

Add a collection for the file (copy `postsPage`), and register it in `content-collections.ts`.

```ts
export const aboutPage = defineCollection({
	name: "aboutPage",
	directory: "content/pages",
	include: "**/about.yaml",
	parser: "yaml",
	schema: z.object({
		title: z.string(),
		intro: optionalString(),
		values: z.array(z.object({ title: z.string(), body: z.string() })),
	}),
	transform: (doc) => ({ ...doc, locale: localeOf(doc) }),
});
```

## 3. Its CMS entry: `public/admin/config.yml`

Add the file under the `pages` collection's `files`, with the same fields (a list of objects is the `list` widget with `fields`):

```yaml
      - name: "about"
        label: "About"
        file: "content/pages/about.yaml"
        fields:
          - { label: "Title", name: "title", widget: "string" }
          - { label: "Intro", name: "intro", widget: "text", required: false }
          - label: "Values"
            name: "values"
            widget: "list"
            summary: "{{title}}"
            fields:
              - { label: "Title", name: "title", widget: "string" }
              - { label: "Body", name: "body", widget: "text" }
```

`bun run validate:cms` fails when these fields and the schema's differ.

## 4. Its reader: `src/server/pages.ts`

```ts
export const getAboutPage = (locale: Locale) =>
	pageIn(allAboutPages, locale, "content/pages/about.yaml");
```

The generated list is named after the collection: `aboutPage` → `allAboutPages` (run `bun run typecheck` once to generate it).

## 5. The page file

Folder → URL: `src/app/(site)/about/page.tsx` → `/about`, `src/app/(site)/docs/[slug]/page.tsx` → `/docs/:slug`, `src/app/(site)/docs/page.tsx` → `/docs`.

```tsx
import type { Metadata } from "next";
import { type LocaleParams, pageLocale } from "#/libs/i18n-server";
import { seo } from "#/libs/seo";
import { getAboutPage, getSite } from "#/server/pages";

export async function generateMetadata({
	params,
}: {
	params: LocaleParams;
}): Promise<Metadata> {
	const locale = await pageLocale(params);
	const page = getAboutPage(locale);
	return seo({
		site: getSite(locale),
		locale,
		path: "/about",
		title: page.title,
		description: page.intro,
	});
}

export default async function AboutPage({ params }: { params: LocaleParams }) {
	const page = getAboutPage(await pageLocale(params));
	return (
		<div className="w-full">
			<h1 className="text-4xl font-bold">{page.title}</h1>
			{page.intro && <p className="mt-3 text-slate-600">{page.intro}</p>}
			<ul className="mt-8 grid gap-4 sm:grid-cols-2">
				{page.values.map((value) => (
					<li key={value.title} className="rounded-lg border border-slate-200 p-4">
						<h2 className="font-semibold">{value.title}</h2>
						<p className="mt-1 text-slate-600">{value.body}</p>
					</li>
				))}
			</ul>
		</div>
	);
}
```

- A page is an `async` Server Component, rendered once at build time. It starts with `await pageLocale(params)`.
- The layout already puts `AppLayout` (header, nav, footer) around it: return only the page's own content.
- A page that lists a collection (posts, projects) reads it beside its own words, as `src/app/(site)/posts/page.tsx` does (see the `add-collection` skill).
- A page for each item of a collection is a dynamic route: copy `src/app/(site)/posts/[slug]/page.tsx` (`dynamicParams = false`, `generateStaticParams` through `slugParams()`, `notFound()` for a missing item).
- `seo()` from `#/libs/seo` makes the title, description, canonical and hreflang links, Open Graph, and Twitter card tags. A page with its own picture passes `image` (a root-absolute path or a full URL), else the site's share picture is used; an article passes `type: "article"` and `publishedTime`. Never write the `og:*` or `twitter:*` tags by hand.

## 6. Nav link (optional)

The navigation is content too: add the link to `nav` in `content/settings/site.yaml` (`LocalizedLink` adds the locale prefix):

```yaml
nav:
  - label: Home
    to: /
  - label: About
    to: /about
```

Check that the route exists: `to` is a plain string.

## 7. Languages and verify

1. With more than one language, the page's file exists once per language: `content/pages/<locale>/about.yaml` (see the `add-locale` skill). Translate the words; keep the keys.
2. Interface words the page adds (a form's messages, a button that is not copy) go through `i18n._("...")`: follow the `i18n-lingui` skill, run `bun run i18n:extract`, and fill every catalog.
3. `bun run verify`
4. Check (`verify` built the site) that `out/<path>.html` (and `out/<locale>/<path>.html` if the site has other languages) was written.
