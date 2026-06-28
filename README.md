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
│   ├── chiquito/            # Widgets interactivos del artículo "chiquito"
│   └── cursos/              # Sección de cursos
│       ├── CursosList.astro          # Listado de cursos (estilo ArticlesList)
│       ├── CursoTemario.astro        # Menú lateral colapsable por curso
│       ├── LeccionVideo.astro        # Reproductor 16:9 (iframe o <video>)
│       ├── LeccionNavegacion.astro   # Anterior / siguiente / volver al curso
│       └── leccion-helpers.ts        # Orden, agrupación por bloque, slugs
├── content/
│   ├── articulos/           # Artículos en Markdown / MDX
│   └── cursos/              # Cursos: index.md por curso + capitulos/*.md
├── content.config.ts        # Esquemas de las colecciones (articulos, apuntes, cursos, lecciones)
├── layouts/
│   ├── Layout.astro
│   ├── PageLayout.astro
│   └── CursoLayout.astro    # Layout de lección: temario lateral + vídeo/prosa
├── pages/
│   ├── index.astro          # Landing
│   ├── quien-soy.mdx
│   ├── rss.xml.js           # Feed RSS
│   ├── sitemap.xml.js
│   ├── articulos/
│   ├── apuntes/
│   └── cursos/
│       ├── index.astro              # Listado de cursos
│       ├── [curso]/
│       │   ├── index.astro          # Presentación del curso + temario
│       │   └── [leccion].astro       # Página de cada lección
│       └── tags/[tag].astro
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

### HTTPS con Traefik

Para producción con TLS automático vía Let's Encrypt, se incluye `docker-compose.traefik.yml` que añade un Traefik como reverse proxy:

```bash
cp .env.example .env
# Editar .env con el dominio real y email
nano .env
docker compose -f docker-compose.traefik.yml up -d --build
```

Variables de entorno disponibles:

| Variable | Descripción | Valor por defecto |
|---|---|---|
| `DOMAIN` | Dominio del blog (ej: `carloscapote.com`) | — |
| `LETSENCRYPT_EMAIL` | Email para el registro de Let's Encrypt | — |
| `HTTP_PORT` | Puerto HTTP | `80` |
| `HTTPS_PORT` | Puerto HTTPS | `443` |
| `TRAEFIK_DASHBOARD_USERS` | Credenciales htpasswd para el dashboard (vacío = sin dashboard) | `""` |
| `TRAEFIK_DASHBOARD_DOMAIN` | Subdominio del dashboard (ej: `traefik.${DOMAIN}`) | `traefik.${DOMAIN}` |

Para generar las credenciales del dashboard:

```bash
htpasswd -nb admin mi-contraseña-segura
```

> El servicio `web` del `docker-compose.traefik.yml` construye la misma imagen que el `docker-compose.yml` simple, pero no publica puertos directamente: Traefik enruta el tráfico y gestiona los certificados automáticamente.

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

## Cursos y lecciones

La sección de cursos vive en `src/content/cursos/`. Cada curso es una carpeta con un `index.md` (presentación del curso) y una subcarpeta `capitulos/` con las lecciones.

### Estructura de un curso

```
src/content/cursos/<curso-slug>/
├── index.md                # frontmatter con metadatos + body de presentación
└── capitulos/
    ├── 00-preparar-el-entorno.md   # prefijo numérico para ordenar
    ├── 01-como-leer-codigo.md     # slug final: /cursos/<curso>/como-leer-codigo/
    └── ...
```

### Frontmatter del curso (`index.md`)

```yaml
---
title: "Leyendo Python"
description: "..."
pubDate: 2026-06-28
updatedDate: 2026-06-29      # opcional, último cambio
tags: ["python", "código"]
bloques: ["Preparación", "Cómo aproximarse a un repositorio"]  # orden explícito de bloques
repo: "https://github.com/.../leyendo-python"   # opcional
license: "CC0"                                   # opcional
draft: true
---
```

### Frontmatter de cada lección (`capitulos/NN-slug.md`)

```yaml
---
title: "Cómo leer código"
description: "..."
curso: "leyendo-python"               # slug del curso al que pertenece
bloque: "Cómo aproximarse a un repositorio"   # grupo en el menú lateral
orden: 1                             # opcional; si se omite, se infiere del prefijo del nombre
videoUrl: "https://youtu.be/..."     # opcional (embed YouTube/Vimeo)
videoFile: "/cursos/.../intro.mp4"   # opcional (self-hosted en /public)
duration: "12:34"                    # opcional, sólo decorativo
draft: true
---
```

- El `title` de la lección se usa como encabezado y como etiqueta en el menú lateral. **No** se muestra ninguna numeración automática.
- Las lecciones se **agrupan por `bloque`** en el menú (estilo screencasting.com). Si el curso declara `bloques`, ese array fija el orden; si no, se respeta el orden de aparición.
- Los vídeos son optativos: una lección con `videoUrl`/`videoFile` monta el reproductor como elemento principal del layout (estilo Coursera/Udemy); una lección sin vídeo usa exactamente el mismo layout pero sin el hueco del reproductor, para dar continuidad visual a cursos mixtos.
- El menú lateral `CursoTemario` es **colapsable en escritorio** (ancho vs franja de 48px) y **drawer superpuesto en móvil**. El estado colapsado se persiste por curso en `localStorage['temario:<curso-slug>']`.
- En `pnpm dev` los cursos y lecciones con `draft: true` **se muestran** para poder previsualizarlos; en `astro build` no se generan rutas para ellos.

### Sincronización de contenido vendorizado

El contenido de un curso puede vivir en un repositorio externo. En ese caso, los `.md` se **copian (vendor)** a `src/content/cursos/<curso>/`  en el repo del blog. El frontmatter propio del blog se añade al copiar y **no** se machaca con posteriores `syncs` (cuerpo Markdown = fuente externa, frontmatter = blog). No existe todavía un script automático de sincronización; por ahora la copia es manual.

## Licencia

Contenidos bajo [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/). Código bajo licencia libre (por definir).
