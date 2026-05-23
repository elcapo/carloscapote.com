import { getCollection } from 'astro:content';

const SITE = 'https://carloscapote.com';

function url(loc, { lastmod, changefreq, priority } = {}) {
  let entry = `  <url>\n    <loc>${SITE}${loc}</loc>`;
  if (lastmod) entry += `\n    <lastmod>${new Date(lastmod).toISOString().slice(0, 10)}</lastmod>`;
  if (changefreq) entry += `\n    <changefreq>${changefreq}</changefreq>`;
  if (priority) entry += `\n    <priority>${priority}</priority>`;
  entry += '\n  </url>';
  return entry;
}

export async function GET() {
  const articulos = (await getCollection('articulos', ({ data }) => !data.draft))
    .sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf());
  const apuntes = (await getCollection('apuntes', ({ data }) => !data.draft))
    .sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf());

  const articuloTags = new Set(articulos.flatMap((a) => a.data.tags));
  const apunteTags = new Set(apuntes.flatMap((a) => a.data.tags));

  const pages = [
    url('/', { changefreq: 'weekly', priority: '1.0' }),
    url('/quien-soy/', { changefreq: 'monthly', priority: '0.8' }),
    url('/articulos/', { changefreq: 'weekly', priority: '0.9' }),
    url('/apuntes/', { changefreq: 'weekly', priority: '0.9' }),
    ...articulos.map((a) =>
      url(`/articulos/${a.id}/`, {
        lastmod: a.data.pubDate,
        changefreq: 'monthly',
        priority: '0.7',
      }),
    ),
    ...apuntes.map((a) =>
      url(`/apuntes/${a.id}/`, {
        lastmod: a.data.pubDate,
        changefreq: 'monthly',
        priority: '0.7',
      }),
    ),
    ...Array.from(articuloTags).map((tag) =>
      url(`/articulos/tags/${encodeURIComponent(tag)}/`, {
        changefreq: 'weekly',
        priority: '0.5',
      }),
    ),
    ...Array.from(apunteTags).map((tag) =>
      url(`/apuntes/tags/${encodeURIComponent(tag)}/`, {
        changefreq: 'weekly',
        priority: '0.5',
      }),
    ),
  ];

  return new Response(
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${pages.join('\n')}\n</urlset>`,
    { headers: { 'Content-Type': 'application/xml' } },
  );
}
