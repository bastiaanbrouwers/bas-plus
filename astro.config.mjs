import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://bas.plus',
  output: 'static',
  trailingSlash: 'ignore',
  build: { format: 'directory' },
});
