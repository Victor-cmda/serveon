import { ApiProperty } from '@nestjs/swagger';
import { BaseEntity } from '../../../common/entities/base.entity';

export class AccountPayable extends BaseEntity {
  @ApiProperty({
    description: 'ID da compra relacionada',
    example: 1,
  })
  compraId: number;

  @ApiProperty({
    description: 'ID do fornecedor',
    example: 1,
  })
  fornecedorId: number;

  @ApiProperty({
    description: 'Número da parcela',
    example: 1,
  })
  numeroParcela: number;

  @ApiProperty({
    description: 'Total de parcelas',
    example: 3,
  })
  totalParcelas: number;

  @ApiProperty({
    description: 'Valor da parcela',
    example: 500.00,
  })
  valorParcela: number;

  @ApiProperty({
    description: 'Data de vencimento',
    example: '2024-02-15',
  })
  dataVencimento: Date;

  @ApiProperty({
    description: 'Data de pagamento (se pago)',
    example: '2024-02-10',
    required: false,
  })
  dataPagamento?: Date;

  @ApiProperty({
    description: 'Valor pago',
    example: 500.00,
    required: false,
  })
  valorPago?: number;

  @ApiProperty({
    description: 'Status da conta',
    example: 'PENDENTE',
    enum: ['PENDENTE', 'PAGO', 'VENCIDO', 'CANCELADO'],
  })
  status: string;

  @ApiProperty({
    description: 'ID do método de pagamento utilizado',
    example: 1,
    required: false,
  })
  metodoPagamentoId?: number;

  @ApiProperty({
    description: 'Observações sobre o pagamento',
    example: 'Pagamento antecipado com desconto',
    required: false,
  })
  observacoes?: string;
}
