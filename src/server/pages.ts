import "server-only";
import { allHomePages, allPostsPages, allSites } from "content-collections";
import type { Locale } from "#/libs/locales";
import { inLocale } from "./locale";

// The words of each page and of the shared frame, from content/pages and
// content/settings. A page asks for its own file as it renders, at build time.

/** One page file in `locale`, without what only the build reads; a missing file fails the build with its name. */
const pageIn = <T extends { locale: Locale; _meta: unknown }>(
	documents: readonly T[],
	locale: Locale,
	file: string,
) => {
	const found = inLocale(documents, locale);
	if (!found) throw new Error(`${file} is missing`);
	const { _meta, locale: _locale, ...fields } = found;
	return fields;
};

export const getSite = (locale: Locale) =>
	pageIn(allSites, locale, "content/settings/site.yaml");

export const getHomePage = (locale: Locale) =>
	pageIn(allHomePages, locale, "content/pages/home.yaml");

export const getPostsPage = (locale: Locale) =>
	pageIn(allPostsPages, locale, "content/pages/posts.yaml");

/** What the frame around every page shows of the site's settings (src/layouts/AppLayout.tsx). */
export type SiteFrame = Pick<
	ReturnType<typeof getSite>,
	"nav" | "footer_links" | "footer_note"
>;
