/** The slug of the stand-in page of a collection with no entry; no entry may be named so. */
export const NO_ENTRY_SLUG = "_";

/**
 * A dynamic route's `generateStaticParams()` result. A static export
 * refuses a route with no page at all (a blog with no post yet), so an
 * empty list becomes one stand-in slug, whose page is the not-found page.
 */
export const slugParams = (slugs: readonly string[]) =>
	(slugs.length > 0 ? slugs : [NO_ENTRY_SLUG]).map((slug) => ({ slug }));
