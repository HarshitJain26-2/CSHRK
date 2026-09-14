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
  INITIATED = 'INITIATED',
  PENDING = 'PENDING',
  AUTHORIZED = 'AUTHORIZED',
  PAID = 'PAID',
  FAILED = 'FAILED',
  EXPIRED = 'EXPIRED',
  CANCELLED = 'CANCELLED',
  REFUNDED = 'REFUNDED',
  PARTIALLY_REFUNDED = 'PARTIALLY_REFUNDED',
  DISPUTED = 'DISPUTED',
}

export enum RefundStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
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

export enum FinancialPolicyStatus {
  DRAFT = 'DRAFT',
  ACTIVE = 'ACTIVE',
  RETIRED = 'RETIRED',
}

export enum ReconciliationDiscrepancyType {
  MATCHED = 'MATCHED',
  AMOUNT_MISMATCH = 'AMOUNT_MISMATCH',
  MISSING_IN_PLATFORM = 'MISSING_IN_PLATFORM',
  MISSING_IN_GATEWAY = 'MISSING_IN_GATEWAY',
  INCONSISTENT_STATUS = 'INCONSISTENT_STATUS',
  UNSETTLED_COMPLETED_PAYMENT = 'UNSETTLED_COMPLETED_PAYMENT',
}

export enum ReconciliationResolutionStatus {
  UNRESOLVED = 'UNRESOLVED',
  RESOLVED = 'RESOLVED',
  FLAGGED_FOR_AUDIT = 'FLAGGED_FOR_AUDIT',
}

export enum ComplaintStatus {
  OPEN = 'OPEN',
  ACKNOWLEDGED = 'ACKNOWLEDGED',
  UNDER_REVIEW = 'UNDER_REVIEW',
  INVESTIGATING = 'INVESTIGATING',
  RESOLVED = 'RESOLVED',
  REJECTED = 'REJECTED',
  DISMISSED = 'DISMISSED',
  CLOSED = 'CLOSED',
}

// ==============================================================================
// PHASE 3 — COOPERATIVE & FEDERATION ENUMS
// ==============================================================================
export enum MembershipStatus {
  PENDING = 'PENDING',
  ACTIVE = 'ACTIVE',
  SUSPENDED = 'SUSPENDED',
  INACTIVE = 'INACTIVE',
}

