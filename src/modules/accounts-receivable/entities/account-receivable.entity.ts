import { ApiProperty } from '@nestjs/swagger';
import { BaseEntity } from '../../../common/entities/base.entity';

export class AccountReceivable extends BaseEntity {
  @ApiProperty({
    description: 'Número do pedido de venda',
    example: 'PV-0001',
    required: false,
  })
  vendaNumeroPedido?: string;

  @ApiProperty({
    description: 'Modelo da nota fiscal',
    example: '55',
    required: false,
  })
  vendaModelo?: string;

  @ApiProperty({
    description: 'Série da nota fiscal',
    example: '001',
    required: false,
  })
  vendaSerie?: string;

  @ApiProperty({
    description: 'ID do cliente na venda',
    example: 1,
    required: false,
  })
  vendaClienteId?: number;

  @ApiProperty({
    description: 'Número da parcela da venda',
    example: 1,
    required: false,
  })
  parcela?: number;

  @ApiProperty({
    description: 'ID do cliente',
    example: 1,
  })
  clienteId: number;

  @ApiProperty({
    description: 'Nome do cliente',
    example: 'Cliente XYZ Ltda',
    required: false,
  })
  clienteNome?: string;

  @ApiProperty({
    description: 'CNPJ/CPF do cliente',
    example: '12.345.678/0001-90',
    required: false,
  })
  clienteCnpjCpf?: string;

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
    description: 'Data de recebimento',
    example: '2024-02-10',
    required: false,
  })
  dataRecebimento?: Date;

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
    description: 'Valor recebido',
    example: 1490.00,
  })
  valorRecebido: number;

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
    enum: ['ABERTO', 'RECEBIDO', 'VENCIDO', 'CANCELADO'],
  })
  status: string;

  @ApiProperty({
    description: 'ID do funcionário que realizou o recebimento',
    example: 1,
    required: false,
  })
  recebidoPor?: number;

  @ApiProperty({
    description: 'Nome do funcionário que realizou o recebimento',
    example: 'João Silva',
    required: false,
  })
  recebidoPorNome?: string;

  @ApiProperty({
    description: 'Observações',
    example: 'Recebimento com desconto negociado',
    required: false,
  })
  observacoes?: string;
}
