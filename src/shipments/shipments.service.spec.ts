import { beforeEach, describe, jest, it, expect } from '@jest/globals';
import { ShipmentsService } from './shipments.service';
import { ShipmentEntity } from './entities/shipment.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ShipmentRulesService } from './shipment-rules.service';
import { Test } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { ShipmentStatus } from './shipment-status.enum';

void describe('ShipmentsServiceTest', () => {
    let service: ShipmentsService
    
    const repositoryMock = {
    find: jest.fn<() => Promise<ShipmentEntity[]>>(),
    findOneBy:  jest.fn<(options: any) => Promise<ShipmentEntity | null>>(),
    create: jest.fn(),
    save: jest.fn<(shipment: ShipmentEntity) => Promise<ShipmentEntity>>(),
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

    it('returns a shipment when the id exists', async () => {
        
        const shipmentMock = {
                id: 1,
                trackingCode: 'SHIP-001',
                destination: 'Cali',
            } as ShipmentEntity

            repositoryMock.findOneBy.mockResolvedValue(shipmentMock)

            const result = await service.findOne(1)

            expect(result).toEqual(shipmentMock)
            expect(repositoryMock.findOneBy).toHaveBeenCalledWith({
                id: 1,
            });
    })

    it('throws NotFoundException when the id does not exist', async () => {
        repositoryMock.findOneBy.mockResolvedValue(null);

        await expect(service.findOne(999)).rejects.toBeInstanceOf(
        NotFoundException,
        );
    })

    it('creates and saves a shipment', async () => {

        const data = {
            trackingCode: 'SHIP-100',
            destination: 'Cali',
        };

        const createdShipment = {
            ...data,
            status: ShipmentStatus.CREATED,
        } as ShipmentEntity;

        const savedShipment = {
            ...createdShipment,
            id: 1,
        } as ShipmentEntity;

        repositoryMock.create.mockReturnValue(createdShipment);
        repositoryMock.save.mockResolvedValue(savedShipment);

        const result = await service.create(data);

        expect(repositoryMock.create).toHaveBeenCalledWith({
            ...data,
            status: ShipmentStatus.CREATED,
        });

        expect(repositoryMock.save).toHaveBeenCalledWith(createdShipment);
        expect(result).toEqual(savedShipment);
    });

    it('dispatches and saves a valid shipment', async () => {

        const shipmentMock =  {
            id: 1,
            trackingCode: 'SHIP-100',
            destination: 'Cali',
            status: ShipmentStatus.CREATED,
        } as ShipmentEntity;
    
        repositoryMock.findOneBy.mockResolvedValue(shipmentMock)
        repositoryMock.save.mockResolvedValue(shipmentMock)

        const result = await service.dispatch(1)

        expect(shipmentRulesServiceMock.ensureCanBeDispatched).toHaveBeenCalledWith(shipmentMock)
        expect(shipmentMock.status).toBe(ShipmentStatus.DISPATCHED)
        expect(repositoryMock.save).toHaveBeenCalledWith(shipmentMock)
        expect(result).toEqual(shipmentMock)
    });
})