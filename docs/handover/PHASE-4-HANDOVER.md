# CSHRK Phase 4 — Payments & AI Intelligence Handover Document

```text
================================================================================
  PROJECT:                 CSHRK (Cooperative Labour & Service Marketplace)
  CURRENT PHASE:           PHASE 4 COMPLETED & VERIFIED
  PREVIOUS PHASES:         PHASE 0 (Foundation), PHASE 1 (Worker), PHASE 2 (Customer), PHASE 3 (Cooperative & Federation)
  NEXT PHASE:              PHASE 5 — REAL-TIME COMMUNICATIONS, SOS & DISPUTE ARBITRATION
  DEVELOPMENT BRANCH:      feature/phase-4-payments-ai
  STATUS:                  PRODUCTION-GRADE PAYMENTS & ADVISORY AI LAYER FULLY VERIFIED
================================================================================
```

---

## 1. Executive Summary & Phase 4 Scope

**Phase 4 — Payments & AI Intelligence** establishes the financial settlement infrastructure and machine learning advisory systems for CSHRK. It enables trust-minimized, GST-compliant transactions with automated policy-driven revenue distribution (85% worker take-home, 10% cooperative welfare fund, 5% federation platform fee by default config), combined with an intelligent advisory AI suite (multi-factor worker matching, Holt-Winters demand forecasting, constrained workforce allocation, and regional trade skill gap analysis).

### Core Boundaries & Principles:
- **Strict Sequential Phase**: No rebuilding of Phases 0–3; no premature implementation of Phase 5 (chat, SOS, legal arbitration, mobile push notifications).
- **Payment Abstraction**: Pluggable `PaymentProvider` interface decoupling backend logic from specific gateways (Development: `CshrkSandboxPaymentProvider`; Production: `RazorpayPaymentProvider` / `StripePaymentProvider`).
- **Fail-Fast Sandbox Safeguard**: The sandbox provider is strictly blocked from running in production environments.
- **State Decoupling**: `BookingStatus` and `PaymentStatus` are strictly independent state machines.
- **Server-Authoritative Taxation**: Invoicing and tax computations (18% GST under SAC Code 9987) are strictly computed server-side.
- **Versioned Financial Policy**: No hardcoded financial split magic numbers; all settlements snapshot an immutable, versioned policy (`FinancialPolicy`, e.g., `POL-2026-V1`).
- **AI Advisory Governance**: The Python AI microservice is strictly an advisory engine; NestJS backend remains authoritative. PostGIS hard eligibility filters strictly precede AI scoring, and allocation plans require explicit Cooperative Admin approval.
- **Privacy-Preserving AI**: All raw PII is hashed (SHA-256) prior to inference logging in `ai_inference_logs`.

---

## 2. Architecture Overview: Decoupled Payments & Advisory AI

```
                                  ┌─────────────────────────────────────────┐
                                  │           Admin / Customer /            │
                                  │              Worker Apps                │
                                  └───────────────────┬─────────────────────┘
                                                      │ HTTPS / REST
                                                      ▼
                   ┌─────────────────────────────────────────────────────────────────────────┐
                   │                     Authoritative NestJS API Engine                     │
                   │                                                                         │
                   │   ┌─────────────────────┐    ┌──────────────────────────────────────┐   │
                   │   │   Payment Module    │    │           AI Client Module           │   │
                   │   │ - PaymentProvider   │    │ - Deterministic PostGIS Discovery    │   │
                   │   │ - Authoritative Tax │    │ - Resilient 3000ms HTTP RPC          │   │
                   │   │ - POL-2026-V1 Split │    │ - Circuit Breaker / Fallback Engine  │   │
                   │   │ - Reconciliation    │    │ - SHA-256 Privacy Inference Logger   │   │
                   │   └──────────┬──────────┘    └──────────────────┬───────────────────┘   │
                   └──────────────┼──────────────────────────────────┼───────────────────────┘
                                  │                                  │ JSON RPC (advisory)
                   ┌──────────────┴──────────────┐                   ▼
                   │                             │     ┌─────────────────────────────────────┐
                   ▼                             ▼     │         Python AI Microservice      │
       ┌────────────────────────┐  ┌────────────────┐  │ - Multi-Factor Matcher (0.35/0.25..)│
       │ CshrkSandboxProvider   │  │ RazorpayProvider│ │ - Holt-Winters Demand Forecaster    │
       │ (Dev/Test HMAC Mock)   │  │ (Production)   │  │ - Constrained Bipartite Allocator   │
       └────────────────────────┘  └────────────────┘  │ - Regional Skill Gap & Trainee Model│
                                                       └─────────────────────────────────────┘
```

