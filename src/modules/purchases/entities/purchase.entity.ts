import { ApiProperty } from '@nestjs/swagger';
import { BaseEntity } from '../../../common/entities/base.entity';

export class Purchase extends BaseEntity {
  @ApiProperty({
    description: 'Número sequencial da compra',
    example: 1001,
  })
  numeroSequencial: number;

  @ApiProperty({
    description: 'ID do fornecedor',
    example: 1,
  })
  fornecedorId: number;

  @ApiProperty({
    description: 'ID da condição de pagamento',
    example: 1,
  })
  condicaoPagamentoId: number;

  @ApiProperty({
    description: 'ID do funcionário responsável pela compra',
    example: 1,
  })
  funcionarioId: number;

  @ApiProperty({
    description: 'Data da compra',
    example: '2024-01-15',
  })
  dataCompra: Date;

  @ApiProperty({
    description: 'Data de vencimento',
    example: '2024-02-15',
  })
  dataVencimento: Date;

  @ApiProperty({
    description: 'Valor total da compra',
    example: 1500.50,
  })
  valorTotal: number;

  @ApiProperty({
    description: 'Valor de desconto aplicado',
    example: 50.00,
  })
  valorDesconto: number;

  @ApiProperty({
    description: 'Valor líquido da compra',
    example: 1450.50,
  })
  valorLiquido: number;

  @ApiProperty({
    description: 'Status da compra',
    example: 'PENDENTE',
    enum: ['PENDENTE', 'CONFIRMADA', 'CANCELADA', 'ENTREGUE'],
  })
  status: string;

  @ApiProperty({
    description: 'ID da transportadora',
    example: 1,
    required: false,
  })
  transportadoraId?: number;

  @ApiProperty({
    description: 'Observações sobre a compra',
    example: 'Compra de materiais de escritório',
    required: false,
  })
  observacoes?: string;
}
