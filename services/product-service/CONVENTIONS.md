# Product service conventions

- Controllers validate input and format HTTP responses only.
- Services contain product business rules; repositories contain Mongoose access.
- TypeScript variables use camelCase, types/classes use PascalCase, and files use kebab-case.
- Catalog reads are public; catalog mutations require an `ADMIN` access token.
- All responses use `{ success, message, data?, error? }`.