---

## 3. Payment Provider Abstraction Layer

The payment layer is abstracted behind the `PaymentProvider` interface in `services/api/src/modules/payment/interfaces/payment-provider.interface.ts`:

```typescript
export interface PaymentProvider {
  readonly providerName: string;
  createPaymentIntent(params: CreatePaymentIntentParams): Promise<PaymentIntentResult>;
  verifyPayment(params: VerifyPaymentParams): Promise<PaymentVerificationResult>;
  createRefund(params: CreateRefundParams): Promise<RefundResult>;
  verifyWebhookSignature(payload: string | Buffer, signature: string): boolean;
  parseWebhookEvent(payload: any): WebhookEventPayload;
  listTransactions?(params: ListTransactionsParams): Promise<ProviderTransaction[]>;
}
```

A dynamic `PaymentProviderFactory` instantiates either `CshrkSandboxPaymentProvider` or `RazorpayPaymentProvider` based on environment configuration (`PAYMENT_PROVIDER`).

---

## 4. Sandbox vs Production Safeguards

1. **Fail-Fast Production Check**:
   `CshrkSandboxPaymentProvider` verifies `process.env.NODE_ENV !== 'production'` in its constructor. If initialized in production, it immediately throws a fatal exception, preventing fake payment capture in production.
2. **HMAC-SHA256 Cryptographic Verification**:
   Both providers cryptographically verify incoming webhook payloads against a shared secret using `crypto.createHmac('sha256', secret)`.

---

## 5. Server-Authoritative Tax & Invoicing Model

Tax invoices are calculated and persisted strictly on the server:
- **SAC Code**: `9987` (Maintenance, repair, and technical trade labour services).
- **GST Rate**: Standard 18% (split into 9% CGST + 9% SGST for intra-state, or 18% IGST for inter-state).
- **Rounding**: Server-authoritative `Math.round()` on paise/cent boundaries to prevent fractional penny discrepancies.
- **Invoice Entities**: Persisted in `invoices` table referencing `bookingId`, `customerId`, `subtotal`, `taxAmount`, `totalAmount`, `status`, and `invoiceNumber` (format: `INV-YYYY-XXXXXX`).

---

## 6. Financial Policy Model (`POL-YYYY-Vn`)

To prevent magic hardcoded financial percentages:
- Modeled as `FinancialPolicyEntity` (`financial_policies` table).
- Policy identifier: e.g., `POL-2026-V1`.
- Configurable split:
  - `workerSharePct`: 85% default
  - `cooperativeSharePct`: 10% default
  - `platformFeePct`: 5% default
- Constraint: `workerSharePct + cooperativeSharePct + platformFeePct === 100`.
- All settlements reference the specific `policyId` and `policyVersion` active at execution time.

---

## 7. Settlement Rules & Eligibility Matrix

Settlements are created via `SettlementService.createSettlementForBooking()` under strict preconditions:
1. **Verified Payment**: Associated payment entity must have `status === PaymentStatus.PAID`.
2. **Completed Booking**: Associated booking entity must have `status === BookingStatus.COMPLETED`.
3. **Zero Active Disputes/Refunds**: No open disputes, chargebacks, or active refunds.
4. **Idempotency**: One settlement per completed booking; duplicate requests return existing settlement.
5. **Split Execution**: Computes worker payout, cooperative welfare allocation, and platform fee based on the active financial policy.

---

## 8. Webhook Processing Architecture

- **Endpoint**: `POST /api/v1/payments/webhook`
- **HMAC Verification**: Raw payload verified against `x-payment-signature` header.
- **Deduplication**: Webhook event ID checked against `payment_webhook_events` table. If already processed, returns HTTP 200 immediately without reprocessing.
- **Separation of Concerns**: Payment capture marks `payment.status = PAID`. Settlement is NOT immediately executed inside the webhook; it is gated on booking completion.

