import { ApiProperty } from '@nestjs/swagger';
import { OfflineSyncOperationType } from '@cshrk/types';

export class OfflineSyncItemDto {
  @ApiProperty({ description: 'Unique operation client UUID' })
  operationId: string;

  @ApiProperty({ enum: OfflineSyncOperationType })
  operationType: OfflineSyncOperationType;

  @ApiProperty({ description: 'Client idempotency key (min 8 chars)' })
  idempotencyKey: string;

  @ApiProperty({ description: 'ISO 8601 timestamp when client performed offline action' })
  clientTimestamp: string;

  @ApiProperty({ description: 'Operation specific payload' })
  payload: Record<string, any>;
}

export class OfflineSyncQueueDto {
  @ApiProperty({ type: [OfflineSyncItemDto], description: 'Batch of offline operations (max 50)' })
  items: OfflineSyncItemDto[];
}
