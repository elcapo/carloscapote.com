# syntax=docker/dockerfile:1.7

# Builder: imagen oficial de Playwright con Chromium ya instalado. Lo necesita
# `rehype-mermaid` (estrategia `inline-svg`) durante `astro build` para pintar
# los diagramas a SVG. También trae Node, así que sirve como entorno de build.
FROM mcr.microsoft.com/playwright:v1.59.1-noble AS builder

WORKDIR /app

RUN corepack enable && corepack prepare pnpm@latest --activate

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

COPY . .
RUN pnpm run build

# Runtime: nginx estático. Astro genera HTML + assets ya con las gráficas
# (Chart.js prerender vía chartjs-node-canvas) y diagramas (Mermaid) embebidos,
# así que no hace falta un proceso Node vivo en producción.
FROM nginx:1.27-alpine AS runtime

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80
