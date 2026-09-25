import dayjs, { type Dayjs } from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import { SITE } from "@/config";

dayjs.extend(utc);
dayjs.extend(timezone);

/** 星期名，索引与 `Dayjs.day()` 对齐（0 = 星期日） */
export const WEEKDAYS = [
  "星期日",
  "星期一",
  "星期二",
  "星期三",
  "星期四",
  "星期五",
  "星期六",
] as const;

/** 月份名，索引与 `Dayjs.month()` 对齐 */
export const MONTHS = [
  "一月",
  "二月",
  "三月",
  "四月",
  "五月",
  "六月",
  "七月",
  "八月",
  "九月",
  "十月",
  "十一月",
  "十二月",
] as const;

/**
 * 把日期落到日记所在时区
 *
 * 静态站点在构建时求值，因此统一使用条目自身声明的时区（缺省为站点时区），
 * 保证「日期」与作者落笔当天的认知一致，而不受构建机器时区影响。
 */
export function toSiteTime(
  date: string | Date,
  entryTimezone?: string | null
): Dayjs {
  return dayjs(date).tz(entryTimezone || SITE.timezone);
}

/** 日记的「记录日期」：以发生日 pubDatetime 为准 */
export function getDiaryDate(
  pubDatetime: string | Date,
  entryTimezone?: string | null
): Dayjs {
  return toSiteTime(pubDatetime, entryTimezone);
}

/** 展示用日期，如 `2025年6月30日` */
export function formatDate(date: Dayjs): string {
  return date.format("YYYY年M月D日");
}

/** 紧凑日期，如 `2025-06-30` */
export function formatDateISO(date: Dayjs): string {
  return date.format("YYYY-MM-DD");
}

/** 星期，如 `星期一` */
export function formatWeekday(date: Dayjs): string {
  return WEEKDAYS[date.day()] ?? "";
}

/** 月份名，如 `六月` */
export function formatMonth(month: number): string {
  return MONTHS[month - 1] ?? `${month}月`;
}

/** 年表／时间线上的年份锚点，如 `2025` */
export function getYearAnchor(year: number): string {
  return String(year);
}

/** 年表／时间线上的月份锚点，如 `2025-06` */
export function getMonthAnchor(year: number, month: number): string {
  return `${year}-${String(month).padStart(2, "0")}`;
}

const pad2 = (value: number) => String(value).padStart(2, "0");

/** 周一起算的下标：周一 = 0 … 周日 = 6（中文习惯，而非 dayjs 默认的周日开头） */
const mondayIndex = (date: Dayjs) => (date.day() + 6) % 7;

/** 把一维日序切成「每周 7 天」 */
function toWeeks(cells: (string | null)[]): (string | null)[][] {
  const weeks: (string | null)[][] = [];
  for (let i = 0; i < cells.length; i += 7) {
    weeks.push(cells.slice(i, i + 7));
  }
  return weeks;
}

/**
 * 某年某月的日历网格
 *
 * 返回「每周 7 天」的行数组，`null` 为当月之外的补位空格；
 * 其余元素是 `YYYY-MM-DD`，可直接与条目日期比对。
 */
export function getMonthGrid(year: number, month: number): (string | null)[][] {
  const first = toSiteTime(`${year}-${pad2(month)}-01`);
  const cells: (string | null)[] = Array.from(
    { length: mondayIndex(first) },
    () => null
  );

  for (let day = 1; day <= first.daysInMonth(); day++) {
    cells.push(`${year}-${pad2(month)}-${pad2(day)}`);
  }
  while (cells.length % 7 !== 0) cells.push(null);

  return toWeeks(cells);
}

/**
 * 一整年的日历网格，用于记录热力图
 *
 * 外层是「列」（周），内层是 7 天，与热力图 `grid-flow-col grid-rows-7` 的排布一致。
 */
export function getYearGrid(year: number): (string | null)[][] {
  const first = toSiteTime(`${year}-01-01`);
  const last = toSiteTime(`${year}-12-31`);
  const start = first.subtract(mondayIndex(first), "day");

  const weeks: (string | null)[][] = [];
  for (
    let cursor = start;
    !cursor.isAfter(last, "day");
    cursor = cursor.add(7, "day")
  ) {
    const week: (string | null)[] = [];
    for (let offset = 0; offset < 7; offset++) {
      const day = cursor.add(offset, "day");
      week.push(day.year() === year ? day.format("YYYY-MM-DD") : null);
    }
    weeks.push(week);
  }

  return weeks;
}

/** 站点时区下的「今天」，形如 `2026-09-24` */
export function getTodayISO(): string {
  return toSiteTime(new Date()).format("YYYY-MM-DD");
}

/** 短星期名，周一开头，用于月历表头 */
export const WEEKDAYS_SHORT = [
  "一",
  "二",
  "三",
  "四",
  "五",
  "六",
  "日",
] as const;
