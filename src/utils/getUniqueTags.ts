import type { DiaryEntry } from "@/types";
import { slugifyStr } from "./slugify";
import postFilter from "./postFilter";

export interface Tag {
  tag: string;
  tagName: string;
  /** 该标签下的日记则数 */
  count: number;
}

/**
 * 汇总全站标签
 *
 * 按使用频次倒序：写得最多的主题排在最前，便于顺着标签回顾同类经历。
 */
const getUniqueTags = (entries: DiaryEntry[]): Tag[] => {
  const counter = new Map<string, Tag>();

  for (const entry of entries.filter(postFilter)) {
    for (const tagName of entry.data.tags) {
      const tag = slugifyStr(tagName);
      const existing = counter.get(tag);
      if (existing) {
        existing.count += 1;
      } else {
        counter.set(tag, { tag, tagName, count: 1 });
      }
    }
  }

  return [...counter.values()].sort(
    (a, b) => b.count - a.count || a.tag.localeCompare(b.tag)
  );
};

export default getUniqueTags;
