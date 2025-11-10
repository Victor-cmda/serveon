import { Test, TestingModule } from '@nestjs/testing';
import { AccountsPayableService } from './accounts-payable.service';
import { DatabaseService } from '../../../common/database/database.service';
import { NotFoundException, BadRequestException } from '@nestjs/common';

describe('AccountsPayableService', () => {
  let service: AccountsPayableService;
  let databaseService: DatabaseService;

  const mockClient = {
    query: jest.fn(),
    release: jest.fn(),
  };

  const mockDatabaseService = {
    getClient: jest.fn().mockResolvedValue(mockClient),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AccountsPayableService,
        {
          provide: DatabaseService,
          useValue: mockDatabaseService,
        },
      ],
    }).compile();

    service = module.get<AccountsPayableService>(AccountsPayableService);
    databaseService = module.get<DatabaseService>(DatabaseService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new account payable', async () => {
      const createDto = {
        fornecedorId: 1,
        numeroDocumento: 'FAT-001',
        tipoDocumento: 'FATURA',
        dataEmissao: new Date('2024-01-15'),
        dataVencimento: new Date('2024-02-15'),
        valorOriginal: 1500.00,
      };

      const mockSupplier = {
        rows: [{ id: 1, razao_social: 'Fornecedor Teste', cnpj_cpf: '12345678901234' }],
        rowCount: 1,
      };

      const mockAccountPayable = {
        rows: [{
          id: 1,
          fornecedor_id: 1,
          numero_documento: 'FAT-001',
          tipo_documento: 'FATURA',
          data_emissao: new Date('2024-01-15'),
          data_vencimento: new Date('2024-02-15'),
          valor_original: '1500.00',
          valor_desconto: '0.00',
          valor_juros: '0.00',
          valor_multa: '0.00',
          valor_pago: '0.00',
          valor_saldo: '1500.00',
          status: 'ABERTO',
          ativo: true,
          created_at: new Date(),
          updated_at: new Date(),
        }],
        rowCount: 1,
      };

      mockClient.query
        .mockResolvedValueOnce(undefined) // BEGIN
        .mockResolvedValueOnce(mockSupplier) // Verificar fornecedor
        .mockResolvedValueOnce(mockAccountPayable) // INSERT
        .mockResolvedValueOnce(mockSupplier) // enrichAccountData
        .mockResolvedValueOnce(undefined); // COMMIT

      const result = await service.create(createDto as any);

      expect(result).toBeDefined();
      expect(result.numeroDocumento).toBe('FAT-001');
      expect(mockClient.query).toHaveBeenCalled();
    });

    it('should throw BadRequestException if supplier not found', async () => {
      const createDto = {
        fornecedorId: 999,
        numeroDocumento: 'FAT-001',
        dataEmissao: new Date('2024-01-15'),
        dataVencimento: new Date('2024-02-15'),
        valorOriginal: 1500.00,
      };

      mockClient.query
        .mockResolvedValueOnce(undefined) // BEGIN
        .mockResolvedValueOnce({ rows: [], rowCount: 0 }); // Fornecedor não encontrado

      await expect(service.create(createDto as any)).rejects.toThrow(BadRequestException);
    });
  });

  describe('findAll', () => {
    it('should return all accounts payable', async () => {
      const mockAccounts = {
        rows: [
          {
            id: 1,
            fornecedor_id: 1,
            numero_documento: 'FAT-001',
            valor_original: '1500.00',
            valor_desconto: '0.00',
            valor_juros: '0.00',
            valor_multa: '0.00',
            valor_pago: '0.00',
            valor_saldo: '1500.00',
            status: 'ABERTO',
            ativo: true,
            created_at: new Date(),
            updated_at: new Date(),
          },
        ],
        rowCount: 1,
      };

      mockClient.query.mockResolvedValueOnce(mockAccounts);

      const result = await service.findAll();

      expect(result).toBeDefined();
      expect(result.length).toBe(1);
      expect(mockClient.release).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return an account payable by id', async () => {
      const mockAccount = {
        rows: [
          {
            id: 1,
            fornecedor_id: 1,
            numero_documento: 'FAT-001',
            valor_original: '1500.00',
            valor_desconto: '0.00',
            valor_juros: '0.00',
            valor_multa: '0.00',
            valor_pago: '0.00',
            valor_saldo: '1500.00',
            status: 'ABERTO',
            ativo: true,
            created_at: new Date(),
            updated_at: new Date(),
          },
        ],
        rowCount: 1,
      };

      mockClient.query.mockResolvedValueOnce(mockAccount);

      const result = await service.findOne(1);

      expect(result).toBeDefined();
      expect(result.id).toBe(1);
    });

    it('should throw NotFoundException if account not found', async () => {
      mockClient.query.mockResolvedValueOnce({ rows: [], rowCount: 0 });

      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('pay', () => {
    it('should pay an account', async () => {
      const payDto = {
        dataPagamento: new Date('2024-02-10'),
        valorPago: 1500.00,
        formaPagamentoId: 1,
      };

      const mockAccount = {
        rows: [
          {
            id: 1,
            valor_original: '1500.00',
            valor_desconto: '0.00',
            valor_juros: '0.00',
            valor_multa: '0.00',
            valor_pago: '0.00',
            status: 'ABERTO',
          },
        ],
        rowCount: 1,
      };

      const mockPaidAccount = {
        rows: [
          {
            id: 1,
            fornecedor_id: 1,
            valor_original: '1500.00',
            valor_desconto: '0.00',
            valor_juros: '0.00',
            valor_multa: '0.00',
            valor_pago: '1500.00',
            valor_saldo: '0.00',
            status: 'PAGO',
            data_pagamento: new Date('2024-02-10'),
            ativo: true,
            created_at: new Date(),
            updated_at: new Date(),
          },
        ],
        rowCount: 1,
      };

      mockClient.query
        .mockResolvedValueOnce(undefined) // BEGIN
        .mockResolvedValueOnce(mockAccount) // Buscar conta
        .mockResolvedValueOnce(mockPaidAccount) // UPDATE
        .mockResolvedValueOnce({ rows: [], rowCount: 0 }) // enrichAccountData
        .mockResolvedValueOnce(undefined); // COMMIT

      const result = await service.pay(1, payDto as any);

      expect(result).toBeDefined();
      expect(result.status).toBe('PAGO');
    });

    it('should throw BadRequestException if account already paid', async () => {
      const payDto = {
        dataPagamento: new Date('2024-02-10'),
        valorPago: 1500.00,
        formaPagamentoId: 1,
      };

      mockClient.query
        .mockResolvedValueOnce(undefined) // BEGIN
        .mockResolvedValueOnce({
          rows: [{ status: 'PAGO' }],
          rowCount: 1,
        });

      await expect(service.pay(1, payDto as any)).rejects.toThrow(BadRequestException);
    });
  });

  describe('cancel', () => {
    it('should cancel an account', async () => {
      mockClient.query
        .mockResolvedValueOnce(undefined) // BEGIN
        .mockResolvedValueOnce({ rows: [{ id: 1, status: 'ABERTO' }], rowCount: 1 }) // Verificar conta
        .mockResolvedValueOnce(undefined) // UPDATE
        .mockResolvedValueOnce(undefined); // COMMIT

      await service.cancel(1);

      expect(mockClient.query).toHaveBeenCalled();
    });

    it('should throw BadRequestException if account already paid', async () => {
      mockClient.query
        .mockResolvedValueOnce(undefined) // BEGIN
        .mockResolvedValueOnce({ rows: [{ id: 1, status: 'PAGO' }], rowCount: 1 });

      await expect(service.cancel(1)).rejects.toThrow(BadRequestException);
    });
  });

  describe('remove', () => {
    it('should remove an account (soft delete)', async () => {
      mockClient.query
        .mockResolvedValueOnce(undefined) // BEGIN
        .mockResolvedValueOnce({ rows: [{ id: 1, status: 'ABERTO' }], rowCount: 1 }) // Verificar conta
        .mockResolvedValueOnce(undefined) // UPDATE
        .mockResolvedValueOnce(undefined); // COMMIT

      await service.remove(1);

      expect(mockClient.query).toHaveBeenCalled();
    });
  });
});
