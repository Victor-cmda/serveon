import { ApiProperty } from '@nestjs/swagger';
import { BaseEntity } from '../../../common/entities/base.entity';

export class AccountReceivable extends BaseEntity {
  @ApiProperty({
    description: 'ID da venda relacionada',
    example: 1,
  })
  vendaId: number;

  @ApiProperty({
    description: 'ID do cliente',
    example: 1,
  })
  clienteId: number;

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
    example: 800.00,
  })
  valorParcela: number;

  @ApiProperty({
    description: 'Data de vencimento',
    example: '2024-02-15',
  })
  dataVencimento: Date;

  @ApiProperty({
    description: 'Data de recebimento (se recebido)',
    example: '2024-02-10',
    required: false,
  })
  dataRecebimento?: Date;

  @ApiProperty({
    description: 'Valor recebido',
    example: 800.00,
    required: false,
  })
  valorRecebido?: number;

  @ApiProperty({
    description: 'Status da conta',
    example: 'PENDENTE',
    enum: ['PENDENTE', 'RECEBIDO', 'VENCIDO', 'CANCELADO'],
  })
  status: string;

  @ApiProperty({
    description: 'ID do método de pagamento utilizado',
    example: 1,
    required: false,
  })
  metodoPagamentoId?: number;

  @ApiProperty({
    description: 'Observações sobre o recebimento',
    example: 'Pagamento via PIX',
    required: false,
  })
  observacoes?: string;
}
