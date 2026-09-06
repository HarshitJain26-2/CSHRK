# CSHRK Authentication & Identity Guide

## 1. Endpoints

### Register
- **Route**: `POST /api/v1/auth/register`
- **Body**:
  ```json
  {
    "email": "worker@example.com",
    "password": "Password123!",
    "fullName": "Ramesh Kumar",
    "role": "WORKER",
    "phone": "+919876543210"
  }
  ```

### Login
- **Route**: `POST /api/v1/auth/login`
- **Body**:
  ```json
  {
    "email": "worker@example.com",
    "password": "Password123!"
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "statusCode": 200,
    "data": {
      "user": {
        "id": "c1f7b8c2-3e28-4e39-b9d9-5f65342a1234",
        "email": "worker@example.com",
        "role": "WORKER",
        "status": "ACTIVE"
      },
      "tokens": {
        "accessToken": "eyJhbGciOi...",
        "expiresIn": "7d"
      }
    }
  }
  ```

### Profile
- **Route**: `GET /api/v1/auth/me`
- **Headers**: `Authorization: Bearer <accessToken>`
