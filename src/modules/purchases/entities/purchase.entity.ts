import { ApiProperty } from '@nestjs/swagger';
import { BaseEntity } from '../../../common/entities/base.entity';

export class Purchase extends BaseEntity {
  @ApiProperty({
    description: 'Número sequencial da compra',
    example: 1001,
    required: false,
  })
  numeroSequencial?: number | null;

  @ApiProperty({
    description: 'Modelo da nota fiscal',
    example: '55',
    required: false,
  })
  modelo?: string;

  @ApiProperty({
    description: 'Série da nota fiscal',
    example: '1',
    required: false,
  })
  serie?: string;

  @ApiProperty({
    description: 'Código do fornecedor',
    example: 'FORN001',
    required: false,
  })
  codigoFornecedor?: string;

  @ApiProperty({
    description: 'ID do fornecedor',
    example: 1,
  })
  fornecedorId: number;

  @ApiProperty({
    description: 'Data de emissão da compra',
    example: '2024-01-15',
  })
  dataEmissao: Date;

  @ApiProperty({
    description: 'Data de chegada prevista',
    example: '2024-02-15',
  })
  dataChegada: Date;

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
    description: 'Tipo de frete',
    example: 'CIF',
    enum: ['CIF', 'FOB'],
  })
  tipoFrete: string;

  @ApiProperty({
    description: 'Valor do frete',
    example: 50.00,
  })
  valorFrete: number;

  @ApiProperty({
    description: 'Valor do seguro',
    example: 25.00,
  })
  valorSeguro: number;

  @ApiProperty({
    description: 'Outras despesas',
    example: 15.00,
  })
  outrasDespesas: number;

  @ApiProperty({
    description: 'Total dos produtos',
    example: 1400.00,
  })
  totalProdutos: number;

  @ApiProperty({
    description: 'Valor de desconto aplicado',
    example: 50.00,
  })
  valorDesconto: number;

  @ApiProperty({
    description: 'Total a pagar',
    example: 1440.00,
  })
  totalAPagar: number;

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
