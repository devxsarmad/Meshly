# Cart service conventions

- Controllers validate input and format HTTP responses only.
- Services contain cart business rules; repositories contain Redis access.
- Cart keys are scoped to the authenticated user and expire through Redis TTL.
- TypeScript variables use camelCase, types/classes use PascalCase, and files use kebab-case.
- All responses use `{ success, message, data?, error? }`.
