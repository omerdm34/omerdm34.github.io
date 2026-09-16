import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://omerdm34.github.io',
  trailingSlash: 'ignore',
  build: { inlineStylesheets: 'auto' },
  image: { responsiveStyles: false },
});
