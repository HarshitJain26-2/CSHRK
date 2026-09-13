# CSHRK Phase 5 — Operations, Trust & Completion Handover Document

```text
================================================================================
  PROJECT:                 CSHRK (Cooperative Labour & Service Marketplace)
  CURRENT PHASE:           PHASE 5 COMPLETED & VERIFIED
  PREVIOUS PHASES:         PHASE 0 (Foundation), PHASE 1 (Worker), PHASE 2 (Customer),
                           PHASE 3 (Cooperative & Federation), PHASE 4 (Payments & AI Intelligence)
  NEXT PHASE:              PHASE FINAL — POLISHING & PRODUCTION READINESS
  DEVELOPMENT BRANCH:      feature/phase-5-operations-trust
  STATUS:                  OPERATIONS, TRUST & RESILIENCE SUITE FULLY VERIFIED (52/52 CHECKS)
================================================================================
```

---

## 1. Executive Summary & Phase 5 Scope

**Phase 5 — Operations, Trust & Completion** implements the real-time communications, platform trust, regulatory dispute safety, emergency operational escalation, worker welfare advocacy, and offline-first resilience layers for CSHRK.

### Core Boundaries & Guardrails Maintained:
- **Zero Phase 0–4 Regressions**: All database migrations, PostGIS spatial queries, 8-state booking state machines, versioned financial policies (`POL-2026-V1`), GST tax invoices, sandbox/production payment gateways, and advisory AI matching models remain 100% operational without regression.
- **Non-Silent Financial Integrity**: Dispute arbitration outcomes that mandate customer refunds never silently mutate ledger accounts or write directly to balance tables. All financial resolutions invoke `PaymentService.processRefund()` through the controlled refund state machine.
- **Human Moderation & Accountability**: No autonomous black-box automated moderation suspensions. Account restrictions and content flags are strictly reviewed and enacted by authorized human administrators with immutable audit logging.
- **Statutory Emergency Disclaimers**: Emergency/SOS is an **internal platform operational escalation mechanism** to coordinate on-call cooperative safety officers and platform dispatchers. It contains prominent statutory warnings declaring it is **NOT a replacement for emergency public safety services (112 / Police / Ambulance)**.
- **Data Privacy & Retention Windows**: High-precision PostGIS coordinates associated with resolved emergency alerts are retained for 30 days for incident review, after which coordinates are automatically redacted/snapped to generalized sector centroids. All location queries are logged in security audit logs.
- **MIME & Storage Security**: File attachment uploads enforce strict MIME allowlists (`image/jpeg`, `image/png`, `image/webp`, `application/pdf`), a 5MB maximum file size guard, and SHA-256 integrity hashing; executable formats (`.exe`, `.bat`, `.sh`, `.php`, `.js`) are strictly rejected.
- **Resilience Offline Sync**: Operations queued while offline in remote or basement job sites sync via operation-specific conflict rules: `JOB_STATUS_UPDATE` respects server authoritative precedence, `SEND_MESSAGE` is append-only and idempotent, and `SUPPORT_REQUEST` is append-only.

---

## 2. Architecture Overview: Operations, Trust & Resilience

