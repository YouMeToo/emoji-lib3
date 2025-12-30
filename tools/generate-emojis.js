const fs = require('fs');
const path = require('path');

const repoEnv = process.env.REPO || '';
const [owner, name] = repoEnv.split('/');
const exts = new Set(['.png', '.jpg', '.jpeg', '.gif', '.webp']);

function walk(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap(d => {
    const p = path.join(dir, d.name);
    return d.isDirectory() ? walk(p) : p;
  });
}

function encPath(p) {
  return String(p).split(path.sep).map(s => encodeURIComponent(s)).join('/');
}

function toTags(file) {
  const base = path.basename(file).replace(/\.[^.]+$/, '');
  const parts = base.split(/[^\p{L}\p{N}]+/u).filter(Boolean);
  const folders = path.dirname(file).split(path.sep).filter(Boolean).slice(-2);
  const tags = Array.from(new Set([...folders, ...parts])).slice(0, 8);
  return tags.length ? tags : [base];
}

function main() {
  const files = walk('images').filter(f => exts.has(path.extname(f).toLowerCase()));
  const list = files.map(f => ({
    url: `https://cdn.jsdelivr.net/gh/${owner}/${name}@main/${encPath(f)}`,
    filename: path.basename(f),
    tags: toTags(f)
  }));
  fs.writeFileSync('emojis.json', JSON.stringify({ files: list }, null, 2));
  console.log(`Generated ${list.length} entries to emojis.json`);
}

main();
