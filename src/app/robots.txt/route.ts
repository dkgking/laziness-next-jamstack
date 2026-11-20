import { siteUrl } from "#/libs/site";

// Written to robots.txt at build time: every page may be read, the CMS is
// left alone, and the sitemap is named.
export const dynamic = "force-static";

export function GET() {
	return new Response(
		[
			"User-agent: *",
			"Allow: /",
			"Disallow: /admin/",
			"",
			`Sitemap: ${siteUrl}/sitemap.xml`,
			"",
		].join("\n"),
		{ headers: { "content-type": "text/plain; charset=utf-8" } },
	);
}
