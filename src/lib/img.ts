// Turns an original image path (/images/<slot>) into lighter WebP sources.
// The variants come from scripts/optimise-images.mjs, which runs before every build.
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

type Entry = { width: number; height: number; variants: { w: number; path: string }[] };

let manifest: Record<string, Entry> | null = null;
function load(): Record<string, Entry> {
  if (manifest) return manifest;
  const p = join(process.cwd(), 'src/data/image-variants.json');
  manifest = existsSync(p) ? JSON.parse(readFileSync(p, 'utf8')) : {};
  return manifest!;
}

export interface ImgAttrs {
  src: string;
  srcset?: string;
  sizes?: string;
  width?: number;
  height?: number;
}

/** sizes: how wide the image shows, as a CSS sizes value. */
export function img(src: string, sizes = '100vw'): ImgAttrs {
  const e = load()[src];
  if (!e || e.variants.length === 0) return { src };
  const v = e.variants;
  const mid = v.find((x) => x.w >= 1600) ?? v[v.length - 1];
  return {
    src: mid.path,
    srcset: v.length > 1 ? v.map((x) => `${x.path} ${x.w}w`).join(', ') : undefined,
    sizes: v.length > 1 ? sizes : undefined,
    width: e.width,
    height: e.height,
  };
}
