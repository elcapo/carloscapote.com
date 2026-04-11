/**
 * Lógica pura del simulador del forward pass de Chiquito.
 *
 * Modela el ciclo `cargar → ejecutar → liberar` que la función `forward()`
 * aplica a cada bloque del modelo durante una única pasada: en un momento
 * dado sólo hay un bloque cargado en VRAM (más los buffers permanentes
 * como RoPE) mientras el tensor de estados ocultos atraviesa el modelo de
 * principio a fin.
 */

export type BlockKind = 'embed' | 'transformer' | 'norm' | 'lm_head';

export type Block = {
  name: string;
  kind: BlockKind;
  index: number;
};

export type BlockState = 'idle' | 'loading' | 'running' | 'freed';

export type Substep = 'idle' | 'load' | 'run' | 'free';

export type Snapshot = {
  blocks: Array<Block & { state: BlockState }>;
  currentBlockIndex: number | null;
  currentSubstep: Substep;
};

/** Subpasos por bloque: cargar → ejecutar → liberar. */
const SUBSTEPS = 3;

/** Deriva la lista de bloques de un mini modelo estilo Llama con
 *  `numTransformerLayers` capas transformer. */
export function deriveBlocks(numTransformerLayers: number): Block[] {
  const blocks: Block[] = [];
  let i = 0;
  blocks.push({ name: 'model.embed_tokens', kind: 'embed', index: i++ });
  for (let n = 0; n < numTransformerLayers; n++) {
    blocks.push({ name: `model.layers.${n}`, kind: 'transformer', index: i++ });
  }
  blocks.push({ name: 'model.norm', kind: 'norm', index: i++ });
  blocks.push({ name: 'lm_head', kind: 'lm_head', index: i++ });
  return blocks;
}

export function totalSteps(blockCount: number): number {
  return blockCount * SUBSTEPS;
}

function clampStep(step: number, blockCount: number): number {
  const max = totalSteps(blockCount);
  if (!Number.isFinite(step)) return 0;
  return Math.max(0, Math.min(max, Math.floor(step)));
}

/** Construye el estado del forward pass en el paso `step`.
 *
 *  Codificación de pasos:
 *    0 →  estado inicial, todo en disco, VRAM vacía.
 *    3k+1 → bloque k cargándose en VRAM.
 *    3k+2 → bloque k ejecutándose.
 *    3k+3 → bloque k liberándose (vuelve a meta).
 */
export function buildSnapshot(blocks: Block[], step: number): Snapshot {
  const clamped = clampStep(step, blocks.length);
  const outBlocks = blocks.map((b) => ({ ...b, state: 'idle' as BlockState }));
  let currentBlockIndex: number | null = null;
  let currentSubstep: Substep = 'idle';

  if (clamped > 0) {
    const subIndex = (clamped - 1) % SUBSTEPS;
    currentBlockIndex = Math.floor((clamped - 1) / SUBSTEPS);

    // Los bloques anteriores ya están liberados.
    for (let i = 0; i < currentBlockIndex; i++) {
      outBlocks[i].state = 'freed';
    }

    if (subIndex === 0) {
      outBlocks[currentBlockIndex].state = 'loading';
      currentSubstep = 'load';
    } else if (subIndex === 1) {
      outBlocks[currentBlockIndex].state = 'running';
      currentSubstep = 'run';
    } else {
      outBlocks[currentBlockIndex].state = 'freed';
      currentSubstep = 'free';
    }
  }

  return { blocks: outBlocks, currentBlockIndex, currentSubstep };
}

/** Descripciones cortas y largas para cada paso del slider. */
export function stepLabel(
  blocks: Block[],
  step: number,
): { short: string; long: string } {
  const total = totalSteps(blocks.length);
  const clamped = clampStep(step, blocks.length);
  const short = `${clamped} / ${total}`;

  if (clamped === 0) {
    return {
      short,
      long: 'Estado inicial. Todos los pesos del modelo están en disco, la VRAM está vacía y los buffers permanentes (como las tablas de RoPE) ya residen en GPU.',
    };
  }

  const subIndex = (clamped - 1) % SUBSTEPS;
  const blockIndex = Math.floor((clamped - 1) / SUBSTEPS);
  const block = blocks[blockIndex];

  if (subIndex === 0) {
    return {
      short,
      long: `Cargando ${block.name}: sus pesos se leen del archivo por capas y se mueven a VRAM. El tensor de estados ocultos espera a que el bloque esté listo.`,
    };
  }
  if (subIndex === 1) {
    const what = runningDescription(block.kind);
    return { short, long: `Ejecutando ${block.name}: ${what}.` };
  }
  return {
    short,
    long: `Liberando ${block.name}: sus pesos vuelven al dispositivo meta y la VRAM queda disponible para el siguiente bloque.`,
  };
}

function runningDescription(kind: BlockKind): string {
  switch (kind) {
    case 'embed':
      return 'el embedding convierte los IDs de tokens en vectores de estados ocultos';
    case 'transformer':
      return 'auto-atención y red feed-forward transforman los estados ocultos';
    case 'norm':
      return 'RMSNorm final estabiliza el último estado oculto antes de la proyección al vocabulario';
    case 'lm_head':
      return 'la proyección lineal produce los logits de salida sobre todo el vocabulario';
  }
}

/** Etiqueta corta para mostrar al lado del nombre del bloque. */
export function blockStateLabel(state: BlockState): string {
  switch (state) {
    case 'idle':
      return 'en disco';
    case 'loading':
      return 'cargando';
    case 'running':
      return 'ejecutando';
    case 'freed':
      return 'liberado';
  }
}
