import satori from "satori";
import { SITE } from "@/config";
import loadGoogleFonts from "../loadGoogleFont";
import logoDataUri from "./logo";
import { formatDate, formatWeekday, getDiaryDate } from "../date";

/* 分享图的视觉语言与站点一致：浅底、虚线、等宽字，主色取自 logo（#5B5FEF） */
const COLOR = {
  background: "#fdfdfd",
  ink: "#282728",
  muted: "#8a8a93",
  accent: "#5b5fef",
  line: "#e4e4e8",
};

const WIDTH = 1200;
const HEIGHT = 630;

/** 标题越长字号越小，避免被裁掉半行 */
function titleSize(title) {
  const length = [...title].length;
  if (length <= 18) return 64;
  if (length <= 30) return 54;
  if (length <= 44) return 44;
  return 38;
}

function text(content, style) {
  return { type: "div", props: { style, children: content } };
}

export default async post => {
  // 日记的分享图以「记录日期」为主角，而不是作者署名
  const date = getDiaryDate(post.data.pubDatetime, post.data.timezone);
  const dateLabel = formatDate(date);
  const weekday = formatWeekday(date);
  const hostname = new URL(SITE.website).hostname;

  return satori(
    {
      type: "div",
      props: {
        style: {
          width: "100%",
          height: "100%",
          display: "flex",
          background: COLOR.background,
        },
        children: [
          // 左侧主色竖条
          {
            type: "div",
            props: {
              style: {
                width: 12,
                height: "100%",
                background: COLOR.accent,
                flexShrink: 0,
              },
            },
          },
          // 内容区（虚线外框内）
          {
            type: "div",
            props: {
              style: {
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                flexGrow: 1,
                margin: "36px 36px 36px 28px",
                padding: "44px 48px",
                border: `2px dashed ${COLOR.line}`,
                borderRadius: 8,
              },
              children: [
                // 站名行
                {
                  type: "div",
                  props: {
                    style: {
                      display: "flex",
                      alignItems: "center",
                      gap: 20,
                    },
                    children: [
                      {
                        type: "img",
                        props: {
                          src: logoDataUri(),
                          width: 64,
                          height: 64,
                        },
                      },
                      {
                        type: "div",
                        props: {
                          style: { display: "flex", alignItems: "baseline", gap: 14 },
                          children: [
                            text(SITE.title, {
                              fontSize: 34,
                              fontWeight: 700,
                              color: COLOR.ink,
                              fontFamily: "Noto Sans SC",
                            }),
                            text(SITE.subtitle, {
                              fontSize: 24,
                              color: COLOR.muted,
                              fontFamily: "Noto Sans SC",
                            }),
                          ],
                        },
                      },
                    ],
                  },
                },
                // 标题
                text(post.data.title, {
                  fontSize: titleSize(post.data.title),
                  fontWeight: 700,
                  lineHeight: 1.4,
                  color: COLOR.ink,
                  fontFamily: "Noto Sans SC",
                  maxHeight: 300,
                  overflow: "hidden",
                }),
                // 底部：日期 + 域名
                {
                  type: "div",
                  props: {
                    style: {
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      borderTop: `2px dashed ${COLOR.line}`,
                      paddingTop: 24,
                    },
                    children: [
                      text(`${dateLabel} ${weekday}`, {
                        fontSize: 30,
                        fontWeight: 700,
                        color: COLOR.accent,
                        fontFamily: "Noto Sans SC",
                      }),
                      text(hostname, {
                        fontSize: 24,
                        color: COLOR.muted,
                        fontFamily: "IBM Plex Mono",
                      }),
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
    {
      width: WIDTH,
      height: HEIGHT,
      embedFont: true,
      fonts: await loadGoogleFonts(
        post.data.title +
          dateLabel +
          weekday +
          SITE.title +
          SITE.subtitle +
          hostname
      ),
    }
  );
};
