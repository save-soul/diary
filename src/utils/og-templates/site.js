import satori from "satori";
import { SITE } from "@/config";
import loadGoogleFonts from "../loadGoogleFont";
import logoDataUri from "./logo";

/* 与条目分享图同一套视觉语言，主色取自 logo */
const COLOR = {
  background: "#fdfdfd",
  ink: "#282728",
  muted: "#8a8a93",
  accent: "#5b5fef",
  line: "#e4e4e8",
};

export default async () => {
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
          {
            type: "div",
            props: {
              style: {
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "space-between",
                flexGrow: 1,
                margin: "36px 36px 36px 28px",
                padding: "52px 64px",
                border: `2px dashed ${COLOR.line}`,
                borderRadius: 8,
              },
              children: [
                // 主视觉：标志 + 站名 + 副标题
                {
                  type: "div",
                  props: {
                    style: {
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      flexGrow: 1,
                    },
                    children: [
                      {
                        type: "img",
                        props: { src: logoDataUri(), width: 132, height: 132 },
                      },
                      {
                        type: "div",
                        props: {
                          style: {
                            display: "flex",
                            alignItems: "baseline",
                            gap: 18,
                            marginTop: 28,
                          },
                          children: [
                            {
                              type: "div",
                              props: {
                                style: {
                                  fontSize: 68,
                                  fontWeight: 700,
                                  color: COLOR.ink,
                                  fontFamily: "Noto Sans SC",
                                },
                                children: SITE.title,
                              },
                            },
                            {
                              type: "div",
                              props: {
                                style: {
                                  fontSize: 30,
                                  letterSpacing: 2,
                                  color: COLOR.muted,
                                  fontFamily: "Noto Sans SC",
                                },
                                children: SITE.subtitle,
                              },
                            },
                          ],
                        },
                      },
                    ],
                  },
                },
                // 底部域名
                {
                  type: "div",
                  props: {
                    style: {
                      display: "flex",
                      justifyContent: "flex-end",
                      width: "100%",
                      fontSize: 24,
                      color: COLOR.muted,
                      fontFamily: "IBM Plex Mono",
                    },
                    children: hostname,
                  },
                },
              ],
            },
          },
        ],
      },
    },
    {
      width: 1200,
      height: 630,
      embedFont: true,
      // 必须把图上会出现的所有字符都拼进来（字体是按字符裁剪的子集）
      fonts: await loadGoogleFonts(SITE.title + SITE.subtitle + hostname),
    }
  );
};
