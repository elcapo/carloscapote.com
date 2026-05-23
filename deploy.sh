#!/usr/bin/env bash
set -euo pipefail

COMPOSE_FILE="docker-compose.traefik.yml"
SERVICE="web"
IMAGE="carloscapote-com:latest"
CONTAINER="carloscapote-com"
TMP_DIST=$(mktemp -d)

cleanup() { rm -rf "$TMP_DIST"; }
trap cleanup EXIT

echo "1. Building image"
docker compose -f "$COMPOSE_FILE" build "$SERVICE"

echo "2. Extracting dist from image"
docker create --name extract-tmp "$IMAGE" > /dev/null
docker cp extract-tmp:/usr/share/nginx/html/. "$TMP_DIST/"
docker rm extract-tmp > /dev/null

echo "3. Copying assets"
docker cp "$TMP_DIST/_astro/." "$CONTAINER:/usr/share/nginx/html/_astro/" 2>/dev/null || true

echo "4. Copying nginx config"
docker cp nginx.conf "$CONTAINER:/etc/nginx/conf.d/default.conf"

echo "5. Copying HTML y resto del contenido"
docker cp "$TMP_DIST/." "$CONTAINER:/usr/share/nginx/html/"

echo "6. Reloading nginx"
docker exec "$CONTAINER" nginx -s reload

echo "Deploy finished"
