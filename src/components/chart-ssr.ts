/**
 * Renderizado server-side de las gráficas de `Chart.astro`.
 *
 * Usa `chartjs-node-canvas` con el backend SVG de `canvas` para generar, en
 * tiempo de build, un SVG visual equivalente al canvas que Chart.js pinta en
 * el cliente. Al hidratar la página, el script del componente reemplaza este
 * SVG por el canvas interactivo.
 *
 * Mantenemos este módulo separado de `Chart.astro` para que el import de
 * `chartjs-node-canvas` (que depende de `canvas`, un binario nativo) sólo
 * se evalúe en el entorno de build de Astro, nunca en el bundle cliente.
 */
import { ChartJSNodeCanvas } from 'chartjs-node-canvas';
import type { ChartConfiguration } from 'chart.js';

type Point = { x: number; y: number };
type Series = { label: string; points: Point[] };
export type SsrConfig = {
  type: 'line';
  series: Series[];
  xLabel?: string;
  yLabel?: string;
  xScale: 'linear' | 'logarithmic';
  yScale: 'linear' | 'logarithmic';
};

// Valores fijos del tema claro. El cliente, al hidratar, lee las CSS vars
// vivas y puede pintar con otra paleta; como sustituimos el SVG por el
// canvas en ese momento, la diferencia no llega a verse.
const THEME = {
  fg: '#1a1a1a',
  muted: '#6b6b6b',
  border: '#d4d4d4',
  accent: '#ff4500',
  bg: 'transparent',
};

function seriesColors(n: number): string[] {
  const palette = [THEME.accent, THEME.fg, THEME.muted];
  return Array.from({ length: n }, (_, i) => palette[i % palette.length]);
}

// Una instancia por tamaño; `chartjs-node-canvas` cachea el entorno interno.
const canvasCache = new Map<string, ChartJSNodeCanvas>();

function getCanvas(width: number, height: number): ChartJSNodeCanvas {
  const key = `${width}x${height}`;
  let canvas = canvasCache.get(key);
  if (!canvas) {
    // `type: 'svg'` no está en los tipos de chartjs-node-canvas pero sí se
    // acepta en tiempo de ejecución y hace que `node-canvas` use su backend
    // SVG. Casteamos para esquivar la comprobación del compilador.
    canvas = new ChartJSNodeCanvas({
      width,
      height,
      backgroundColour: 'transparent',
      type: 'svg',
    } as ConstructorParameters<typeof ChartJSNodeCanvas>[0]);
    canvasCache.set(key, canvas);
  }
  return canvas;
}

function buildConfig(cfg: SsrConfig): ChartConfiguration {
  const sColors = seriesColors(cfg.series.length);
  return {
    type: cfg.type,
    data: {
      datasets: cfg.series.map((s, i) => ({
        label: s.label,
        data: s.points,
        borderColor: sColors[i],
        backgroundColor: sColors[i],
        borderWidth: 2,
        pointRadius: 3,
        pointHoverRadius: 5,
        tension: 0,
      })),
    },
    options: {
      responsive: false,
      animation: false,
      plugins: {
        legend: {
          display: cfg.series.length > 1,
          labels: { color: THEME.fg },
        },
        tooltip: { enabled: false },
      },
      scales: {
        x: {
          type: cfg.xScale,
          title: cfg.xLabel
            ? { display: true, text: cfg.xLabel, color: THEME.muted }
            : { display: false },
          ticks: { color: THEME.muted },
          grid: { color: THEME.border },
          border: { color: THEME.border },
        },
        y: {
          type: cfg.yScale,
          title: cfg.yLabel
            ? { display: true, text: cfg.yLabel, color: THEME.muted }
            : { display: false },
          ticks: { color: THEME.muted },
          grid: { color: THEME.border },
          border: { color: THEME.border },
        },
      },
    },
  };
}

export function renderChartSvg(cfg: SsrConfig, height: number): string {
  // Ancho de referencia grande; el SVG es vectorial y el wrapper lo re-escala.
  const width = 960;
  const canvas = getCanvas(width, height);
  const config = buildConfig(cfg);
  // Usamos el path síncrono con el backend SVG: `canvas.toBuffer()` sin
  // mimetype es lo que acepta `node-canvas` cuando el canvas es SVG.
  const buf = canvas.renderToBufferSync(config);
  let svg = buf.toString('utf8');
  // Forzamos viewBox y quitamos width/height absolutos para que escale al wrapper.
  svg = svg.replace(
    /<svg([^>]*)>/,
    (_m, attrs) => {
      const cleaned = attrs
        .replace(/\swidth="[^"]*"/, '')
        .replace(/\sheight="[^"]*"/, '');
      const hasViewBox = /viewBox=/.test(cleaned);
      const vb = hasViewBox ? '' : ` viewBox="0 0 ${width} ${height}"`;
      return `<svg${cleaned}${vb} preserveAspectRatio="xMidYMid meet">`;
    },
  );
  return svg;
}
