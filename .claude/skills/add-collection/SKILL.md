---
name: add-collection
description: Add a new CMS-managed content collection (e.g. projects, events, pages) end to end - zod schema in src/content, registration in content-collections.ts, matching Sveltia CMS collection in public/admin/config.yml, readers in src/server and pages. Use when asked to add a new content type or make something editable in the CMS.
---

# Add a content collection

A collection has four parts that must agree: **data folder**, **zod schema**, **CMS config**, **readers in `src/server`**. Use `posts` (translated, Markdown) or `authors` (single language, YAML) as the reference. Library details and pitfalls are in the `content-collections` skill.

First decide:
- **Translated?** Translated collections use `content/<name>/<locale>/<slug>.md` (CMS `i18n: true`). Untranslated ones use `content/<name>/<slug>.yaml|md`.
- **Body?** Use Markdown with frontmatter if there is long text (`parser: "frontmatter"`). Use YAML for data only (`parser: "yaml"`).

## 1. Schema: `src/content/<name>.ts`

```ts
import { defineCollection } from "@content-collections/core";
import { compileMarkdown } from "@content-collections/markdown";
import rehypeSanitize from "rehype-sanitize";
import { z } from "zod";
import { isoDate, optionalString, parseLocalePath } from "./helpers";

export const projects = defineCollection({
	name: "projects",
	directory: "content/projects",
	include: "**/*.md",
	parser: "frontmatter",
	schema: z.object({
		title: z.string(),
		summary: optionalString(),
		date: isoDate(),
		content: z.string(),
	}),
	transform: async (doc, context) => {
		const parsed = parseLocalePath(doc._meta.path); // translated collections only
		if (!parsed) {
			throw new Error(`"${doc._meta.filePath}" must be content/projects/<locale>/<slug>.md`);
		}
		const html = await compileMarkdown(context, doc, { rehypePlugins: [rehypeSanitize] });
		const { content: _content, ...rest } = doc;
		return { ...rest, ...parsed, html };
	},
});
```

Rules:
- This file runs at build time in Node, outside Next.js. Import only framework-free modules (`./helpers`, `../libs/locales`), never `#/libs/i18n`, `#/libs/i18n-server`, or React.
- Optional CMS fields arrive as `""`: use `optionalString()`, `optionalUrl()` and `optionalEmail()`. For dates use `isoDate()`.
- For an untranslated collection, use `slug: doc._meta.path` instead of `parseLocalePath`.
- To reference another collection, store its slug and resolve it in `transform` with `context.documents(other).find((d) => d._meta.path === doc.ref)`. Throw if it is missing. `documents()` returns pre-transform data, so match on `_meta.path`.
- Always keep `rehypeSanitize` on Markdown.

## 2. Register in `content-collections.ts`

```ts
import { projects } from "./src/content/projects";
export default defineConfig({ content: [authors, posts, projects] });
```

Run `bunx content-collections build`. `allProjects` is then importable from `content-collections`.

## 3. CMS: `public/admin/config.yml`

Add a collection with the **same folder and fields** (widget ↔ zod mapping: `.claude/skills/sveltia-cms/fields.md`). Translated example (mirror of `posts`):

```yaml
  - name: "projects"
    label: "Projects"
    folder: "content/projects"
    slug: "{{slug}}"
    create: true
    extension: md
    format: frontmatter
    i18n: true
    fields:
      - { label: "Title", name: "title", widget: "string", i18n: true }
      - { label: "Summary", name: "summary", widget: "text", required: false, i18n: true }
      - { label: "Date", name: "date", widget: "datetime", output_utc: true, i18n: duplicate }
      - { label: "Body", name: "body", widget: "markdown", i18n: true }
```

- `body` (markdown widget) becomes the file body, which the schema reads as `content`.
- Match the validation on both sides: `type: url` / `type: email` on string widgets that the schema checks with `optionalUrl()` / `optionalEmail()`. Use `output_utc: true` on datetimes.
- Relations: `widget: relation`, `collection: authors`, `value_field: "{{slug}}"`.
- Run `bun run validate:cms`.

## 4. Readers: `src/server/<name>.ts`

Never import `content-collections` in pages or components. Copy the pattern from `src/server/posts.ts`:

```ts
import "server-only";
import { allProjects } from "content-collections";
import { defaultLocale, type Locale } from "#/libs/locales";

/** The slug of every project, once each (for `generateStaticParams`). */
export const projectSlugs = () => [...new Set(allProjects.map((project) => project.slug))];

/** A project by its slug, in `locale` when it is written in it, else the default locale's; null when there is none. */
export const getProject = (locale: Locale, slug: string) => {
	const versions = allProjects.filter((project) => project.slug === slug);
	const project =
		versions.find((version) => version.locale === locale) ??
		versions.find((version) => version.locale === defaultLocale);
	if (!project) return null;
	const { _meta, ...rest } = project;
	return rest;
};
```

Return only what the page needs. A function that finds nothing returns `null`, and its page calls `notFound()`.

## 5. Pages, sample content, verify

1. Add pages with the `add-page` skill (the page calls the reader, `lang={item.locale}` on the content element). The page of one item is a dynamic route copied from `src/app/(site)/posts/[slug]/page.tsx`: its `generateStaticParams` returns `slugParams(projectSlugs())`. Add the collection's pages to `src/app/sitemap.xml/route.ts`.
2. Add at least one sample file per locale under `content/<name>/`.
4. Run `bun run verify` (it validates the CMS config too).
