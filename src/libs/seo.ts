import type { Metadata } from "next";
import { defaultLocale, type Locale, locales, pathIn } from "./locales";
import { absoluteUrl, siteUrl } from "./site";

export { pathIn, unlocalizedPath } from "./locales";

/** What the site says about itself (content/settings/site.yaml), as the head needs it. */
export interface SiteSeo {
	readonly name: string;
	readonly description?: string;
	readonly image?: string;
	readonly twitter?: string;
	readonly google_verification?: string;
	readonly theme_color?: string;
	readonly organization: {
		readonly name?: string;
		readonly url?: string;
		readonly logo?: string;
		readonly email?: string;
	};
}

export interface SeoInput {
	/** The site's settings in the page's locale (`getSite(locale)`). */
	readonly site: SiteSeo;
	readonly locale: Locale;
	/** The page's path without a locale ("/posts/hello-world"). */
	readonly path: string;
	readonly title: string;
	readonly description?: string;
	/** Root-absolute ("/uploads/cover.png") or a full URL; the site's share picture when left out. */
	readonly image?: string;
	/** What the image shows; the title when left out. */
	readonly imageAlt?: string;
	readonly type?: "website" | "article";
	/** ISO dates and the writer's name, for articles. */
	readonly publishedTime?: string;
	readonly modifiedTime?: string;
	readonly author?: string;
	/**
	 * The locale whose address search engines keep. An entry not yet
	 * translated shows the default locale's text: pass that entry's own
	 * locale, so the copy points at the version it copies.
	 */
	readonly canonicalLocale?: Locale;
}

/** The full public address of the page `path` in `locale`: what a visitor's browser shows. */
export const addressIn = (locale: Locale, path: string) =>
	`${siteUrl}${pathIn(locale, path)}`;

/** The same page in each locale, and x-default, for `<link rel="alternate" hreflang>`. */
export const alternateLanguages = (path: string): Record<string, string> => ({
	...Object.fromEntries(
		locales.map(({ code }) => [code, addressIn(code, path)]),
	),
	"x-default": addressIn(defaultLocale, path),
});

/**
 * A page's `generateMetadata()`: title, description, canonical and
 * hreflang links, Open Graph, and Twitter card. Values that are not set
 * leave their tags out. What only the site knows (its name, its X handle)
 * is read from `site`; the icon, the manifest, and Google's verification
 * are set once by src/app/(site)/layout.tsx.
 */
export const seo = ({
	site,
	locale,
	path,
	title,
	description,
	image = site.image,
	imageAlt,
	type = "website",
	publishedTime,
	modifiedTime,
	author,
	canonicalLocale = locale,
}: SeoInput): Metadata => {
	const images = image
		? [{ url: absoluteUrl(image), alt: imageAlt ?? title }]
		: undefined;
	return {
		title,
		description,
		alternates: {
			canonical: addressIn(canonicalLocale, path),
			languages: alternateLanguages(path),
		},
		openGraph: {
			siteName: site.name,
			locale,
			alternateLocale: locales
				.filter(({ code }) => code !== locale)
				.map(({ code }) => code),
			title,
			description,
			url: addressIn(locale, path),
			images,
			...(type === "article"
				? {
						type,
						publishedTime,
						modifiedTime,
						authors: author ? [author] : undefined,
					}
				: { type }),
		},
		twitter: {
			card: images ? "summary_large_image" : "summary",
			site: site.twitter,
			title,
			description,
			images: images?.map(({ url }) => url),
		},
	};
};

/**
 * Structured data as the text of a `<script type="application/ld+json">`
 * (src/components/JsonLd.tsx). "<" is written as its escape, so words from
 * a content file can never close the script.
 */
export const jsonLdText = (item: object) =>
	JSON.stringify(item).replaceAll("<", "\\u003c");

/** Who publishes the site, for search engines; nothing when the site names no organization. */
export const organizationJsonLd = (site: SiteSeo) =>
	site.organization.name
		? {
				"@context": "https://schema.org",
				"@type": "Organization",
				name: site.organization.name,
				url: site.organization.url ?? siteUrl,
				...(site.organization.logo
					? { logo: absoluteUrl(site.organization.logo) }
					: {}),
				...(site.organization.email ? { email: site.organization.email } : {}),
			}
		: undefined;

/** An article (a post) as structured data. */
export const articleJsonLd = (article: {
	readonly title: string;
	readonly description?: string;
	/** The post's path in its locale ("/vi/posts/hello-world"). */
	readonly path: string;
	readonly image?: string;
	readonly publishedTime: string;
	readonly author: { readonly name: string; readonly url?: string };
	readonly site: SiteSeo;
}) => ({
	"@context": "https://schema.org",
	"@type": "BlogPosting",
	headline: article.title,
	...(article.description ? { description: article.description } : {}),
	url: absoluteUrl(article.path),
	...(article.image ? { image: absoluteUrl(article.image) } : {}),
	datePublished: article.publishedTime,
	author: {
		"@type": "Person",
		name: article.author.name,
		...(article.author.url ? { url: article.author.url } : {}),
	},
	publisher: {
		"@type": "Organization",
		name: article.site.organization.name ?? article.site.name,
		...(article.site.organization.logo
			? { logo: absoluteUrl(article.site.organization.logo) }
			: {}),
	},
});

const escapeXml = (value: string) =>
	value
		.replaceAll("&", "&amp;")
		.replaceAll("<", "&lt;")
		.replaceAll(">", "&gt;")
		.replaceAll('"', "&quot;");

export interface SitemapEntry {
	/** Unlocalized, e.g. "/posts/hello-world". */
	readonly path: string;
	/** The locales the page is written in; a fallback to another locale is left out. */
	readonly locales: readonly Locale[];
}

/** A sitemap of each entry in each of its locales, with the others as alternates. */
export const sitemapXml = (entries: readonly SitemapEntry[]) => {
	const urls = entries.flatMap(({ path, locales: written }) =>
		written.map((code) => {
			const alternates = written
				.map(
					(other) =>
						`<xhtml:link rel="alternate" hreflang="${other}" href="${escapeXml(addressIn(other, path))}"/>`,
				)
				.join("");
			return `<url><loc>${escapeXml(addressIn(code, path))}</loc>${alternates}</url>`;
		}),
	);
	return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">${urls.join("")}</urlset>\n`;
};
