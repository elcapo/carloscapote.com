/**
 * Lógica pura del simulador de la caché de ventana deslizante de Chiquito.
 *
 * Modela el patrón productor-consumidor del `_SlidingWindowCache` que usa
 * `preload_to_ram=N`: un hilo de fondo (productor) mantiene N capas en RAM
 * cargando por adelantado, mientras el forward pass (consumidor) las va
 * ejecutando una a una y liberando sus huecos. La caché nunca contiene más
 * de N entradas y, cuando el consumidor libera un hueco, el productor lo
 * ocupa con la siguiente capa pendiente.
 */

export type Layer = {
  name: string;
  index: number;
};

export type LayerState = 'idle' | 'loading' | 'cached' | 'running' | 'freed';

export type Substep = 'initial' | 'warmup' | 'run' | 'advance' | 'final';

export type ProducerStatus =
  | { kind: 'idle' }
  | { kind: 'loading'; layer: number }
  | { kind: 'waiting' }
  | { kind: 'done' };

export type Snapshot = {
  layers: Array<Layer & { state: LayerState }>;
  /** Índices de las capas actualmente en la ventana, ordenados de menor a mayor. */
  cache: number[];
  /** Capa que el consumidor está ejecutando o acaba de liberar, si la hay. */
  currentLayer: number | null;
  substep: Substep;
  producer: ProducerStatus;
};

export function deriveLayers(numLayers: number): Layer[] {
  const out: Layer[] = [];
  for (let i = 0; i < numLayers; i++) {
    out.push({ name: `model.layers.${i}`, index: i });
  }
  return out;
}

/**
 * Valor máximo del slider para un modelo de M capas y ventana de N:
 * - paso 0                  → estado inicial
 * - pasos 1..N              → warmup síncrono
 * - pasos N+1..N+2·M−1      → forward (alternando `run` y `advance`, sin
 *                             `advance` tras el último `run`)
 * - paso N+2·M              → estado final: todas las capas liberadas
 */
export function totalSteps(numLayers: number, windowSize: number): number {
  const M = Math.max(0, Math.floor(numLayers));
  const N = clampWindow(windowSize, M);
  if (M === 0) return 0;
  return N + 2 * M;
}

function clampWindow(windowSize: number, numLayers: number): number {
  if (!Number.isFinite(windowSize)) return 1;
  return Math.max(1, Math.min(numLayers, Math.floor(windowSize)));
}

function clampStep(step: number, numLayers: number, windowSize: number): number {
  const max = totalSteps(numLayers, windowSize);
  if (!Number.isFinite(step)) return 0;
  return Math.max(0, Math.min(max, Math.floor(step)));
}

/**
 * Cuenta cuántas capas distintas han sido cargadas en la caché a lo largo
 * de la ejecución hasta `step` (inclusive). Tras el warmup son N; cada
 * `advance` suma una más, hasta el máximo M.
 */
function loadedCount(M: number, N: number, step: number): number {
  if (step <= 0) return 0;
  if (step <= N) return step;
  const forwardStep = step - N;
  const advancesDone = Math.floor(forwardStep / 2);
  return Math.min(M, N + advancesDone);
}

/**
 * Construye el estado de la caché en el paso `step`.
 *
 * Codificación:
 *   0                           → estado inicial, caché vacía, todo en disco.
 *   1..N                        → warmup: el paso k carga la capa (k−1).
 *   N+1..N+2·M−1 (forward)      → por cada capa i del modelo:
 *                                    · substep `run`    → el consumidor la ejecuta;
 *                                    · substep `advance` → el consumidor la libera y,
 *                                      si queda pendiente, el productor carga (i+N).
 */
