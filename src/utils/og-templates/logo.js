import fs from "node:fs";
import path from "node:path";

let cached;

/**
 * 把 `public/logo.png` 读成 data URI，供 satori 内联使用
 *
 * 分享图在构建期渲染，直接读文件比让 satori 去请求网络更稳；
 * 读一次就缓存，避免每个条目都重复读盘。
 */
export default function logoDataUri() {
  if (!cached) {
    const file = path.join(process.cwd(), "public", "logo.png");
    cached = `data:image/png;base64,${fs.readFileSync(file).toString("base64")}`;
  }
  return cached;
}
