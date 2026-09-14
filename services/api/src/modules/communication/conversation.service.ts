import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  ConversationEntity,
  BookingEntity,
  WorkerEntity,
  CustomerEntity,
  CooperativeMembershipEntity,
} from '../../database/entities';
import {
  ConversationType,
  ConversationStatus,
  UserRole,
} from '@cshrk/types';
import { CreateConversationDto } from './dto/communication.dto';

@Injectable()
export class ConversationService {
  constructor(
    @InjectRepository(ConversationEntity)
    private readonly conversationRepo: Repository<ConversationEntity>,
    @InjectRepository(BookingEntity)
    private readonly bookingRepo: Repository<BookingEntity>,
    @InjectRepository(WorkerEntity)
    private readonly workerRepo: Repository<WorkerEntity>,
    @InjectRepository(CustomerEntity)
    private readonly customerRepo: Repository<CustomerEntity>,
    @InjectRepository(CooperativeMembershipEntity)
    private readonly coopMembershipRepo: Repository<CooperativeMembershipEntity>,
  ) {}

  async getOrCreateBookingConversation(
    userId: string,
    userRole: UserRole,
    bookingId: string,
  ): Promise<ConversationEntity> {
    const booking = await this.bookingRepo.findOne({
      where: { id: bookingId },
      relations: ['customer', 'worker'],
    });

    if (!booking) {
      throw new NotFoundException(`Booking with ID ${bookingId} not found`);
    }

    // Access control check
    await this.verifyBookingAccess(userId, userRole, booking);

    // Check for existing conversation for this booking
    const existing = await this.conversationRepo.findOne({
      where: { bookingId },
      relations: ['customer', 'worker', 'cooperative'],
    });

    if (existing) {
      return existing;
    }

    const conversation = this.conversationRepo.create({
      type: ConversationType.BOOKING,
      status: ConversationStatus.ACTIVE,
      bookingId: booking.id,
      customerId: booking.customerId,
      workerId: booking.workerId,
      cooperativeId: booking.cooperativeId,
      title: `Booking #${booking.id.slice(0, 8)}`,
    });

    return this.conversationRepo.save(conversation);
  }

  async createConversation(
    userId: string,
    userRole: UserRole,
    dto: CreateConversationDto,
  ): Promise<ConversationEntity> {
    if (dto.type === ConversationType.BOOKING && dto.bookingId) {
      return this.getOrCreateBookingConversation(userId, userRole, dto.bookingId);
    }

    // Custom operational conversation
    const conversation = this.conversationRepo.create({
      type: dto.type,
      status: ConversationStatus.ACTIVE,
      bookingId: dto.bookingId,
      workerId: dto.workerId,
      customerId: dto.customerId,
      cooperativeId: dto.cooperativeId,
      title: dto.title || `Conversation ${dto.type}`,
    });

    return this.conversationRepo.save(conversation);
  }

  async listUserConversations(
    userId: string,
    userRole: UserRole,
  ): Promise<ConversationEntity[]> {
    const qb = this.conversationRepo
      .createQueryBuilder('conv')
      .leftJoinAndSelect('conv.customer', 'customer')
      .leftJoinAndSelect('conv.worker', 'worker')
      .leftJoinAndSelect('conv.cooperative', 'cooperative')
      .leftJoinAndSelect('conv.booking', 'booking')
      .orderBy('conv.lastMessageAt', 'DESC', 'NULLS LAST');

    if (userRole === UserRole.CUSTOMER) {
      const customer = await this.customerRepo.findOne({ where: { userId } });
      if (!customer) return [];
      qb.andWhere('conv.customerId = :customerId', { customerId: customer.id });
    } else if (userRole === UserRole.WORKER) {
      const worker = await this.workerRepo.findOne({ where: { userId } });
      if (!worker) return [];
      qb.andWhere('conv.workerId = :workerId', { workerId: worker.id });
    } else if (userRole === UserRole.COOPERATIVE_ADMIN) {
      const membership = await this.coopMembershipRepo.findOne({ where: { userId } });
      if (!membership) return [];
      qb.andWhere('conv.cooperativeId = :coopId', { coopId: membership.cooperativeId });
    } else if (userRole !== UserRole.PLATFORM_ADMIN && userRole !== UserRole.FEDERATION_ADMIN) {
      throw new ForbiddenException('Unauthorized to list conversations');
    }

    return qb.getMany();
  }

  async getConversationById(
    userId: string,
    userRole: UserRole,
    conversationId: string,
  ): Promise<ConversationEntity> {
    const conversation = await this.conversationRepo.findOne({
      where: { id: conversationId },
      relations: ['customer', 'worker', 'cooperative', 'booking'],
    });

    if (!conversation) {
      throw new NotFoundException(`Conversation ${conversationId} not found`);
    }

    await this.verifyConversationAccess(userId, userRole, conversation);

    return conversation;
  }

  async verifyConversationAccess(
    userId: string,
    userRole: UserRole,
    conversation: ConversationEntity,
  ): Promise<void> {
    if (userRole === UserRole.PLATFORM_ADMIN || userRole === UserRole.FEDERATION_ADMIN) {
      return; // Authorized administrative access
    }

    if (userRole === UserRole.CUSTOMER) {
      const customer = await this.customerRepo.findOne({ where: { userId } });
      if (!customer || conversation.customerId !== customer.id) {
        throw new ForbiddenException('Access denied to this conversation');
      }
      return;
    }

    if (userRole === UserRole.WORKER) {
      const worker = await this.workerRepo.findOne({ where: { userId } });
      if (!worker || conversation.workerId !== worker.id) {
        throw new ForbiddenException('Access denied to this conversation');
      }
      return;
    }

    if (userRole === UserRole.COOPERATIVE_ADMIN) {
      const membership = await this.coopMembershipRepo.findOne({ where: { userId } });
      if (!membership || conversation.cooperativeId !== membership.cooperativeId) {
        throw new ForbiddenException('Access denied to this conversation');
      }
      return;
    }

    throw new ForbiddenException('Unauthorized to access conversation');
  }

  private async verifyBookingAccess(
    userId: string,
    userRole: UserRole,
    booking: BookingEntity,
  ): Promise<void> {
    if (userRole === UserRole.PLATFORM_ADMIN || userRole === UserRole.FEDERATION_ADMIN) {
      return;
    }

    if (userRole === UserRole.CUSTOMER) {
      const customer = await this.customerRepo.findOne({ where: { userId } });
      if (!customer || booking.customerId !== customer.id) {
        throw new ForbiddenException('Customer not authorized for this booking');
      }
      return;
    }

    if (userRole === UserRole.WORKER) {
      const worker = await this.workerRepo.findOne({ where: { userId } });
      if (!worker || booking.workerId !== worker.id) {
        throw new ForbiddenException('Worker not assigned to this booking');
      }
      return;
    }

    if (userRole === UserRole.COOPERATIVE_ADMIN) {
      const membership = await this.coopMembershipRepo.findOne({ where: { userId } });
      if (!membership || booking.cooperativeId !== membership.cooperativeId) {
        throw new ForbiddenException('Cooperative not authorized for this booking');
      }
      return;
    }

    throw new ForbiddenException('Unauthorized for this booking conversation');
  }
}