export function buildSnapshot(
  numLayers: number,
  windowSize: number,
  step: number,
): Snapshot {
  const M = Math.max(0, Math.floor(numLayers));
  const N = clampWindow(windowSize, M);
  const clamped = clampStep(step, M, N);
  const layers: Snapshot['layers'] = deriveLayers(M).map((l) => ({
    ...l,
    state: 'idle',
  }));

  if (clamped === 0) {
    return {
      layers,
      cache: [],
      currentLayer: null,
      substep: 'initial',
      producer: { kind: 'idle' },
    };
  }

  // Final: el forward pass ha terminado y todas las capas están liberadas.
  if (clamped === N + 2 * M) {
    for (let j = 0; j < M; j++) layers[j].state = 'freed';
    return {
      layers,
      cache: [],
      currentLayer: null,
      substep: 'final',
      producer: { kind: 'done' },
    };
  }

  // Warmup: el paso k (1..N) deja las k primeras capas en caché. La última,
  // la que el productor acaba de traer en este paso, se marca como `loading`.
  if (clamped <= N) {
    const k = clamped;
    const cache: number[] = [];
    for (let i = 0; i < k; i++) {
      layers[i].state = i === k - 1 ? 'loading' : 'cached';
      cache.push(i);
    }
    return {
      layers,
      cache,
      currentLayer: k - 1,
      substep: 'warmup',
      producer: { kind: 'loading', layer: k - 1 },
    };
  }

  const forwardStep = clamped - N; // 1..(2·M−1)
  const isRun = forwardStep % 2 === 1;
  const i = Math.floor((forwardStep - 1) / 2);

  for (let j = 0; j < i; j++) layers[j].state = 'freed';

  const cache: number[] = [];
  let producer: ProducerStatus;

  if (isRun) {
    // Consumidor ejecutando la capa i; caché = {i .. min(i+N-1, M-1)}.
    const cacheEnd = Math.min(i + N - 1, M - 1);
    for (let j = i; j <= cacheEnd; j++) {
      layers[j].state = j === i ? 'running' : 'cached';
      cache.push(j);
    }
    const loaded = loadedCount(M, N, clamped);
    producer = loaded < M ? { kind: 'waiting' } : { kind: 'done' };
    return {
      layers,
      cache,
      currentLayer: i,
      substep: 'run',
      producer,
    };
  }

  // advance i: se libera la capa i; si queda pendiente, el productor carga (i+N).
  layers[i].state = 'freed';
  const cacheEnd = Math.min(i + N, M - 1);
  const loaded = loadedCount(M, N, clamped);
  const loadedPrev = loadedCount(M, N, clamped - 1);
  const justLoaded = loaded > loadedPrev ? loaded - 1 : null;
  for (let j = i + 1; j <= cacheEnd; j++) {
    layers[j].state = j === justLoaded ? 'loading' : 'cached';
    cache.push(j);
  }
  producer =
    justLoaded !== null
      ? { kind: 'loading', layer: justLoaded }
      : { kind: 'done' };
  return {
    layers,
    cache,
    currentLayer: i,
    substep: 'advance',
    producer,
  };
}

export function stepLabel(
  numLayers: number,
  windowSize: number,
  step: number,
): { short: string; long: string } {
  const M = Math.max(0, Math.floor(numLayers));
  const N = clampWindow(windowSize, M);
  const max = totalSteps(M, N);
  const clamped = clampStep(step, M, N);
  const short = `${clamped} / ${max}`;

  if (clamped === 0) {
    return {
      short,
      long: 'Estado inicial. Todas las capas del modelo residen en disco; la ventana en RAM está vacía y el hilo productor aún no se ha puesto en marcha.',
    };
  }

  if (clamped === N + 2 * M) {
    return {
      short,
      long: 'Final: el forward pass ha terminado. El consumidor ha liberado la última capa, la ventana queda vacía y el modelo entero vuelve a residir en disco, listo para la siguiente pasada.',
    };
  }

  if (clamped <= N) {
    const k = clamped;
    return {
      short,
      long: `Warmup: el inicializador carga model.layers.${k - 1} en la ventana de forma síncrona antes de arrancar el forward pass. Ranuras ocupadas: ${k} / ${N}.`,
    };
  }

  const forwardStep = clamped - N;
  const isRun = forwardStep % 2 === 1;
  const i = Math.floor((forwardStep - 1) / 2);

  if (isRun) {
    const loaded = loadedCount(M, N, clamped);
    if (loaded < M) {
      return {
        short,
        long: `Forward: el consumidor ejecuta model.layers.${i} desde la ventana. El hilo productor aguarda a que se libere un hueco para cargar la siguiente capa pendiente.`,
      };
    }
    return {
      short,
      long: `Forward: el consumidor ejecuta model.layers.${i} desde la ventana. Ya no quedan capas por leer del disco; el productor ha terminado y la ventana se vaciará a medida que se liberen los huecos.`,
    };
  }

  const nextToLoad = i + N;
  if (nextToLoad < M) {
    return {
      short,
      long: `Forward: el consumidor libera model.layers.${i} y notifica al productor; este carga model.layers.${nextToLoad} en la ranura vacía, en paralelo con la siguiente ejecución.`,
    };
  }
  return {
    short,
    long: `Forward: el consumidor libera model.layers.${i}. Ya no hay más capas pendientes de leer del disco, así que la ventana empieza a vaciarse.`,
  };
}

export function layerStateLabel(state: LayerState): string {
  switch (state) {
    case 'idle':
      return 'en disco';
    case 'loading':
      return 'cargando';
    case 'cached':
      return 'en caché';
    case 'running':
      return 'ejecutando';
    case 'freed':
      return 'liberada';
  }
}
