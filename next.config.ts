import { withContentCollections } from "@content-collections/next";
import type { NextConfig } from "next";
import { PHASE_DEVELOPMENT_SERVER } from "next/constants";
import {
	syncLocaleRoutes,
	watchLocaleRoutes,
} from "./scripts/locale-routes.ts";

/**
 * The address Web Studio shows the dev server at: Next.js refuses its dev
 * resources to any origin it was not told about.
 */
const previewHosts = process.env.__VITE_ADDITIONAL_SERVER_ALLOWED_HOSTS;

/**
 * A static site: `next build` writes every page as HTML into out/, as flat
 * files (posts.html, vi/posts.html) that Cloudflare, Netlify, and Vercel
 * (cleanUrls) all serve at /posts with no redirect. Nothing runs on a
 * server afterwards.
 */
const config: NextConfig = {
	output: "export",
	trailingSlash: false,
	// No server to resize pictures on: they are served as they were uploaded.
	images: { unoptimized: true },
	reactCompiler: true,
	allowedDevOrigins: previewHosts ? [`*${previewHosts}`] : [],
};

export default function nextConfig(phase: string) {
	// The other locales' routes mirror src/app/(site): scripts/locale-routes.ts.
	syncLocaleRoutes();
	if (phase === PHASE_DEVELOPMENT_SERVER) watchLocaleRoutes();
	// Builds content/ into typed data (.content-collections), and follows it in dev.
	return withContentCollections(config);
}
