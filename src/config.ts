export const SITE = {
  website: "https://likeit.dev/", // replace this with your deployed domain
  author: "赵文光",
  createdYear: 2025, // 日记起始年份
  profile: "https://zwg.me/",
  title: "蓝色的海角",
  subtitle: "个人日记",
  desc: "在互联网上留下自己人生轨迹的个人日记本。按日期逐日记录生活、阅读与思考，用时间线串起散落的日常，也供偶然路过的人翻阅。",
  keywords:
    "个人日记, 日记本, 生活记录, 时间线, 人生轨迹, 日常随笔, 学习记录, 阅读笔记, 长期记录",
  // 默认分享图：由 src/pages/og.png.ts 在构建期用 satori 生成（1200×630，含 logo）
  // 条目页另有按日期生成的 /diary/YYYY/MM/DD/<slug>/index.png
  ogImage: "og.png",
  lightAndDarkMode: true,
  diaryPerIndex: 12, // 首页时光轴的条目预算（按「整年」截取，确保年份计数与事实一致）
  diaryPerPage: 20, // 时光轴每页的条目预算（按「整年」分页，不切开任何一年）
  scheduledPostMargin: 15 * 60 * 1000, // 15 minutes
  showArchives: true, // 是否展示年表（按年月检视全部日记）
  showBackButton: true, // show back button in entry detail
  editPost: {
    enabled: true,
    text: "编辑这一则",
    url: "https://github.com/save-soul/blog/edit/main/",
  },
  dynamicOgImage: true,
  dir: "ltr", // "rtl" | "auto"
  lang: "zh-CN", // html lang code. Set this empty and default will be "en"
  ogLocale: "zh_CN", // Open Graph 的 og:locale 用下划线写法（zh_CN）
  timezone: "Asia/Shanghai", // Default global timezone (IANA format) https://en.wikipedia.org/wiki/List_of_tz_database_time_zones
  welcome: {
    title: "赵文光",
    description:
      "首先要闭上嘴巴——不要观众了，学着自我评断。专注保养身体之余亦不忘追求人生的意义。放下一切身段，致力于一种双重的解放——对于金钱以及自己的虚荣和怯懦。生活要有规律。花两年来想通一件事其实不算浪费人生。要把之前的那些习惯改掉，先全心全力地记取教训，然后再耐心地去学习。",
    rssLabel: "RSS Feed",
  },
  artalk: {
    enabled: true, // 是否启用 Artalk 评论
    server: "https://artalk.likeit.dev", // Artalk 后端地址
    site: "蓝色的海角", // 站点名称（需与后端配置的 Site 一致，留空则使用访问域名）
  },
} as const;
