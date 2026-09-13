import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Query,
  Headers,
  Req,
  UseGuards,
  ForbiddenException,
} from '@nestjs/common';
import { UserRole } from '@cshrk/types';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { PaymentService } from '../services/payment.service';
import { InvoiceService } from '../services/invoice.service';
import { SettlementService } from '../services/settlement.service';
import { ReconciliationService } from '../services/reconciliation.service';
import { WorkerService } from '../../worker/worker.service';

@Controller()
export class PaymentController {
  constructor(
    private readonly paymentService: PaymentService,
    private readonly invoiceService: InvoiceService,
    private readonly settlementService: SettlementService,
    private readonly reconciliationService: ReconciliationService,
    private readonly workerService: WorkerService,
  ) {}

  // ============================================================================
  // CUSTOMER PAYMENT & INVOICE FLOWS
  // ============================================================================
  @Post('payments/intent')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.CUSTOMER)
  async initiatePayment(
    @CurrentUser() user: any,
    @Body() body: { bookingId: string; idempotencyKey: string; paymentMethod?: string },
  ) {
    const result = await this.paymentService.initiatePayment(
      body.bookingId,
      body.idempotencyKey,
      body.paymentMethod,
      user.email,
    );
    return {
      success: true,
      statusCode: 201,
      message: 'Payment intent created successfully',
      data: result,
    };
  }

  @Post('payments/verify')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.CUSTOMER)
  async verifyPayment(
    @Body()
    body: {
      paymentId: string;
      intentId: string;
      providerRef: string;
      signature: string;
    },
  ) {
    const result = await this.paymentService.verifyPayment(
      body.paymentId,
      body.intentId,
      body.providerRef,
      body.signature,
    );
    return {
      success: result.isVerified,
      statusCode: result.isVerified ? 200 : 400,
      message: result.isVerified ? 'Payment verified successfully' : 'Payment verification failed',
      data: result,
    };
  }

  // ============================================================================
  // PUBLIC WEBHOOK INGESTION (HMAC Authenticated)
  // ============================================================================
  @Post('payments/webhook/:provider')
  async handleWebhook(
    @Param('provider') provider: string,
    @Headers() headers: Record<string, string>,
    @Req() req: any,
    @Body() body: any,
  ) {
    // In Fastify, raw body or parsed body can be handled
    const rawPayload = typeof body === 'string' ? body : JSON.stringify(body);
    const result = await this.paymentService.handleWebhook(provider, headers, rawPayload);
    return {
      success: true,
      statusCode: 200,
      data: result,
    };
  }

  // ============================================================================
  // INVOICING ENDPOINTS
  // ============================================================================
  @Get('invoices/:id')
  @UseGuards(JwtAuthGuard)
  async getInvoice(@Param('id') id: string) {
    const invoice = await this.invoiceService.getInvoiceById(id);
    return {
      success: true,
      statusCode: 200,
      data: invoice,
    };
  }

  @Get('invoices/booking/:bookingId')
  @UseGuards(JwtAuthGuard)
  async getInvoiceByBooking(@Param('bookingId') bookingId: string) {
    const invoice = await this.invoiceService.getOrCreateInvoiceForBooking(bookingId);
    return {
      success: true,
      statusCode: 200,
      data: invoice,
    };
  }

  // ============================================================================
  // WORKER SETTLEMENTS & EARNINGS
  // ============================================================================
  @Get('settlements/worker/me')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.WORKER)
  async getMySettlements(@CurrentUser() user: any) {
    const worker = await this.workerService.getProfileByUserId(user.id);
    const settlements = await this.settlementService.getWorkerSettlements(worker.id);
    return {
      success: true,
      statusCode: 200,
      data: settlements,
    };
  }


  // ============================================================================
  // COOPERATIVE FINANCIAL SETTLEMENTS
  // ============================================================================
  @Get('settlements/cooperative/:cooperativeId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.COOPERATIVE_ADMIN, UserRole.PLATFORM_ADMIN, UserRole.FEDERATION_ADMIN)
  async getCooperativeSettlements(@Param('cooperativeId') cooperativeId: string) {
    const settlements = await this.settlementService.getCooperativeSettlements(cooperativeId);
    return {
      success: true,
      statusCode: 200,
      data: settlements,
    };
  }

  // ============================================================================
  // REFUNDS & ADMINISTRATIVE FINANCE
  // ============================================================================
  @Post('payments/refund')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.PLATFORM_ADMIN, UserRole.COOPERATIVE_ADMIN)
  async processRefund(
    @CurrentUser() user: any,
    @Body() body: { paymentId: string; amount: number; reason: string },
  ) {
    const refund = await this.paymentService.processRefund(
      body.paymentId,
      body.amount,
      body.reason,
      user.id,
    );
    return {
      success: true,
      statusCode: 201,
      message: 'Refund processed successfully',
      data: refund,
    };
  }

  @Post('reconciliation/run')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.PLATFORM_ADMIN, UserRole.FEDERATION_ADMIN)
  async runReconciliation(
    @Body() body: { periodStart: string; periodEnd: string },
  ) {
    const result = await this.reconciliationService.runReconciliation(
      new Date(body.periodStart),
      new Date(body.periodEnd),
    );
    return {
      success: true,
      statusCode: 200,
      message: 'Reconciliation completed',
      data: result,
    };
  }

  @Get('reconciliation/records')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.PLATFORM_ADMIN, UserRole.FEDERATION_ADMIN)
  async getReconciliationRecords(@Query('limit') limit?: number) {
    const records = await this.reconciliationService.getReconciliationRecords(limit ? Number(limit) : 50);
    return {
      success: true,
      statusCode: 200,
      data: records,
    };
  }

  @Get('financial-policies')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.PLATFORM_ADMIN, UserRole.FEDERATION_ADMIN, UserRole.COOPERATIVE_ADMIN)
  async listFinancialPolicies() {
    const policies = await this.settlementService.listFinancialPolicies();
    return {
      success: true,
      statusCode: 200,
      data: policies,
    };
  }

  @Post('financial-policies')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.PLATFORM_ADMIN)
  async createFinancialPolicy(
    @CurrentUser() user: any,
    @Body()
    body: {
      version: string;
      effectiveFrom: string;
      workerSharePct: number;
      cooperativeSharePct: number;
      platformFeePct: number;
      notes?: string;
    },
  ) {
    const policy = await this.settlementService.createFinancialPolicy(
      body.version,
      new Date(body.effectiveFrom),
      body.workerSharePct,
      body.cooperativeSharePct,
      body.platformFeePct,
      user.id,
      body.notes,
    );
    return {
      success: true,
      statusCode: 201,
      message: 'Versioned financial policy created successfully',
      data: policy,
    };
  }
}
