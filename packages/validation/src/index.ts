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

// Phase 2 Customer & Marketplace Schemas
export const updateCustomerProfileSchema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters').optional(),
  phone: phoneSchema,
  address: z.string().min(3, 'Address must be at least 3 characters').optional(),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
});

export const createServiceRequestSchema = z.object({
  serviceId: z.string().uuid('Invalid service ID format'),
  description: z.string().min(5, 'Description must be at least 5 characters'),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  addressText: z.string().min(3, 'Address must be at least 3 characters').optional(),
  urgency: z.enum(['STANDARD', 'URGENT', 'EMERGENCY']).default('STANDARD'),
  scheduledTime: z.string().datetime().optional(),
});

export const createBookingSchema = z.object({
  serviceRequestId: z.string().uuid('Invalid service request ID format'),
  workerId: z.string().uuid('Invalid worker ID format'),
  startTime: z.string().datetime().optional(),
  durationHours: z.number().positive().default(2),
});

export const rateBookingSchema = z.object({
  score: z.number().int().min(1, 'Score must be between 1 and 5').max(5, 'Score must be between 1 and 5'),
  comment: z.string().max(1000).optional(),
});

// ==============================================================================
// PHASE 3 — COOPERATIVE & FEDERATION VALIDATION SCHEMAS
// ==============================================================================
export const createTeamSchema = z.object({
  cooperativeId: z.string().uuid('Invalid cooperative ID'),
  name: z.string().min(2, 'Team name must be at least 2 characters'),
  description: z.string().optional(),
  leaderWorkerId: z.string().uuid('Invalid leader worker ID').optional(),
  projectId: z.string().uuid('Invalid project ID').optional(),
});

export const updateTeamSchema = z.object({
  name: z.string().min(2).optional(),
  description: z.string().optional(),
  leaderWorkerId: z.string().uuid().optional(),
  status: z.enum(['ACTIVE', 'ASSIGNED', 'DISBANDED']).optional(),
  projectId: z.string().uuid().optional(),
});

export const addTeamMemberSchema = z.object({
  workerId: z.string().uuid('Invalid worker ID'),
  role: z.enum(['LEADER', 'MEMBER']).default('MEMBER'),
});

export const createContractSchema = z.object({
  contractNumber: z.string().min(3, 'Contract number must be at least 3 characters'),
  title: z.string().min(3, 'Title must be at least 3 characters'),
  clientName: z.string().min(2, 'Client name must be at least 2 characters'),
  clientContact: z.string().optional(),
  cooperativeId: z.string().uuid().optional(),
  federationId: z.string().uuid().optional(),
  scope: z.string().min(5, 'Scope must be at least 5 characters'),
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
  status: z.enum(['DRAFT', 'PROPOSED', 'ACTIVE', 'PAUSED', 'COMPLETED', 'CANCELLED']).default('DRAFT'),
});

export const updateContractStatusSchema = z.object({
  status: z.enum(['DRAFT', 'PROPOSED', 'ACTIVE', 'PAUSED', 'COMPLETED', 'CANCELLED']),
});

export const createProjectSchema = z.object({
  contractId: z.string().uuid().optional(),
  cooperativeId: z.string().uuid('Invalid cooperative ID'),
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().min(5, 'Description must be at least 5 characters'),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  address: z.string().optional(),
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
  status: z.enum(['PLANNING', 'IN_PROGRESS', 'ON_HOLD', 'COMPLETED', 'CANCELLED']).default('PLANNING'),
});

export const createLargeJobSchema = z.object({
  projectId: z.string().uuid().optional(),
  cooperativeId: z.string().uuid('Invalid cooperative ID'),
  title: z.string().min(3, 'Job title must be at least 3 characters'),
  organizationName: z.string().min(2, 'Organization name must be at least 2 characters'),
  skillId: z.string().uuid('Invalid skill ID'),
  requiredWorkers: z.number().int().positive('Must require at least 1 worker'),
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  address: z.string().optional(),
  status: z.enum(['OPEN', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED']).default('OPEN'),
});

export const createWorkforceRequirementSchema = z.object({
  contractId: z.string().uuid().optional(),
  projectId: z.string().uuid().optional(),
  skillId: z.string().uuid('Invalid skill ID'),
  quantity: z.number().int().positive('Quantity must be greater than 0'),
  locationCity: z.string().min(2, 'City must be at least 2 characters'),
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
});

export const createFulfillmentProposalSchema = z.object({
  requirementId: z.string().uuid('Invalid requirement ID'),
  title: z.string().min(3, 'Proposal title must be at least 3 characters'),
  notes: z.string().optional(),
  allocations: z.array(
    z.object({
      cooperativeId: z.string().uuid('Invalid cooperative ID'),
      allocatedWorkers: z.number().int().positive('Must allocate at least 1 worker'),
    }),
  ).min(1, 'Must specify at least one cooperative allocation'),
});

export const respondFulfillmentAllocationSchema = z.object({
  action: z.enum(['APPROVE', 'REJECT']),
  rejectionReason: z.string().optional(),
});

export const updateMembershipStatusSchema = z.object({
  status: z.enum(['PENDING', 'ACTIVE', 'SUSPENDED', 'INACTIVE']),
  notes: z.string().optional(),
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
export type UpdateCustomerProfileInput = z.infer<typeof updateCustomerProfileSchema>;
export type CreateServiceRequestInput = z.infer<typeof createServiceRequestSchema>;
export type CreateBookingInput = z.infer<typeof createBookingSchema>;
export type RateBookingInput = z.infer<typeof rateBookingSchema>;

export type CreateTeamInput = z.infer<typeof createTeamSchema>;
export type UpdateTeamInput = z.infer<typeof updateTeamSchema>;
export type AddTeamMemberInput = z.infer<typeof addTeamMemberSchema>;
export type CreateContractInput = z.infer<typeof createContractSchema>;
export type UpdateContractStatusInput = z.infer<typeof updateContractStatusSchema>;
export type CreateProjectInput = z.infer<typeof createProjectSchema>;
export type CreateLargeJobInput = z.infer<typeof createLargeJobSchema>;
export type CreateWorkforceRequirementInput = z.infer<typeof createWorkforceRequirementSchema>;
export type CreateFulfillmentProposalInput = z.infer<typeof createFulfillmentProposalSchema>;
export type RespondFulfillmentAllocationInput = z.infer<typeof respondFulfillmentAllocationSchema>;
export type UpdateMembershipStatusInput = z.infer<typeof updateMembershipStatusSchema>;


