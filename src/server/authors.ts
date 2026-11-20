import "server-only";
import { allAuthors } from "content-collections";

export const listAuthors = () =>
	allAuthors.map(({ _meta, ...author }) => author);

export type Author = ReturnType<typeof listAuthors>[number];
