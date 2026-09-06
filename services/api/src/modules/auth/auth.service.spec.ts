import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { AuthService } from './auth.service';
import { UserEntity } from '../../database/entities/user.entity';
import { UserRole, AccountStatus } from '@cshrk/types';

describe('AuthService (Phase 0 Unit Tests)', () => {
  let service: AuthService;
  let userRepository: any;
  let jwtService: any;

  beforeEach(async () => {
    userRepository = {
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
    };

    jwtService = {
      sign: jest.fn().mockReturnValue('mock_jwt_token_xyz'),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: getRepositoryToken(UserEntity),
          useValue: userRepository,
        },
        {
          provide: JwtService,
          useValue: jwtService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('register', () => {
    it('should throw ConflictException if user already exists', async () => {
      userRepository.findOne.mockResolvedValue({ id: '1', email: 'test@example.com' });

      await expect(
        service.register({
          email: 'test@example.com',
          password: 'Password123!',
          fullName: 'Test User',
          role: UserRole.CUSTOMER,
        }),
      ).rejects.toThrow(ConflictException);
    });

    it('should successfully register a new user and return session', async () => {
      userRepository.findOne.mockResolvedValue(null);
      const mockSavedUser = {
        id: 'uuid-123',
        email: 'newuser@example.com',
        fullName: 'New User',
        role: UserRole.CUSTOMER,
        status: AccountStatus.ACTIVE,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      userRepository.create.mockReturnValue(mockSavedUser);
      userRepository.save.mockResolvedValue(mockSavedUser);

      const result = await service.register({
        email: 'newuser@example.com',
        password: 'Password123!',
        fullName: 'New User',
        role: UserRole.CUSTOMER,
      });

      expect(result).toBeDefined();
      expect(result.tokens.accessToken).toBe('mock_jwt_token_xyz');
      expect(result.user.email).toBe('newuser@example.com');
      expect(result.user.role).toBe(UserRole.CUSTOMER);
    });
  });

  describe('login', () => {
    it('should throw UnauthorizedException if user not found', async () => {
      userRepository.findOne.mockResolvedValue(null);

      await expect(
        service.login({
          email: 'notfound@example.com',
          password: 'Password123!',
        }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException if password does not match', async () => {
      const hash = await bcrypt.hash('CorrectPass123!', 10);
      userRepository.findOne.mockResolvedValue({
        id: '1',
        email: 'user@example.com',
        passwordHash: hash,
        status: AccountStatus.ACTIVE,
      });

      await expect(
        service.login({
          email: 'user@example.com',
          password: 'WrongPassword!',
        }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should successfully authenticate and return session on valid credentials', async () => {
      const hash = await bcrypt.hash('CorrectPass123!', 10);
      const mockUser = {
        id: 'uuid-1',
        email: 'user@example.com',
        fullName: 'Valid User',
        passwordHash: hash,
        role: UserRole.WORKER,
        status: AccountStatus.ACTIVE,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      userRepository.findOne.mockResolvedValue(mockUser);

      const result = await service.login({
        email: 'user@example.com',
        password: 'CorrectPass123!',
      });

      expect(result).toBeDefined();
      expect(result.tokens.accessToken).toBe('mock_jwt_token_xyz');
      expect(result.user.role).toBe(UserRole.WORKER);
    });
  });
});