```
                                  ┌────────────────────────────────────────────────────────┐
                                  │               Mobile & Web Clients                     │
                                  │   (Admin Web, Customer Mobile, Worker Mobile)          │
                                  └───────────────────────────┬────────────────────────────┘
                                                              │ REST / WebSocket
                                                              ▼
 ┌──────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
 │                                           CSHRK Authoritative API Engine                                         │
 │                                                                                                                  │
 │  ┌───────────────────────┐  ┌─────────────────────────┐  ┌─────────────────────────┐  ┌───────────────────────┐  │
 │  │ Communication Module  │  │   Notification Module   │  │   Trust & Safety Module │  │   Emergency Module    │  │
 │  │ - Booking Conversations│  │ - Multi-channel (InApp, │  │ - Complaints Lifecycle  │  │ - Internal SOS Alert  │  │
 │  │ - 15 msg/min Limiter  │  │   Push, Email, SMS)     │  │ - Dispute Arbitration   │  │ - PostGIS 4326 Fix    │  │
 │  │ - Script Sanitization │  │ - Critical Event Bypass │  │ - processRefund Linkage │  │ - Statutory Warning   │  │
 │  │ - Participant Auth    │  │ - User Preference Store │  │ - Human Moderation      │  │ - 30-Day Redaction    │  │
 │  └───────────────────────┘  └─────────────────────────┘  └─────────────────────────┘  └───────────────────────┘  │
 │                                                                                                                  │
 │  ┌────────────────────────────────────────────────────┐  ┌────────────────────────────────────────────────────┐  │
 │  │             Welfare Operations Module              │  │                 Resilience Module                  │  │
 │  │ - Worker Support Requests (Safety, PPE, Medical)   │  │ - Batch Offline Sync (/resilience/sync)            │  │
 │  │ - Cooperative Advocate Assignment & Action Plans   │  │ - Server Precedence & Idempotency Rules            │  │
 │  └────────────────────────────────────────────────────┘  └────────────────────────────────────────────────────┘  │
 └────────────────────────────────────────────────────────────┬─────────────────────────────────────────────────────┘
                                                              │
                                                              ▼
                               ┌────────────────────────────────────────────────────────────┐
                               │           PostgreSQL / PostGIS Authoritative Store         │
                               │  - conversations, messages                                 │
                               │  - notifications, push_tokens, notification_preferences    │
                               │  - complaints, disputes, dispute_evidence, restrictions    │
                               │  - sos_alerts (GEOMETRY Point 4326), sos_updates           │
                               │  - worker_support_requests, audit_logs                     │
                               └────────────────────────────────────────────────────────────┘
```

---

## 3. Database Entities & Schemas

The following PostgreSQL tables and TypeORM entities were implemented:

| Entity | Table Name | Key Attributes & Constraints |
| :--- | :--- | :--- |
| `Conversation` | `conversations` | `type` (`BOOKING`, `SUPPORT`, `DIRECT`), `bookingId`, `customerId`, `workerId`, `status` |
| `Message` | `messages` | `conversationId`, `senderId`, `senderType`, `content` (sanitized), `status`, `metadata` |
| `Notification` | `notifications` | `userId`, `title`, `message`, `priority`, `channel`, `isRead`, `eventType` |
| `PushToken` | `push_tokens` | `userId`, `token`, `platform` (`IOS`, `ANDROID`, `WEB`), `isActive` |
| `NotificationPreference` | `notification_preferences` | `userId`, channel toggles (`inApp`, `push`, `email`, `sms`), muted categories |
| `Complaint` | `complaints` | Extended with `cooperativeId`, `complainantRole`, `respondentRole`, resolution metadata |
| `Dispute` | `disputes` | `bookingId`, `paymentId`, `raisedById`, `disputeAmount`, `resolution`, `status` |
| `DisputeEvidence` | `dispute_evidence` | `disputeId`, `uploaderId`, `fileUrl`, `fileSize`, `mimeType`, `sha256Hash` |
| `AccountRestriction` | `account_restrictions` | `userId`, `type` (`WARNING`, `RESTRICTED`, `SUSPENDED`), `reason`, `appliedById` |
| `SosAlert` | `sos_alerts` | `userId`, `bookingId`, `category`, `priority` (`CRITICAL`), `location` (Point 4326), disclaimer |
| `SosUpdate` | `sos_updates` | `sosAlertId`, `responderId`, `status`, `notes`, `location` (Point 4326) |
| `WorkerSupportRequest` | `worker_support_requests` | `workerId`, `category` (`SAFETY_ISSUE`, `WELFARE_ASSISTANCE`), `status`, `advocateId` |

---

## 4. Operational Systems Implementation Details

