/**
 * CSHRK Centralized Type Definitions & Domain Enums
 * Single source of truth across Backend, Web Admin, Customer Mobile, and Worker Mobile
 */

// ==============================================================================
// USER ROLES & ACCOUNT STATUS
// ==============================================================================
export enum UserRole {
  CUSTOMER = 'CUSTOMER',
  WORKER = 'WORKER',
  COOPERATIVE_ADMIN = 'COOPERATIVE_ADMIN',
  FEDERATION_ADMIN = 'FEDERATION_ADMIN',
  PLATFORM_ADMIN = 'PLATFORM_ADMIN',
}

export enum AccountStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  SUSPENDED = 'SUSPENDED',
  PENDING_VERIFICATION = 'PENDING_VERIFICATION',
}

// ==============================================================================
// WORKFORCE ENUMS
// ==============================================================================
export enum WorkerAvailabilityStatus {
  AVAILABLE = 'AVAILABLE',
  BUSY = 'BUSY',
  OFFLINE = 'OFFLINE',
}

export enum WorkerEmploymentType {
  MEMBER_WORKER = 'MEMBER_WORKER',
  CONTRACT_WORKER = 'CONTRACT_WORKER',
  APPRENTICE = 'APPRENTICE',
}

export enum ProficiencyLevel {
  BEGINNER = 'BEGINNER',
  INTERMEDIATE = 'INTERMEDIATE',
  ADVANCED = 'ADVANCED',
  EXPERT = 'EXPERT',
}

// ==============================================================================
// MARKETPLACE & SERVICE ENUMS
// ==============================================================================
export enum ServiceRequestStatus {
  PENDING = 'PENDING',
  ACCEPTED = 'ACCEPTED',
  ASSIGNED = 'ASSIGNED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export enum BookingStatus {
  REQUESTED = 'REQUESTED',
  MATCHED = 'MATCHED',
  PENDING_ACCEPTANCE = 'PENDING_ACCEPTANCE',
  CONFIRMED = 'CONFIRMED',
  SCHEDULED = 'SCHEDULED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  REJECTED = 'REJECTED',
  DISPUTED = 'DISPUTED',
}

// ==============================================================================
// FINANCIAL & AUDIT ENUMS
// ==============================================================================
export enum PaymentStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  REFUNDED = 'REFUNDED',
}

export enum InvoiceStatus {
  DRAFT = 'DRAFT',
  ISSUED = 'ISSUED',
  PAID = 'PAID',
  CANCELLED = 'CANCELLED',
}

export enum SettlementStatus {
  PENDING = 'PENDING',
  PROCESSED = 'PROCESSED',
  FAILED = 'FAILED',
}

export enum ComplaintStatus {
  OPEN = 'OPEN',
  INVESTIGATING = 'INVESTIGATING',
  RESOLVED = 'RESOLVED',
  DISMISSED = 'DISMISSED',
}

// ==============================================================================
// GEOMETRIC & SPATIAL TYPES (PostGIS 4326)
// ==============================================================================
export interface GeoPoint {
  type: 'Point';
  coordinates: [number, number]; // [longitude, latitude]
}

export interface GeoPolygon {
  type: 'Polygon' | 'MultiPolygon';
  coordinates: number[][][] | number[][][][];
}

// ==============================================================================
// CORE DOMAIN ENTITY INTERFACES
// ==============================================================================
export interface IUser {
  id: string;
  email: string;
  fullName?: string;
  phone?: string;
  role: UserRole;
  status: AccountStatus;
  createdAt: string;
  updatedAt: string;
}

export interface IFederation {
  id: string;
  name: string;
  code: string;
  state: string;
  contactEmail: string;
  contactPhone?: string;
  status: AccountStatus;
  createdAt: string;
  updatedAt: string;
}

export interface ICooperative {
  id: string;
  federationId: string;
  name: string;
  registrationNumber: string;
  district: string;
  contactEmail: string;
  contactPhone?: string;
  serviceBoundary?: GeoPolygon;
  status: AccountStatus;
  createdAt: string;
  updatedAt: string;
}

