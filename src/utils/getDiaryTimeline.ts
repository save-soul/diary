import type { DiaryEntry } from "@/types";
import { getDiaryDate } from "./date";

export interface DiaryMonthGroup {
  month: number;
  entries: DiaryEntry[];
}

export interface DiaryYearGroup {
  year: number;
  count: number;
  months: DiaryMonthGroup[];
}

/**
 * 把日记按「年 → 月」分组，组内与组间均为时间倒序
 *
 * 时间线、年表都基于这一份分组结果，保证两处呈现的先后顺序完全一致。
 */
export function getDiaryTimeline(entries: DiaryEntry[]): DiaryYearGroup[] {
  const sorted = [...entries].sort(
    (a, b) =>
      getDiaryDate(b.data.pubDatetime, b.data.timezone).valueOf() -
      getDiaryDate(a.data.pubDatetime, a.data.timezone).valueOf()
  );

  const years = new Map<number, Map<number, DiaryEntry[]>>();

  for (const entry of sorted) {
    const date = getDiaryDate(entry.data.pubDatetime, entry.data.timezone);
    const year = date.year();
    const month = date.month() + 1;

    const months = years.get(year) ?? new Map<number, DiaryEntry[]>();
    const monthEntries = months.get(month) ?? [];
    monthEntries.push(entry);
    months.set(month, monthEntries);
    years.set(year, months);
  }

  return [...years.entries()]
    .sort(([yearA], [yearB]) => yearB - yearA)
    .map(([year, months]) => ({
      year,
      count: [...months.values()].reduce((sum, list) => sum + list.length, 0),
      months: [...months.entries()]
        .sort(([monthA], [monthB]) => monthB - monthA)
        .map(([month, monthEntries]) => ({ month, entries: monthEntries })),
    }));
}

/**
 * 按预算裁剪时间线，但**只保留完整的年份**
 *
 * 计数必须是真话：如果某个年份只列出其中几则，标题上的「N 则」就会与事实不符。
 * 因此这里不做「一刀切到第 N 条」，而是从最新的一年开始整年纳入，装不下就整年舍去；
 * 最新的一年无论多少都完整保留，避免首页出现空档。
 */
export function limitTimeline(
  groups: DiaryYearGroup[],
  budget?: number
): DiaryYearGroup[] {
  if (!budget || budget <= 0) return groups;

  const limited: DiaryYearGroup[] = [];
  let used = 0;

  for (const group of groups) {
    if (used > 0 && used + group.count > budget) break;
    limited.push(group);
    used += group.count;
  }

  return limited;
}

/**
 * 把年份分组切成「页」，且**不切开任何一年**
 *
 * 每页尽量装到 budget 条，但从不在年份中间断开：装不下就整年挪到下一页。
 * 单一年份本身就超过预算时，它独占一页 —— 宁可一页长一点，也不让「N 则」说谎。
 */
export function paginateTimeline(
  groups: DiaryYearGroup[],
  budget: number
): DiaryYearGroup[][] {
  if (groups.length === 0) return [[]];
  if (!budget || budget <= 0) return [groups];

  const pages: DiaryYearGroup[][] = [];
  let current: DiaryYearGroup[] = [];
  let used = 0;

  for (const group of groups) {
    if (used > 0 && used + group.count > budget) {
      pages.push(current);
      current = [];
      used = 0;
    }
    current.push(group);
    used += group.count;
  }

  if (current.length > 0) pages.push(current);

  return pages;
}

export default getDiaryTimeline;