---

## 9. Payment & Booking State Machine Decoupling

| PaymentStatus | Allowed Booking States | Description |
|---|---|---|
| `INITIATED` | `PENDING_ACCEPTANCE`, `CONFIRMED`, `IN_PROGRESS`, `COMPLETED` | Intent registered with payment provider |
| `PENDING` | `IN_PROGRESS`, `COMPLETED` | Awaiting customer gateway confirmation |
| `PAID` | `CONFIRMED`, `IN_PROGRESS`, `COMPLETED` | Funds captured and held in escrow |
| `FAILED` | Any | Gateway transaction failed; booking remains intact |
| `REFUNDED` | `CANCELLED`, `DISPUTED` | Full refund issued back to source |
| `PARTIALLY_REFUNDED` | `COMPLETED`, `DISPUTED` | Partial settlement adjustment |

---

## 10. Financial Reconciliation Engine

`ReconciliationService` executes automated reconciliation audits between the payment gateway ledger and internal database records:
- **`MATCHED`**: Internal and provider transactions match in amount, currency, and status.
- **`AMOUNT_MISMATCH`**: Gateway captured amount differs from internal invoice total.
- **`MISSING_IN_PLATFORM`**: Gateway has captured payment with no corresponding internal record.
- **`MISSING_IN_GATEWAY`**: Internal record is marked PAID but provider has no matching transaction.
- **`UNSETTLED_COMPLETED_PAYMENT`**: Payment is PAID and booking is COMPLETED, but settlement has not been processed.
- Results are logged in `reconciliation_records` and surfaced in Admin Web.

---

## 11. AI Architecture & Advisory Philosophy

- **Authoritative Boundary**: The Python FastAPI service (`services/ai`) is purely an advisory microservice.
- **Safe Degradation**: If the AI service is unavailable, errors out, or exceeds 3000ms, the NestJS API falls back to deterministic PostGIS distance and qualification ranking.
- **Audit Logging**: Every AI invocation logs request metadata, model version, execution latency, and anonymized SHA-256 hashed inputs into `ai_inference_logs`.

---

## 12. Multi-Factor Worker Matching Engine

1. **Pre-Filter (Hard PostGIS Constraints)**:
   - Worker must be `active === true`.
   - Worker must be `isVerified === true`.
   - Worker availability must be `AVAILABLE`.
   - Worker must possess the mandatory trade skill required by the service request.
   - Worker must be within maximum search radius ($R \le 30\text{ km}$).
2. **AI Scoring Model**:
   $$\text{Score} = w_1 \cdot S_{\text{dist}} + w_2 \cdot S_{\text{rating}} + w_3 \cdot S_{\text{rel}} + w_4 \cdot S_{\text{coop}}$$
   - Distance Weight ($w_1 = 0.35$): Normalized inverse distance.
   - Rating Weight ($w_2 = 0.25$): Normalized historical rating ($0.0 - 5.0$).
   - Reliability Weight ($w_3 = 0.20$): Job completion rate / low cancellation.
   - Cooperative Balance Weight ($w_4 = 0.20$): Priority score for equitable cooperative dispatch.

---

## 13. Match Explainability & Transparency

Every matched candidate returned by the AI matching endpoint includes human-readable explainability metadata:
- `factor_breakdown`: Key-value map of individual factor scores (0.0–1.0).
- `match_reasons`: Human-readable summary (e.g., `"Top rated (4.9/5)", "Close proximity (3.2 km)", "Certified in Electrical Trades"`).
- `confidence_score`: 0.0–1.0 confidence score.

---

## 14. Demand Forecasting Engine

- **Model**: Holt-Winters Exponential Smoothing with additive trend and seasonal components.
- **Validation**: Walk-forward validation computing MAE, RMSE, and MAPE.
- **Endpoint**: `POST /api/v1/ai/forecasting/predict`

---

## 15. `INSUFFICIENT_DATA` Safeguard

If historical service request data for a district/trade is less than 14 days ($N < 14$):
- Holt-Winters computation is safely bypassed.
- Response returns `status: "INSUFFICIENT_DATA"`, `forecast_points: []`, and fallback confidence.
- Zero crash / zero unhandled exceptions.

