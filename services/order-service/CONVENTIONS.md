# Order service conventions

- Controllers validate input and format HTTP responses only.
- Services contain order business rules; repositories contain Prisma access.
- Order creation publishes the `OrderPlaced` event to the durable `meshly.events` topic exchange.
- Orders are scoped to the authenticated user and never expose another user's records.
- TypeScript variables use camelCase, types/classes use PascalCase, and files use kebab-case.
