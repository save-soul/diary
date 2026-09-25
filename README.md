# 蓝色的海角 · 个人日记本

一个按时间线组织的公开个人日记站。基于 AstroPaper 主题改造：保留原有的排版风格与明暗主题，把「博客文章」的组织方式换成以日期为核心的日记形态。

## 怎么写一则日记

内容放在 `src/data/diary/` 下，子目录可以任意组织（只影响文件管理，不影响链接）。直接在目录里新建 `.md` 文件即可：

```md
---
title: 今天把旧键盘拆了
pubDatetime: 2026-09-23T22:10:00+08:00
description: 拆开之后才发现，落灰最多的地方是我从来没按过的那些键。
tags:
  - 日常
  - 折腾
weather: 晴            # 可选
location: 上海 · 家      # 可选
mood: 平静              # 可选
---

正文……
```

- **`pubDatetime` 是整站的核心**：决定条目在时光轴、年表里的位置，也决定它的链接。
  链接规则为 `/diary/YYYY/MM/DD/<slug>`，`<slug>` 默认取文件名，
  可通过 frontmatter 的 `slug` 指定；同一天写两则时请确保 `slug` 不同（否则构建会直接报错提示）。
- `weather` / `location` / `mood` 是日记专属的可选字段，不写就不显示。
- 想事后订正又不想让旧日记跳回时间线顶端，加 `modDatetime` 即可（排序始终以 `pubDatetime` 为准）。
- `featured: true` 会在这一则的日期旁显示「值得重读」标记；排序仍按时间，不打乱先后。
- `draft: true` 不发布；写未来日期则到点才出现。

## 站点的几个入口

| 路径 | 作用 |
| :--- | :--- |
| `/` | 首页：简介、概览统计、**往年今天**、时光轴（按「整年」截取，年份计数即真实条数）、随便翻一则 |
| `/diary/` | 全部日记的时间线，按年/月分组；分页同样**不切开年份**（第 2 页起为 `/diary/2`） |
| `/calendar/` | 日历：年份切换 + 记录密度热力图 + 12 张月历（点亮的日期可直接点开当天日记） |
| `/archives/` | 年表：年 → 月 → 日的总目录，带锚点便于跳转 |
| `/tags/` | 标签索引，按出现频次排列，用于回溯同一主题 |
| `/search/` | 全文搜索（Pagefind） |

> 时间线里的「N 则」一律是**该年份／月份的真实条数**。首页按整年取用、时光轴按整年分页，
> 都是为了不出现「标题写着 2 则、实际有 3 则」这种自相矛盾。
> 代价是：某一年写得特别多时，它会独占一页（宁可比 `diaryPerPage` 长，也不把它切开）。

正文页的几处约定：

- **目录**：小标题 ≥ 3 个时，正文前会出现可折叠的「本文目录」（≥ 9 节默认收起）。由
  `render()` 返回的 `headings` 生成，不依赖任何 markdown 插件。
- **篇幅与阅读时长**：中文字按字、西文按词，**含代码块**；速度按 300 字/分钟估算。
  首页概览的「累计写下约 X 字」与条目页的「篇幅」共用同一口径，因此单则相加即等于总数。
- **往年今天**：与「随便翻一则」共用首页内嵌的一份条目清单（日期/路径/标题），在浏览器端计算，
  所以「今天」以读者的本机日期为准，不会随构建时间过期。

维护脚本：

## 标志与分享图

- **标志**：`public/logo.png`（羽毛笔，主色 `#5B5FEF`，256×256 透明底）。它同时用于三处：
  页头品牌位（28px，暗色下 `dark:brightness-125` 提亮）、
  `npm run favicons` 生成的站点图标、以及构建期渲染的分享图。
- **分享图**：两张都会在构建期用 satori 渲染成 1200×630 的 PNG，视觉语言与站点一致（浅底 + 虚线外框 + 左侧主色竖条），
  logo 以 data URI 内联。
  - 非条目页（首页 / 日历 / 年表 / 标签 / 搜索…）共用 `/og.png`，对应 `src/pages/og.png.ts` 与 `src/utils/og-templates/site.js`；
  - 条目页各自生成 `/diary/YYYY/MM/DD/<slug>/index.png`，对应 `src/utils/og-templates/post.js`；
  - 想换默认分享图，改 `src/utils/og-templates/site.js` 即可（`SITE.ogImage` 指向 `og.png`）。