---

## 16. Constrained Workforce Allocation Optimizer

- **Model**: Constrained bipartite allocation optimizer matching available cooperative workforce against pending project/trade demand.
- **Constraints**:
  - Worker qualifications and trade certificates.
  - Cooperative operational capacity boundaries ($N_{\text{assigned}} \le \text{Capacity}_{\text{max}}$).
  - Maximum travel radius.

---

## 17. Cooperative Approval Governance

- Allocation plans produced by the AI optimizer are generated in `status: "DRAFT"`.
- Workforce cannot be committed or dispatched until a `COOPERATIVE_ADMIN` or `FEDERATION_ADMIN` explicitly invokes the approval endpoint (`allocationApproved: true`).

---

## 18. Regional Skill Gap Analyzer

- **Model**: Compares projected trade demand over 30–90 days against active certified cooperative workers in the region.
- **Outputs**:
  - `deficit_count`: Absolute shortage of tradespersons.
  - `severity`: `CRITICAL`, `ELEVATED`, or `BALANCED`.
  - `recommended_trainees`: Recommended apprentice intake (including 20% completion buffer).

---

## 19. AI Model Version Registry

Model versions are registered in `ai_model_versions` table and managed via `/api/v1/ai/models`:
- `cshrk-matching-ranker-v1.0.0` (Active)
- `cshrk-demand-hw-v1.0.0` (Active)
- `cshrk-alloc-bipartite-v1.0.0` (Active)
- `cshrk-skillgap-v1.0.0` (Active)

---

## 20. Privacy-Preserving Inference Logging

- Every AI inference invocation is recorded in `ai_inference_logs`.
- **Privacy Rule**: Raw phone numbers, personal names, and physical street addresses are NEVER stored in inference logs.
- Request inputs are hashed using cryptographic SHA-256 (`request_hash = SHA256(payload)`).

---

## 21. NestJS AI Client Resilience

`AIClientService` (`services/api/src/modules/ai-client/ai-client.service.ts`):
- Strict `timeout: 3000ms`.
- Catches network timeouts, connection refused, and HTTP 5xx errors.
- Automatically falls back to deterministic PostGIS ordering.
- Logs inference latency and outcome status.

---

## 22. Admin Web Portal: Finance & Payments Management View

Location: `apps/admin-web/src/views/FinanceManagementView.tsx`
- **Invoices Tab**: List of all GST tax invoices with line items, tax rate, and payment status.
- **Settlements Tab**: Cooperative split tracking, payout destination, and settlement execution status.
- **Reconciliation Tab**: Discrepancy detector and audit summary metrics.
- **Financial Policies Tab**: Versioned policy inspector (`POL-2026-V1`) showing worker, cooperative, and platform split percentages.

---

## 23. Admin Web Portal: AI Labour Intelligence View

Location: `apps/admin-web/src/views/AILabourIntelligenceView.tsx`
- **Matching Insights**: Factor weight visualizer and candidate explainability inspection.
- **Demand Forecasting**: 7-day projection chart with historical demand and confidence intervals.
- **Workforce Allocation**: Optimization matrix with **Mandatory Cooperative Approval** button.
- **Regional Skill Gap**: Trade deficit analysis and apprentice program recommendations.
- **Model Registry**: Status, framework, and performance metrics for active AI models.

---

## 24. Customer Mobile Experience: Checkout & Invoicing Flow

Location: `apps/customer-mobile/App.tsx`
- **Pay & Invoice Button**: Added to booking cards for active/completed bookings.
- **Checkout Modal**:
  - Real-time tax breakdown: Base Labour Subtotal, CGST (9%), SGST (9%), Total Amount.
  - Fair Cooperative Guarantee banner informing customer of worker welfare contribution.
  - "Pay Securely" action triggering backend intent creation and verification.
  - Verified receipt view with invoice number and settlement status.

---

## 25. Worker Mobile Experience: Earnings & Settlement Transparency

Location: `apps/worker-mobile/App.tsx`
- **Earnings & Settlements Card**: Displayed in worker profile.
- **Net Earnings Display**: Clear presentation of take-home pay (85%) under `POL-2026-V1`.
- **Cooperative Welfare Visibility**: Worker sees exactly what was contributed to their society fund.
- **Settlement Records Modal**: Detailed ledger of processed and pending direct-to-bank settlements.

