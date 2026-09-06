# CSHRK API Conventions

## 1. Routing & Versioning
All backend API routes follow the URI versioning convention:
```text
https://api.cshrk.local/api/v1/{module}/{resource}
```

## 2. Standard Success Response Envelope
All successful 2xx responses are wrapped in a standard JSON envelope:
```json
{
  "success": true,
  "statusCode": 200,
  "data": { ... },
  "meta": {
    "timestamp": "2026-09-06T14:30:00.000Z",
    "page": 1,
    "limit": 20,
    "total": 100
  }
}
```

## 3. Standard Error Envelope (RFC 7807)
All 4xx and 5xx responses are caught by the global `HttpExceptionFilter`:
```json
{
  "statusCode": 400,
  "message": "Validation error occurred",
  "error": "Bad Request",
  "errors": [
    "email must be an email",
    "password must be longer than or equal to 8 characters"
  ],
  "timestamp": "2026-09-06T14:30:00.000Z",
  "path": "/api/v1/auth/register"
}
```
