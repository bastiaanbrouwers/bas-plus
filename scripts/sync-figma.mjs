// Figma → site image sync. Run by .github/workflows/figma-sync.yml.
//
// Every frame in the Figma file named like "brand-refresh/cover.png" is a site image.
// For each frame it takes the ORIGINAL image in its image fill (not a render), and if
// that image changed since the last sync it writes it to public/images/<slot>.
//
// Checks
//   errors (the run fails, nothing is committed):
//     - a slot the site uses has no frame in Figma
//     - a frame has no image fill, or two frames share a name
//     - a GIF slot received a non-GIF image (or the reverse)
//   warnings (reported, still synced):
//     - file is heavier than 2.5 MB
//     - image is narrower than 1200 px
//     - aspect ratio changed by more than 5% (the layout may shift)
//     - a frame in Figma that the site does not use yet
//     - PNG, JPG and WebP are converted to the slot's extension when they differ
//
// Env: FIGMA_TOKEN (required), FIGMA_FILE_KEY, DRY_RUN=1 to only report.
import { readFileSync, writeFileSync, existsSync, mkdirSync, appendFileSync } from 'node:fs';
import { dirname, extname, join } from 'node:path';

const root = new URL('..', import.meta.url).pathname;
const FILE_KEY = process.env.FIGMA_FILE_KEY || 'Q98U6mNyvhUMQIfi2vRMdx';
const TOKEN = process.env.FIGMA_TOKEN;
const DRY = process.env.DRY_RUN === '1';
const SLOT_RE = /^[a-z0-9-]+\/[a-z0-9-]+\.(png|jpe?g|gif|webp)$/;
const STATE_FILE = join(root, 'scripts/figma-sync-state.json');

const errors = [];
const warnings = [];
const changed = [];

const kind = (buf) => {
  if (buf.subarray(0, 4).toString('hex') === '89504e47') return 'png';
  if (buf.subarray(0, 3).toString('hex') === 'ffd8ff') return 'jpg';
  if (buf.subarray(0, 3).toString() === 'GIF') return 'gif';
  if (buf.subarray(0, 4).toString() === 'RIFF' && buf.subarray(8, 12).toString() === 'WEBP') return 'webp';
  return 'unknown';
};
const extKind = (slot) => ({ '.jpeg': 'jpg' })[extname(slot)] || extname(slot).slice(1);

async function api(path) {
  const res = await fetch(`https://api.figma.com/v1${path}`, { headers: { 'X-Figma-Token': TOKEN } });
  if (!res.ok) throw new Error(`Figma API ${path} → ${res.status} ${await res.text()}`);
  return res.json();
}

function findSlots(node, out = []) {
  if (node.name && SLOT_RE.test(node.name) && node.type !== 'TEXT') out.push(node);
  for (const c of node.children || []) findSlots(c, out);
  return out;
}

