import { Test, TestingModule } from '@nestjs/testing';
import { CountriesService } from './countries.service';
import { DatabaseService } from '../../../common/database/database.service';
import { ConflictException, NotFoundException } from '@nestjs/common';

// Mock para o DatabaseService
const mockDatabaseService = {
  query: jest.fn(),
};

describe('CountriesService', () => {
  let service: CountriesService;
  let databaseService: DatabaseService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CountriesService,
        {
          provide: DatabaseService,
          useValue: mockDatabaseService,
        },
      ],
    }).compile();

    service = module.get<CountriesService>(CountriesService);
    databaseService = module.get<DatabaseService>(DatabaseService);

    // Limpar todos os mocks antes de cada teste
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    const createCountryDto = {
      nome: 'Test Country',
      codigo: '123',
      sigla: 'TC',
    };

    const mockCountry = {
      id: 'c7b59a86-dbf3-4a20-9e40-d5bb32c3aaaa',
      nome: 'Test Country',
      codigo: '123',
      sigla: 'TC',
      created_at: new Date(),
      updated_at: new Date(),
    };

    it('should create a country successfully', async () => {
      // Configura o mock para simular que não existe país com o mesmo código ou sigla
      mockDatabaseService.query
        .mockResolvedValueOnce({ rowCount: 0 }) // verificação de código
        .mockResolvedValueOnce({ rowCount: 0 }) // verificação de sigla
        .mockResolvedValueOnce({ rows: [mockCountry] }); // inserção do país

      const result = await service.create(createCountryDto);

      expect(databaseService.query).toHaveBeenCalledTimes(3);
      expect(result).toEqual({
        id: mockCountry.id,
        nome: mockCountry.nome,
        codigo: mockCountry.codigo,
        sigla: mockCountry.sigla,
        createdAt: mockCountry.created_at,
        updatedAt: mockCountry.updated_at,
      });
    });

    it('should throw ConflictException if country with same code exists', async () => {
      // Configura o mock para simular que existe país com o mesmo código
      mockDatabaseService.query.mockResolvedValueOnce({ rowCount: 1 });

      await expect(service.create(createCountryDto)).rejects.toThrow(
        ConflictException,
      );
      expect(databaseService.query).toHaveBeenCalledTimes(1);
    });

    it('should throw ConflictException if country with same sigla exists', async () => {
      // Configura o mock para simular que não existe país com o mesmo código, mas existe com a mesma sigla
      mockDatabaseService.query
        .mockResolvedValueOnce({ rowCount: 0 })
        .mockResolvedValueOnce({ rowCount: 1 });

      await expect(service.create(createCountryDto)).rejects.toThrow(
        ConflictException,
      );
      expect(databaseService.query).toHaveBeenCalledTimes(2);
    });
  });

  describe('findAll', () => {
    it('should return an array of countries', async () => {
      const mockCountries = [
        {
          id: 'c7b59a86-dbf3-4a20-9e40-d5bb32c3aaaa',
          nome: 'Test Country 1',
          codigo: '123',
          sigla: 'T1',
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          id: 'c7b59a86-dbf3-4a20-9e40-d5bb32c3bbbb',
          nome: 'Test Country 2',
          codigo: '456',
          sigla: 'T2',
          created_at: new Date(),
          updated_at: new Date(),
        },
      ];

      mockDatabaseService.query.mockResolvedValueOnce({ rows: mockCountries });

      const result = await service.findAll();

      expect(databaseService.query).toHaveBeenCalledTimes(1);
      expect(result).toHaveLength(2);
      expect(result[0].nome).toBe('Test Country 1');
      expect(result[1].nome).toBe('Test Country 2');
    });
  });

  describe('findOne', () => {
    const mockCountry = {
      id: 'c7b59a86-dbf3-4a20-9e40-d5bb32c3aaaa',
      nome: 'Test Country',
      codigo: '123',
      sigla: 'TC',
      created_at: new Date(),
      updated_at: new Date(),
    };

    it('should return a country by id', async () => {
      mockDatabaseService.query.mockResolvedValueOnce({ 
        rowCount: 1, 
        rows: [mockCountry] 
      });

      const result = await service.findOne(mockCountry.id);

      expect(databaseService.query).toHaveBeenCalledTimes(1);
      expect(result.id).toBe(mockCountry.id);
      expect(result.nome).toBe(mockCountry.nome);
    });

    it('should throw NotFoundException if country not found', async () => {
      mockDatabaseService.query.mockResolvedValueOnce({ rowCount: 0 });

      await expect(
        service.findOne('non-existent-id'),
      ).rejects.toThrow(NotFoundException);
      expect(databaseService.query).toHaveBeenCalledTimes(1);
    });
  });

  describe('update', () => {
    const mockCountry = {
      id: 'c7b59a86-dbf3-4a20-9e40-d5bb32c3aaaa',
      nome: 'Test Country',
      codigo: '123',
      sigla: 'TC',
      created_at: new Date(),
      updated_at: new Date(),
    };

    const updateCountryDto = {
      nome: 'Updated Country',
    };

    it('should update a country successfully', async () => {
      const updatedMockCountry = {
        ...mockCountry,
        nome: 'Updated Country',
      };

      mockDatabaseService.query
        .mockResolvedValueOnce({ rowCount: 1 }) // verificação se o país existe
        .mockResolvedValueOnce({ rows: [updatedMockCountry] }); // atualização do país

      const result = await service.update(mockCountry.id, updateCountryDto);

      expect(databaseService.query).toHaveBeenCalledTimes(2);
      expect(result.id).toBe(mockCountry.id);
      expect(result.nome).toBe('Updated Country');
    });

    it('should throw NotFoundException if country not found', async () => {
      mockDatabaseService.query.mockResolvedValueOnce({ rowCount: 0 });

      await expect(
        service.update('non-existent-id', updateCountryDto),
      ).rejects.toThrow(NotFoundException);
      expect(databaseService.query).toHaveBeenCalledTimes(1);
    });

    it('should throw ConflictException if updating to an existing code', async () => {
      const updateWithExistingCode = {
        codigo: '456', // código já existente em outro país
      };

      mockDatabaseService.query
        .mockResolvedValueOnce({ rowCount: 1 }) // verificação se o país existe
        .mockResolvedValueOnce({ rowCount: 1 }); // verificação se já existe outro país com o código

      await expect(
        service.update(mockCountry.id, updateWithExistingCode),
      ).rejects.toThrow(ConflictException);
      expect(databaseService.query).toHaveBeenCalledTimes(2);
    });
  });

  describe('remove', () => {
    const mockCountryId = 'c7b59a86-dbf3-4a20-9e40-d5bb32c3aaaa';

    it('should remove a country successfully', async () => {
      mockDatabaseService.query
        .mockResolvedValueOnce({ rowCount: 1 }) // verificação se o país existe
        .mockResolvedValueOnce({ rowCount: 0 }) // verificação de estados vinculados
        .mockResolvedValueOnce({ rowCount: 1 }); // remoção do país

      await service.remove(mockCountryId);

      expect(databaseService.query).toHaveBeenCalledTimes(3);
    });

    it('should throw NotFoundException if country not found', async () => {
      mockDatabaseService.query.mockResolvedValueOnce({ rowCount: 0 });

      await expect(service.remove('non-existent-id')).rejects.toThrow(
        NotFoundException,
      );
      expect(databaseService.query).toHaveBeenCalledTimes(1);
    });

    it('should throw ConflictException if country has linked states', async () => {
      mockDatabaseService.query
        .mockResolvedValueOnce({ rowCount: 1 }) // verificação se o país existe
        .mockResolvedValueOnce({ rowCount: 1 }); // verificação de estados vinculados

      await expect(service.remove(mockCountryId)).rejects.toThrow(
        ConflictException,
      );
      expect(databaseService.query).toHaveBeenCalledTimes(2);
    });
  });
});