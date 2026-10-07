#!/usr/bin/env bash
set -Eeuo pipefail

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
env_file="${ENV_FILE:-$repo_root/.env.prod}"
compose_file="$repo_root/docker-compose.prod.yml"

if [[ ! -f "$env_file" ]]; then
  echo "Missing production environment file: $env_file" >&2
  exit 1
fi

set -a
source "$env_file"
set +a

: "${DOMAIN:?Set DOMAIN in .env.prod}"
: "${LETSENCRYPT_EMAIL:?Set LETSENCRYPT_EMAIL in .env.prod}"

# Standalone validation is reliable for one VPS/domain and avoids keeping a
# privileged renewal sidecar running. Port 80 must be free during issuance.
docker compose --env-file "$env_file" -f "$compose_file" stop nginx >/dev/null 2>&1 || true
docker compose --env-file "$env_file" -f "$compose_file" --profile certificate run --rm --service-ports certbot \
  certonly --standalone --non-interactive --agree-tos \
  --email "$LETSENCRYPT_EMAIL" --domain "$DOMAIN"
docker compose --env-file "$env_file" -f "$compose_file" up -d nginx

echo "HTTPS certificate issued for $DOMAIN and nginx started."
