// Builds scripts/image-slots.json: every image the site uses, with a stable slot name.
// Slot names are the contract between the site, the repo and the Figma file:
//   <project-slug>/cover.<ext>, <slug>/gallery-01.<ext>, <slug>/story-01.<ext>, site/<name>.<ext>
// Run: node scripts/build-image-slots.mjs
import { readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { join, extname } from 'node:path';
import { parse } from 'yaml';

const root = new URL('..', import.meta.url).pathname;
const dir = join(root, 'src/content/projects');
const pad = (n) => String(n).padStart(2, '0');
const extOf = (url) => extname(new URL(url).pathname).toLowerCase() || '.png';

const slots = [];
const files = readdirSync(dir).filter((f) => f.endsWith('.md'));
const projects = files
  .map((f) => {
    const raw = readFileSync(join(dir, f), 'utf8');
    const [, fm, body] = raw.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
    return { slug: f.replace(/\.md$/, ''), data: parse(fm), body };
  })
  .sort((a, b) => a.data.order - b.data.order);

for (const { slug, data, body } of projects) {
  const add = (kind, i, src, caption = '') =>
    slots.push({
      slot: `${slug}/${kind}${i ? '-' + pad(i) : ''}${extOf(src)}`,
      project: data.title,
      slug,
      kind,
      src,
      caption,
    });
  add('cover', 0, data.cover);
  [...body.matchAll(/!\[[^\]]*\]\(([^)\s]+)\)/g)].forEach((m, i) => add('story', i + 1, m[1]));
  (data.gallery || []).forEach((g, i) => add('gallery', i + 1, g.src, g.alt || ''));
}

const site = [
  ['portrait', 'https://framerusercontent.com/images/5N2qntQCPUeOJem27W3d57vVzjI.jpg', 'Portrait on home and about'],
  ['grain', 'https://framerusercontent.com/images/rR6HYXBrMmX4cRpXfXUOvpvpB0.png', 'Grain texture over the portrait'],
  ['og', 'https://framerusercontent.com/assets/Nl1fcH3IRXSe6rc7JmywGI36Jp4.jpg', 'Social share image'],
];
for (const [name, src, caption] of site) {
  slots.push({ slot: `site/${name}${extOf(src)}`, project: 'site', slug: 'site', kind: name, src, caption });
}

writeFileSync(join(root, 'scripts/image-slots.json'), JSON.stringify(slots, null, 2) + '\n');
console.log(`${slots.length} slots`);
