import { z } from 'zod';
import {
  UserRole,
  WorkerAvailabilityStatus,
  WorkerEmploymentType,
  ProficiencyLevel,
} from '@cshrk/types';

// Password criteria: min 8 chars, at least 1 number, at least 1 letter
export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters long')
  .regex(/[A-Za-z]/, 'Password must contain at least one letter')
  .regex(/[0-9]/, 'Password must contain at least one number');

// Indian phone number or general E.164
export const phoneSchema = z
  .string()
  .regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number format')
  .optional();

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: passwordSchema,
  phone: phoneSchema,
  role: z.nativeEnum(UserRole, {
    errorMap: () => ({ message: 'Invalid user role' }),
  }),
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
});

export const geoPointSchema = z.object({
  type: z.literal('Point'),
  coordinates: z.tuple([
    z.number().min(-180).max(180), // Longitude
    z.number().min(-90).max(90),   // Latitude
  ]),
});

export const paginationQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

// Phase 1 Workforce Schemas
export const workerAvailabilitySchema = z.object({
  availabilityStatus: z.nativeEnum(WorkerAvailabilityStatus, {
    errorMap: () => ({ message: 'Invalid availability status' }),
  }),
});

export const workerLocationUpdateSchema = z.object({
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
});

export const workerOnboardSchema = z.object({
  cooperativeId: z.string().uuid('Invalid cooperative ID format'),
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
  memberId: z.string().optional(),
  employmentType: z.nativeEnum(WorkerEmploymentType).default(WorkerEmploymentType.MEMBER_WORKER),
});

export const addWorkerSkillSchema = z.object({
  skillId: z.string().uuid('Invalid skill ID format'),
  proficiencyLevel: z.nativeEnum(ProficiencyLevel).default(ProficiencyLevel.BEGINNER),
});

export const verifyWorkerSkillSchema = z.object({
  isVerified: z.boolean(),
});

export const jobAssignmentResponseSchema = z.object({
  action: z.enum(['ACCEPT', 'DECLINE'], {
    errorMap: () => ({ message: 'Action must be either ACCEPT or DECLINE' }),
  }),
  reason: z.string().optional(),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type GeoPointInput = z.infer<typeof geoPointSchema>;
export type PaginationQueryInput = z.infer<typeof paginationQuerySchema>;
export type WorkerAvailabilityInput = z.infer<typeof workerAvailabilitySchema>;
export type WorkerLocationUpdateInput = z.infer<typeof workerLocationUpdateSchema>;
export type WorkerOnboardInput = z.infer<typeof workerOnboardSchema>;
export type AddWorkerSkillInput = z.infer<typeof addWorkerSkillSchema>;
export type VerifyWorkerSkillInput = z.infer<typeof verifyWorkerSkillSchema>;
export type JobAssignmentResponseInput = z.infer<typeof jobAssignmentResponseSchema>;

