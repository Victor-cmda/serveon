import { Test, TestingModule } from '@nestjs/testing';
import { AccountsPayableController } from './accounts-payable.controller';
import { AccountsPayableService } from '../services/accounts-payable.service';

describe('AccountsPayableController', () => {
  let controller: AccountsPayableController;
  let service: AccountsPayableService;

  const mockAccountsPayableService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    findBySupplier: jest.fn(),
    findOverdue: jest.fn(),
    findByPeriod: jest.fn(),
    update: jest.fn(),
    pay: jest.fn(),
    cancel: jest.fn(),
    remove: jest.fn(),
    updateOverdueStatus: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AccountsPayableController],
      providers: [
        {
          provide: AccountsPayableService,
          useValue: mockAccountsPayableService,
        },
      ],
    }).compile();

    controller = module.get<AccountsPayableController>(AccountsPayableController);
    service = module.get<AccountsPayableService>(AccountsPayableService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create an account payable', async () => {
      const createDto = {
        fornecedorId: 1,
        numeroDocumento: 'FAT-001',
        tipoDocumento: 'FATURA',
        dataEmissao: new Date('2024-01-15'),
        dataVencimento: new Date('2024-02-15'),
        valorOriginal: 1500.00,
      };

      const mockResult = {
        id: 1,
        ...createDto,
        valorDesconto: 0,
        valorJuros: 0,
        valorMulta: 0,
        valorPago: 0,
        valorSaldo: 1500,
        status: 'ABERTO',
        ativo: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      mockAccountsPayableService.create.mockResolvedValue(mockResult);

      const result = await controller.create(createDto as any);

      expect(result).toEqual(mockResult);
      expect(service.create).toHaveBeenCalledWith(createDto);
    });
  });

  describe('findAll', () => {
    it('should return all accounts payable', async () => {
      const mockAccounts = [
        {
          id: 1,
          numeroDocumento: 'FAT-001',
          valorOriginal: 1500,
          status: 'ABERTO',
        },
      ];

      mockAccountsPayableService.findAll.mockResolvedValue(mockAccounts);

      const result = await controller.findAll();

      expect(result).toEqual(mockAccounts);
      expect(service.findAll).toHaveBeenCalled();
    });

    it('should return accounts payable with filters', async () => {
      const mockAccounts = [
        {
          id: 1,
          numeroDocumento: 'FAT-001',
          valorOriginal: 1500,
          status: 'ABERTO',
          fornecedorId: 1,
        },
      ];

      mockAccountsPayableService.findAll.mockResolvedValue(mockAccounts);

      const result = await controller.findAll(1, 'ABERTO');

      expect(result).toEqual(mockAccounts);
      expect(service.findAll).toHaveBeenCalledWith({
        fornecedorId: 1,
        status: 'ABERTO',
      });
    });
  });

  describe('findOne', () => {
    it('should return an account payable by id', async () => {
      const mockAccount = {
        id: 1,
        numeroDocumento: 'FAT-001',
        valorOriginal: 1500,
        status: 'ABERTO',
      };

      mockAccountsPayableService.findOne.mockResolvedValue(mockAccount);

      const result = await controller.findOne('1');

      expect(result).toEqual(mockAccount);
      expect(service.findOne).toHaveBeenCalledWith(1);
    });
  });

  describe('findOverdue', () => {
    it('should return overdue accounts', async () => {
      const mockAccounts = [
        {
          id: 1,
          numeroDocumento: 'FAT-001',
          valorOriginal: 1500,
          status: 'VENCIDO',
        },
      ];

      mockAccountsPayableService.findOverdue.mockResolvedValue(mockAccounts);

      const result = await controller.findOverdue();

      expect(result).toEqual(mockAccounts);
      expect(service.findOverdue).toHaveBeenCalled();
    });
  });

  describe('pay', () => {
    it('should pay an account', async () => {
      const payDto = {
        dataPagamento: new Date('2024-02-10'),
        valorPago: 1500.00,
        formaPagamentoId: 1,
      };

      const mockResult = {
        id: 1,
        numeroDocumento: 'FAT-001',
        valorOriginal: 1500,
        valorPago: 1500,
        status: 'PAGO',
      };

      mockAccountsPayableService.pay.mockResolvedValue(mockResult);

      const result = await controller.pay('1', payDto as any);

      expect(result).toEqual(mockResult);
      expect(service.pay).toHaveBeenCalledWith(1, payDto);
    });
  });

  describe('cancel', () => {
    it('should cancel an account', async () => {
      mockAccountsPayableService.cancel.mockResolvedValue(undefined);

      const result = await controller.cancel('1');

      expect(result).toBeUndefined();
      expect(service.cancel).toHaveBeenCalledWith(1);
    });
  });

  describe('remove', () => {
    it('should remove an account', async () => {
      mockAccountsPayableService.remove.mockResolvedValue(undefined);

      const result = await controller.remove('1');

      expect(result).toBeUndefined();
      expect(service.remove).toHaveBeenCalledWith(1);
    });
  });
});