### 4.1 Real-Time Communications & Rate Limiting
- **Context-Bound Messaging**: All chat conversations are explicitly scoped to valid bookings (`type = ConversationType.BOOKING`). Only authorized booking participants (the matched worker, customer, or platform safety admins) can post or read messages.
- **Sliding-Window Rate Limiting**: In-memory sliding window rate limiter protects backend sockets and databases, permitting a maximum of 15 messages per 60-second window per user per conversation. Excessive rapid requests trigger HTTP 429 (`TooManyRequestsException`).
- **Content Sanitization**: Message bodies undergo automated HTML script sanitization (`<script>` tags, malicious event handlers) before persistence and broadcast.

### 4.2 Unified Notification Provider Abstraction
- Defined `NotificationProvider` interface with multi-channel adapters:
  - `InAppNotificationProvider`: Writes persistent unread notification records.
  - `PushNotificationProvider`: Handles device APNS / FCM push dispatch.
  - `EmailNotificationProvider`: Dispatches structured transactional HTML receipts.
  - `SmsNotificationProvider`: Dispatches critical operational SMS alerts.
- **Critical Event Protection**: While standard job updates respect user opt-out preferences (e.g., opting out of marketing or standard SMS alerts), life-safety critical events (`SOS_ALERT_TRIGGERED`, `DISPUTE_OPENED`, `ADMIN_ACTION`) bypass user suppression rules.

### 4.3 Secure Attachment & Storage Architecture
- **MIME Allowlist**: Strictly limited to `image/jpeg`, `image/png`, `image/webp`, and `application/pdf`.
- **Blocked Formats**: Executables and script files (`.exe`, `.bat`, `.sh`, `.php`, `.js`, `.py`, `.ps1`) are rejected at the edge.
- **Size Bounds**: Enforces a strict 5MB maximum file size limit.
- **Integrity**: Generates and validates cryptographic SHA-256 checksums on all uploaded dispute and safety evidence items.

### 4.4 Dispute Arbitration & Non-Silent Financial Flow
- Controlled workflow: `OPEN` -> `UNDER_REVIEW` -> `EVIDENCE_REQUESTED` -> `RESOLVED`.
- When an administrator arbitrates a dispute in favor of customer refund (`FULL_REFUND_CUSTOMER` or `PARTIAL_SETTLEMENT`), the dispute service directly invokes `PaymentService.processRefund(paymentId, amount, reason)`.
- Ledger transactions and settlement holdbacks are never directly updated from the dispute console; they strictly progress through the standard payment refund state machine.

### 4.5 Emergency SOS Operational Mechanism
- **Statutory Warning**: All emergency responses and alert records prominently carry:
  > *"NOTICE: This is an internal platform operational escalation mechanism to alert cooperative safety responders and platform coordinators. It is NOT a replacement for emergency public safety services. For immediate life-threatening danger, always call 112 (Police / Ambulance) first."*
- **PostGIS 4326 Capture**: Exact GPS fix recorded as spatial points for real-time nearest-responder routing.
- **Retention & Redaction**: High-precision coordinates are audited upon every query. After 30 days post-resolution, GPS coordinates are automatically redacted and snapped to generalized 2-decimal sector centroids (~1.1km area) to protect long-term worker/customer privacy.

### 4.6 Resilience & Operation-Specific Offline Sync
- Endpoint `POST /resilience/sync` processes queued client transactions:
  - `JOB_STATUS_UPDATE`: Server authoritative state takes precedence over stale offline timestamps.
  - `SEND_MESSAGE`: Client operation IDs are deduplicated in an append-only idempotent store.
  - `SUPPORT_REQUEST`: Append-only queueing for worker safety requests.
  - `OFFLINE_ACKNOWLEDGE`: Idempotent state synchronization.

---

## 5. Client Integrations

