// Runs before every build (npm "prebuild"). Originals in public/images stay untouched.
// For each original it writes lighter WebP versions to public/images/_w/ and records
// sizes in src/data/image-variants.json, which the site uses for src, srcset, width and height.
//   photos and screenshots → 800, 1600 and 2400 px wide (never upscaled)
//   GIFs → one animated WebP at up to 1280 px
// Skips work when the output is newer than the original, so local builds stay quick.
import { readdirSync, statSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join, relative, dirname, extname } from 'node:path';
import sharp from 'sharp';

const root = new URL('..', import.meta.url).pathname;
const base = join(root, 'public/images');
const outBase = join(base, '_w');
const WIDTHS = [800, 1600, 2400];

function walk(dir, out = []) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (p === outBase) continue;
    if (statSync(p).isDirectory()) walk(p, out);
    else if (/\.(png|jpe?g|gif|webp)$/i.test(name)) out.push(p);
  }
  return out;
}
const fresh = (out, src) => existsSync(out) && statSync(out).mtimeMs >= statSync(src).mtimeMs;

const manifest = {};
const files = existsSync(base) ? walk(base) : [];
let made = 0;

await Promise.all(
  files.map(async (src) => {
    const rel = relative(base, src);
    const stem = rel.slice(0, -extname(rel).length);
    const isGif = /\.gif$/i.test(src);
    const meta = await sharp(src, { animated: isGif }).metadata();
    const width = meta.width;
    const height = meta.pageHeight || meta.height;
    const entry = { width, height, variants: [] };

    if (isGif) {
      const w = Math.min(width, 1280);
      const out = join(outBase, `${stem}-${w}.webp`);
      if (!fresh(out, src)) {
        mkdirSync(dirname(out), { recursive: true });
        await sharp(src, { animated: true }).resize({ width: w, withoutEnlargement: true }).webp({ quality: 80, effort: 4 }).toFile(out);
        made++;
      }
      entry.variants.push({ w, path: `/images/_w/${stem}-${w}.webp` });
    } else {
      const widths = WIDTHS.filter((w) => w < width).concat(Math.min(width, WIDTHS.at(-1)));
      for (const w of [...new Set(widths)]) {
        const out = join(outBase, `${stem}-${w}.webp`);
        if (!fresh(out, src)) {
          mkdirSync(dirname(out), { recursive: true });
          await sharp(src).resize({ width: w, withoutEnlargement: true }).webp({ quality: 82 }).toFile(out);
          made++;
        }
        entry.variants.push({ w, path: `/images/_w/${stem}-${w}.webp` });
      }
    }
    manifest[`/images/${rel}`] = entry;
  }),
);

mkdirSync(join(root, 'src/data'), { recursive: true });
const sorted = Object.fromEntries(Object.entries(manifest).sort(([a], [b]) => a.localeCompare(b)));
writeFileSync(join(root, 'src/data/image-variants.json'), JSON.stringify(sorted, null, 2) + '\n');
console.log(`images: ${files.length} originals, ${made} variants written`);
