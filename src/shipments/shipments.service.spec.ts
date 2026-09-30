import { beforeEach, describe, jest, it, expect } from '@jest/globals';
import { ShipmentsService } from './shipments.service';
import { ShipmentEntity } from './entities/shipment.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ShipmentRulesService } from './shipment-rules.service';
import { Test } from '@nestjs/testing';

void describe('ShipmentsServiceTest', () => {
    let service: ShipmentsService
    
    const repositoryMock = {
    find: jest.fn<() => Promise<ShipmentEntity[]>>(),
    findOneBy: jest.fn(),
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

   it('returns all shipments', async () => {
    
    const shipmentsMock = [
            {
            id: 1,
            trackingCode: 'SHIP-001',
            destination: 'Cali',
            },
            {
            id: 2,
            trackingCode: 'SHIP-002',
            destination: 'Medallo',
            }
    ] as ShipmentEntity[]

    repositoryMock.find.mockResolvedValue(shipmentsMock);

    const result = await service.findAll();

    expect(result).toEqual(shipmentsMock)
    expect(repositoryMock.find).toHaveBeenCalledTimes(1)

  })
})