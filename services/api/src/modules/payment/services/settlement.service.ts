import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SettlementStatus, PaymentStatus, BookingStatus, FinancialPolicyStatus } from '@cshrk/types';
import {
  SettlementEntity,
  PaymentEntity,
  BookingEntity,
  FinancialPolicyEntity,
} from '../../../database/entities';

@Injectable()
export class SettlementService {
  private readonly logger = new Logger(SettlementService.name);

  constructor(
    @InjectRepository(SettlementEntity)
    private readonly settlementRepository: Repository<SettlementEntity>,
    @InjectRepository(PaymentEntity)
    private readonly paymentRepository: Repository<PaymentEntity>,
    @InjectRepository(BookingEntity)
    private readonly bookingRepository: Repository<BookingEntity>,
    @InjectRepository(FinancialPolicyEntity)
    private readonly policyRepository: Repository<FinancialPolicyEntity>,
  ) {}

  async getActiveFinancialPolicy(): Promise<FinancialPolicyEntity> {
    let policy = await this.policyRepository.findOne({
      where: { status: FinancialPolicyStatus.ACTIVE },
      order: { createdAt: 'DESC' },
    });

    if (!policy) {
      // Seed initial default versioned policy if none exists
      policy = this.policyRepository.create({
        version: 'POL-2026-V1',
        effectiveFrom: new Date(),
        workerSharePct: 0.85,
        cooperativeSharePct: 0.1,
        platformFeePct: 0.05,
        status: FinancialPolicyStatus.ACTIVE,
        notes: 'Default baseline cooperative revenue-sharing policy (Phase 4 initial)',
      });
      policy = await this.policyRepository.save(policy);
      this.logger.log(`Initialized default financial policy: ${policy.version}`);
    }

    return policy;
  }

  async listFinancialPolicies(): Promise<FinancialPolicyEntity[]> {
    return this.policyRepository.find({
      order: { createdAt: 'DESC' },
    });
  }

  async createFinancialPolicy(
    version: string,
    effectiveFrom: Date,
    workerSharePct: number,
    cooperativeSharePct: number,
    platformFeePct: number,
    approvedBy?: string,
    notes?: string,
  ): Promise<FinancialPolicyEntity> {
    const sum = Math.round((workerSharePct + cooperativeSharePct + platformFeePct) * 10000) / 10000;
    if (Math.abs(sum - 1.0) > 0.0001) {
      throw new BadRequestException(`Sum of shares must equal exactly 1.0 (100%). Received sum: ${sum}`);
    }

    // Retire current active policies
    await this.policyRepository.update(
      { status: FinancialPolicyStatus.ACTIVE },
      { status: FinancialPolicyStatus.RETIRED },
    );

    const newPolicy = this.policyRepository.create({
      version,
      effectiveFrom,
      workerSharePct,
      cooperativeSharePct,
      platformFeePct,
      status: FinancialPolicyStatus.ACTIVE,
      approvedBy,
      notes,
    });

    return this.policyRepository.save(newPolicy);
  }

  async createSettlementForPayment(paymentId: string): Promise<SettlementEntity | null> {
    const existing = await this.settlementRepository.findOne({ where: { paymentId } });
    if (existing) {
      this.logger.warn(`Settlement already exists for payment ${paymentId}`);
      return existing;
    }

    const payment = await this.paymentRepository.findOne({
      where: { id: paymentId },
      relations: ['booking', 'booking.worker', 'booking.cooperative'],
    });

    if (!payment) {
      throw new NotFoundException(`Payment ${paymentId} not found`);
    }

    // Strict Settlement Eligibility Check:
    // 1. Payment must be PAID
    // 2. Booking must be COMPLETED
    // 3. Worker and Cooperative must be defined
    if (payment.status !== PaymentStatus.PAID) {
      this.logger.warn(`Payment ${paymentId} is not in PAID status. Current: ${payment.status}. Deferring settlement.`);
      return null;
    }

    const booking = payment.booking;
    if (!booking || booking.status !== BookingStatus.COMPLETED) {
      this.logger.warn(
        `Booking ${booking?.id} is not COMPLETED (status: ${booking?.status}). Settlement will be processed upon completion.`,
      );
      return null;
    }

    if (!booking.workerId || !booking.cooperativeId) {
      this.logger.warn(`Booking ${booking.id} missing workerId or cooperativeId. Cannot settle.`);
      return null;
    }

    const policy = await this.getActiveFinancialPolicy();

    const grossAmount = Math.round(Number(payment.amount) * 100) / 100;
    const workerAmount = Math.round(grossAmount * Number(policy.workerSharePct) * 100) / 100;
    const cooperativeFee = Math.round(grossAmount * Number(policy.cooperativeSharePct) * 100) / 100;
    // Remainder to platform guarantees exact penny equality (gross = worker + coop + platform)
    const platformFee = Math.round((grossAmount - workerAmount - cooperativeFee) * 100) / 100;

    const settlement = this.settlementRepository.create({
      cooperativeId: booking.cooperativeId,
      workerId: booking.workerId,
      bookingId: booking.id,
      paymentId: payment.id,
      financialPolicyId: policy.id,
      policyVersionApplied: policy.version,
      grossAmount,
      workerAmount,
      cooperativeFee,
      platformFee,
      status: SettlementStatus.PENDING,
      periodStart: booking.createdAt,
      periodEnd: booking.updatedAt,
    });

    const saved = await this.settlementRepository.save(settlement);
    this.logger.log(
      `Created Settlement ${saved.id} for Booking ${booking.id} under Policy ${policy.version}. Gross: ${grossAmount}, Worker: ${workerAmount}, Coop: ${cooperativeFee}, Platform: ${platformFee}`,
    );
    return saved;
  }

  async getWorkerSettlements(workerId: string): Promise<SettlementEntity[]> {
    return this.settlementRepository.find({
      where: { workerId },
      relations: ['cooperative'],
      order: { createdAt: 'DESC' },
    });
  }

  async getCooperativeSettlements(cooperativeId: string): Promise<SettlementEntity[]> {
    return this.settlementRepository.find({
      where: { cooperativeId },
      relations: ['worker'],
      order: { createdAt: 'DESC' },
    });
  }

  async processPayout(settlementId: string, payoutReference: string): Promise<SettlementEntity> {
    const settlement = await this.settlementRepository.findOne({ where: { id: settlementId } });
    if (!settlement) {
      throw new NotFoundException(`Settlement ${settlementId} not found`);
    }

    settlement.status = SettlementStatus.PROCESSED;
    settlement.paidOutAt = new Date();
    settlement.payoutReference = payoutReference;
    return this.settlementRepository.save(settlement);
  }
}
