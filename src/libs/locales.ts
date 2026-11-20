// Framework-free locale constants, safe to import from content-collections config.
// Codes must be two lowercase letters: a locale is the first part of a page's
// address (/vi/posts). English only until the user asks for more languages:
// add one with .claude/skills/add-locale (also lingui.config.ts,
// src/locales/index.ts and public/admin/config.yml).
export const locales = [
	{ code: "en", name: "English", nativeName: "English" },
] as const;

export type Locale = (typeof locales)[number]["code"];

export const defaultLocale: Locale = "en";

export const isLocale = (value: string): value is Locale =>
	locales.some((locale) => locale.code === value);

/** The path of the page `path` in `locale`: the default locale has no prefix ("/posts"), the others have theirs ("/vi/posts"). */
export const pathIn = (locale: Locale, path: string) =>
	locale === defaultLocale ? path : `/${locale}${path === "/" ? "" : path}`;

/** A path without its locale prefix or a trailing slash ("/vi/posts/" → "/posts"). */
export const unlocalizedPath = (rawPathname: string) => {
	const pathname =
		rawPathname.length > 1 ? rawPathname.replace(/\/+$/, "") : rawPathname;
	for (const { code } of locales) {
		if (pathname === `/${code}`) return "/";
		if (pathname.startsWith(`/${code}/`))
			return pathname.slice(code.length + 1);
	}
	return pathname;
};

/** The locale a path is in, by its prefix; the default locale without one. */
export const localeOfPath = (pathname: string): Locale => {
	const first = pathname.split("/")[1] ?? "";
	return isLocale(first) ? first : defaultLocale;
};
