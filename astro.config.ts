import { defineConfig, envField } from "astro/config";
import tailwindcss from "@tailwindcss/vite";
import sitemap from "@astrojs/sitemap";
import {
  transformerNotationDiff,
  transformerNotationHighlight,
  transformerNotationWordHighlight,
} from "@shikijs/transformers";
import { transformerFileName } from "./src/utils/transformers/fileName";
import { SITE } from "./src/config";

// https://astro.build/config
// 站点地图：
// - 排除搜索页（没有可索引的内容，页面本身也已标 noindex）
// - 每条 URL 补 lastmod：条目页用「记录日期」，其余页面用构建时间
//   （首页／年表／日历／标签都会随新日记变化，构建时间就是它们的真实更新时间）
const buildTime = new Date();

export default defineConfig({
  site: SITE.website,
  integrations: [
    sitemap({
      filter: page =>
        !page.endsWith("/search/") &&
        (SITE.showArchives || !page.endsWith("/archives")),
      serialize(item) {
        const entryDate = item.url.match(/\/diary\/(\d{4})\/(\d{2})\/(\d{2})\//);
        item.lastmod = entryDate
          ? `${entryDate[1]}-${entryDate[2]}-${entryDate[3]}T00:00:00.000Z`
          : buildTime.toISOString();
        return item;
      },
    }),
  ],
  markdown: {
    // 原先的 remark-toc / remark-collapse 对本站内容不生效
    // （remark-toc 需要正文里存在 “Table of contents” 标题才会插入目录），
    // 目录改由 src/layouts/DiaryEntry.astro 用 render() 的 headings 渲染。
    shikiConfig: {
      // For more themes, visit https://shiki.style/themes
      themes: { light: "min-light", dark: "night-owl" },
      defaultColor: false,
      wrap: false,
      transformers: [
        transformerFileName({ style: "v2", hideDot: false }),
        transformerNotationHighlight(),
        transformerNotationWordHighlight(),
        transformerNotationDiff({ matchAlgorithm: "v3" }),
      ],
    },
  },
  vite: {
    // eslint-disable-next-line
    // @ts-ignore
    // This will be fixed in Astro 6 with Vite 7 support
    // See: https://github.com/withastro/astro/issues/14030
    plugins: [tailwindcss()],
    optimizeDeps: {
      exclude: ["@resvg/resvg-js"],
    },
  },
  image: {
    responsiveStyles: true,
    layout: "constrained",
  },
  env: {
    schema: {
      PUBLIC_GOOGLE_SITE_VERIFICATION: envField.string({
        access: "public",
        context: "client",
        optional: true,
      }),
    },
  },
  experimental: {
    preserveScriptOrder: true,
  },
});
