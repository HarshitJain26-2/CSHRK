import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { AuditService } from './audit.service';
import { AuditLogEntity } from '../../database/entities/audit-log.entity';

describe('AuditService (Append-Only Governance Tests)', () => {
  let service: AuditService;
  let auditRepo: any;

  beforeEach(async () => {
    auditRepo = {
      create: jest.fn().mockImplementation((dto) => dto),
      save: jest.fn().mockImplementation((entry) =>
        Promise.resolve({ id: 'log-1', createdAt: new Date(), ...entry }),
      ),
      createQueryBuilder: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuditService,
        { provide: getRepositoryToken(AuditLogEntity), useValue: auditRepo },
      ],
    }).compile();

    service = module.get<AuditService>(AuditService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should append an audit log entry', async () => {
    const log = await service.logAction(
      'user-1',
      'VERIFY_WORKER',
      'WORKER',
      'worker-1',
      { status: 'VERIFIED' },
    );

    expect(auditRepo.create).toHaveBeenCalledWith({
      userId: 'user-1',
      action: 'VERIFY_WORKER',
      entityType: 'WORKER',
      entityId: 'worker-1',
      metadata: { status: 'VERIFIED' },
      ipAddress: undefined,
    });
    expect(auditRepo.save).toHaveBeenCalled();
    expect(log.id).toBe('log-1');
  });

  it('should query audit logs with pagination and filters', async () => {
    const mockQb: any = {
      andWhere: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      take: jest.fn().mockReturnThis(),
      getManyAndCount: jest.fn().mockResolvedValue([[{ id: 'log-1' }], 1]),
    };
    auditRepo.createQueryBuilder.mockReturnValue(mockQb);

    const result = await service.findLogs({
      entityType: 'WORKER',
      action: 'VERIFY',
      page: 1,
      limit: 10,
    });

    expect(mockQb.andWhere).toHaveBeenCalledWith('log.entityType = :entityType', {
      entityType: 'WORKER',
    });
    expect(result.items).toHaveLength(1);
    expect(result.total).toBe(1);
  });
});
