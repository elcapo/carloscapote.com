/**
 * Lógica pura del simulador del splitter de checkpoints de Chiquito.
 *
 * Recibe un `weight_map` de HuggingFace (nombre de tensor → archivo shard)
 * y una lista ordenada de capas, y expone funciones para construir una
 * "snapshot" del estado del proceso en un paso concreto del slider.
 *
 * Cada capa se procesa en dos subpasos (file → .done), así que un modelo
 * con N capas tiene 2·N posiciones de slider, más la inicial (0).
 */

export type WeightMap = Record<string, string>;

/** Subpasos por capa (reflejan el orden real del bucle de `split_and_save_layers`
 *  en `src/chiquito/splitter.py`):
 *    1 → shards necesarios cargados y fichero `.safetensors` escrito, pero
 *         los tensores de la capa siguen en RAM (state_dict) y todavía no
 *         existe el marcador.
 *    2 → marcador `.safetensors.done` creado y los tensores de la capa
 *         liberados de state_dict (`del state_dict[k]`).
 *
 *  Separar ambos momentos permite ver que cuando una capa vive a caballo
 *  de dos shards, los dos tienen que estar cargados simultáneamente mientras
 *  se escribe el fichero de esa capa. */
const SUBSTEPS = 2;

/** Total de posiciones del slider para N capas (la 0 es el estado inicial). */
export function totalSteps(layerCount: number): number {
  return layerCount * SUBSTEPS;
}

/** Traduce un nombre de tensor a su "capa lógica".
 *    - `model.layers.<n>.xxx` → `model.layers.<n>`
 *    - resto                  → quita el último segmento (p. ej. `.weight`) */
function tensorToLayer(key: string): string {
  const m = key.match(/^(.+?\.layers\.\d+)\./);
  if (m) return m[1];
  const dot = key.lastIndexOf('.');
  return dot >= 0 ? key.slice(0, dot) : key;
}

/** Deriva una lista ordenada y única de nombres de capa a partir del
 *  `weight_map`, preservando el orden de primera aparición. */
export function deriveLayerNames(weightMap: WeightMap): string[] {
  const seen = new Set<string>();
  const names: string[] = [];
  for (const key of Object.keys(weightMap)) {
    const layer = tensorToLayer(key);
    if (!seen.has(layer)) {
      seen.add(layer);
      names.push(layer);
    }
  }
  return names;
}

export type ShardSnapshot = {
  name: string;
  total: number;
  remaining: number;
  loaded: boolean;
};

export type OutputState = 'pending' | 'file' | 'done';

export type OutputSnapshot = {
  layer: string;
  state: OutputState;
};

export type Snapshot = {
  shards: ShardSnapshot[];
  outputs: OutputSnapshot[];
  /** Índice de la capa "activa" en este paso, o null si el paso es inicial. */
  currentLayerIndex: number | null;
};

/** Construye el estado del proceso en el paso `step` del slider. */
export function buildSnapshot(
  weightMap: WeightMap,
  layerNames: string[],
  step: number,
): Snapshot {
  const clamped = clampStep(step, layerNames.length);

  // Indexa tensores por shard y por capa en un único recorrido.
  const shardTotals = new Map<string, number>();
  const shardOrder: string[] = [];
  const shardsByLayer = new Map<string, string[]>();

  for (const [tensor, shard] of Object.entries(weightMap)) {
    if (!shardTotals.has(shard)) {
      shardTotals.set(shard, 0);
      shardOrder.push(shard);
    }
    shardTotals.set(shard, shardTotals.get(shard)! + 1);

    const layer = tensorToLayer(tensor);
    if (!shardsByLayer.has(layer)) shardsByLayer.set(layer, []);
    shardsByLayer.get(layer)!.push(shard);
  }

  const completeLayers = Math.floor(clamped / SUBSTEPS);
  const halfLayer = clamped % SUBSTEPS === 1;

  const extractedByShard = new Map<string, number>();
  const loadedShards = new Set<string>();

  // Capas completamente procesadas: se han cargado sus shards, se ha
  // escrito el fichero, se ha creado el .done y los tensores ya se han
  // liberado de state_dict.
  for (let i = 0; i < completeLayers; i++) {
    loadLayerShards(layerNames[i], shardsByLayer, loadedShards);
    extractLayerTensors(layerNames[i], shardsByLayer, extractedByShard);
  }

  // Capa a medias: el fichero `.safetensors` ya está escrito, así que los
  // shards necesarios están cargados, pero el `.done` aún no existe y los
  // tensores siguen ocupando RAM dentro de state_dict.
  let currentLayerIndex: number | null = null;
  if (halfLayer && completeLayers < layerNames.length) {
    currentLayerIndex = completeLayers;
    loadLayerShards(layerNames[completeLayers], shardsByLayer, loadedShards);
  } else if (completeLayers > 0) {
    currentLayerIndex = completeLayers - 1;
  }

  const shards: ShardSnapshot[] = shardOrder.map((name) => {
    const total = shardTotals.get(name)!;
    const extracted = extractedByShard.get(name) ?? 0;
    return {
      name,
      total,
      remaining: total - extracted,
      loaded: loadedShards.has(name),
    };
  });

  const outputs: OutputSnapshot[] = layerNames.map((layer, i) => {
    let state: OutputState = 'pending';
    if (i < completeLayers) state = 'done';
    else if (halfLayer && i === completeLayers) state = 'file';
    return { layer, state };
  });

  return { shards, outputs, currentLayerIndex };
}

function loadLayerShards(
  layer: string,
  shardsByLayer: Map<string, string[]>,
  loadedShards: Set<string>,
) {
  for (const shard of shardsByLayer.get(layer) ?? []) {
    loadedShards.add(shard);
  }
}

function extractLayerTensors(
  layer: string,
  shardsByLayer: Map<string, string[]>,
  extractedByShard: Map<string, number>,
) {
  for (const shard of shardsByLayer.get(layer) ?? []) {
    extractedByShard.set(shard, (extractedByShard.get(shard) ?? 0) + 1);
  }
}

function clampStep(step: number, layerCount: number): number {
  const max = totalSteps(layerCount);
  if (!Number.isFinite(step)) return 0;
  return Math.max(0, Math.min(max, Math.floor(step)));
}

/** Etiquetas para mostrar al usuario: un contador corto y una descripción
 *  larga del subpaso actual. */
export function stepLabel(
  layerNames: string[],
  step: number,
): { short: string; long: string } {
  const total = totalSteps(layerNames.length);
  const clamped = clampStep(step, layerNames.length);
  const short = `${clamped} / ${total}`;

  if (clamped === 0) {
    return { short, long: 'Estado inicial: no se ha escrito nada.' };
  }

  const completeLayers = Math.floor(clamped / SUBSTEPS);
  const halfLayer = clamped % SUBSTEPS === 1;

  if (halfLayer) {
    const layer = layerNames[completeLayers];
    return {
      short,
      long: `${layer}.safetensors escrito. Los shards que contienen sus tensores siguen cargados en RAM: el marcador .done todavía no existe y los tensores no se han liberado de state_dict.`,
    };
  }

  const layer = layerNames[completeLayers - 1];
  return {
    short,
    long: `Marcador ${layer}.safetensors.done creado. Los tensores de esta capa se borran de state_dict. Los shards en los que vivían solo quedan totalmente vacíos cuando todas las capas que los comparten se han confirmado.`,
  };
}
