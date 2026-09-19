# Payment service conventions

- The service is event-driven and does not expose a client-facing write API.
- `OrderPlaced` is consumed idempotently using the unique `orderId` constraint.
- Mock payment results are persisted before `PaymentConfirmed` or `PaymentFailed` is published.
- TypeScript variables use camelCase, types/classes use PascalCase, and files use kebab-case.
