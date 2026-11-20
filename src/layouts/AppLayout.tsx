"use client";

import { useLingui } from "@lingui/react";
import type { PropsWithChildren } from "react";
import { LocalizedLink, useLocale } from "#/libs/i18n";
import { type Locale, locales } from "#/libs/locales";
import type { SiteFrame } from "#/server/pages";

/**
 * The frame of every page (header, nav, language switcher, footer), put
 * around them by src/app/(site)/layout.tsx with the navigation and footer
 * of content/settings/site.yaml.
 */
export function AppLayout({
	site,
	children,
}: PropsWithChildren<{ site: SiteFrame }>) {
	return (
		<div className="flex min-h-screen flex-col bg-white text-slate-900">
			<header className="border-b border-slate-200">
				<div className="mx-auto flex w-full max-w-5xl items-center justify-between gap-4 px-4 py-4">
					<nav className="flex items-center gap-4 text-sm font-medium">
						{site.nav.map((item) => (
							<LocalizedLink
								key={item.to}
								to={item.to}
								className="hover:text-slate-600"
							>
								{item.label}
							</LocalizedLink>
						))}
					</nav>

					{locales.length > 1 && <LanguageSwitcher />}
				</div>
			</header>

			<main className="mx-auto flex w-full max-w-5xl flex-1 flex-col px-4 py-8">
				{children}
			</main>

			{(site.footer_links.length > 0 || site.footer_note) && (
				<footer className="border-t border-slate-200">
					<div className="mx-auto flex w-full max-w-5xl flex-wrap items-center justify-between gap-4 px-4 py-6 text-sm text-slate-500">
						<nav className="flex flex-wrap items-center gap-4">
							{site.footer_links.map((item) => (
								<LocalizedLink
									key={item.to}
									to={item.to}
									className="hover:text-slate-700"
								>
									{item.label}
								</LocalizedLink>
							))}
						</nav>
						{site.footer_note && <p>{site.footer_note}</p>}
					</div>
				</footer>
			)}
		</div>
	);
}

/** Shown once the site has a second locale (see .claude/skills/add-locale). */
function LanguageSwitcher() {
	const { i18n } = useLingui();
	const { currentLocale, switchLocale } = useLocale();

	return (
		<label className="flex items-center gap-2 text-sm">
			<span>{i18n._("Language")}</span>
			<select
				className="rounded-md border border-slate-300 bg-white px-3 py-2"
				value={currentLocale}
				onChange={(event) => switchLocale(event.target.value as Locale)}
			>
				{locales.map((locale) => (
					<option key={locale.code} value={locale.code}>
						{locale.nativeName}
					</option>
				))}
			</select>
		</label>
	);
}
