/**
 * 标签体检
 *
 * 标签页的价值来自「同一主题能聚起几则」。只出现一次的标签会把它摊薄成噪声 ——
 * 这个脚本把分布摊开来看，便于决定合并哪些。
 *
 * 用法：
 *   node scripts/check-tags.mjs          只看报告
 *   node scripts/check-tags.mjs --strict 存在「只用过一次」的标签时以非 0 退出（可挂到 CI）
 *   node scripts/check-tags.mjs --suggest 额外给出疑似同义的候选（按名字包含关系）
 */
import fs from "fs";
import path from "path";

const DIR = "src/data/diary";
const flags = new Set(process.argv.slice(2));

const walk = dir =>
  fs
    .readdirSync(dir, { withFileTypes: true })
    .flatMap(entry =>
      entry.isDirectory()
        ? walk(path.join(dir, entry.name))
        : [path.join(dir, entry.name)]
    );

/** 取出 frontmatter 里的 tags（支持 `- x` 列表与 `[a, b]` 行内两种写法） */
function readTags(file) {
  const raw = fs.readFileSync(file, "utf8");
  const frontmatter = raw.split(/^---\s*$/m)[1] ?? "";
  const lines = frontmatter.split("\n");

  const inline = frontmatter.match(/^tags:\s*\[(.*)\]\s*$/m);
  if (inline) {
    return inline[1]
      .split(",")
      .map(value => value.trim().replace(/^["']|["']$/g, ""))
      .filter(Boolean);
  }

  const start = lines.findIndex(line => /^tags:\s*$/.test(line));
  if (start === -1) return [];

  const tags = [];
  for (const line of lines.slice(start + 1)) {
    const item = line.match(/^\s*-\s*(.+?)\s*$/);
    if (!item) break;
    tags.push(item[1].replace(/^["']|["']$/g, ""));
  }
  return tags;
}

const files = walk(DIR).filter(file => file.endsWith(".md") && !path.basename(file).startsWith("_"));

const usage = new Map();
for (const file of files) {
  for (const tag of readTags(file)) {
    const record = usage.get(tag) ?? { count: 0, entries: [] };
    record.count += 1;
    record.entries.push(path.basename(file, ".md"));
    usage.set(tag, record);
  }
}

const ranked = [...usage.entries()].sort(
  (a, b) => b[1].count - a[1].count || a[0].localeCompare(b[0], "zh")
);

const once = ranked.filter(([, record]) => record.count === 1);
const total = ranked.reduce((sum, [, record]) => sum + record.count, 0);

console.log(`条目 ${files.length} 篇，标签 ${ranked.length} 个，共被使用 ${total} 次`);
console.log(`只用过一次的标签：${once.length} 个（占 ${((once.length / ranked.length) * 100).toFixed(0)}%）\n`);

console.log("分布：");
for (const [tag, record] of ranked) {
  console.log(`  ${String(record.count).padStart(2)} 次  #${tag}`);
}

if (once.length > 0) {
  console.log("\n只出现一次（合并候选）：");
  for (const [tag, record] of once) {
    console.log(`  #${tag}  ←  ${record.entries.join(" / ")}`);
  }
}

if (flags.has("--suggest")) {
  console.log("\n疑似同义（名称互相包含，仅供参考）：");
  const names = ranked.map(([tag]) => tag);
  let found = 0;
  for (const a of names) {
    for (const b of names) {
      if (a === b) continue;
      const lower = [a.toLowerCase(), b.toLowerCase()];
      if (lower[0].includes(lower[1]) && lower[0] !== lower[1]) {
        console.log(`  #${a} ⊃ #${b}`);
        found++;
      }
    }
  }
  if (found === 0) console.log("  （无）");
}

if (flags.has("--strict") && once.length > 0) {
  console.error(`\n✗ 有 ${once.length} 个标签只用过一次，建议合并或改用更通用的名称。`);
  process.exit(1);
}
