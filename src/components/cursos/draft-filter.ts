/* Predicado de visibilidad para colecciones de cursos y lecciones.
   En desarrollo (pnpm dev) los borradores se incluyen para poder
   previsualizarlos. En build de producción quedan ocultos. */
export const visible = ({ data }: { data: { draft: boolean } }): boolean =>
  !data.draft || import.meta.env.DEV;