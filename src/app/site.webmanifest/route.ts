import { defaultLocale } from "#/libs/locales";
import { getSite } from "#/server/pages";

/** The background a browser paints while the site opens, when the site names no theme color. */
const DEFAULT_COLOR = "#ffffff";

// Written to site.webmanifest at build time, from content/settings/site.yaml:
// what a phone shows when the site is added to its home screen.
export const dynamic = "force-static";

export function GET() {
	const site = getSite(defaultLocale);
	const color = site.theme_color ?? DEFAULT_COLOR;
	return new Response(
		JSON.stringify({
			name: site.name,
			short_name: site.name,
			description: site.description ?? "",
			start_url: "/",
			display: "standalone",
			background_color: color,
			theme_color: color,
			icons: [
				{
					src: "/app-icon.svg",
					sizes: "any",
					type: "image/svg+xml",
					purpose: "any",
				},
			],
		}),
		{
			headers: { "content-type": "application/manifest+json; charset=utf-8" },
		},
	);
}
