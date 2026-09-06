# CSHRK Deployment Guidelines (Phase 0 Foundation)

## 1. Local Containerized Stack

To bring up the entire local backend and database stack:
```bash
docker compose -f infrastructure/docker/docker-compose.yml up -d
```

## 2. Production Target Topology
- **API & AI Services**: Containerized workloads deployed via ECS, Kubernetes, or App Runner.
- **Database**: Managed PostgreSQL instance (e.g. AWS RDS or Supabase) with PostGIS extension enabled (`CREATE EXTENSION IF NOT EXISTS postgis;`).
- **Web Applications**: Static hosting on edge CDNs (Cloudflare Pages / Vercel / AWS S3 + CloudFront).
- **Mobile Applications**: Distributed via Expo Application Services (EAS Build) for iOS IPA and Android APK/AAB.
