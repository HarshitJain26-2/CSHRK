import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';
import { CertificationService } from './certification.service';
import {
  CertificationEntity,
  CertificationStatus,
} from '../../database/entities/certification.entity';
import { WorkerEntity } from '../../database/entities/worker.entity';

describe('CertificationService (Phase 1 Unit Tests)', () => {
  let service: CertificationService;
  let certRepo: any;
  let workerRepo: any;

  beforeEach(async () => {
    certRepo = {
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      createQueryBuilder: jest.fn(),
    };
    workerRepo = {
      findOne: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CertificationService,
        { provide: getRepositoryToken(CertificationEntity), useValue: certRepo },
        { provide: getRepositoryToken(WorkerEntity), useValue: workerRepo },
      ],
    }).compile();

    service = module.get<CertificationService>(CertificationService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('calculateDynamicStatus', () => {
    it('should calculate EXPIRED when expiry date is in the past', () => {
      const pastCert: any = {
        status: CertificationStatus.VALID,
        expiryDate: '2020-01-01',
      };
      expect(service.calculateDynamicStatus(pastCert)).toBe(CertificationStatus.EXPIRED);
    });

    it('should calculate EXPIRING when expiry date is within 30 days', () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 15);
      const expiringCert: any = {
        status: CertificationStatus.VALID,
        expiryDate: futureDate.toISOString().split('T')[0],
      };
      expect(service.calculateDynamicStatus(expiringCert)).toBe(CertificationStatus.EXPIRING);
    });

    it('should calculate VALID when expiry date is far in the future', () => {
      const farFutureDate = new Date();
      farFutureDate.setDate(farFutureDate.getDate() + 180);
      const validCert: any = {
        status: CertificationStatus.VALID,
        expiryDate: farFutureDate.toISOString().split('T')[0],
      };
      expect(service.calculateDynamicStatus(validCert)).toBe(CertificationStatus.VALID);
    });
  });

  describe('verifyCertification', () => {
    it('should update verification status to VALID with review notes', async () => {
      const cert: any = { id: 'crt-1', status: CertificationStatus.PENDING };
      certRepo.findOne.mockResolvedValue(cert);
      certRepo.save.mockImplementation((c: any) => Promise.resolve(c));

      const result = await service.verifyCertification('crt-1', {
        status: CertificationStatus.VALID,
        verificationNotes: 'OSHA registry database record confirmed',
      });

      expect(result.status).toBe(CertificationStatus.VALID);
      expect(result.verificationNotes).toContain('confirmed');
    });
  });

  describe('renewCertification', () => {
    it('should renew certification with extended date and VALID status', async () => {
      const cert: any = { id: 'crt-1', status: CertificationStatus.EXPIRED };
      certRepo.findOne.mockResolvedValue(cert);
      certRepo.save.mockImplementation((c: any) => Promise.resolve(c));

      const result = await service.renewCertification('crt-1', {
        newExpiryDate: '2029-09-09',
      });

      expect(result.status).toBe(CertificationStatus.VALID);
      expect(result.expiryDate).toBe('2029-09-09');
    });
  });
});
