# Meshly Deployment Readiness — Chunk 0

Audit completed on 2026-10-06.

## Docker images

- [x] All nine custom images use separate build and runtime stages: API gateway, frontend, auth, cart, MCP, notification, order, payment, and product.
- [x] All runtime stages install production dependencies with `npm ci --omit=dev`.
- [x] TypeScript and `tsx` are absent from every final image.
- [x] Every final image declares `USER node`; Docker image inspection confirmed `user=node` for all nine images.
- [x] All nine images build successfully.
- [x] Prisma is available as a production dependency only where it is required for container startup migrations/schema synchronization.
- [x] Auth and order run `prisma db push --skip-generate`; Prisma clients are generated during the build so non-root runtime containers do not write into `node_modules`.

## Health endpoints

Live checks against the local Compose stack returned HTTP 200 for every HTTP service:

- [x] API gateway `/health` — process liveness; it owns no database or message-broker connection.
- [x] Auth service `/health` — executes `SELECT 1` against PostgreSQL.
- [x] Product service `/health` — pings MongoDB through the active Mongoose connection.
- [x] Cart service `/health` — executes Redis `PING`.
- [x] Order service `/health` — executes PostgreSQL `SELECT 1` and checks its RabbitMQ queue/channel.
- [x] Payment service `/health` — executes PostgreSQL `SELECT 1` and checks its RabbitMQ queue/channel.
- [x] Notification service `/health` — checks its RabbitMQ queue/channel.
- [x] Frontend `/health` — application liveness route added at `/health`; it owns no direct datastore connection.
- [x] MCP server — HTTP health is not applicable because this server uses stdio transport; its `ping` MCP tool is the liveness check.

Dependency failures in backend health handlers return HTTP 503 rather than a static success response.

## Secrets and configuration

- [x] Removed the frontend reference to `NEXT_PUBLIC_STRIPE_SECRET_KEY` and removed Stripe key logging.
- [x] Confirmed the only browser-exposed Stripe value is `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`, which is intentionally public.
- [x] Removed the tracked `frontend/.env.local` file and added local environment variants to `.gitignore` while preserving committed `.env.example` templates.
- [x] Replaced committed Docker Compose passwords and signing keys with required environment interpolation.
- [x] Added a root `.env.example` containing placeholders only.
- [x] Removed localhost fallback URLs from application runtime source; required URLs now fail fast when missing.
- [x] Removed the product seed script's localhost MongoDB fallback.
- [x] Removed payment-service startup logs that disclosed secret presence and length metadata.
- [x] Secret-pattern scan found no private keys, live Stripe secrets, credential-bearing database URLs, or public environment variables with secret names in application source.

Localhost URLs remain only in local-development Compose/example/documentation files. They are not runtime fallbacks and will not be used by the production configuration created in Chunk 1.

## Verification performed

- [x] TypeScript/Next.js production builds pass for all custom services.
- [x] `docker compose config --quiet` passes with supplied environment values.
- [x] Docker builds pass for all Compose services and the standalone MCP image.
- [x] Runtime image-user inspection reports `node` for every custom image.
- [x] Runtime image inspection confirms build-only TypeScript tooling is absent.
- [x] Live `/health` calls on ports 3000–3007 return HTTP 200 with dependency status details.

## Follow-up observation

Image installation reported existing npm advisories in the API gateway, frontend, auth, order, and payment dependency trees. The frontend reported 2 moderate, 7 high, and 1 critical advisory; the other affected services reported 3 high advisories each. Dependency upgrades need a separate compatibility-tested maintenance change before calling the application fully security-hardened; forced upgrades were not applied during this scoped audit.
