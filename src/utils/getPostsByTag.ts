import type { DiaryEntry } from "@/types";
import getSortedEntries from "./getSortedEntries";
import { slugifyAll } from "./slugify";

const getPostsByTag = (entries: DiaryEntry[], tag: string) =>
  getSortedEntries(
    entries.filter(entry => slugifyAll(entry.data.tags).includes(tag))
  );

export default getPostsByTag;
