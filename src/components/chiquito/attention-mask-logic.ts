/**
 * Lógica pura del visualizador de máscaras de atención causal.
 *
 * Trabaja sobre una frase fija tokenizada y un contador de tokens
 * visibles. El estado inicial muestra los primeros `startTokens` tokens
 * en "prefill" (todas las filas se computan a la vez). A partir del
 * primer click en "generar", cada paso añade un token más en modo
 * "decode": las filas anteriores pasan a estar en caché y sólo la nueva
 * fila se considera computada en el forward actual.
 */

export type Phase = 'prefill' | 'decode';

export type CellState = 'masked' | 'current' | 'cached';

export type Matrix = CellState[][];

/** Tokenizador de juguete: separa por espacios y deja los signos de
 *  puntuación como tokens independientes. Pensado para que las etiquetas
 *  de la matriz sean palabras legibles, no subpalabras BPE. */
export function tokenizeSimple(text: string): string[] {
  const trimmed = text.trim();
  if (!trimmed) return [];
  const out: string[] = [];
  for (const part of trimmed.split(/\s+/)) {
    const match = part.match(/^([\p{P}]*)(.*?)([\p{P}]*)$/u);
    if (!match) {
      out.push(part);
      continue;
    }
    const [, lead, mid, trail] = match;
    for (const ch of lead) out.push(ch);
    if (mid) out.push(mid);
    for (const ch of trail) out.push(ch);
  }
  return out;
}

/** Construye la matriz de atención para un estado dado.
 *
 *  La matriz es `visibleCount × visibleCount`. Cada celda `(i, j)`:
 *    - `masked`  si `j > i` (atención causal: no se ve el futuro).
 *    - `current` si `j ≤ i` y la fila `i` se está computando en el
 *                 forward actual. En prefill son todas las filas; en
 *                 decode sólo la última.
 *    - `cached`  si `j ≤ i` y la fila `i` viene de un forward anterior.
 */
export function buildMatrix(visibleCount: number, phase: Phase): Matrix {
  const n = Math.max(0, visibleCount);
  const matrix: Matrix = [];
  for (let i = 0; i < n; i++) {
    const row: CellState[] = [];
    for (let j = 0; j < n; j++) {
      if (j > i) {
        row.push('masked');
      } else if (phase === 'prefill' || i === n - 1) {
        row.push('current');
      } else {
        row.push('cached');
      }
    }
    matrix.push(row);
  }
  return matrix;
}

/** Position IDs del forward actual.
 *
 *  En prefill el forward procesa todos los tokens visibles a la vez, así
 *  que sus posiciones son `[0, 1, …, visibleCount-1]`. En decode procesa
 *  únicamente el último token y su posición es `[visibleCount-1]`. */
export function positionIdsForPhase(
  phase: Phase,
  visibleCount: number,
): number[] {
  if (visibleCount <= 0) return [];
  if (phase === 'prefill') {
    return Array.from({ length: visibleCount }, (_, i) => i);
  }
  return [visibleCount - 1];
}

/** Acorta un token si no cabe en la etiqueta de la matriz. */
export function displayToken(tok: string, maxLen = 8): string {
  if (tok.length <= maxLen) return tok;
  return tok.slice(0, maxLen - 1) + '…';
}

/** Etiqueta corta para el modo actual, pensada para el pie de la
 *  descripción del widget. */
export function phaseLabel(
  phase: Phase,
  visibleCount: number,
): string {
  if (visibleCount <= 0) return 'prefill · (prompt vacío)';
  if (phase === 'prefill') {
    return `prefill · ${visibleCount} × ${visibleCount}`;
  }
  return `decode · fila ${visibleCount}: ${visibleCount - 1} tokens en caché + 1 token nuevo`;
}
