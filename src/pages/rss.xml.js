import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';

export async function GET(context) {
  const articulos = (await getCollection('articulos', ({ data }) => !data.draft))
    .sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf());

  return rss({
    title: 'Carlos Capote',
    description:
      'Compartir es la tecnología más antigua. Y la reproducibilidad, su forma más avanzada. Publico artículos en profundidad sobre software libre, pedagogía y cultura tecnológica.',
    site: context.site,
    items: articulos.map((a) => ({
      title: a.data.title,
      description: a.data.description,
      pubDate: a.data.pubDate,
      link: `/articulos/${a.id}/`,
      categories: a.data.tags,
    })),
    customData: `<language>es-es</language>`,
  });
}
