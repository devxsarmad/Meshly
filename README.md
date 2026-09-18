# Meshly

Meshly is a production-minded, portfolio-quality e-commerce platform built with independently deployable microservices. The project demonstrates practical distributed-systems patterns: an API gateway, service-owned databases, synchronous REST APIs, asynchronous event-driven workflows, authentication, containerization, and clear service boundaries.

## Product vision

Meshly will provide a customer-facing storefront and lightweight administration experience backed by the following services:

| Service | Responsibility | Data store |
| --- | --- | --- |
| `api-gateway` | Public entry point, routing, JWT verification, rate limiting | None |
| `auth-service` | Registration, login, JWTs, refresh tokens, roles | PostgreSQL |
| `product-service` | Products, categories, search, inventory counts | MongoDB |
| `cart-service` | Per-user carts and TTL-based expiry | Redis |
| `order-service` | Order creation, history, and order status | PostgreSQL |
| `payment-service` | Mock payment processing and payment status | PostgreSQL |
| `notification-service` | Mock email/SMS notifications and event handling | None or lightweight log storage |
| `frontend` | Storefront, cart, checkout, order history, and admin views | None |

## Architecture

Clients communicate only with the API gateway over REST. The gateway routes requests to the appropriate service and performs cross-cutting concerns such as rate limiting and access-token verification.

Services communicate with each other through APIs or domain events. They never access another service's database. Each service owns its schema, persistence, business rules, and deployment lifecycle.

The order workflow is event-driven:

```text
Client → API Gateway ──REST──▶ Order Service
                                  │ OrderPlaced
                                  ▼
                               RabbitMQ
                              ╱        ╲
                             ▼          ▼
                    Payment Service  Notification Service
                             │
                    PaymentConfirmed / PaymentFailed
```

Docker Compose provides service discovery through internal service names such as `auth-service`, `postgres`, and `rabbitmq`. Kubernetes migration is a future deployment option.

## Repository structure

```text
meshly/
├── api-gateway/
│   ├── src/
│   ├── Dockerfile
│   ├── package.json
│   └── .env.example
├── services/
│   ├── auth-service/
│   │   ├── src/
│   │   ├── prisma/
│   │   ├── Dockerfile
│   │   ├── package.json
│   │   └── .env.example
│   ├── product-service/
│   │   ├── src/
│   │   ├── Dockerfile
│   │   ├── package.json
│   │   └── .env.example
│   ├── product-service/
│   ├── cart-service/
│   ├── order-service/
│   ├── payment-service/
│   └── notification-service/
├── frontend/
├── shared/
│   └── types/
├── docker-compose.yml
├── README.md
└── .gitignore
```

Every service has its own `package.json`, `package-lock.json`, `node_modules`, Dockerfile, environment configuration, and database access layer. There are no shared root runtime dependencies.

## Backend conventions

Backend services follow a consistent layered architecture:

```text
Controller → Service → Repository → Database
```

- Controllers handle HTTP input and output only.
- Services contain business logic and orchestration.
- Repositories contain database queries.
- Centralized error middleware handles failures.
- All APIs use `{ success, message, data?, error? }`.
- TypeScript runs in strict mode.
- Secrets and service URLs come from environment variables.
- Shared event payloads stay minimal and live under `shared/types`.

## Authentication

The auth service uses Prisma with PostgreSQL. Access tokens expire after 15 minutes. Refresh tokens expire after 7 days, are stored hashed, and are rotated when refreshed. Users support `CUSTOMER` and `ADMIN` roles.

## Frontend design direction

The frontend will use Next.js, TypeScript, and Tailwind CSS with a deliberate editorial design system:

- Deep slate navy: `#1A2B3C`
- Burnt terracotta accent: `#C65D3B`
- Warm off-white background: `#FAF7F2`
- Fraunces headings
- IBM Plex Sans body text
- IBM Plex Mono for prices and SKUs
- Four-pixel border radius and restrained shadows

Design tokens will be defined once and reused throughout the application. The interface should feel considered and distinctive rather than like a generic SaaS template.

## Running the platform

### Docker Compose

The containerized development environment is the primary way to run the currently implemented platform foundation:

```bash
docker compose up --build
```

The API gateway is available at `http://localhost:3000`. PostgreSQL is available on port `5432` and the auth service is available directly on port `3001` for development diagnostics.

Stop the environment with:

```bash
docker compose down
```

### Running a service independently

Each service can be copied out of this repository and installed independently. For example:

```bash
cd services/auth-service
cp .env.example .env
npm install
npm run prisma:generate
npx prisma db push
npm run dev
```

In another terminal:

```bash
cd api-gateway
cp .env.example .env
npm install
npm run dev
```

## Auth API

Through the gateway:

- `POST /api/auth/register` — `{ "email", "password", "name?" }`
- `POST /api/auth/login` — `{ "email", "password" }`
- `POST /api/auth/refresh` — `{ "refreshToken" }`
- `POST /api/auth/logout` — `{ "refreshToken" }`
- `GET /health`

Product catalog endpoints are available through the gateway at `/api/products`.

## Delivery roadmap

The platform is developed incrementally so every architectural slice remains runnable and testable:

1. Gateway and authentication foundation.
2. Product catalog and MongoDB integration.
3. Redis-backed shopping carts.
4. Orders, RabbitMQ, and order events.
5. Mock payment processing.
6. Notifications and event consumers.
7. Frontend foundation and design system.
8. Storefront, checkout, and order pages.
9. Error states, loading states, and admin views.
10. Optional Kubernetes deployment.

The repository intentionally grows one independently verifiable service at a time while preserving the final architecture above.
# Meshly
