# Notification service conventions

- The service consumes domain events and emits mock delivery logs.
- No business database is used; logs are held in process memory for this mock implementation.
- Event handlers must acknowledge messages only after processing succeeds.
- TypeScript variables use camelCase, types/classes use PascalCase, and files use kebab-case.
