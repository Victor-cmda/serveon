import { ApiProperty } from '@nestjs/swagger';
import { BaseEntity } from '../../../common/entities/base.entity';

export class StockMovement extends BaseEntity {
  @ApiProperty({
    description: 'ID do produto',
    example: 1,
  })
  produtoId: number;

  @ApiProperty({
    description: 'Tipo de movimento',
    example: 'ENTRADA',
    enum: ['ENTRADA', 'SAIDA', 'AJUSTE', 'TRANSFERENCIA'],
  })
  tipoMovimento: string;

  @ApiProperty({
    description: 'Quantidade movimentada',
    example: 100.00,
  })
  quantidade: number;

  @ApiProperty({
    description: 'Valor unitário do produto no momento do movimento',
    example: 25.50,
  })
  valorUnitario: number;

  @ApiProperty({
    description: 'Valor total da movimentação',
    example: 2550.00,
  })
  valorTotal: number;

  @ApiProperty({
    description: 'Data da movimentação',
    example: '2024-01-15',
  })
  dataMovimento: Date;

  @ApiProperty({
    description: 'ID da compra (se movimento for de entrada por compra)',
    example: 1,
    required: false,
  })
  compraId?: number;

  @ApiProperty({
    description: 'ID da venda (se movimento for de saída por venda)',
    example: 1,
    required: false,
  })
  vendaId?: number;

  @ApiProperty({
    description: 'ID do funcionário responsável pela movimentação',
    example: 1,
  })
  funcionarioId: number;

  @ApiProperty({
    description: 'Observações sobre a movimentação',
    example: 'Entrada de mercadoria da compra #1001',
    required: false,
  })
  observacoes?: string;
}
