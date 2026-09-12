import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CustomerEntity } from '../../database/entities/customer.entity';
import { UserEntity } from '../../database/entities/user.entity';
import { UpdateCustomerProfileDto } from './dto/customer.dto';

@Injectable()
export class CustomerService {
  constructor(
    @InjectRepository(CustomerEntity)
    private readonly customerRepository: Repository<CustomerEntity>,
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
  ) {}

  async getProfileByUserId(userId: string): Promise<CustomerEntity> {
    let customer = await this.customerRepository.findOne({
      where: { userId },
      relations: ['user'],
    });

    if (!customer) {
      const user = await this.userRepository.findOne({ where: { id: userId } });
      if (!user) {
        throw new NotFoundException(`User with ID ${userId} not found`);
      }
      customer = this.customerRepository.create({
        userId: user.id,
        fullName: user.fullName || 'Customer',
        phone: user.phone,
      });
      await this.customerRepository.save(customer);
      customer.user = user;
    }

    return customer;
  }

  async updateProfile(userId: string, dto: UpdateCustomerProfileDto): Promise<CustomerEntity> {
    const customer = await this.getProfileByUserId(userId);

    if (dto.fullName) {
      customer.fullName = dto.fullName;
      await this.userRepository.update(userId, { fullName: dto.fullName });
    }

    if (dto.phone !== undefined) {
      customer.phone = dto.phone;
      await this.userRepository.update(userId, { phone: dto.phone });
    }

    if (dto.address !== undefined) {
      customer.address = dto.address;
    }

    if (dto.latitude !== undefined && dto.longitude !== undefined) {
      customer.defaultLocation = {
        type: 'Point',
        coordinates: [dto.longitude, dto.latitude],
      };
    }

    return this.customerRepository.save(customer);
  }
}
