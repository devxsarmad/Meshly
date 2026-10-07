#!/usr/bin/env bash
set -Eeuo pipefail

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
env_file="${ENV_FILE:-$repo_root/.env.prod}"
compose_file="$repo_root/docker-compose.prod.yml"

if [[ ! -f "$env_file" ]]; then
  echo "Missing production environment file: $env_file" >&2
  exit 1
fi

docker compose --env-file "$env_file" -f "$compose_file" stop nginx
docker compose --env-file "$env_file" -f "$compose_file" --profile certificate run --rm --service-ports certbot renew --standalone
docker compose --env-file "$env_file" -f "$compose_file" up -d nginx
