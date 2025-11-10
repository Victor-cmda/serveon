import { ApiProperty } from '@nestjs/swagger';
import { BaseEntity } from '../../../common/entities/base.entity';

export class AccountPayable extends BaseEntity {
  @ApiProperty({
    description: 'Número do pedido de compra',
    example: 'PC-0001',
    required: false,
  })
  compraNumeroPedido?: string;

  @ApiProperty({
    description: 'Modelo da nota fiscal',
    example: '55',
    required: false,
  })
  compraModelo?: string;

  @ApiProperty({
    description: 'Série da nota fiscal',
    example: '001',
    required: false,
  })
  compraSerie?: string;

  @ApiProperty({
    description: 'ID do fornecedor na compra',
    example: 1,
    required: false,
  })
  compraFornecedorId?: number;

  @ApiProperty({
    description: 'Número da parcela da compra',
    example: 1,
    required: false,
  })
  parcela?: number;

  @ApiProperty({
    description: 'ID do fornecedor',
    example: 1,
  })
  fornecedorId: number;

  @ApiProperty({
    description: 'Nome do fornecedor',
    example: 'Fornecedor ABC Ltda',
    required: false,
  })
  fornecedorNome?: string;

  @ApiProperty({
    description: 'CNPJ/CPF do fornecedor',
    example: '12.345.678/0001-90',
    required: false,
  })
  fornecedorCnpjCpf?: string;

  @ApiProperty({
    description: 'Número do documento',
    example: 'FAT-001',
  })
  numeroDocumento: string;

  @ApiProperty({
    description: 'Tipo do documento',
    example: 'FATURA',
    enum: ['FATURA', 'DUPLICATA', 'BOLETO', 'NOTA_FISCAL'],
  })
  tipoDocumento: string;

  @ApiProperty({
    description: 'Data de emissão',
    example: '2024-01-15',
  })
  dataEmissao: Date;

  @ApiProperty({
    description: 'Data de vencimento',
    example: '2024-02-15',
  })
  dataVencimento: Date;

  @ApiProperty({
    description: 'Data de pagamento',
    example: '2024-02-10',
    required: false,
  })
  dataPagamento?: Date;

  @ApiProperty({
    description: 'Valor original',
    example: 1500.00,
  })
  valorOriginal: number;

  @ApiProperty({
    description: 'Valor de desconto',
    example: 50.00,
  })
  valorDesconto: number;

  @ApiProperty({
    description: 'Valor de juros',
    example: 25.00,
  })
  valorJuros: number;

  @ApiProperty({
    description: 'Valor de multa',
    example: 15.00,
  })
  valorMulta: number;

  @ApiProperty({
    description: 'Valor pago',
    example: 1490.00,
  })
  valorPago: number;

  @ApiProperty({
    description: 'Valor do saldo',
    example: 0.00,
  })
  valorSaldo: number;

  @ApiProperty({
    description: 'ID da forma de pagamento',
    example: 1,
    required: false,
  })
  formaPagamentoId?: number;

  @ApiProperty({
    description: 'Nome da forma de pagamento',
    example: 'Boleto Bancário',
    required: false,
  })
  formaPagamentoNome?: string;

  @ApiProperty({
    description: 'Status da conta',
    example: 'ABERTO',
    enum: ['ABERTO', 'PAGO', 'PARCIAL', 'VENCIDO', 'CANCELADO'],
  })
  status: string;

  @ApiProperty({
    description: 'ID do funcionário que realizou o pagamento',
    example: 1,
    required: false,
  })
  pagoPor?: number;

  @ApiProperty({
    description: 'Nome do funcionário que realizou o pagamento',
    example: 'João Silva',
    required: false,
  })
  pagoPorNome?: string;

  @ApiProperty({
    description: 'Observações',
    example: 'Pagamento com desconto negociado',
    required: false,
  })
  observacoes?: string;
}
