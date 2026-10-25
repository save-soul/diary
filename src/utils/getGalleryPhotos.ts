import { getCollection } from "astro:content";
import type { ImageMetadata } from "astro";
import type { Dayjs } from "dayjs";
import { DIARY_PATH } from "@/content.config";
import type { DiaryEntry } from "@/types";
import { getDiaryDate } from "./date";
import { getDiaryPath } from "./getDiaryPath";
import getSortedEntries from "./getSortedEntries";

const IMAGE_EXT = /\.(jpe?g|png|webp|avif|gif)$/i;

/**
 * 日记目录里出现过的图片
 *
 * 构建期把 `src/data/diary/**` 下的图片收成「路径 → ImageMetadata」的表，
 * 这样正文里的相对引用才能解析成带尺寸的图片资源（Astro 会顺带做响应式优化）。
 */
const diaryImages = import.meta.glob<ImageMetadata>(
  "/src/data/diary/**/*.{jpg,jpeg,png,webp,avif,gif}",
  { eager: true, import: "default" }
);

/** Markdown 图片语法：`![说明](路径 "可选标题")` */
const BODY_IMAGE = /!\[([^\]]*)\]\(\s*([^)\s]+)(?:\s+"[^"]*")?\s*\)/g;

/**
 * 条目所在目录（相对日记内容根目录，带末尾斜杠）
 *
 * **不能从 `entry.id` 推断**：glob loader 会把 id 的路径段 slug 化（`Dev/xxx` → `dev/xxx`），
 * 而 `import.meta.glob` 的键是真实文件路径，两者大小写可能不同，查表就会落空。
 * 因此统一从 `entry.filePath`（源文件的真实路径）取目录。
 */
function entryDir(filePath: string | undefined): string {
  const normalized = (filePath ?? "").replace(/\\/g, "/");
  const marker = `${DIARY_PATH}/`;
  const index = normalized.indexOf(marker);
  if (index === -1) return "";
  return normalized.slice(index + marker.length).replace(/[^/]+$/, "");
}

/**
 * 把正文里的图片相对路径解析成图片资源
 *
 * 图片与 .md 放在同一目录，正文里用相对路径引用；`./` 与 `../` 交给 URL 处理。
 * 返回 undefined 表示这不是「日记目录里的本地图片」（外链、public 下的绝对路径都会被跳过）。
 */
function resolveEntryImage(
  entry: DiaryEntry,
  src: string
): ImageMetadata | undefined {
  if (!IMAGE_EXT.test(src) || src.startsWith("http") || src.startsWith("/")) {
    return undefined;
  }

  const dir = entryDir(entry.filePath);
  // new URL 会把中文等字符百分号编码，查表前要还原
  const relative = decodeURIComponent(
    new URL(src, `https://diary.invalid/${dir}`).pathname
  );
  const key = `/src/data/diary${relative}`.replace(/\/{2,}/g, "/");

  return diaryImages[key];
}

export interface GalleryPhoto {
  /** 唯一键，用于灯箱的索引 */
  key: string;
  image: ImageMetadata;
  /** 必填的替代文本（读屏靠它） */
  alt: string;
  /** 展示用的说明，可能为空 */
  caption?: string;
  location?: string;
  date: Dayjs;
  /** 来自日记正文时带上出处，便于点回那一则 */
  entry?: { title: string; href: string };
}

/**
 * 相册的全部照片
 *
 * 两个来源合并成一条时间线，由近及远：
 * 1. **日记正文里引用过的图片** —— 图片与 .md 放在同一目录，正文里用 `![说明](./图.jpg)` 引用；
 * 2. **单独上传的照片** —— `src/data/photos/` 下一图配一个 .md。
 *
 * 外链图片与 `public/` 下的绝对路径不计入（它们没有构建期元数据，无法生成响应式尺寸）。
 */
export async function getGalleryPhotos(): Promise<GalleryPhoto[]> {
  const photos: GalleryPhoto[] = [];

  const entries = getSortedEntries(await getCollection("diary"));
  for (const entry of entries) {
    const date = getDiaryDate(entry.data.pubDatetime, entry.data.timezone);
    const href = getDiaryPath(entry.id, entry.data);
    let index = 0;

    for (const match of (entry.body ?? "").matchAll(BODY_IMAGE)) {
      const image = resolveEntryImage(entry, match[2]);
      if (!image) continue;

      index += 1;
      const caption = match[1].trim();
      photos.push({
        key: `${entry.id}#${index}`,
        image,
        // 正文没写说明时，用「条目标题 + 日期」兜底，保证 alt 不为空
        alt:
          caption || `${entry.data.title}（${date.format("M 月 D 日")}的照片）`,
        caption: caption || undefined,
        date,
        entry: { title: entry.data.title, href },
      });
    }
  }

  for (const photo of await getCollection("photos")) {
    const { data } = photo;
    if (data.draft) continue;

    photos.push({
      key: `photo:${photo.id}`,
      image: data.image,
      alt: data.caption?.trim() || data.title,
      caption: data.caption,
      location: data.location,
      date: getDiaryDate(data.photographedAt, data.timezone),
    });
  }

  return photos.sort((a, b) => b.date.valueOf() - a.date.valueOf());
}

export interface GalleryYear {
  year: number;
  photos: GalleryPhoto[];
}

/** 按年份分组（由近及远），相册页按年渲染 */
export function groupGalleryByYear(photos: GalleryPhoto[]): GalleryYear[] {
  const years = new Map<number, GalleryPhoto[]>();

  for (const photo of photos) {
    const year = photo.date.year();
    years.set(year, [...(years.get(year) ?? []), photo]);
  }

  return [...years.entries()]
    .sort(([a], [b]) => b - a)
    .map(([year, list]) => ({ year, photos: list }));
}

export default getGalleryPhotos;
