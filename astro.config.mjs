import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://carloscapote.com',
  markdown: {
    shikiConfig: {
      theme: 'github-dark-dimmed',
      wrap: true,
    },
  },
});
