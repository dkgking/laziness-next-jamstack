import type { Metadata } from "next";
import { PostList } from "#/components/PostList";
import { type LocaleParams, pageLocale } from "#/libs/i18n-server";
import { seo } from "#/libs/seo";
import { getPostsPage, getSite } from "#/server/pages";
import { listPosts } from "#/server/posts";

export async function generateMetadata({
	params,
}: {
	params: LocaleParams;
}): Promise<Metadata> {
	const locale = await pageLocale(params);
	const page = getPostsPage(locale);
	return seo({
		site: getSite(locale),
		locale,
		path: "/posts",
		title: page.seo_title ?? page.title,
		description: page.seo_description ?? page.intro,
	});
}

export default async function PostsPage({ params }: { params: LocaleParams }) {
	const locale = await pageLocale(params);
	const page = getPostsPage(locale);

	return (
		<div className="w-full">
			<h1 className="text-4xl font-bold">{page.title}</h1>
			{page.intro && <p className="mt-3 text-slate-600">{page.intro}</p>}
			<div className="mt-8">
				<PostList posts={listPosts(locale)} locale={locale} />
			</div>
		</div>
	);
}