### 5.1 Admin Web Portal (`apps/admin-web`)
1. **Trust & Safety Console (`TrustSafetyView.tsx`)**:
   - Tabular view of customer and worker complaints with status progression.
   - Dispute arbitration modal coordinating refund parameters.
   - User account restriction modal (Warning, Restrict, Suspend) with audit reason capture.
2. **Emergency Monitoring Console (`EmergencyMonitoringView.tsx`)**:
   - Real-time incident board with flashing alerts and statutory disclaimer banner.
   - Map coordinate inspector with access audit logging and 30-day retention indicator.
   - Responder dispatch and resolution recording.
3. **Worker Welfare Operations (`WorkerWelfareOperationsView.tsx`)**:
   - Worker safety and equipment replacement request dashboard.
   - Advocate assignment and cooperative welfare fund distribution logging.

### 5.2 Customer Mobile App (`apps/customer-mobile`)
- Top operational bar with red `🚨 SOS` emergency escalation button and `🔔` notification bell with unread badge.
- Active booking card enhancements:
  - `💬 Chat with Worker`: Direct messaging interface with rate limit notifications.
  - `⚠️ Report Issue / Dispute`: Dispute creation modal with reason and category selectors.
- Modals for Chat, Emergency SOS (with statutory disclaimer), Dispute Filing, and In-App Notifications.

### 5.3 Worker Mobile App (`apps/worker-mobile`)
- Header quick actions: `🚨 SOS` button, `🔔` notifications bell, and `📦 Offline Queue` badge indicator.
- Job card enhancements on active/accepted dispatches:
  - `💬 Chat with Customer`: In-transit communication with offline message buffering.
  - `⚠️ Safety / Welfare Support`: Direct site hazard and PPE replacement request modal.
  - `📦 Queue Offline Update`: Local buffer testing for basement or low-connectivity sites.
- Resilience modal providing batch synchronization to `POST /resilience/sync` with conflict resolution matrix display.

---

## 6. Verification & Test Results

### 6.1 Automated Phase 5 Verification (`scripts/verify-phase-5.ts`)
Executed via `npx ts-node -r dotenv/config scripts/verify-phase-5.ts`:
- **Scenario 1**: Communications & Booking-Scoped Direct Messaging — **8/8 Checks Passed**
- **Scenario 2**: Messaging Abuse Controls & Sliding-Window Rate Limiting — **4/4 Checks Passed**
- **Scenario 3**: Unified Notification Provider & Critical Event Protection — **3/3 Checks Passed**
- **Scenario 4**: Trust & Safety Complaints Lifecycle — **4/4 Checks Passed**
- **Scenario 5**: Secure Evidence & Object-Storage Architecture — **5/5 Checks Passed**
- **Scenario 6**: Dispute Arbitration & Non-Silent Financial Reconciliation — **6/6 Checks Passed**
- **Scenario 7**: Account Restrictions & Human Moderation Workflow — **3/3 Checks Passed**
- **Scenario 8**: Emergency SOS Escalation & Statutory Disclaimers — **6/6 Checks Passed**
- **Scenario 9**: SOS Location Retention & Redaction Access Policy — **4/4 Checks Passed**
- **Scenario 10**: Worker Welfare & Support Lifecycle — **5/5 Checks Passed**
- **Scenario 11**: Resilience & Operation-Specific Offline Conflict Rules — **4/4 Checks Passed**
- **Total**: **52 / 52 Checks Passed (100%)**

### 6.2 Regression Suite Verification
- **Phase 4 Master Verification (`scripts/verify-phase-4.ts`)**: **33 / 33 Checks Passed** (0 regressions).
- **Jest Unit Test Suite (`npm test`)**: **19 test suites, 109 tests passed** across all modules with 0 failures.
- **Monorepo Build (`npm run build --workspaces --if-present`)**: All packages (`@cshrk/config`, `@cshrk/types`, `@cshrk/validation`, `@cshrk/api`, `@cshrk/admin-web`, `@cshrk/customer-mobile`, `@cshrk/worker-mobile`) built cleanly with code 0.
