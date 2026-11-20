import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { JsonLd } from "#/components/JsonLd";
import { LocalizedLink } from "#/libs/i18n";
import { i18nFor, pageLocale } from "#/libs/i18n-server";
import { formatDate } from "#/libs/intl";
import { defaultLocale, isLocale } from "#/libs/locales";
import { articleJsonLd, pathIn, seo } from "#/libs/seo";
import { slugParams } from "#/libs/static-params";
import { getSite } from "#/server/pages";
import { getPost, listPosts } from "#/server/posts";

/** A post lists its sections only when it has at least this many. */
const MIN_HEADINGS_FOR_CONTENTS = 2;

interface Props {
	params: Promise<{ locale?: string; slug: string }>;
}

// Every post is a page of the built site; any other slug is the 404 page.
export const dynamicParams = false;

export function generateStaticParams({
	params,
}: {
	params: { locale?: string };
}) {
	const locale =
		params.locale && isLocale(params.locale) ? params.locale : defaultLocale;
	return slugParams(listPosts(locale).map(({ slug }) => slug));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
	const locale = await pageLocale(params);
	const post = getPost(locale, (await params).slug);
	if (!post) return {};
	return seo({
		site: getSite(locale),
		locale,
		path: `/posts/${post.slug}`,
		title: post.seo_title ?? post.title,
		description: post.seo_description ?? post.summary,
		image: post.og_image ?? post.cover,
		type: "article",
		publishedTime: post.date,
		author: post.author.name,
		// A post not yet translated shows the default-locale text: the address
		// search engines keep is that version's, never the copy's.
		canonicalLocale: post.locale,
	});
}

export default async function PostPage({ params }: Props) {
	const locale = await pageLocale(params);
	const post = getPost(locale, (await params).slug);
	if (!post) notFound();
	const i18n = i18nFor(locale);
	const site = getSite(locale);

	return (
		<article className="w-full" lang={post.locale}>
			<LocalizedLink
				to="/posts"
				className="text-sm text-slate-500 hover:text-slate-700"
			>
				{"← "}
				{i18n._("All posts")}
			</LocalizedLink>

			<h1 className="mt-4 text-4xl font-bold">{post.title}</h1>
			<p className="mt-2 text-sm text-slate-500">
				{formatDate(locale, post.date)}
				{" · "}
				{post.author.name}
				{" · "}
				{i18n._("{minutes, plural, one {# min read} other {# min read}}", {
					minutes: post.readingMinutes,
				})}
			</p>

			{post.cover && (
				// biome-ignore lint/performance/noImgElement: a static site has no server to resize pictures
				<img src={post.cover} alt="" className="mt-6 w-full rounded-lg" />
			)}

			{post.headings.length >= MIN_HEADINGS_FOR_CONTENTS && (
				<nav
					aria-label={i18n._("On this page")}
					className="mt-6 rounded-lg border border-slate-200 p-4 text-sm"
				>
					<p className="font-semibold">{i18n._("On this page")}</p>
					<ul className="mt-2 flex flex-col gap-1">
						{post.headings.map((heading) => (
							<li
								key={heading.id}
								className={heading.depth > 2 ? "pl-4" : undefined}
							>
								<a
									href={`#${heading.id}`}
									className="text-slate-600 hover:text-slate-900"
								>
									{heading.text}
								</a>
							</li>
						))}
					</ul>
				</nav>
			)}

			{/* HTML is compiled from Markdown at build time; content comes from repo editors. */}
			<div
				className="post-content mt-8"
				// biome-ignore lint/security/noDangerouslySetInnerHtml: trusted, build-time Markdown
				dangerouslySetInnerHTML={{ __html: post.html }}
			/>

			{(post.older || post.newer) && (
				<nav
					aria-label={i18n._("More posts")}
					className="mt-12 flex flex-wrap justify-between gap-4 border-t border-slate-200 pt-6 text-sm"
				>
					{post.older ? (
						<LocalizedLink
							to={`/posts/${post.older.slug}`}
							className="text-slate-600 hover:text-slate-900"
						>
							{"← "}
							{post.older.title}
						</LocalizedLink>
					) : (
						<span />
					)}
					{post.newer && (
						<LocalizedLink
							to={`/posts/${post.newer.slug}`}
							className="text-slate-600 hover:text-slate-900"
						>
							{post.newer.title}
							{" →"}
						</LocalizedLink>
					)}
				</nav>
			)}

			<JsonLd
				data={articleJsonLd({
					title: post.seo_title ?? post.title,
					description: post.seo_description ?? post.summary,
					path: pathIn(post.locale, `/posts/${post.slug}`),
					image: post.og_image ?? post.cover ?? site.image,
					publishedTime: post.date,
					author: post.author,
					site,
				})}
			/>
		</article>
	);
}
