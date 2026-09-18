# Auth service conventions

- Controllers parse input and format HTTP responses only.
- Services contain business rules; repositories contain Prisma access.
- TypeScript variables use camelCase, types/classes use PascalCase, and files use kebab-case.
- All responses use `{ success, message, data?, error? }`.
