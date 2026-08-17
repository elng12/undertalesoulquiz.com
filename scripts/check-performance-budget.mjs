import { readdir, stat } from 'node:fs/promises';
import { extname, join, relative } from 'node:path';

const root = new URL('../dist/', import.meta.url);
const files = await walk(root.pathname);
const budgetFiles = files;
const socialImagePaths = new Set(['og-undertale-soul-quiz.jpg']);
const siteVerificationPaths = new Set(['BingSiteAuth.xml']);
const runtimeFiles = budgetFiles.filter((file) => {
  const path = relative(root.pathname, file.path);
  return !socialImagePaths.has(path) && !siteVerificationPaths.has(path);
});
const socialImageFiles = budgetFiles.filter((file) => socialImagePaths.has(relative(root.pathname, file.path)));
const groups = {
  javascript: sumByExtension(runtimeFiles, ['.js']),
  css: sumByExtension(runtimeFiles, ['.css']),
  html: sumByExtension(runtimeFiles, ['.html']),
  images: sumByExtension(runtimeFiles, ['.avif', '.gif', '.jpg', '.jpeg', '.png', '.svg', '.webp']),
  fonts: sumByExtension(runtimeFiles, ['.otf', '.ttf', '.woff', '.woff2']),
  social: socialImageFiles.reduce((sum, file) => sum + file.size, 0),
  total: runtimeFiles.reduce((sum, file) => sum + file.size, 0),
};

const budgets = {
  javascript: 80 * 1024,
  css: 24 * 1024,
  html: 36 * 1024,
  images: 100 * 1024,
  fonts: 100 * 1024,
  social: 100 * 1024,
  total: 136 * 1024,
};

let failed = false;
for (const [name, limit] of Object.entries(budgets)) {
  const actual = groups[name];
  const status = actual <= limit ? 'PASS' : 'FAIL';
  console.log(`${status} ${name.padEnd(10)} ${formatBytes(actual)} / ${formatBytes(limit)}`);
  failed ||= actual > limit;
}

for (const file of files.filter((entry) => entry.size > 80 * 1024)) {
  console.error(`FAIL oversized asset ${relative(root.pathname, file.path)} (${formatBytes(file.size)})`);
  failed = true;
}

if (failed) process.exitCode = 1;

async function walk(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const output = [];
  for (const entry of entries) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) output.push(...await walk(path));
    else if (entry.isFile()) output.push({ path, size: (await stat(path)).size });
  }
  return output;
}

function sumByExtension(entries, extensions) {
  return entries
    .filter((entry) => extensions.includes(extname(entry.path).toLowerCase()))
    .reduce((sum, entry) => sum + entry.size, 0);
}

function formatBytes(value) {
  return `${(value / 1024).toFixed(1)} KiB`;
}
