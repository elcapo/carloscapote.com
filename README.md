# carloscapote.com

Sitio personal de Carlos Capote: portfolio y casos de uso, construido con [Astro](https://astro.build).

## Stack

- **Astro 5** (sitio estático) con colecciones de contenido para los artículos.
- **CSS puro** con tokens semánticos. Sistema de diseño "Swiss Modernism 2.0": rejilla de 12 columnas, monocromo + acento azul, tipografías Archivo (titulares) y Space Grotesk (cuerpo).
- Soporte automático de **modo claro / oscuro** vía `prefers-color-scheme`.
- Accesibilidad: contraste AA, focus visibles, `prefers-reduced-motion`, skip link.

## Estructura

```
src/
├── components/        # Header, Footer
├── content/
│   └── articulos/     # Artículos en Markdown (frontmatter tipado)
├── content.config.ts  # Esquema de la colección
├── layouts/
│   └── Layout.astro   # Layout base
├── pages/
│   ├── index.astro            # Landing
│   ├── sobre-mi.astro
│   └── articulos/
│       ├── index.astro        # Listado
│       └── [...slug].astro    # Detalle
└── styles/global.css
```

## Desarrollo

```bash
npm install
npm run dev      # http://localhost:4321
npm run build
npm run preview
```

## Artículos

Cada artículo es un Markdown en `src/content/articulos/`. El frontmatter sigue el esquema definido en `src/content.config.ts`:

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

Los borradores actuales son **drafts** que iré ampliando: `bocana.org`, `malcolm`, `chiquito`, `neural-network-from-scratch` y `llm-from-scratch`.

## Licencia

Contenidos bajo [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/). Código bajo licencia libre (por definir).
