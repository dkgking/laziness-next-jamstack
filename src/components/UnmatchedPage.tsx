"use client";

import type { Messages } from "@lingui/core";
import { NotFound } from "#/components/NotFound";
import { AppLayout } from "#/layouts/AppLayout";
import { LinguiProvider, usePathLocale } from "#/libs/i18n";
import type { Locale } from "#/libs/locales";
import type { SiteFrame } from "#/server/pages";

/**
 * The not-found page of an address no route matches
 * (src/app/not-found.tsx, built as 404.html). Its language is not known
 * when it is built, so it is given every locale's messages and frame and
 * reads the locale from the address in the browser.
 */
export function UnmatchedPage({
	messages,
	sites,
}: {
	messages: Record<Locale, Messages>;
	sites: Record<Locale, SiteFrame>;
}) {
	const locale = usePathLocale();
	return (
		<LinguiProvider key={locale} locale={locale} messages={messages[locale]}>
			<AppLayout site={sites[locale]}>
				<NotFound />
			</AppLayout>
		</LinguiProvider>
	);
}
