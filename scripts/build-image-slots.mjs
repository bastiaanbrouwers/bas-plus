// Builds scripts/image-slots.json: every image the site uses, with its slot name.
// Slot names are the contract between the site, the repo and the Figma file:
//   <project-slug>/cover.<ext>, <slug>/gallery-01.<ext>, <slug>/story-01.<ext>, site/<name>.<ext>
// The file lives at public/images/<slot> and the Figma frame is named <slot>.
// Run after adding or removing an image in a project: node scripts/build-image-slots.mjs
import { readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { parse } from 'yaml';

const root = new URL('..', import.meta.url).pathname;
const dir = join(root, 'src/content/projects');
const toSlot = (p) => (p.startsWith('/images/') ? p.slice('/images/'.length) : null);

const slots = [];
const projects = readdirSync(dir)
  .filter((f) => f.endsWith('.md'))
  .map((f) => {
    const raw = readFileSync(join(dir, f), 'utf8');
    const [, fm, body] = raw.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
    return { slug: f.replace(/\.md$/, ''), data: parse(fm), body };
  })
  .sort((a, b) => a.data.order - b.data.order);

for (const { slug, data, body } of projects) {
  const add = (kind, src, caption = '') => {
    const slot = toSlot(src);
    if (slot) slots.push({ slot, project: data.title, slug, kind, caption });
  };
  add('cover', data.cover);
  for (const m of body.matchAll(/!\[[^\]]*\]\(([^)\s]+)\)/g)) add('story', m[1]);
  for (const g of data.gallery || []) add('gallery', g.src, g.alt || '');
}

for (const [slot, caption] of [
  ['site/portrait.jpg', 'Portrait on home and about'],
  ['site/grain.png', 'Grain texture over the portrait'],
  ['site/og.jpg', 'Social share image'],
]) {
  slots.push({ slot, project: 'site', slug: 'site', kind: slot.split('/')[1].split('.')[0], caption });
}

writeFileSync(join(root, 'scripts/image-slots.json'), JSON.stringify(slots, null, 2) + '\n');
console.log(`${slots.length} slots`);
