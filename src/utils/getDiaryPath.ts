import { slugifyStr } from "./slugify";
import { getDiaryDate } from "./date";
import type { DiaryData, DiaryEntry } from "@/types";

/** 日记的路由前缀 */
export const DIARY_BASE = "/diary";

/** 取条目 id 的最后一段作为链接末段（loader 已归一化路径，frontmatter 的 slug 会覆盖文件名） */
export function getDiarySlug(id: string): string {
  const segments = id.split("/").filter(Boolean);
  return slugifyStr(segments[segments.length - 1] ?? id);
}

/** 拆出日期路径片段：2025 / 06 / 30 */
export function getDiaryDateParts(
  pubDatetime: string | Date,
  entryTimezone?: string | null
) {
  const date = getDiaryDate(pubDatetime, entryTimezone);
  return {
    year: date.format("YYYY"),
    month: date.format("MM"),
    day: date.format("DD"),
  };
}

/**
 * 日记的正式链接，形如 `/diary/2025/06/30/quick-desktop-switch/`
 *
 * 日期在前、末段为条目 slug：既能一眼看出「哪一天」，又保证同一天多则日记互不冲突。
 * **末尾带斜杠**，与页面自身输出的 canonical 完全一致 —— 否则站内链接指向的是同一内容的
 * 另一种写法，爬虫跟进后还要再靠 canonical 纠正一次（部分托管平台还会为此多发一次 301）。
 */
export function getDiaryPath(
  id: string,
  data: Pick<DiaryData, "pubDatetime" | "timezone">
): string {
  const { year, month, day } = getDiaryDateParts(data.pubDatetime, data.timezone);
  return `${DIARY_BASE}/${year}/${month}/${day}/${getDiarySlug(id)}/`;
}

/** 供 `getStaticPaths` 使用的路由参数 */
export function getDiaryRouteParams(
  id: string,
  data: Pick<DiaryData, "pubDatetime" | "timezone">
) {
  const { year, month, day } = getDiaryDateParts(data.pubDatetime, data.timezone);
  return { year, month, day, slug: getDiarySlug(id) };
}

/**
 * 校验「同一天 + 同 slug」的冲突
 *
 * 链接里不含目录信息，因此同一天的两则日记若末段相同会互相覆盖。
 * 这里在构建期直接报错，避免静态产物静默丢页。
 */
export function assertUniqueDiaryPaths(entries: DiaryEntry[]): void {
  const seen = new Map<string, string[]>();

  for (const entry of entries) {
    const path = getDiaryPath(entry.id, entry.data);
    const owners = seen.get(path) ?? [];
    owners.push(entry.id);
    seen.set(path, owners);
  }

  const conflicts = [...seen.entries()].filter(([, owners]) => owners.length > 1);

  if (conflicts.length > 0) {
    const detail = conflicts
      .map(([path, owners]) => `  ${path}\n    ← ${owners.join("\n    ← ")}`)
      .join("\n");
    throw new Error(
      `日记链接冲突：以下条目落在同一天且 slug 相同，请修改文件名或 frontmatter 中的 slug。\n${detail}`
    );
  }
}
