import { jsonLdText } from "#/libs/seo";

/** Structured data for search engines (`organizationJsonLd`, `articleJsonLd`); nothing when there is none. */
export function JsonLd({ data }: { data: object | undefined }) {
	if (!data) return null;
	return (
		<script
			type="application/ld+json"
			// biome-ignore lint/security/noDangerouslySetInnerHtml: JSON with "<" escaped (jsonLdText)
			dangerouslySetInnerHTML={{ __html: jsonLdText(data) }}
		/>
	);
}
