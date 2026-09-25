import type { Dayjs } from "dayjs";
import type { DiaryEntry } from "@/types";
import { getDiaryDate } from "./date";
import { countChars } from "./readingStats";
import getUniqueTags from "./getUniqueTags";

export interface DiaryStats {
  /** 日记则数 */
  total: number;
  /** 有记录的天数（一天多则只计一天） */
  days: number;
  /** 用到的标签数 */
  tags: number;
  /** 正文字数：中文字按字、西文按词，不含代码块（与条目页「篇幅」同口径） */
  chars: number;
  /** 记录跨越的年份数 */
  years: number;
  /** 最早一则 */
  firstDate: Dayjs | null;
  /** 最近一则 */
  lastDate: Dayjs | null;
}

const EMPTY_STATS: DiaryStats = {
  total: 0,
  days: 0,
  tags: 0,
  chars: 0,
  years: 0,
  firstDate: null,
  lastDate: null,
};

/**
 * 日记本的整体概览，用于首页与年表页的统计区
 *
 * 全部在构建期算好：静态站点不必让浏览器重复这些计算。
 */
export function getDiaryStats(entries: DiaryEntry[]): DiaryStats {
  if (entries.length === 0) return EMPTY_STATS;

  const dates = entries.map(entry =>
    getDiaryDate(entry.data.pubDatetime, entry.data.timezone)
  );

  const earliest = dates.reduce((min, date) =>
    date.valueOf() < min.valueOf() ? date : min
  );
  const latest = dates.reduce((max, date) =>
    date.valueOf() > max.valueOf() ? date : max
  );

  return {
    total: entries.length,
    days: new Set(dates.map(date => date.format("YYYY-MM-DD"))).size,
    tags: getUniqueTags(entries).length,
    // 口径与条目页的「篇幅」一致：中文字按字、西文按词，不含代码块
    chars: entries.reduce(
      (sum, entry) => sum + countChars(entry.body ?? ""),
      0
    ),
    years: latest.year() - earliest.year() + 1,
    firstDate: earliest,
    lastDate: latest,
  };
}

export default getDiaryStats;
