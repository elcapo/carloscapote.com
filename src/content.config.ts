import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const articulos = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/articulos' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.coerce.date(),
    tags: z.array(z.string()).default([]),
    project: z.string().optional(),
    projectUrl: z.string().url().optional(),
    draft: z.boolean().default(false),
  }),
});

const apuntes = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/apuntes' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.coerce.date(),
    tags: z.array(z.string()).default([]),
    draft: z.boolean().default(false),
  }),
});

/* Metadatos y presentación de cada curso (un fichero index.md por curso). */
const cursos = defineCollection({
  loader: glob({ pattern: '*/index.md', base: './src/content/cursos' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    tags: z.array(z.string()).default([]),
    /* Orden garantizado de los bloques (grupos de lecciones en el menú).
       Si se omite, se usa el orden de aparición en las lecciones. */
    bloques: z.array(z.string()).default([]),
    /* URL al repositorio "fuente" del curso, si existe. */
    repo: z.string().url().optional(),
    license: z.string().optional(),
    draft: z.boolean().default(false),
  }),
});

/* Cada capítulo/lección de un curso. El campo `curso` enlaza con el slug
   del curso (carpeta bajo src/content/cursos/). La agrupación visual en
   el menú se controla con `bloque`. El vídeo es optativo: si se omite,
   la lección se renderiza sólo con contenido escrito. */
const lecciones = defineCollection({
  loader: glob({
    pattern: '*/capitulos/*.md',
    base: './src/content/cursos',
  }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    curso: z.string(),
    bloque: z.string().default('General'),
    /* Orden dentro del bloque. Si se omite, se infiere del prefijo numérico
       del nombre del fichero (01-foo → 1). */
    orden: z.number().int().nonnegative().optional(),
    /* Vídeo incrustado (YouTube, Vimeo…). */
    videoUrl: z.string().url().optional(),
    /* Vídeo self-hosted: ruta a un fichero en /public (p.ej. /cursos/<curso>/intro.mp4). */
    videoFile: z.string().optional(),
    duration: z.string().optional(),
    draft: z.boolean().default(false),
    pubDate: z.coerce.date().optional(),
  }),
});

export const collections = { articulos, apuntes, cursos, lecciones };