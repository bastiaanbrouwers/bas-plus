// One-off import, run by .github/workflows/framer-import.yml.
// For each job in .github/image-jobs.json it:
//   1. downloads the original image from Framer's CDN,
//   2. saves it to public/images/<slot> so the site no longer depends on Framer,
//   3. uploads it into its frame in the Figma file (single-use upload URL).
// Writes a report to .github/image-jobs-result.json.
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, basename, extname, join } from 'node:path';

const root = new URL('..', import.meta.url).pathname;
const jobs = JSON.parse(readFileSync(join(root, '.github/image-jobs.json'), 'utf8'));
const TYPES = { '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.gif': 'image/gif', '.webp': 'image/webp' };
const FIGMA_MAX = 9.5 * 1024 * 1024;

let sharp = null;
try {
  sharp = (await import('sharp')).default;
} catch {
  console.log('sharp not installed, large images will not be shrunk for Figma');
}

async function shrinkForFigma(buf, ext) {
  if (buf.length <= FIGMA_MAX || !sharp) return buf;
  const img = sharp(buf, { animated: ext === '.gif' });
  for (const width of [3200, 2400, 1600, 1200, 800]) {
    let out = img.clone().resize({ width, withoutEnlargement: true });
    out = ext === '.png' ? out.png({ compressionLevel: 9 }) : ext === '.gif' ? out.gif() : out.jpeg({ quality: 85 });
    const b = await out.toBuffer();
    if (b.length <= FIGMA_MAX) return b;
  }
  return buf;
}

async function run(job) {
  const ext = extname(job.slot).toLowerCase();
  const type = TYPES[ext] || 'application/octet-stream';
  const res = await fetch(job.src);
  if (!res.ok) throw new Error(`download ${res.status}`);
  const buf = Buffer.from(await res.arrayBuffer());
  const out = join(root, 'public/images', job.slot);
  mkdirSync(dirname(out), { recursive: true });
  writeFileSync(out, buf);
  const result = { slot: job.slot, bytes: buf.length, saved: `public/images/${job.slot}` };
  if (job.submitUrl) {
    const up = await shrinkForFigma(buf, ext);
    const fd = new FormData();
    fd.append('file', new Blob([up], { type }), basename(job.slot));
    const r = await fetch(job.submitUrl, { method: 'POST', body: fd });
    const text = await r.text();
    result.figma = r.ok ? 'uploaded' : `failed ${r.status}: ${text.slice(0, 200)}`;
    if (up !== buf) result.shrunkForFigma = up.length;
  }
  return result;
}

const results = [];
const queue = [...jobs];
await Promise.all(
  Array.from({ length: 6 }, async () => {
    while (queue.length) {
      const job = queue.shift();
      try {
        results.push(await run(job));
      } catch (e) {
        results.push({ slot: job.slot, error: String(e.message || e) });
      }
    }
  }),
);
results.sort((a, b) => a.slot.localeCompare(b.slot));
writeFileSync(join(root, '.github/image-jobs-result.json'), JSON.stringify(results, null, 2) + '\n');
const failed = results.filter((r) => r.error || (r.figma && r.figma !== 'uploaded'));
console.log(`${results.length - failed.length}/${results.length} ok`);
for (const f of failed) console.log('FAILED', f.slot, f.error || f.figma);
