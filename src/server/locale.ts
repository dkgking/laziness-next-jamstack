import { defaultLocale, type Locale } from "#/libs/locales";

/** The document written in `locale`, else the default locale's (a missing translation falls back). */
export const inLocale = <T extends { locale: Locale }>(
	documents: readonly T[],
	locale: Locale,
): T | undefined =>
	documents.find((document) => document.locale === locale) ??
	documents.find((document) => document.locale === defaultLocale);
