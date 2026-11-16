// Swaps /images/... originals in markdown for the lighter WebP versions, with srcset and size.
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

export default function rehypeImages() {
  const p = join(process.cwd(), 'src/data/image-variants.json');
  const manifest = existsSync(p) ? JSON.parse(readFileSync(p, 'utf8')) : {};
  const visit = (node) => {
    if (node.type === 'element' && node.tagName === 'img') {
      const e = manifest[node.properties?.src];
      if (e && e.variants.length) {
        const v = e.variants;
        const mid = v.find((x) => x.w >= 1600) ?? v[v.length - 1];
        node.properties.src = mid.path;
        if (v.length > 1) {
          node.properties.srcSet = v.map((x) => `${x.path} ${x.w}w`).join(', ');
          node.properties.sizes = '(min-width: 810px) 62vw, 100vw';
        }
        node.properties.width = e.width;
        node.properties.height = e.height;
      }
      node.properties.loading = 'lazy';
      node.properties.decoding = 'async';
    }
    for (const c of node.children || []) visit(c);
  };
  return (tree) => visit(tree);
}
