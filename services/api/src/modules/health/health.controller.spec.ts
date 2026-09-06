import { HealthController } from './health.controller';
import { DataSource } from 'typeorm';
import { HttpStatus } from '@nestjs/common';

describe('HealthController (Phase 0 Unit Tests)', () => {
  let controller: HealthController;
  let dataSource: any;

  beforeEach(() => {
    dataSource = {
      isInitialized: true,
      query: jest.fn().mockResolvedValue([{ '?column?': 1 }]),
    };
    controller = new HealthController(dataSource as DataSource);
  });

  it('should return 200 and healthy status when database query succeeds', async () => {
    const mockJson = jest.fn();
    const mockStatus = jest.fn().mockReturnValue({ json: mockJson });
    const mockResponse: any = { status: mockStatus };

    await controller.getHealth(mockResponse);

    expect(mockStatus).toHaveBeenCalledWith(HttpStatus.OK);
    expect(mockJson).toHaveBeenCalledWith(
      expect.objectContaining({
        status: 'healthy',
        service: 'cshrk-api',
        database: 'connected',
      }),
    );
  });

  it('should return 503 and degraded status when database query fails', async () => {
    dataSource.query.mockRejectedValue(new Error('Connection lost'));

    const mockJson = jest.fn();
    const mockStatus = jest.fn().mockReturnValue({ json: mockJson });
    const mockResponse: any = { status: mockStatus };

    await controller.getHealth(mockResponse);

    expect(mockStatus).toHaveBeenCalledWith(HttpStatus.SERVICE_UNAVAILABLE);
    expect(mockJson).toHaveBeenCalledWith(
      expect.objectContaining({
        status: 'degraded',
      }),
    );
  });
});
