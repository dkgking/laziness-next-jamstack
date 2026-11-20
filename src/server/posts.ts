import "server-only";
import { allPosts } from "content-collections";
import { defaultLocale, type Locale } from "#/libs/locales";

// Content stays on the server: pages render only what they show, so the
// collections never reach the browser.

type Post = (typeof allPosts)[number];

/** Drafts show only in `bun dev`, marked Draft. */
const visiblePosts = () =>
	allPosts.filter(
		(post) => process.env.NODE_ENV === "development" || !post.draft,
	);

// Prefer the requested locale, fall back to the default-locale version.
const pickTranslation = (posts: Post[], slug: string, locale: Locale) =>
	posts.find((post) => post.slug === slug && post.locale === locale) ??
	posts.find((post) => post.slug === slug && post.locale === defaultLocale);

/** What a list shows of a post. */
const summaryOf = ({
	slug,
	locale,
	title,
	summary,
	date,
	cover,
	draft,
	featured,
	readingMinutes,
	author,
}: Post) => ({
	slug,
	locale,
	title,
	summary,
	date,
	cover,
	draft,
	featured,
	readingMinutes,
	author,
});

/** Every visible post as `locale` reads it (its own version, else the default locale's), newest first. */
const postsIn = (locale: Locale) => {
	const posts = visiblePosts();
	const slugs = [...new Set(posts.map((post) => post.slug))];
	return slugs
		.map((slug) => pickTranslation(posts, slug, locale))
		.filter((post): post is Post => post !== undefined)
		.sort((a, b) => b.date.localeCompare(a.date));
};

export const listPosts = (locale: Locale) => postsIn(locale).map(summaryOf);

/** A neighbour's link: its slug and title. */
const linkOf = (post: Post | undefined) =>
	post ? { slug: post.slug, title: post.title } : null;

/** A post by its slug as `locale` reads it, with its neighbours; null when there is none. */
export const getPost = (locale: Locale, slug: string) => {
	const posts = postsIn(locale);
	const at = posts.findIndex((post) => post.slug === slug);
	const post = posts[at];
	if (!post) return null;

	const { _meta, ...rest } = post;
	// Newest first: the one after it in the list was written before it.
	return {
		...rest,
		newer: linkOf(posts[at - 1]),
		older: linkOf(posts[at + 1]),
	};
};

export type PostSummary = ReturnType<typeof listPosts>[number];
