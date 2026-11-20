import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { i18nFor, pageLocale } from "#/libs/i18n-server";
import { formatDate } from "#/libs/intl";
import { seo } from "#/libs/seo";
import { slugParams } from "#/libs/static-params";
import { getSite } from "#/server/pages";
import { getTextPage, textPageSlugs } from "#/server/text-pages";

// A text page (content/text-pages/<slug>.md): privacy, terms, and the like.

interface Props {
	params: Promise<{ locale?: string; slug: string }>;
}

// Every text page is a page of the built site; any other slug is the 404 page.
export const dynamicParams = false;

export function generateStaticParams() {
	return slugParams(textPageSlugs());
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
	const locale = await pageLocale(params);
	const page = getTextPage(locale, (await params).slug);
	if (!page) return {};
	return seo({
		site: getSite(locale),
		locale,
		path: `/page/${page.slug}`,
		title: page.seo_title ?? page.title,
		description: page.seo_description ?? page.summary,
		// A page not yet translated shows the default-locale text: that version's address is kept.
		canonicalLocale: page.locale,
	});
}

export default async function TextPage({ params }: Props) {
	const locale = await pageLocale(params);
	const page = getTextPage(locale, (await params).slug);
	if (!page) notFound();
	const i18n = i18nFor(locale);

	return (
		<article className="w-full" lang={page.locale}>
			<h1 className="text-4xl font-bold">{page.title}</h1>
			<p className="mt-2 text-sm text-slate-500">
				{i18n._("Updated {date}", {
					date: formatDate(locale, page.updated),
				})}
			</p>
			{/* HTML is compiled from Markdown at build time; content comes from repo editors. */}
			<div
				className="post-content mt-8"
				// biome-ignore lint/security/noDangerouslySetInnerHtml: trusted, build-time Markdown
				dangerouslySetInnerHTML={{ __html: page.html }}
			/>
		</article>
	);
}