export enum ContractStatus {
  DRAFT = 'DRAFT',
  PROPOSED = 'PROPOSED',
  ACTIVE = 'ACTIVE',
  PAUSED = 'PAUSED',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export enum ProjectStatus {
  PLANNING = 'PLANNING',
  IN_PROGRESS = 'IN_PROGRESS',
  ON_HOLD = 'ON_HOLD',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export enum JobStatus {
  OPEN = 'OPEN',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export enum RequirementStatus {
  PENDING = 'PENDING',
  FULFILLED = 'FULFILLED',
  PARTIALLY_FULFILLED = 'PARTIALLY_FULFILLED',
  UNFULFILLED = 'UNFULFILLED',
}

export enum TeamStatus {
  ACTIVE = 'ACTIVE',
  ASSIGNED = 'ASSIGNED',
  DISBANDED = 'DISBANDED',
}

export enum TeamMemberRole {
  LEADER = 'LEADER',
  MEMBER = 'MEMBER',
}

export enum FulfillmentPlanStatus {
  PROPOSED = 'PROPOSED',
  PENDING_COOPERATIVE_APPROVAL = 'PENDING_COOPERATIVE_APPROVAL',
  PARTIALLY_APPROVED = 'PARTIALLY_APPROVED',
  CONFIRMED = 'CONFIRMED',
  REJECTED = 'REJECTED',
  CANCELLED = 'CANCELLED',
}

export enum AllocationApprovalStatus {
  PENDING_APPROVAL = 'PENDING_APPROVAL',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
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
  matchScore?: number;
  explanations?: string[];
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
// PHASE 3 — COOPERATIVE & FEDERATION INTERFACES
// ==============================================================================
export interface ICooperativeMembership {
  id: string;
  userId: string;
  cooperativeId: string;
  workerId?: string;
  memberId?: string;
  role: string;
  status: MembershipStatus;
  joinedAt: string;
  leftAt?: string;
  verifiedBy?: string;
  verifiedAt?: string;
  notes?: string;
  user?: IUser;
  cooperative?: ICooperative;
  worker?: IWorker;
}

export interface IFederationMembership {
  id: string;
  userId: string;
  federationId: string;
  role: string;
  status: MembershipStatus;
  joinedAt: string;
  leftAt?: string;
  user?: IUser;
  federation?: IFederation;
}

export interface IWorkerTeam {
  id: string;
  cooperativeId: string;
  name: string;
  description?: string;
  leaderWorkerId?: string;
  status: TeamStatus;
  projectId?: string;
  members?: ITeamMember[];
  leader?: IWorker;
  createdAt: string;
  updatedAt: string;
}

export interface ITeamMember {
  id: string;
  teamId: string;
  workerId: string;
  role: TeamMemberRole;
  joinedAt: string;
  worker?: IWorker;
}

export interface IContract {
  id: string;
  contractNumber: string;
  title: string;
  clientName: string;
  clientContact?: string;
  cooperativeId?: string;
  federationId?: string;
  scope: string;
  startDate: string;
  endDate: string;
  status: ContractStatus;
  createdAt: string;
  updatedAt: string;
}

export interface IProject {
  id: string;
  contractId?: string;
  cooperativeId: string;
  title: string;
  description: string;
  location?: GeoPoint;
  address?: string;
  startDate: string;
  endDate: string;
  status: ProjectStatus;
  contract?: IContract;
  teams?: IWorkerTeam[];
  createdAt: string;
  updatedAt: string;
}

export interface ILargeJob {
  id: string;
  projectId?: string;
  cooperativeId: string;
  title: string;
  organizationName: string;
  skillId: string;
  requiredWorkers: number;
  assignedWorkers: number;
  startDate: string;
  endDate: string;
  location?: GeoPoint;
  address?: string;
  status: JobStatus;
  skill?: ISkill;
  project?: IProject;
  createdAt: string;
  updatedAt: string;
}

export interface IWorkforceRequirement {
  id: string;
  contractId?: string;
  projectId?: string;
  skillId: string;
  quantity: number;
  fulfilledQuantity: number;
  locationCity: string;
  startDate: string;
  endDate: string;
  status: RequirementStatus;
  skill?: ISkill;
  contract?: IContract;
  createdAt: string;
  updatedAt: string;
}

export interface IFulfillmentPlan {
  id: string;
  requirementId: string;
  federationId: string;
  title: string;
  notes?: string;
  status: FulfillmentPlanStatus;
  allocations?: IFulfillmentAllocation[];
  requirement?: IWorkforceRequirement;
  createdAt: string;
  updatedAt: string;
}

export interface IFulfillmentAllocation {
  id: string;
  planId: string;
  cooperativeId: string;
  allocatedWorkers: number;
  status: AllocationApprovalStatus;
  reviewedBy?: string;
  reviewedAt?: string;
  rejectionReason?: string;
  cooperative?: ICooperative;
  createdAt: string;
  updatedAt: string;
}

export interface IWorkforceCapacity {
  cooperativeId: string;
  skillId?: string;
  timeWindow?: {
    startDate: string;
    endDate: string;
  };
  totalWorkforce: number;
  activeWorkforce: number;
  availableWorkers: number;
  committedWorkforce: number;
  unavailableWorkers: number;
  availableCapacity: number;
  bySkill?: Array<{
    skillId: string;
    skillName: string;
    total: number;
    available: number;
    committed: number;
  }>;
}

export interface IFederationCapacity {
  federationId: string;
  totalCooperatives: number;
  totalWorkforce: number;
  activeWorkforce: number;
  availableWorkers: number;
  committedWorkforce: number;
  availableCapacity: number;
  cooperatives: Array<{
    cooperativeId: string;
    cooperativeName: string;
    district: string;
    capacity: IWorkforceCapacity;
  }>;
}

export interface IAuditLog {
  id: string;
  userId?: string;
  action: string;
  entityType: string;
  entityId?: string;
  ipAddress?: string;
  metadata?: Record<string, any>;
  createdAt: string;
}

// ==============================================================================
// PHASE 4 — FINANCIAL & PAYMENT INTERFACES
// ==============================================================================
export interface IFinancialPolicy {
  id: string;
  version: string;
  effectiveFrom: string;
  effectiveTo?: string;
  workerSharePct: number;
  cooperativeSharePct: number;
  platformFeePct: number;
  status: FinancialPolicyStatus;
  approvedBy?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ITaxPolicy {
  id: string;
  name: string;
  category?: string;
  rate: number;
  isExempt: boolean;
  description?: string;
}

export interface IPayment {
  id: string;
  bookingId: string;
  invoiceId?: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  provider: string;
  intentId?: string;
  idempotencyKey?: string;
  paymentMethod?: string;
  transactionRef?: string;
  paidAt?: string;
  failureReason?: string;
  metadata?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface IPaymentWebhookEvent {
  id: string;
  provider: string;
  eventId: string;
  eventType: string;
  payload: Record<string, any>;
  signature?: string;
  isVerified: boolean;
  isProcessed: boolean;
  processedAt?: string;
  createdAt: string;
}

export interface IInvoice {
  id: string;
  bookingId: string;
  customerId?: string;
  cooperativeId?: string;
  invoiceNumber: string;
  subtotal: number;
  discountAmount: number;
  taxableAmount: number;
  taxRate: number;
  taxAmount: number;
  totalAmount: number;
  status: InvoiceStatus;
  paidAt?: string;
  notes?: string;
  booking?: IBooking;
  createdAt: string;
  updatedAt: string;
}

export interface IRefund {
  id: string;
  paymentId: string;
  amount: number;
  reason: string;
  status: RefundStatus;
  providerRefundId?: string;
  createdById?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ISettlement {
  id: string;
  cooperativeId: string;
  workerId: string;
  bookingId?: string;
  paymentId?: string;
  financialPolicyId?: string;
  policyVersionApplied?: string;
  grossAmount: number;
  workerAmount: number;
  cooperativeFee: number;
  platformFee: number;
  status: SettlementStatus;
  periodStart?: string;
  periodEnd?: string;
  paidOutAt?: string;
  payoutReference?: string;
  worker?: IWorker;
  cooperative?: ICooperative;
  createdAt: string;
  updatedAt: string;
}

export interface IReconciliationRecord {
  id: string;
  periodStart: string;
  periodEnd: string;
  discrepancyType: ReconciliationDiscrepancyType;
  platformPaymentId?: string;
  gatewayTransactionId?: string;
  platformAmount?: number;
  gatewayAmount?: number;
  amountDiff?: number;
  resolutionStatus: ReconciliationResolutionStatus;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

// ==============================================================================
// PHASE 4 — AI LABOUR INTELLIGENCE INTERFACES
// ==============================================================================
export interface IAIWorkerMatchCandidate {
  workerId: string;
  cooperativeId: string;
  matchScore: number;
  distanceKm: number;
  skillFitScore: number;
  reliabilityScore: number;
  explanations: string[];
}

export interface IAIWorkerMatchResponse {
  serviceRequestId: string;
  candidates: IAIWorkerMatchCandidate[];
  algorithmVersion: string;
  fallbackUsed: boolean;
}

export interface IDailyDemandPrediction {
  date: string;
  expectedRequests: number;
  confidenceIntervalLower: number;
  confidenceIntervalUpper: number;
}

export interface IAIDemandForecast {
  districtCode: string;
  category: string;
  status: 'SUCCESS' | 'INSUFFICIENT_DATA';
  predictions: IDailyDemandPrediction[];
  modelVersion: string;
  evaluationMetrics?: {
    mae: number;
    rmse: number;
    mape: number;
  };
  notes?: string;
}

export interface IAllocationAssignment {
  jobId: string;
  assignedWorkerId: string;
  optimizationMetricScore: number;
}

export interface IAIWorkforceAllocationRecommendation {
  cooperativeId: string;
  assignments: IAllocationAssignment[];
  unassignedJobs: string[];
  optimizationEngine: string;
  requiresCooperativeApproval: boolean;
  status: 'RECOMMENDED' | 'SUBMITTED_AS_PROPOSAL' | 'APPROVED' | 'REJECTED';
}

export interface ISkillDeficit {
  skillName: string;
  skillCode: string;
  unfulfilledRequestCount: number;
  recommendedTrainees: number;
  severity: 'CRITICAL' | 'MODERATE' | 'ADEQUATE';
}

export interface IAISkillGapReport {
  districtCode: string;
  deficits: ISkillDeficit[];
  analysisEngine: string;
  generatedAt: string;
}

export interface IAIModelMetadata {
  modelName: string;
  version: string;
  featureSchema?: Record<string, any>;
  trainingDatasetRef?: string;
  evaluationMetrics?: Record<string, number>;
  status: 'ACTIVE' | 'DEPRECATED' | 'EVALUATING';
  createdAt: string;
}

export interface IAIInferenceLog {
  id: string;
  taskType: 'MATCHING' | 'FORECASTING' | 'ALLOCATION' | 'SKILL_GAP';
  modelVersion: string;
  inputHash: string;
  outputSummary?: Record<string, any>;
  latencyMs: number;
  fallbackUsed: boolean;
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

// ==============================================================================
// PHASE 5 — OPERATIONS, TRUST, COMMUNICATIONS & COMPLETION
// ==============================================================================

// Communication Enums
export enum ConversationType {
  BOOKING = 'BOOKING',
  CUSTOMER_COOPERATIVE = 'CUSTOMER_COOPERATIVE',
  WORKER_COOPERATIVE = 'WORKER_COOPERATIVE',
  COOPERATIVE_FEDERATION = 'COOPERATIVE_FEDERATION',
  DISPUTE_MEDIATION = 'DISPUTE_MEDIATION',
}

export enum ConversationStatus {
  ACTIVE = 'ACTIVE',
  ARCHIVED = 'ARCHIVED',
  CLOSED = 'CLOSED',
}

export enum MessageStatus {
  SENT = 'SENT',
  DELIVERED = 'DELIVERED',
  READ = 'READ',
}

// Notification Enums
export enum NotificationChannel {
  IN_APP = 'IN_APP',
  PUSH = 'PUSH',
  EMAIL = 'EMAIL',
  SMS = 'SMS',
}

export enum NotificationEventType {
  BOOKING_ACCEPTED = 'BOOKING_ACCEPTED',
  BOOKING_REJECTED = 'BOOKING_REJECTED',
  BOOKING_RESCHEDULED = 'BOOKING_RESCHEDULED',
  SERVICE_STARTED = 'SERVICE_STARTED',
  SERVICE_COMPLETED = 'SERVICE_COMPLETED',
  INVOICE_READY = 'INVOICE_READY',
  PAYMENT_VERIFIED = 'PAYMENT_VERIFIED',
  SETTLEMENT_PROCESSED = 'SETTLEMENT_PROCESSED',
  DISPUTE_OPENED = 'DISPUTE_OPENED',
  DISPUTE_UPDATED = 'DISPUTE_UPDATED',
  SOS_ALERT_TRIGGERED = 'SOS_ALERT_TRIGGERED',
  ADMIN_ACTION = 'ADMIN_ACTION',
  COOP_ASSIGNMENT = 'COOP_ASSIGNMENT',
  CERTIFICATION_EXPIRY_WARNING = 'CERTIFICATION_EXPIRY_WARNING',
  MESSAGE_RECEIVED = 'MESSAGE_RECEIVED',
  SUPPORT_REQUEST_UPDATED = 'SUPPORT_REQUEST_UPDATED',
}

export enum NotificationPriority {
  LOW = 'LOW',
  NORMAL = 'NORMAL',
  HIGH = 'HIGH',
  URGENT = 'URGENT',
}

// Trust & Safety Enums
export enum DisputeStatus {
  OPEN = 'OPEN',
  UNDER_REVIEW = 'UNDER_REVIEW',
  EVIDENCE_REQUESTED = 'EVIDENCE_REQUESTED',
  MEDIATION = 'MEDIATION',
  DECISION = 'DECISION',
  RESOLVED = 'RESOLVED',
  ESCALATED = 'ESCALATED',
}

export enum DisputeResolution {
  FULL_REFUND_CUSTOMER = 'FULL_REFUND_CUSTOMER',
  RELEASE_TO_WORKER = 'RELEASE_TO_WORKER',
  PARTIAL_SETTLEMENT = 'PARTIAL_SETTLEMENT',
  DISMISSED = 'DISMISSED',
}

export enum AccountRestrictionType {
  WARNING = 'WARNING',
  RESTRICTED = 'RESTRICTED',
  SUSPENDED = 'SUSPENDED',
  DEACTIVATED = 'DEACTIVATED',
}

export enum ModerationActionType {
  FLAG_CONTENT = 'FLAG_CONTENT',
  SUSPEND_USER = 'SUSPEND_USER',
  RESTRICT_USER = 'RESTRICT_USER',
  REINSTATE_USER = 'REINSTATE_USER',
  DISMISS_REPORT = 'DISMISS_REPORT',
}

// Emergency / SOS Enums
export enum SosCategory {
  PHYSICAL_SAFETY = 'PHYSICAL_SAFETY',
  MEDICAL_EMERGENCY = 'MEDICAL_EMERGENCY',
  HARASSMENT = 'HARASSMENT',
  ACCIDENT = 'ACCIDENT',
  HAZARDOUS_CONDITION = 'HAZARDOUS_CONDITION',
  OTHER = 'OTHER',
}

export enum SosPriority {
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL',
}

export enum SosStatus {
  TRIGGERED = 'TRIGGERED',
  ACKNOWLEDGED = 'ACKNOWLEDGED',
  RESPONDER_ASSIGNED = 'RESPONDER_ASSIGNED',
  RESOLVED = 'RESOLVED',
  FALSE_ALARM = 'FALSE_ALARM',
}

// Worker Support / Welfare Enums
export enum SupportRequestCategory {
  SAFETY_ISSUE = 'SAFETY_ISSUE',
  WORKPLACE_INCIDENT = 'WORKPLACE_INCIDENT',
  WELFARE_ASSISTANCE = 'WELFARE_ASSISTANCE',
  TRAINING_SUPPORT = 'TRAINING_SUPPORT',
  DOCUMENTATION_SUPPORT = 'DOCUMENTATION_SUPPORT',
}

export enum SupportRequestStatus {
  SUBMITTED = 'SUBMITTED',
  REVIEW = 'REVIEW',
  ACTION = 'ACTION',
  RESOLVED = 'RESOLVED',
  CLOSED = 'CLOSED',
}

// Offline Operations Enum
export enum OfflineSyncOperationType {
  JOB_STATUS_UPDATE = 'JOB_STATUS_UPDATE',
  SEND_MESSAGE = 'SEND_MESSAGE',
  OFFLINE_ACKNOWLEDGE = 'OFFLINE_ACKNOWLEDGE',
  SUPPORT_REQUEST = 'SUPPORT_REQUEST',
}

// Attachments & Storage Interfaces
export interface IAttachmentMetadata {
  id: string;
  filename: string;
  mimeType: 'image/jpeg' | 'image/png' | 'image/webp' | 'application/pdf';
  fileSizeBytes: number;
  url: string;
  sha256Checksum: string;
  uploadedAt: string;
}

// Communication Interfaces
export interface IConversation {
  id: string;
  type: ConversationType;
  status: ConversationStatus;
  customerId?: string;
  workerId?: string;
  cooperativeId?: string;
  federationId?: string;
  bookingId?: string;
  projectId?: string;
  disputeId?: string;
  title?: string;
  metadata?: Record<string, any>;
  lastMessageAt?: string;
  closedAt?: string;
  customer?: ICustomer;
  worker?: IWorker;
  cooperative?: ICooperative;
  booking?: IBooking;
  messages?: IMessage[];
  createdAt: string;
  updatedAt: string;
}

export interface IMessage {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  status: MessageStatus;
  clientMessageId?: string;
  readAt?: string;
  attachments?: IAttachmentMetadata[];
  sender?: IUser;
  conversation?: IConversation;
  createdAt: string;
  updatedAt: string;
}

// Notification Interfaces
export interface INotification {
  id: string;
  recipientId: string;
  title: string;
  message: string;
  channel: NotificationChannel;
  eventType: NotificationEventType;
  priority: NotificationPriority;
  isRead: boolean;
  readAt?: string;
  metadata?: Record<string, any>;
  recipient?: IUser;
  createdAt: string;
}

export interface IPushToken {
  id: string;
  userId: string;
  token: string;
  platform: 'IOS' | 'ANDROID' | 'WEB';
  deviceId?: string;
  isActive: boolean;
  lastUsedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface INotificationPreference {
  id: string;
  userId: string;
  channel: NotificationChannel;
  eventType: NotificationEventType;
  isEnabled: boolean;
  updatedAt: string;
}

// Trust & Safety Interfaces
export interface IComplaint {
  id: string;
  bookingId: string;
  raisedById: string;
  workerId?: string;
  customerId?: string;
  cooperativeId?: string;
  category: string;
  description: string;
  status: ComplaintStatus;
  resolutionNotes?: string;
  resolvedById?: string;
  resolvedAt?: string;
  booking?: IBooking;
  raisedBy?: IUser;
  cooperative?: ICooperative;
  createdAt: string;
  updatedAt: string;
}

export interface IDispute {
  id: string;
  bookingId: string;
  initiatorId: string;
  respondentId?: string;
  cooperativeId?: string;
  status: DisputeStatus;
  reason: string;
  disputedAmount: number;
  resolution?: DisputeResolution;
  resolutionNotes?: string;
  resolvedById?: string;
  resolvedAt?: string;
  booking?: IBooking;
  initiator?: IUser;
  respondent?: IUser;
  cooperative?: ICooperative;
  evidences?: IDisputeEvidence[];
  createdAt: string;
  updatedAt: string;
}

export interface IDisputeEvidence {
  id: string;
  disputeId: string;
  submittedById: string;
  title: string;
  description?: string;
  attachment: IAttachmentMetadata;
  submittedBy?: IUser;
  createdAt: string;
}

export interface IAccountRestriction {
  id: string;
  userId: string;
  restrictionType: AccountRestrictionType;
  reason: string;
  issuedById: string;
  expiresAt?: string;
  isActive: boolean;
  revokedAt?: string;
  revocationReason?: string;
  user?: IUser;
  issuedBy?: IUser;
  createdAt: string;
  updatedAt: string;
}

// Emergency / SOS Interfaces
export interface ISosAlert {
  id: string;
  requesterId: string;
  bookingId?: string;
  cooperativeId?: string;
  category: SosCategory;
  priority: SosPriority;
  status: SosStatus;
  location: GeoPoint;
  addressText?: string;
  description?: string;
  assignedResponderId?: string;
  resolutionNotes?: string;
  isLocationRedacted: boolean;
  resolvedAt?: string;
  requester?: IUser;
  booking?: IBooking;
  cooperative?: ICooperative;
  assignedResponder?: IUser;
  updates?: ISosUpdate[];
  createdAt: string;
  updatedAt: string;
}

export interface ISosUpdate {
  id: string;
  sosAlertId: string;
  authorId: string;
  note: string;
  previousStatus?: SosStatus;
  newStatus?: SosStatus;
  location?: GeoPoint;
  author?: IUser;
  createdAt: string;
}

// Worker Support / Welfare Interfaces
export interface IWorkerSupportRequest {
  id: string;
  workerId: string;
  cooperativeId: string;
  category: SupportRequestCategory;
  status: SupportRequestStatus;
  subject: string;
  description: string;
  actionTaken?: string;
  reviewedById?: string;
  resolvedAt?: string;
  worker?: IWorker;
  cooperative?: ICooperative;
  createdAt: string;
  updatedAt: string;
}

// Offline Sync Interfaces
export interface IOfflineSyncQueueItem {
  operationId: string;
  operationType: OfflineSyncOperationType;
  idempotencyKey: string;
  clientTimestamp: string;
  payload: Record<string, any>;
}

export interface IOfflineSyncResult {
  operationId: string;
  status: 'APPLIED' | 'DUPLICATE_IGNORED' | 'CONFLICT_RESOLVED' | 'REJECTED';
  message: string;
  serverEntityId?: string;
  serverTimestamp: string;
  conflictDetails?: Record<string, any>;
}

export interface IOfflineSyncResponse {
  totalProcessed: number;
  appliedCount: number;
  conflictCount: number;
  results: IOfflineSyncResult[];
}

