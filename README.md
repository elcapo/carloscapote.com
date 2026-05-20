# Carlos Capote

Sitio web personal de [Carlos Capote](https://carloscapote.com): software y cultura libres, casos de uso y artículos pedagógicos en profundidad.

## Stack

- **Astro 5** con salida estática y colecciones de contenido tipadas para los artículos.
- **MDX** (`@astrojs/mdx`) para artículos con componentes interactivos embebidos.
- **Chart.js** para gráficas interactivas. En `astro build` se prerenderizan a SVG con `chartjs-node-canvas` (backend SVG de `node-canvas`) y al hidratar en el cliente se sustituyen por un `<canvas>` interactivo.
- **Mermaid** para diagramas, renderizados a SVG inline en build con `rehype-mermaid` (estrategia `inline-svg`, usa Playwright/Chromium).
- **Shiki** para resaltado de sintaxis con temas `github-light` / `github-dark-dimmed`.
- **Feed RSS** generado con `@astrojs/rss` en `src/pages/rss.xml.js`.
- **CSS puro** con tokens semánticos. Sistema de diseño "Swiss Modernism 2.0": rejilla de 12 columnas, monocromo + acento, tipografías Archivo (titulares) y Space Grotesk (cuerpo).
- Soporte automático de **modo claro / oscuro** vía `prefers-color-scheme`.
- Accesibilidad: contraste AA, focus visibles, `prefers-reduced-motion`, skip link.

## Estructura

```
src/
├── components/
│   ├── Header.astro
│   ├── Footer.astro
│   ├── ArticlesList.astro
│   ├── Chart.astro          # Gráfica: SSR build-time + hidratación cliente
│   ├── chart-ssr.ts         # Render SVG server-side de Chart.js
│   ├── Note.astro           # Notas al margen / aclaraciones
│   └── chiquito/            # Widgets interactivos del artículo "chiquito"
├── content/
│   └── articulos/           # Artículos en Markdown / MDX
├── content.config.ts        # Esquema de la colección
├── layouts/
│   └── Layout.astro
├── pages/
│   ├── index.astro          # Landing
│   ├── quien-soy.mdx
│   ├── rss.xml.js           # Feed RSS
│   └── articulos/
│       ├── index.astro      # Listado
│       └── [...slug].astro  # Detalle
└── styles/global.css
```

## Desarrollo

```bash
pnpm install
pnpm dev      # http://localhost:4321
pnpm build
pnpm preview
```

> La primera build puede tardar: `rehype-mermaid` descarga Chromium vía Playwright si no lo tiene, y `canvas` puede compilarse nativamente si no hay binario precompilado para la plataforma.

## Despliegue con Docker

El sitio es 100% estático tras `astro build`: las gráficas de Chart.js y los diagramas de Mermaid quedan embebidos como SVG en los HTML generados. En producción sólo hace falta un nginx sirviendo `dist/`.

El mismo `docker-compose.yml` sirve para la máquina de desarrollo (Ubuntu) y para el VPS.

```bash
docker compose up -d --build
```

Por defecto expone el sitio en `http://localhost:8080`. En el VPS, poner un reverse proxy (Caddy, Traefik, nginx del host…) delante que termine TLS y apunte al puerto mapeado.

Ficheros relevantes:

- `Dockerfile` — build multi-stage. Builder sobre `mcr.microsoft.com/playwright:v1.59.1-noble` (trae Node + Chromium, necesario para `rehype-mermaid`). Runtime sobre `nginx:1.27-alpine`.
- `nginx.conf` — sirve `dist/` con `try_files` para rutas tipo carpeta (`build.format: 'directory'`), cache inmutable para `/_astro/*` (assets con hash) y `no-cache` para HTML.
- `docker-compose.yml` — un único servicio `web`, mapea `8080:80`.
- `.dockerignore` — excluye `node_modules`, `dist`, `.git`, etc.

Para reconstruir tras cambios:

```bash
docker compose up -d --build
```

Para ver logs:

```bash
docker compose logs -f web
```

## Artículos

Cada artículo es un `.md` o `.mdx` en `src/content/articulos/`. El frontmatter sigue el esquema definido en `src/content.config.ts`:

```yaml
---
title: "Título del artículo"
description: "Descripción corta para listados y SEO"
pubDate: 2026-03-12
tags: ["tag1", "tag2"]
project: "Nombre del proyecto"
projectUrl: "https://..."
draft: true
---
```

## Licencia

Contenidos bajo [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/). Código bajo licencia libre (por definir).