```bash
npm run favicons    # 由 public/logo.png 生成 favicon.ico(16/32/48) / favicon-32.png / apple-touch-icon.png(180)
npm run check:tags  # 标签体检：频率分布、只出现一次的标签（--suggest 给出疑似同义，--strict 用于 CI）
```

改造前的 `/posts/*` 链接**已废弃**，不再做兼容跳转，访问会落到 404 页；链接规则只认 `/diary/YYYY/MM/DD/<slug>`。

---

# AstroPaper 📄

[![Figma](https://img.shields.io/badge/Figma-F24E1E?style=for-the-badge&logo=figma&logoColor=white)](https://www.figma.com/community/file/1356898632249991861)
![Typescript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![GitHub](https://img.shields.io/github/license/satnaing/astro-paper?color=%232F3741&style=for-the-badge)
[![Conventional Commits](https://img.shields.io/badge/Conventional%20Commits-1.0.0-%23FE5196?logo=conventionalcommits&logoColor=white&style=for-the-badge)](https://conventionalcommits.org)
[![Commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg?style=for-the-badge)](http://commitizen.github.io/cz-cli/)

AstroPaper is a minimal, responsive, accessible and SEO-friendly Astro blog theme. This theme is designed and crafted based on [my personal blog](https://satnaing.dev/blog).

Read [the blog posts](https://astro-paper.pages.dev/posts/) or check [the README Documentation Section](#-documentation) for more info.

## 🔥 Features

- [x] type-safe markdown
- [x] super fast performance
- [x] accessible (Keyboard/VoiceOver)
- [x] responsive (mobile ~ desktops)
- [x] SEO-friendly
- [x] light & dark mode
- [x] fuzzy search
- [x] draft posts & pagination
- [x] sitemap & rss feed
- [x] followed best practices
- [x] highly customizable
- [x] dynamic OG image generation for blog posts [#15](https://github.com/satnaing/astro-paper/pull/15) ([Blog Post](https://astro-paper.pages.dev/posts/dynamic-og-image-generation-in-astropaper-blog-posts/))

_Note: I've tested screen-reader accessibility of AstroPaper using **VoiceOver** on Mac and **TalkBack** on Android. I couldn't test all other screen-readers out there. However, accessibility enhancements in AstroPaper should be working fine on others as well._

## ✅ Lighthouse Score

<p align="center">
  <a href="https://pagespeed.web.dev/report?url=https%3A%2F%2Fastro-paper.pages.dev%2F&form_factor=desktop">
    <img width="710" alt="AstroPaper Lighthouse Score" src="AstroPaper-lighthouse-score.svg">
  <a>
</p>

## 🚀 Project Structure

Inside of AstroPaper, you'll see the following folders and files:

```bash
/
├── public/
│   ├── assets/
|   ├── pagefind/ # auto-generated when build
│   └── favicon.svg
│   └── astropaper-og.jpg
│   └── favicon.svg
│   └── toggle-theme.js
├── src/
│   ├── assets/
│   │   └── icons/
│   │   └── images/
│   ├── components/
│   ├── data/
│   │   └── blog/
│   │       └── some-blog-posts.md
│   ├── layouts/
│   └── pages/
│   └── styles/
│   └── utils/
│   └── config.ts
│   └── constants.ts
│   └── content.config.ts
└── astro.config.ts
```

Astro looks for `.astro` or `.md` files in the `src/pages/` directory. Each page is exposed as a route based on its file name.

Any static assets, like images, can be placed in the `public/` directory.

All blog posts are stored in `src/data/blog` directory.

## 📖 Documentation

Documentation can be read in two formats\_ _markdown_ & _blog post_.

- Configuration - [markdown](src/data/blog/how-to-configure-astropaper-theme.md) | [blog post](https://astro-paper.pages.dev/posts/how-to-configure-astropaper-theme/)
- Add Posts - [markdown](src/data/blog/adding-new-post.md) | [blog post](https://astro-paper.pages.dev/posts/adding-new-posts-in-astropaper-theme/)
- Customize Color Schemes - [markdown](src/data/blog/customizing-astropaper-theme-color-schemes.md) | [blog post](https://astro-paper.pages.dev/posts/customizing-astropaper-theme-color-schemes/)
- Predefined Color Schemes - [markdown](src/data/blog/predefined-color-schemes.md) | [blog post](https://astro-paper.pages.dev/posts/predefined-color-schemes/)

## 💻 Tech Stack

**Main Framework** - [Astro](https://astro.build/)  
**Type Checking** - [TypeScript](https://www.typescriptlang.org/)  
**Styling** - [TailwindCSS](https://tailwindcss.com/)  
**UI/UX** - [Figma Design File](https://www.figma.com/community/file/1356898632249991861)  
**Static Search** - [FuseJS](https://pagefind.app/)  
**Icons** - [Tablers](https://tabler-icons.io/)  
**Code Formatting** - [Prettier](https://prettier.io/)  
**Deployment** - [Cloudflare Pages](https://pages.cloudflare.com/)  
**Illustration in About Page** - [https://freesvgillustration.com](https://freesvgillustration.com/)  
**Linting** - [ESLint](https://eslint.org)

## 👨🏻‍💻 Running Locally

You can start using this project locally by running the following command in your desired directory:

```bash
# pnpm
pnpm create astro@latest --template satnaing/astro-paper

# npm
npm create astro@latest -- --template satnaing/astro-paper

# yarn
yarn create astro --template satnaing/astro-paper

# bun
bun create astro@latest -- --template satnaing/astro-paper
```

Then start the project by running the following commands:

```bash
# install dependencies if you haven't done so in the previous step.
pnpm install

# start running the project
pnpm run dev
```

As an alternative approach, if you have Docker installed, you can use Docker to run this project locally. Here's how:

```bash
# Build the Docker image
docker build -t astropaper .

# Run the Docker container
docker run -p 4321:80 astropaper
```

## Google Site Verification (optional)

You can easily add your [Google Site Verification HTML tag](https://support.google.com/webmasters/answer/9008080#meta_tag_verification&zippy=%2Chtml-tag) in AstroPaper using an environment variable. This step is optional. If you don't add the following environment variable, the google-site-verification tag won't appear in the HTML `<head>` section.

```bash
# in your environment variable file (.env)
PUBLIC_GOOGLE_SITE_VERIFICATION=your-google-site-verification-value
```

> See [this discussion](https://github.com/satnaing/astro-paper/discussions/334#discussioncomment-10139247) for adding AstroPaper to the Google Search Console.

## 🧞 Commands

All commands are run from the root of the project, from a terminal:

> **_Note!_** For `Docker` commands we must have it [installed](https://docs.docker.com/engine/install/) in your machine.

| Command                              | Action                                                                                                                           |
| :----------------------------------- | :------------------------------------------------------------------------------------------------------------------------------- |
| `pnpm install`                       | Installs dependencies                                                                                                            |
| `pnpm run dev`                       | Starts local dev server at `localhost:4321`                                                                                      |
| `pnpm run build`                     | Build your production site to `./dist/`                                                                                          |
| `pnpm run preview`                   | Preview your build locally, before deploying                                                                                     |
| `pnpm run format:check`              | Check code format with Prettier                                                                                                  |
| `pnpm run format`                    | Format codes with Prettier                                                                                                       |
| `pnpm run sync`                      | Generates TypeScript types for all Astro modules. [Learn more](https://docs.astro.build/en/reference/cli-reference/#astro-sync). |
| `pnpm run lint`                      | Lint with ESLint                                                                                                                 |
| `docker compose up -d`               | Run AstroPaper on docker, You can access with the same hostname and port informed on `dev` command.                              |
| `docker compose run app npm install` | You can run any command above into the docker container.                                                                         |
| `docker build -t astropaper .`       | Build Docker image for AstroPaper.                                                                                               |
| `docker run -p 4321:80 astropaper`   | Run AstroPaper on Docker. The website will be accessible at `http://localhost:4321`.                                             |

> **_Warning!_** Windows PowerShell users may need to install the [concurrently package](https://www.npmjs.com/package/concurrently) if they want to [run diagnostics](https://docs.astro.build/en/reference/cli-reference/#astro-check) during development (`astro check --watch & astro dev`). For more info, see [this issue](https://github.com/satnaing/astro-paper/issues/113).

## ✨ Feedback & Suggestions

If you have any suggestions/feedback, you can contact me via [my email](mailto:contact@satnaing.dev). Alternatively, feel free to open an issue if you find bugs or want to request new features.

## 📜 License

Licensed under the MIT License, Copyright © 2025

---

Made with 🤍 by [Sat Naing](https://satnaing.dev) 👨🏻‍💻 and [contributors](https://github.com/satnaing/astro-paper/graphs/contributors).
