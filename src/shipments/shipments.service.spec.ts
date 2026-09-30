import { beforeEach, describe, jest, it, expect } from '@jest/globals';
import { ShipmentsService } from './shipments.service';
import { ShipmentEntity } from './entities/shipment.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ShipmentRulesService } from './shipment-rules.service';
import { Test } from '@nestjs/testing';

void describe('ShipmentsServiceTest', () => {
    let service: ShipmentsService
    
    const repositoryMock = {
    find: jest.fn(),
    findOneBy: jest.fn<(options: any) => Promise<ShipmentEntity | null>>(),
    create: jest.fn(),
    save: jest.fn()
  };

  const shipmentRulesServiceMock = {
    ensureCanBeDispatched: jest.fn(),
  }

  beforeEach(async () => {
    jest.clearAllMocks()

    const moduleRef = await Test.createTestingModule({
        providers: [
            ShipmentsService,
            {
                provide: getRepositoryToken(ShipmentEntity),
                useValue: repositoryMock,
            },
            {
                provide: ShipmentRulesService,
                useValue: shipmentRulesServiceMock,
            }
        ]
    }).compile()

    service = moduleRef.get(ShipmentsService)
  })

  it('is defined', async () => {
    expect(service).toBeDefined()
  })
})