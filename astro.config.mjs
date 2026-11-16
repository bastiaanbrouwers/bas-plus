import { defineConfig } from 'astro/config';
import rehypeImages from './src/lib/rehype-images.mjs';

export default defineConfig({
  site: 'https://bas.plus',
  output: 'static',
  trailingSlash: 'ignore',
  build: { format: 'directory' },
  markdown: {
    rehypePlugins: [rehypeImages],
  },
});
