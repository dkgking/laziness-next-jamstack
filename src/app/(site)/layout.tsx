import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { JsonLd } from "#/components/JsonLd";
import { AppLayout } from "#/layouts/AppLayout";
import { LinguiProvider } from "#/libs/i18n";
import { i18nFor, type LocaleParams, pageLocale } from "#/libs/i18n-server";
import { organizationJsonLd } from "#/libs/seo";
import { siteUrl } from "#/libs/site";
import { getSite } from "#/server/pages";
import "#/styles.css";

interface Props {
	children: ReactNode;
	params: LocaleParams;
}

// What every page shares in its head (a page's own tags come from its
// `generateMetadata`, through `seo()`).
export async function generateMetadata({ params }: Props): Promise<Metadata> {
	const site = getSite(await pageLocale(params));
	return {
		metadataBase: new URL(siteUrl),
		title: site.name,
		icons: { icon: { url: "/app-icon.svg", type: "image/svg+xml" } },
		manifest: "/site.webmanifest",
		verification: { google: site.google_verification },
	};
}

export async function generateViewport({ params }: Props): Promise<Viewport> {
	const site = getSite(await pageLocale(params));
	return { themeColor: site.theme_color };
}

// The document of every page, in the page's locale, and the frame around
// it (AppLayout, with the navigation and footer of content/settings/site.yaml).
// Pages render inside it: they never wrap themselves.
export default async function SiteLayout({ children, params }: Props) {
	const locale = await pageLocale(params);
	const site = getSite(locale);
	const { nav, footer_links, footer_note } = site;
	return (
		<html lang={locale}>
			<body>
				<LinguiProvider locale={locale} messages={i18nFor(locale).messages}>
					<AppLayout site={{ nav, footer_links, footer_note }}>
						{children}
					</AppLayout>
				</LinguiProvider>
				<JsonLd data={organizationJsonLd(site)} />
			</body>
		</html>
	);
}
