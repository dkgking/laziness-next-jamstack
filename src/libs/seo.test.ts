import { describe, expect, test } from "bun:test";
import {
	articleJsonLd,
	jsonLdText,
	organizationJsonLd,
	pathIn,
	seo,
	sitemapXml,
	unlocalizedPath,
} from "./seo";

const site = { name: "Coast", organization: {} };

describe("seo paths", () => {
	test("drops a trailing slash but keeps the root", () => {
		expect(unlocalizedPath("/posts/")).toBe("/posts");
		expect(unlocalizedPath("/")).toBe("/");
	});

	test("puts the default locale at the root", () => {
		expect(pathIn("en", "/posts")).toBe("/posts");
		expect(pathIn("en", "/")).toBe("/");
	});

	test("lists a page only in the locales it is written in", () => {
		const xml = sitemapXml([
			{ path: "/posts/hello", locales: ["en"] },
			{ path: "/posts/none", locales: [] },
		]);
		expect(xml).toContain("/posts/hello</loc>");
		expect(xml).not.toContain("/posts/none");
	});
});

describe("seo", () => {
	test("leaves out what has no value", () => {
		const meta = seo({ site, locale: "en", path: "/posts", title: "Posts" });
		expect(meta.title).toBe("Posts");
		expect(meta.description).toBeUndefined();
		expect(meta.twitter).toMatchObject({ card: "summary" });
		expect(meta.openGraph?.images).toBeUndefined();
	});

	test("makes the image and page address absolute", () => {
		const meta = seo({
			site,
			locale: "en",
			title: "Hello",
			image: "/uploads/cover.png",
			path: "/posts/hello",
			type: "article",
		});
		expect(meta.openGraph).toMatchObject({
			url: "https://example.com/posts/hello",
			images: [{ url: "https://example.com/uploads/cover.png", alt: "Hello" }],
		});
		expect(meta.twitter).toMatchObject({ card: "summary_large_image" });
		expect(meta.alternates).toMatchObject({
			canonical: "https://example.com/posts/hello",
			languages: { "x-default": "https://example.com/posts/hello" },
		});
	});

	test("a page with no picture of its own shows the site's", () => {
		const meta = seo({
			site: { ...site, image: "/uploads/share.png", twitter: "@coast" },
			locale: "en",
			path: "/",
			title: "Home",
		});
		expect(meta.openGraph).toMatchObject({
			siteName: "Coast",
			images: [{ url: "https://example.com/uploads/share.png" }],
		});
		expect(meta.twitter).toMatchObject({ site: "@coast" });
	});

	test("an article says when it was written and by whom", () => {
		const meta = seo({
			site,
			locale: "en",
			path: "/posts/hello",
			title: "Hello",
			type: "article",
			publishedTime: "2026-10-22T00:00:00.000Z",
			author: "Jane Doe",
		});
		expect(meta.openGraph).toMatchObject({
			type: "article",
			publishedTime: "2026-10-22T00:00:00.000Z",
			authors: ["Jane Doe"],
		});
	});
});

describe("structured data", () => {
	test("an organization is structured data only when the site names one", () => {
		expect(organizationJsonLd(site)).toBeUndefined();
		expect(
			organizationJsonLd({
				...site,
				organization: { name: "Coast Ltd", logo: "/uploads/logo.png" },
			}),
		).toMatchObject({
			"@type": "Organization",
			name: "Coast Ltd",
			logo: "https://example.com/uploads/logo.png",
		});
	});

	test("structured data cannot close its own script", () => {
		const text = jsonLdText({ headline: "</script><script>alert(1)" });
		expect(text).not.toContain("<");
		expect(JSON.parse(text).headline).toBe("</script><script>alert(1)");
	});

	test("an article names its public address and its publisher", () => {
		expect(
			articleJsonLd({
				title: "Hello",
				path: "/posts/hello",
				publishedTime: "2026-10-22T00:00:00.000Z",
				author: { name: "Jane Doe" },
				site,
			}),
		).toMatchObject({
			"@type": "BlogPosting",
			url: "https://example.com/posts/hello",
			publisher: { name: "Coast" },
		});
	});
});