---

## 26. Security, Compliance & Data Protection

- **No Stored Cardholder Data**: CSHRK backend never touches or stores raw PAN, CVV, or card credentials (PCI DSS compliance).
- **HMAC Signatures**: Every incoming payment webhook requires a valid cryptographic HMAC signature.
- **Data Minimization & Hashing**: AI inference logs store only SHA-256 hashed representations of request payloads.
- **RBAC Enforcement**: All financial and AI endpoints require explicit roles (`PLATFORM_ADMIN`, `COOPERATIVE_ADMIN`, `FEDERATION_ADMIN`).

---

## 27. Test Coverage & Verification Results

| Test Suite | Result | Details |
|---|---|---|
| API Unit & Service Tests | **19/19 Suites Passed** | 109/109 unit tests passed cleanly |
| Python AI Microservice Tests | **8/8 Tests Passed** | Matching, forecasting, allocation, skill gap, health |
| Phase 4 E2E Script (`verify-phase-4.ts`) | **33/33 Checks Passed** | All 11 verification scenarios confirmed |
| TypeScript Monorepo Check | **0 Errors** | All 7 workspaces passed `tsc --noEmit` |
| Monorepo Production Build | **Clean Bundles** | All workspaces built without errors |

---

## 28. Migration & Deployment Runbook

1. **Database Schema Update**:
   - Apply migrations for new tables: `financial_policies`, `payment_webhook_events`, `refunds`, `reconciliation_records`, `ai_model_versions`, `ai_inference_logs`.
   - Seed default financial policy: `POL-2026-V1` (85/10/5 split).
2. **Environment Configuration**:
   - `PAYMENT_PROVIDER`: `sandbox` (dev) / `razorpay` (prod).
   - `PAYMENT_WEBHOOK_SECRET`: Secure 32+ char secret.
   - `AI_SERVICE_URL`: URL to Python AI microservice (e.g. `http://ai:8000`).
   - `AI_SERVICE_TIMEOUT_MS`: `3000`.
3. **Service Launch**:
   - Start PostgreSQL with PostGIS.
   - Start Python AI microservice: `python -m uvicorn app.main:app --port 8000`.
   - Start NestJS API: `npm run start:prod --workspace=@cshrk/api`.
   - Serve Admin Web: `npm run build --workspace=@cshrk/admin-web`.

---

## 29. Inherited Work Continuity (Preservation of Phases 0–3)

- **Phase 0 Foundation**: Core authentication, JWT tokens, RBAC, and database schemas remain intact.
- **Phase 1 Worker**: Worker profiles, trade verification, and availability toggles preserved.
- **Phase 2 Customer Marketplace**: Service catalog, customer requests, and booking workflows preserved.
- **Phase 3 Cooperative & Federation**: Multi-tenant isolation, capacity engine, worker crews, contracts, and immutable audit logs preserved.

---

## 30. Non-Regressions & Handoff Checklist for Phase 5

- [x] All 7 monorepo workspaces compile with zero TypeScript errors.
- [x] All 109 Jest unit tests pass with zero regressions.
- [x] All 8 Pytest unit tests pass.
- [x] End-to-end Phase 4 script passes 33/33 checks.
- [x] Payment state machine decoupled from booking state machine.
- [x] Webhook idempotency and HMAC verification verified.
- [x] Server-authoritative GST invoice calculations implemented.
- [x] Active versioned financial policy (`POL-2026-V1`) governs splits.
- [x] AI microservice integrated as advisory engine with 3000ms timeout and PostGIS fallback.
- [x] Holt-Winters `< 14` days `INSUFFICIENT_DATA` safeguard implemented.
- [x] Workforce allocation requires explicit Cooperative Admin approval.
- [x] Privacy-preserving SHA-256 inference logging active.
- [x] Admin Web, Customer Mobile, and Worker Mobile financial UIs verified.
- [x] Phase 5 boundary respected (no chat, no SOS, no push notifications).

---
*Signed by Antigravity Agentic AI Pair Programmer — Phase 4 Completed & Verified.*
