import { UserRole } from '@cshrk/types';

export const APP_CONFIG = {
  NAME: 'CSHRK',
  VERSION: '0.1.0',
  DEFAULT_PORT: 3000,
  API_PREFIX: 'api/v1',
  DEFAULT_LOCALE: 'en',
  SUPPORTED_LOCALES: ['en', 'hi'],
} as const;

export const AUTH_CONFIG = {
  JWT_EXPIRES_IN: '7d',
  JWT_REFRESH_EXPIRES_IN: '30d',
  SALT_ROUNDS: 10,
  PASSWORD_MIN_LENGTH: 8,
} as const;

export const DB_CONFIG = {
  SRID: 4326, // WGS 84 GPS Standard
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
} as const;

// Role Permissions Matrix for RBAC
export const ROLE_PERMISSIONS: Record<UserRole, readonly string[]> = {
  [UserRole.CUSTOMER]: [
    'customer:profile:read',
    'customer:profile:write',
    'service:catalog:read',
    'booking:create',
    'booking:read:own',
  ],
  [UserRole.WORKER]: [
    'worker:profile:read',
    'worker:profile:write',
    'worker:availability:manage',
    'booking:read:assigned',
  ],
  [UserRole.COOPERATIVE_ADMIN]: [
    'cooperative:read:own',
    'cooperative:workers:manage',
    'cooperative:bookings:manage',
    'cooperative:reports:read',
  ],
  [UserRole.FEDERATION_ADMIN]: [
    'federation:read:own',
    'federation:cooperatives:manage',
    'federation:oversight:read',
  ],
  [UserRole.PLATFORM_ADMIN]: [
    'platform:admin:full',
    'audit:read:all',
    'system:health:read',
  ],
};
