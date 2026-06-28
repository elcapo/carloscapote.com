import type { CollectionEntry } from 'astro:content';

/* Extrae el orden numérico del prefijo del fichero (01-foo → 1).
   Devuelve +Inf si no hay prefijo, para que quede al final. */
export function ordenDeFichero(id: string): number {
  const basename = id.split('/').pop() ?? id;
  const m = basename.match(/^(\d+)[-_]/);
  return m ? Number(m[1]) : Number.POSITIVE_INFINITY;
}

/* Orden efectivo de una lección: el del frontmatter si existe,
   si no, el inferido del nombre del fichero. */
export function ordenEfectivo(entry: CollectionEntry<'lecciones'>): number {
  return entry.data.orden ?? ordenDeFichero(entry.id);
}

/* Slug limpio y estable para una lección: basename sin extensión y sin
   el prefijo numérico. P.ej. "leyendo-python/capitulos/01-como-leer-codigo"
   → "como-leer-codigo". */
export function leccionSlug(entry: CollectionEntry<'lecciones'>): string {
  const basename = entry.id.split('/').pop() ?? entry.id;
  return basename.replace(/\.md$/, '').replace(/^\d+[-_]/, '');
}

export interface BloqueTemario {
  nombre: string;
  lecciones: CollectionEntry<'lecciones'>[];
}

/* Agrupa las lecciones de un curso por `bloque`, respetando el orden
   indicado por `curso.data.bloques` cuando exista; el resto se ordena por
   orden de aparición. Dentro de cada bloque, las lecciones se ordenan por
   `ordenEfectivo`. */
export function agruparPorBloque(
  lecciones: CollectionEntry<'lecciones'>[],
  ordenBloques: string[] = [],
): BloqueTemario[] {
  const ordenadas = [...lecciones].sort(
    (a, b) => ordenEfectivo(a) - ordenEfectivo(b),
  );

  const map = new Map<string, CollectionEntry<'lecciones'>[]>();
  for (const l of ordenadas) {
    const bloque = l.data.bloque;
    if (!map.has(bloque)) map.set(bloque, []);
    map.get(bloque)!.push(l);
  }

  const nombres = Array.from(map.keys());

  const ordenFinal =
    ordenBloques.length > 0
      ? [
          ...ordenBloques.filter((b) => map.has(b)),
          ...nombres.filter((b) => !ordenBloques.includes(b)),
        ]
      : nombres;

  return ordenFinal.map((nombre) => ({
    nombre,
    lecciones: map.get(nombre) ?? [],
  }));
}

/* Dada la lista ordenada de lecciones, encuentra la anterior y la siguiente
   a la lección actual (por id). */
export function vecinos(
  lecciones: CollectionEntry<'lecciones'>[],
  actualId: string,
): {
  prev: CollectionEntry<'lecciones'> | undefined;
  next: CollectionEntry<'lecciones'> | undefined;
} {
  const idx = lecciones.findIndex((l) => l.id === actualId);
  return {
    prev: idx > 0 ? lecciones[idx - 1] : undefined,
    next: idx >= 0 && idx < lecciones.length - 1 ? lecciones[idx + 1] : undefined,
  };
}