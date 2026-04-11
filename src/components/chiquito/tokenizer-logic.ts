/**
 * Lógica del tokenizador de juguete usado por `TokenizerEmulator`.
 *
 * Vive en un módulo TS aparte para poder ejecutarse tanto en el frontmatter
 * Astro (SSR, durante el build) como en el `<script>` del cliente. Así el
 * HTML inicial ya lleva los chips pintados y el script sólo se encarga de
 * reaccionar a los cambios del usuario.
 */

export const EMBED_DIM = 8;

/** Tokeniza como un BPE de juguete: espacios pegados a la palabra, palabras
 *  largas partidas en piezas de 2-4 caracteres. Determinista. */
export function tokenize(text: string): string[] {
  if (!text) return [];
  const raw = text.match(/\s+[^\s]*|[^\s]+/g) || [];
  const tokens: string[] = [];
  for (const chunk of raw) {
    if (chunk.replace(/\s/g, '').length > 5) {
      const trimmed = chunk.replace(/^\s+/, '');
      const leading = chunk.slice(0, chunk.length - trimmed.length);
      let i = 0;
      while (i < trimmed.length) {
        const len = Math.min(2 + ((i * 7 + trimmed.charCodeAt(0)) % 3), trimmed.length - i);
        const piece = (i === 0 ? leading : '') + trimmed.slice(i, i + len);
        tokens.push(piece);
        i += len;
      }
    } else {
      tokens.push(chunk);
    }
  }
  return tokens;
}

/** ID entero determinista por token, estilo FNV-1a. */
export function tokenId(tok: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < tok.length; i++) {
    h ^= tok.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return ((h >>> 0) % 50000) + 100;
}

/** Vector de embedding determinista a partir del ID del token. */
export function embedding(id: number): number[] {
  const vec: number[] = [];
  let s = id;
  for (let d = 0; d < EMBED_DIM; d++) {
    s = (s * 1103515245 + 12345) & 0x7fffffff;
    const val = (s / 0x7fffffff) * 2 - 1;
    vec.push(Math.round(val * 100) / 100);
  }
  return vec;
}

/** Color de celda del embedding: azul para valores negativos, rojo positivos. */
export function embColor(v: number): string {
  const t = (v + 1) / 2;
  if (t < 0.5) {
    const pct = Math.round((1 - t * 2) * 20);
    return `color-mix(in srgb, #3b82f6 ${pct}%, var(--color-muted))`;
  }
  const pct = Math.round((t * 2 - 1) * 20);
  return `color-mix(in srgb, #ef4444 ${pct}%, var(--color-muted))`;
}

/** Sustituye espacios por punto medio para que los chips sean visibles. */
export function displayToken(tok: string): string {
  return tok.replace(/ /g, '\u00B7');
}
