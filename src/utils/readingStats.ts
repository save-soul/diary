/**
 * 篇幅与阅读时长
 *
 * 口径：**中文字按字计、西文按词计**，全篇统一（含代码块）。
 *
 * 之所以不用「去掉空白后的字符数」：那样会把代码里的每个符号都算进去，
 * 一篇以代码为主的日记会显示成「1.0 万字 · 约 33 分钟」，明显失真。
 * 现在首页概览与条目页共用这一口径，单则相加即等于总数。
 */

/** 正文篇幅：中文字数 + 西文词数 */
export function countChars(body: string): number {
  const text = body ?? "";

  const cjk =
    text.match(/[\u3400-\u4dbf\u4e00-\u9fff\uf900-\ufaff]/g)?.length ?? 0;
  const words = text.match(/[A-Za-z0-9][A-Za-z0-9'’_-]*/g)?.length ?? 0;

  return cjk + words;
}

/**
 * 估算阅读时长
 *
 * 中文阅读速度取 300 字/分钟（偏保守，长文不至于低估），不足一分钟记 1 分钟。
 */
export function getReadingMinutes(chars: number): number {
  return Math.max(1, Math.round(chars / 300));
}

/** 篇幅文本，如 `820 字` / `1.8 万字` */
export function formatChars(chars: number): string {
  if (chars >= 10000) return `${(chars / 10000).toFixed(1)} 万字`;
  return `${chars.toLocaleString("zh-CN")} 字`;
}
