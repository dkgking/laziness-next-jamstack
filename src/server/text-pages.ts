import "server-only";
import { allTextPages } from "content-collections";
import { defaultLocale, type Locale } from "#/libs/locales";

/** The slug of every text page, once each. */
export const textPageSlugs = () => [
	...new Set(allTextPages.map((page) => page.slug)),
];

/** A text page by its slug, in `locale` when it is written in it, else the default locale's; null when there is none. */
export const getTextPage = (locale: Locale, slug: string) => {
	const versions = allTextPages.filter((page) => page.slug === slug);
	const page =
		versions.find((version) => version.locale === locale) ??
		versions.find((version) => version.locale === defaultLocale);
	if (!page) return null;
	const { _meta, ...rest } = page;
	return rest;
};
