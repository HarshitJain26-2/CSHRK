# CSHRK Security Architecture

## 1. Authentication Standards
- **Password Security**: Passwords are salted and hashed using `bcrypt` with 10 rounds. Cleartext passwords are never stored or logged.
- **Token Strategy**: Stateless JSON Web Tokens (JWT) signed with HMAC-SHA256 containing minimal payload (`sub`, `email`, `role`).
- **Header Convention**: Standard HTTP `Authorization: Bearer <token>`.

## 2. Role-Based Access Control (RBAC)
- All protected endpoints apply `JwtAuthGuard` and `RolesGuard`.
- Roles are declared via `@Roles(...)` metadata.
- `PLATFORM_ADMIN` acts as a global administrative superuser with clearance across all role-protected endpoints.

## 3. Input Validation & Defense in Depth
- **Strict Validation Pipe**: DTOs use `class-validator` with `whitelist: true` and `forbidNonWhitelisted: true`.
- **SQL Injection Prevention**: TypeORM parameterized queries prevent SQL injection across both standard and PostGIS spatial queries.
- **RFC 7807 Error Sanitization**: Internal database stack traces are suppressed from client responses in production.
