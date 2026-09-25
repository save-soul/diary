import { SITE } from "@/config";
import type { DiaryEntry } from "@/types";
import { getDiaryDate } from "./date";

/**
 * 是否可以被公开访问
 *
 * 除草稿外，还允许「未来日期」的条目先写好、到点才出现（留出一定的构建时间余量）。
 */
const postFilter = ({ data }: DiaryEntry) => {
  const isPublishTimePassed =
    Date.now() >
    getDiaryDate(data.pubDatetime, data.timezone).valueOf() -
      SITE.scheduledPostMargin;
  return !data.draft && (import.meta.env.DEV || isPublishTimePassed);
};

export default postFilter;
