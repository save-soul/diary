import type { CollectionEntry } from "astro:content";

/** 一则日记 */
export type DiaryEntry = CollectionEntry<"diary">;

/** 一则日记的 frontmatter */
export type DiaryData = DiaryEntry["data"];
