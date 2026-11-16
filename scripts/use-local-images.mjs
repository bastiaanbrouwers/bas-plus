// One-off: point content at /images/<slot> instead of Framer's CDN.
// Walks each project in the same order as build-image-slots.mjs (cover, story images, gallery)
// and only swaps a URL when its file exists in public/images.
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const root = new URL('..', import.meta.url).pathname;
const slots = JSON.parse(readFileSync(join(root, 'scripts/image-slots.json'), 'utf8'));
const has = (slot) => existsSync(join(root, 'public/images', slot));
const missing = [];

const bySlug = {};
for (const s of slots) (bySlug[s.slug] ||= []).push(s);

for (const [slug, list] of Object.entries(bySlug)) {
  if (slug === 'site') continue;
  const path = join(root, 'src/content/projects', `${slug}.md`);
  let text = readFileSync(path, 'utf8');
  const [, fm, body] = text.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  let newFm = fm;
  let newBody = body;
  const local = (s) => (has(s.slot) ? `/images/${s.slot}` : (missing.push(s.slot), s.src));

  const cover = list.find((s) => s.kind === 'cover');
  newFm = newFm.replace(/^cover: .*$/m, `cover: ${local(cover)}`);

  const gallery = list.filter((s) => s.kind === 'gallery');
  let gi = 0;
  newFm = newFm.replace(/^(\s*- src: ).*$/gm, (_, p) => p + local(gallery[gi++]));

  const story = list.filter((s) => s.kind === 'story');
  let si = 0;
  newBody = newBody.replace(/!\[([^\]]*)\]\(([^)\s]+)\)/g, (_, alt) => `![${alt}](${local(story[si++])})`);

  writeFileSync(path, `---\n${newFm}\n---\n${newBody}`);
}

const site = {
  'https://framerusercontent.com/images/5N2qntQCPUeOJem27W3d57vVzjI.jpg': 'site/portrait.jpg',
  'https://framerusercontent.com/images/rR6HYXBrMmX4cRpXfXUOvpvpB0.png': 'site/grain.png',
  'https://framerusercontent.com/assets/Nl1fcH3IRXSe6rc7JmywGI36Jp4.jpg': 'site/og.jpg',
};
for (const f of ['src/components/AboutBlock.astro', 'src/pages/about.astro', 'src/layouts/Base.astro']) {
  const p = join(root, f);
  let t = readFileSync(p, 'utf8');
  for (const [url, slot] of Object.entries(site)) {
    if (!has(slot)) continue;
    t = t.split(url).join(slot === 'site/og.jpg' ? `https://bas.plus/images/${slot}` : `/images/${slot}`);
  }
  writeFileSync(p, t);
}
console.log(missing.length ? `Still on Framer: ${missing.join(', ')}` : 'All images local.');
