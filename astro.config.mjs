import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import rehypeMermaid from 'rehype-mermaid';

export default defineConfig({
  site: 'https://hawara.es',
  integrations: [mdx()],
  markdown: {
    syntaxHighlight: {
      type: 'shiki',
      excludeLangs: ['mermaid'],
    },
    shikiConfig: {
      themes: {
        light: 'github-light',
        dark: 'github-dark-dimmed',
      },
      wrap: true,
    },
    rehypePlugins: [
      [
        rehypeMermaid,
        {
          strategy: 'inline-svg',
          mermaidConfig: {
            theme: 'neutral',
            // Sin override de `fontFamily`: dejamos que mermaid use su
            // default ("trebuchet ms", verdana, arial). Si aquí metemos
            // `var(--font-body)` o cualquier web font, playwright mide con
            // un fallback y el navegador del usuario con la tipografía
            // real, y las etiquetas se salen de las cajas.
          },
        },
      ],
    ],
  },
});
