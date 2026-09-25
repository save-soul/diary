/**
 * 生成站点图标（favicon.ico / favicon-32.png / apple-touch-icon.png）
 *
 * 源图 `public/logo.png`（256×256，透明底，羽毛笔标志，主色 #5B5FEF）。
 * 源图里笔尖顶到了画布边缘，所以这里统一**留出安全边距**再居中，
 * 避免在浏览器标签页、iOS 圆角、Android 遮罩里被切掉。
 *
 * 用法：node scripts/build-favicons.mjs
 */
import sharp from "sharp";
import fs from "fs";

const SRC = "public/logo.png";
const OUT_DIR = "public";

/** 标志在画布中的占比：小尺寸留一点呼吸空间，iOS 圆角再多留一点 */
const RATIO = { icon: 0.86, apple: 0.78 };

const ICO_SIZES = [16, 32, 48];
const PNG_ICON_SIZE = 32;
const APPLE_TOUCH_SIZE = 180;

/** 苹果触摸图标用不透明白底（iOS 不做透明处理，圆角由系统裁） */
const APPLE_BACKGROUND = { r: 255, g: 255, b: 255, alpha: 1 };

await sharp(SRC)
  .metadata()
  .then(m => console.log(`源图: ${m.width}×${m.height} logo.png`));

/** 把标志缩放到「canvas × ratio」并居中合成到方形画布上 */
async function render(size, ratio, background) {
  const inner = Math.round(size * ratio);
  const mark = await sharp(SRC)
    .resize(inner, inner, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer();
  const offset = Math.round((size - inner) / 2);

  return sharp({
    create: { width: size, height: size, channels: 4, background },
  })
    .composite([{ input: mark, left: offset, top: offset }])
    .png({ palette: true, quality: 95, compressionLevel: 9 })
    .toBuffer();
}

/** 把若干 PNG 打包成 ICO（现代浏览器均支持以 PNG 为载荷的 ICO） */
function buildIco(images) {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0); // reserved
  header.writeUInt16LE(1, 2); // 1 = icon
  header.writeUInt16LE(images.length, 4);

  let offset = 6 + images.length * 16;
  const entries = [];
  for (const { size, buf } of images) {
    const entry = Buffer.alloc(16);
    entry.writeUInt8(size >= 256 ? 0 : size, 0); // 宽（256 记 0）
    entry.writeUInt8(size >= 256 ? 0 : size, 1); // 高
    entry.writeUInt8(0, 2); // 调色板数
    entry.writeUInt8(0, 3); // reserved
    entry.writeUInt16LE(1, 4); // color planes
    entry.writeUInt16LE(32, 6); // bits per pixel
    entry.writeUInt32LE(buf.length, 8);
    entry.writeUInt32LE(offset, 12);
    offset += buf.length;
    entries.push(entry);
  }

  return Buffer.concat([header, ...entries, ...images.map(i => i.buf)]);
}

const transparent = { r: 0, g: 0, b: 0, alpha: 0 };

const icoImages = [];
for (const size of ICO_SIZES) {
  icoImages.push({ size, buf: await render(size, RATIO.icon, transparent) });
}

const written = [
  [`${OUT_DIR}/favicon.ico`, buildIco(icoImages)],
  [`${OUT_DIR}/favicon-32.png`, await render(PNG_ICON_SIZE, RATIO.icon, transparent)],
  [
    `${OUT_DIR}/apple-touch-icon.png`,
    await render(APPLE_TOUCH_SIZE, RATIO.apple, APPLE_BACKGROUND),
  ],
];

let total = 0;
for (const [file, buf] of written) {
  fs.writeFileSync(file, buf);
  total += buf.length;
  console.log(`  ${file.padEnd(32)} ${(buf.length / 1024).toFixed(1)} KB`);
}
console.log(`合计 ${(total / 1024).toFixed(1)} KB`);
