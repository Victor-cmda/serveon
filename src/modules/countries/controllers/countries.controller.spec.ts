import { Test, TestingModule } from '@nestjs/testing';
import { CountriesController } from './countries.controller';
import { CountriesService } from '../services/countries.service';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { CreateCountryDto } from '../dto/create-country.dto';
import { UpdateCountryDto } from '../dto/update-country.dto';

// Mock para o CountriesService
const mockCountriesService = {
  create: jest.fn(),
  findAll: jest.fn(),
  findOne: jest.fn(),
  findByCode: jest.fn(),
  findBySigla: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
};

describe('CountriesController', () => {
  let controller: CountriesController;
  let service: CountriesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CountriesController],
      providers: [
        {
          provide: CountriesService,
          useValue: mockCountriesService,
        },
      ],
    }).compile();

    controller = module.get<CountriesController>(CountriesController);
    service = module.get<CountriesService>(CountriesService);

    // Limpar todos os mocks antes de cada teste
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    const createCountryDto: CreateCountryDto = {
      nome: 'Test Country',
      codigo: '123',
      sigla: 'TC',
    };

    const mockCreatedCountry = {
      id: 'c7b59a86-dbf3-4a20-9e40-d5bb32c3aaaa',
      nome: 'Test Country',
      codigo: '123',
      sigla: 'TC',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    it('should create a country successfully', async () => {
      mockCountriesService.create.mockResolvedValueOnce(mockCreatedCountry);

      const result = await controller.create(createCountryDto);

      expect(service.create).toHaveBeenCalledWith(createCountryDto);
      expect(result).toBe(mockCreatedCountry);
    });

    it('should propagate service exceptions', async () => {
      mockCountriesService.create.mockRejectedValueOnce(
        new ConflictException('País com mesmo código ou sigla já existe'),
      );

      await expect(controller.create(createCountryDto)).rejects.toThrow(
        ConflictException,
      );
      expect(service.create).toHaveBeenCalledWith(createCountryDto);
    });
  });

  describe('findAll', () => {
    const mockCountries = [
      {
        id: 'c7b59a86-dbf3-4a20-9e40-d5bb32c3aaaa',
        nome: 'Test Country 1',
        codigo: '123',
        sigla: 'T1',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'c7b59a86-dbf3-4a20-9e40-d5bb32c3bbbb',
        nome: 'Test Country 2',
        codigo: '456',
        sigla: 'T2',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    it('should return an array of countries', async () => {
      mockCountriesService.findAll.mockResolvedValueOnce(mockCountries);

      const result = await controller.findAll();

      expect(service.findAll).toHaveBeenCalled();
      expect(result).toBe(mockCountries);
    });
  });

  describe('findOne', () => {
    const mockCountry = {
      id: 'c7b59a86-dbf3-4a20-9e40-d5bb32c3aaaa',
      nome: 'Test Country',
      codigo: '123',
      sigla: 'TC',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    it('should return a country by id', async () => {
      mockCountriesService.findOne.mockResolvedValueOnce(mockCountry);

      const result = await controller.findOne(mockCountry.id);

      expect(service.findOne).toHaveBeenCalledWith(mockCountry.id);
      expect(result).toBe(mockCountry);
    });

    it('should propagate NotFoundException if country not found', async () => {
      mockCountriesService.findOne.mockRejectedValueOnce(
        new NotFoundException('País não encontrado'),
      );

      await expect(controller.findOne('non-existent-id')).rejects.toThrow(
        NotFoundException,
      );
      expect(service.findOne).toHaveBeenCalledWith('non-existent-id');
    });
  });

  describe('findByCode', () => {
    const mockCountry = {
      id: 'c7b59a86-dbf3-4a20-9e40-d5bb32c3aaaa',
      nome: 'Test Country',
      codigo: '123',
      sigla: 'TC',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    it('should return a country by code', async () => {
      mockCountriesService.findByCode.mockResolvedValueOnce(mockCountry);

      const result = await controller.findByCode('123');

      expect(service.findByCode).toHaveBeenCalledWith('123');
      expect(result).toBe(mockCountry);
    });

    it('should propagate NotFoundException if country not found', async () => {
      mockCountriesService.findByCode.mockRejectedValueOnce(
        new NotFoundException('País não encontrado'),
      );

      await expect(controller.findByCode('999')).rejects.toThrow(
        NotFoundException,
      );
      expect(service.findByCode).toHaveBeenCalledWith('999');
    });
  });

  describe('findBySigla', () => {
    const mockCountry = {
      id: 'c7b59a86-dbf3-4a20-9e40-d5bb32c3aaaa',
      nome: 'Test Country',
      codigo: '123',
      sigla: 'TC',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    it('should return a country by sigla', async () => {
      mockCountriesService.findBySigla.mockResolvedValueOnce(mockCountry);

      const result = await controller.findBySigla('TC');

      expect(service.findBySigla).toHaveBeenCalledWith('TC');
      expect(result).toBe(mockCountry);
    });

    it('should propagate NotFoundException if country not found', async () => {
      mockCountriesService.findBySigla.mockRejectedValueOnce(
        new NotFoundException('País não encontrado'),
      );

      await expect(controller.findBySigla('XX')).rejects.toThrow(
        NotFoundException,
      );
      expect(service.findBySigla).toHaveBeenCalledWith('XX');
    });
  });

  describe('update', () => {
    const updateCountryDto: UpdateCountryDto = {
      nome: 'Updated Country',
    };

    const mockUpdatedCountry = {
      id: 'c7b59a86-dbf3-4a20-9e40-d5bb32c3aaaa',
      nome: 'Updated Country',
      codigo: '123',
      sigla: 'TC',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    it('should update a country successfully', async () => {
      mockCountriesService.update.mockResolvedValueOnce(mockUpdatedCountry);

      const result = await controller.update(
        'c7b59a86-dbf3-4a20-9e40-d5bb32c3aaaa',
        updateCountryDto,
      );

      expect(service.update).toHaveBeenCalledWith(
        'c7b59a86-dbf3-4a20-9e40-d5bb32c3aaaa',
        updateCountryDto,
      );
      expect(result).toBe(mockUpdatedCountry);
    });

    it('should propagate service exceptions', async () => {
      mockCountriesService.update.mockRejectedValueOnce(
        new NotFoundException('País não encontrado'),
      );

      await expect(
        controller.update('non-existent-id', updateCountryDto),
      ).rejects.toThrow(NotFoundException);
      expect(service.update).toHaveBeenCalledWith(
        'non-existent-id',
        updateCountryDto,
      );
    });
  });

  describe('remove', () => {
    it('should remove a country successfully', async () => {
      mockCountriesService.remove.mockResolvedValueOnce(undefined);

      await controller.remove('c7b59a86-dbf3-4a20-9e40-d5bb32c3aaaa');

      expect(service.remove).toHaveBeenCalledWith(
        'c7b59a86-dbf3-4a20-9e40-d5bb32c3aaaa',
      );
    });

    it('should propagate service exceptions', async () => {
      mockCountriesService.remove.mockRejectedValueOnce(
        new NotFoundException('País não encontrado'),
      );

      await expect(controller.remove('non-existent-id')).rejects.toThrow(
        NotFoundException,
      );
      expect(service.remove).toHaveBeenCalledWith('non-existent-id');
    });
  });
});