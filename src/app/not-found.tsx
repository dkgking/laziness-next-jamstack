import { UnmatchedPage } from "#/components/UnmatchedPage";
import { allMessages } from "#/libs/i18n-server";
import { defaultLocale, type Locale, locales } from "#/libs/locales";
import { getSite, type SiteFrame } from "#/server/pages";
import "#/styles.css";

/** The frame's words in every locale: only what AppLayout shows of the site's settings. */
const allFrames = () =>
	Object.fromEntries(
		locales.map(({ code }) => {
			const { nav, footer_links, footer_note } = getSite(code);
			return [code, { nav, footer_links, footer_note }];
		}),
	) as Record<Locale, SiteFrame>;

// An address no route matches, built as 404.html, which every static host
// serves for unknown paths. It is rendered outside every layout, so it
// makes its own document.
export default function GlobalNotFound() {
	return (
		<html lang={defaultLocale}>
			<body>
				<UnmatchedPage messages={allMessages()} sites={allFrames()} />
			</body>
		</html>
	);
}
