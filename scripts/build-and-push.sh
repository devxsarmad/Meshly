#!/usr/bin/env bash
set -Eeuo pipefail

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

if [[ -f "$repo_root/.env.prod" ]]; then
  set -a
  source "$repo_root/.env.prod"
  set +a
fi

dockerhub_username="${DOCKERHUB_USERNAME:-${1:-}}"
image_tag="${IMAGE_TAG:-${2:-latest}}"
platform="${DOCKER_PLATFORM:-linux/amd64}"

if [[ -z "$dockerhub_username" ]]; then
  echo "Usage: DOCKERHUB_USERNAME=<username> [IMAGE_TAG=<tag>] $0" >&2
  echo "Or: $0 <dockerhub-username> [tag]" >&2
  exit 1
fi

if [[ -z "${NEXT_PUBLIC_API_URL:-}" ]]; then
  echo "NEXT_PUBLIC_API_URL is required to build the frontend image" >&2
  exit 1
fi

if [[ -z "${NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY:-}" ]]; then
  echo "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY is required to build the frontend image" >&2
  exit 1
fi

services=(
  "api-gateway:api-gateway"
  "frontend:frontend"
  "auth-service:services/auth-service"
  "cart-service:services/cart-service"
  "mcp-server:services/mcp-server"
  "notification-service:services/notification-service"
  "order-service:services/order-service"
  "payment-service:services/payment-service"
  "product-service:services/product-service"
)

for entry in "${services[@]}"; do
  service="${entry%%:*}"
  context="${entry#*:}"
  image="docker.io/${dockerhub_username}/meshly-${service}:${image_tag}"
  build_args=()

  if [[ "$service" == "frontend" ]]; then
    build_args+=(
      --build-arg "NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}"
      --build-arg "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=${NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY}"
    )
  fi

  echo "Building ${image} for ${platform}"
  docker build --platform "$platform" "${build_args[@]}" -t "$image" "$repo_root/$context"
  echo "Pushing ${image}"
  docker push "$image"
done

echo "Published ${#services[@]} Meshly images with tag ${image_tag}."
