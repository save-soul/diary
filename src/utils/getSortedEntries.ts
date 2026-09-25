import type { DiaryEntry } from "@/types";
import { getDiaryDate } from "./date";
import postFilter from "./postFilter";

/**
 * 按日记发生日期倒序排列
 *
 * 刻意不使用 modDatetime：日记的位置应当由「发生的那一天」决定，
 * 事后订正不该让旧日记跳回时间线顶端。
 */
const getSortedEntries = (entries: DiaryEntry[]) => {
  return [...entries].filter(postFilter).sort(
    (a, b) =>
      getDiaryDate(b.data.pubDatetime, b.data.timezone).valueOf() -
      getDiaryDate(a.data.pubDatetime, a.data.timezone).valueOf()
  );
};

export default getSortedEntries;
