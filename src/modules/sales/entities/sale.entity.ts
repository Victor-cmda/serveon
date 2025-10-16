import { ApiProperty } from '@nestjs/swagger';
import { BaseEntity } from '../../../common/entities/base.entity';

export class Sale extends BaseEntity {
  @ApiProperty({
    description: 'ID do cliente',
    example: 1,
  })
  clienteId: number;

  @ApiProperty({
    description: 'ID da condição de pagamento',
    example: 1,
  })
  condicaoPagamentoId: number;

  @ApiProperty({
    description: 'ID do funcionário responsável pela venda',
    example: 1,
  })
  funcionarioId: number;

  @ApiProperty({
    description: 'Data da venda',
    example: '2024-01-15',
  })
  dataVenda: Date;

  @ApiProperty({
    description: 'Data de vencimento',
    example: '2024-02-15',
  })
  dataVencimento: Date;

  @ApiProperty({
    description: 'Valor total da venda',
    example: 2500.00,
  })
  valorTotal: number;

  @ApiProperty({
    description: 'Valor de desconto aplicado',
    example: 100.00,
  })
  valorDesconto: number;

  @ApiProperty({
    description: 'Valor líquido da venda',
    example: 2400.00,
  })
  valorLiquido: number;

  @ApiProperty({
    description: 'Status da venda',
    example: 'CONFIRMADA',
    enum: ['ORCAMENTO', 'CONFIRMADA', 'CANCELADA', 'ENTREGUE', 'FATURADA'],
  })
  status: string;

  @ApiProperty({
    description: 'ID da transportadora',
    example: 1,
    required: false,
  })
  transportadoraId?: number;

  @ApiProperty({
    description: 'Observações sobre a venda',
    example: 'Venda de produtos eletrônicos',
    required: false,
  })
  observacoes?: string;
}