async function main() {
  if (!TOKEN) {
    const msg = 'FIGMA_TOKEN is not set. Add it under Settings, Secrets and variables, Actions to turn on the sync.';
    console.log(`::warning::${msg}`);
    if (process.env.GITHUB_STEP_SUMMARY) appendFileSync(process.env.GITHUB_STEP_SUMMARY, `## Figma image sync\n\n${msg}\n`);
    return;
  }
  let sharp = null;
  try {
    sharp = (await import('sharp')).default;
  } catch {}

  const expected = JSON.parse(readFileSync(join(root, 'scripts/image-slots.json'), 'utf8')).map((s) => s.slot);
  const state = existsSync(STATE_FILE) ? JSON.parse(readFileSync(STATE_FILE, 'utf8')) : {};

  const [file, images] = await Promise.all([api(`/files/${FILE_KEY}`), api(`/files/${FILE_KEY}/images`)]);
  const urls = images.meta?.images || {};
  const frames = findSlots(file.document);

  const byName = new Map();
  for (const f of frames) {
    if (byName.has(f.name)) errors.push(`Two frames are named ${f.name}. Rename one.`);
    byName.set(f.name, f);
  }
  for (const slot of expected) if (!byName.has(slot)) errors.push(`${slot} is used on the site but has no frame in Figma.`);
  for (const name of byName.keys()) if (!expected.includes(name)) warnings.push(`${name} is in Figma but not on the site yet. Ask Claude to add it.`);

  for (const [slot, f] of byName) {
    const fill = (f.fills || []).filter((p) => p.type === 'IMAGE' && p.visible !== false).pop();
    if (!fill?.imageRef) {
      errors.push(`${slot} has no image fill.`);
      continue;
    }
    const out = join(root, 'public/images', slot);
    if (state[slot] === fill.imageRef && existsSync(out)) continue;
    const url = urls[fill.imageRef];
    if (!url) {
      errors.push(`${slot}: Figma returned no download link for its image.`);
      continue;
    }
    let buf = Buffer.from(await (await fetch(url)).arrayBuffer());
    const want = extKind(slot);
    const got = kind(buf);
    if (got !== want) {
      if (want === 'gif' || got === 'gif' || !sharp) {
        errors.push(`${slot} expects a ${want.toUpperCase()} but the frame holds a ${got.toUpperCase()}.`);
        continue;
      }
      buf = await sharp(buf).toFormat(want === 'jpg' ? 'jpeg' : want, want === 'jpg' ? { quality: 88 } : {}).toBuffer();
      warnings.push(`${slot}: converted ${got.toUpperCase()} to ${want.toUpperCase()}.`);
    }
    if (sharp) {
      const meta = await sharp(buf, { animated: want === 'gif' }).metadata();
      const w = meta.width;
      const h = meta.pageHeight || meta.height;
      if (w < 1200) warnings.push(`${slot} is ${w}px wide. It may look soft on large screens.`);
      if (existsSync(out)) {
        const old = await sharp(readFileSync(out), { animated: want === 'gif' }).metadata();
        const r0 = old.width / (old.pageHeight || old.height);
        const r1 = w / h;
        if (Math.abs(r1 - r0) / r0 > 0.05) warnings.push(`${slot}: aspect ratio changed from ${r0.toFixed(2)} to ${r1.toFixed(2)}. The layout around it may shift.`);
      }
    }
    if (buf.length > 2.5 * 1024 * 1024) warnings.push(`${slot} is ${(buf.length / 1048576).toFixed(1)} MB. Consider a lighter export.`);
    changed.push({ slot, buf, ref: fill.imageRef });
  }

  const ok = errors.length === 0;
  if (ok && !DRY) {
    for (const c of changed) {
      const out = join(root, 'public/images', c.slot);
      mkdirSync(dirname(out), { recursive: true });
      writeFileSync(out, c.buf);
      state[c.slot] = c.ref;
    }
    // Record refs for unchanged slots too, so the first run establishes the baseline.
    for (const [slot, f] of byName) {
      const fill = (f.fills || []).filter((p) => p.type === 'IMAGE' && p.visible !== false).pop();
      if (fill?.imageRef && existsSync(join(root, 'public/images', slot))) state[slot] = fill.imageRef;
    }
    writeFileSync(STATE_FILE, JSON.stringify(state, null, 2) + '\n');
  }

  const lines = [
    `## Figma image sync`,
    ``,
    `${byName.size} frames checked. ${changed.length} changed${DRY ? ' (dry run)' : ''}.`,
    ...(changed.length ? ['', '### Updated', ...changed.map((c) => `- ${c.slot}`)] : []),
    ...(errors.length ? ['', '### Errors (nothing was published)', ...errors.map((e) => `- ${e}`)] : []),
    ...(warnings.length ? ['', '### Warnings', ...warnings.map((w) => `- ${w}`)] : []),
  ];
  console.log(lines.join('\n'));
  if (process.env.GITHUB_STEP_SUMMARY) appendFileSync(process.env.GITHUB_STEP_SUMMARY, lines.join('\n') + '\n');
  if (!ok) process.exit(1);
}

await main();