export interface ICustomer {
  id: string;
  userId: string;
  fullName: string;
  phone?: string;
  address?: string;
  defaultLocation?: GeoPoint;
  status: AccountStatus;
  user?: IUser;
  createdAt: string;
  updatedAt: string;
}

export interface IWorker {
  id: string;
  userId: string;
  cooperativeId: string;
  fullName: string;
  memberId?: string;
  employmentType: WorkerEmploymentType;
  status: AccountStatus;
  availabilityStatus: WorkerAvailabilityStatus;
  currentLocation?: GeoPoint;
  ratingAvg: number;
  totalJobs: number;
  createdAt: string;
  updatedAt: string;
}

export interface ISkill {
  id: string;
  name: string;
  code: string;
  category: string;
  description?: string;
}

export interface IWorkerSkill {
  id: string;
  workerId: string;
  skillId: string;
  skill?: ISkill;
  proficiencyLevel: ProficiencyLevel;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ICertification {
  id: string;
  workerId: string;
  title: string;
  issuingAuthority: string;
  issueDate: string;
  expiryDate?: string;
  verificationStatus: 'PENDING' | 'VERIFIED' | 'REJECTED';
  documentUrl?: string;
}

export interface IJobAssignment {
  id: string;
  bookingId: string;
  serviceRequestId: string;
  customerName: string;
  serviceCategory: string;
  title: string;
  description?: string;
  locationAddress: string;
  distanceKm?: number;
  scheduledAt: string;
  estimatedPayout: number;
  status: 'PENDING_ACCEPTANCE' | 'ACCEPTED' | 'IN_PROGRESS' | 'COMPLETED' | 'DECLINED';
}

export interface IWorkerAvailabilityUpdate {
  availabilityStatus: WorkerAvailabilityStatus;
}

export interface IWorkerProfile extends IWorker {
  cooperative?: ICooperative;
  skills?: IWorkerSkill[];
  certifications?: ICertification[];
}

export interface IService {
  id: string;
  name: string;
  category: string;
  description?: string;
  basePrice: number;
  unit: string;
  isActive: boolean;
  skillId?: string;
  skill?: ISkill;
}

export interface IServiceCategory {
  name: string;
  count: number;
  description?: string;
}

export interface IServiceRequest {
  id: string;
  customerId: string;
  serviceId: string;
  description?: string;
  location?: any;
  addressText?: string;
  urgency?: 'STANDARD' | 'URGENT' | 'EMERGENCY';
  scheduledTime?: string;
  status: ServiceRequestStatus;
  customer?: ICustomer;
  service?: IService;
  createdAt: string;
  updatedAt: string;
}

export interface IBookingCandidate {
  workerId: string;
  userId: string;
  fullName: string;
  cooperativeName: string;
  memberId?: string;
  ratingAvg: number;
  totalJobs: number;
  distanceKm: number;
  verifiedSkillName: string;
  proficiencyLevel: ProficiencyLevel;
}

export interface IBooking {
  id: string;
  serviceRequestId: string;
  customerId: string;
  workerId?: string;
  cooperativeId?: string;
  status: BookingStatus;
  totalAmount: number;
  startTime?: string;
  endTime?: string;
  serviceRequest?: IServiceRequest;
  customer?: ICustomer;
  worker?: IWorkerProfile;
  cooperative?: ICooperative;
  createdAt: string;
  updatedAt: string;
}

export interface IRating {
  id: string;
  bookingId: string;
  reviewerId: string;
  targetId: string;
  score: number;
  comment?: string;
  createdAt: string;
}

// ==============================================================================
// API RESPONSE ENVELOPES (RFC 7807 Standard Compliant)
// ==============================================================================
export interface ApiResponse<T> {
  success: boolean;
  statusCode: number;
  message?: string;
  data: T;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    timestamp: string;
  };
}

export interface ApiErrorResponse {
  statusCode: number;
  message: string;
  error: string;
  errors?: string[] | Record<string, unknown>;
  timestamp: string;
  path: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken?: string;
  expiresIn: string;
}

export interface AuthSession {
  user: IUser;
  tokens: AuthTokens;
}
