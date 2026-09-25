import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

/** 日记内容目录：所有 Markdown 文件都会被收进 `diary` 集合 */
export const DIARY_PATH = "src/data/diary";

/**
 * 日记集合
 *
 * 关于 URL：条目的 `id` 由文件名推导（Astro glob loader 会把路径段归一化），
 * 若 frontmatter 中写了 `slug`，则该值会作为条目 id 的最后一段，用于决定链接末段。
 * 完整链接由 `@/utils/getDiaryPath` 依据日期生成，形如
 * `/diary/2025/06/30/quick-desktop-switch`，因此**同一天**的两则日记需要使用不同的
 * 文件名或 `slug`（构建时会显式报错提示冲突）。
 */
const diary = defineCollection({
  loader: glob({ pattern: "**/[^_]*.md", base: `./${DIARY_PATH}` }),
  schema: ({ image }) =>
    z.object({
      // 站点是单作者，作者名以 SITE.author 为准、在渲染时取值。
      // 这里**不要**写 `.default(SITE.author)`：默认值会被内容层缓存烘焙进条目数据，
      // 之后改 SITE.author 不会生效（曾因此让条目页的作者仍显示旧值）。
      author: z.string().optional(),
      /** 日记发生的日期，也是整站排序与归档的唯一依据 */
      pubDatetime: z.date(),
      /** 若日记事后被订正，可标记修改时间（会显示「更新于」） */
      modDatetime: z.date().optional().nullable(),
      title: z.string(),
      /** 值得重读的一则，会在首页单独置顶 */
      featured: z.boolean().optional(),
      draft: z.boolean().optional(),
      tags: z.array(z.string()).default(["others"]),
      ogImage: image().or(z.string()).optional(),
      /** 引言／当天的一句话概括 */
      description: z.string(),
      canonicalURL: z.string().optional(),
      hideEditPost: z.boolean().optional(),
      timezone: z.string().optional(),
      // ── 日记专属（均为可选，不写则对应位置不渲染）──
      weather: z.string().optional(), // 天气，如「晴」「小雨」
      location: z.string().optional(), // 地点，如「上海 · 家」
      mood: z.string().optional(), // 心情，如「平静」
    }),
});

export const collections = { diary };
