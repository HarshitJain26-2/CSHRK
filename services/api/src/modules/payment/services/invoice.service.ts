import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InvoiceStatus } from '@cshrk/types';
import { InvoiceEntity, BookingEntity } from '../../../database/entities';

@Injectable()
export class InvoiceService {
  constructor(
    @InjectRepository(InvoiceEntity)
    private readonly invoiceRepository: Repository<InvoiceEntity>,
    @InjectRepository(BookingEntity)
    private readonly bookingRepository: Repository<BookingEntity>,
  ) {}

  async getOrCreateInvoiceForBooking(bookingId: string): Promise<InvoiceEntity> {
    const existing = await this.invoiceRepository.findOne({
      where: { bookingId },
      relations: ['booking'],
    });
    if (existing) {
      return existing;
    }

    const booking = await this.bookingRepository.findOne({
      where: { id: bookingId },
      relations: ['serviceRequest', 'serviceRequest.service', 'customer', 'worker'],
    });

    if (!booking) {
      throw new NotFoundException(`Booking with ID ${bookingId} not found`);
    }

    // Authoritative calculations (exact round to 2 decimals)
    const subtotal = Math.round(Number(booking.totalAmount) * 100) / 100;
    const discountAmount = 0.0;
    const taxableAmount = Math.max(0, subtotal - discountAmount);
    const taxRate = parseFloat(process.env.DEFAULT_TAX_RATE || '0.18');
    const taxAmount = Math.round(taxableAmount * taxRate * 100) / 100;
    const totalAmount = Math.round((taxableAmount + taxAmount) * 100) / 100;

    const invoiceNumber = `INV-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const invoice = this.invoiceRepository.create({
      bookingId,
      customerId: booking.customerId,
      cooperativeId: booking.cooperativeId,
      invoiceNumber,
      subtotal,
      discountAmount,
      taxableAmount,
      taxRate,
      taxAmount,
      totalAmount,
      status: InvoiceStatus.ISSUED,
      notes: 'Generated for platform facilitation; tax treatment subject to local cooperative statutory provisions.',
    });

    return this.invoiceRepository.save(invoice);
  }

  async getInvoiceById(id: string): Promise<InvoiceEntity> {
    const invoice = await this.invoiceRepository.findOne({
      where: { id },
      relations: ['booking', 'booking.serviceRequest', 'booking.serviceRequest.service'],
    });
    if (!invoice) {
      throw new NotFoundException(`Invoice with ID ${id} not found`);
    }
    return invoice;
  }

  async getInvoiceByBookingId(bookingId: string): Promise<InvoiceEntity> {
    const invoice = await this.invoiceRepository.findOne({
      where: { bookingId },
      relations: ['booking', 'booking.serviceRequest', 'booking.serviceRequest.service'],
    });
    if (!invoice) {
      throw new NotFoundException(`Invoice for booking ID ${bookingId} not found`);
    }
    return invoice;
  }

  async markInvoiceAsPaid(invoiceId: string): Promise<InvoiceEntity> {
    const invoice = await this.getInvoiceById(invoiceId);
    invoice.status = InvoiceStatus.PAID;
    invoice.paidAt = new Date();
    return this.invoiceRepository.save(invoice);
  }
}
