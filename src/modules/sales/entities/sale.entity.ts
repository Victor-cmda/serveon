import { ApiProperty } from '@nestjs/swagger';
import { BaseEntity } from '../../../common/entities/base.entity';

export class Sale extends BaseEntity {
  @ApiProperty({
    description: 'Número do pedido/venda',
    example: 'PV-0001',
  })
  numeroPedido: string;

  @ApiProperty({
    description: 'ID do cliente',
    example: 1,
  })
  clienteId: number;

  @ApiProperty({
    description: 'ID do vendedor (funcionário)',
    example: 1,
    required: false,
  })
  vendedorId?: number;

  @ApiProperty({
    description: 'Data do pedido',
    example: '2024-01-15',
  })
  dataPedido: Date;

  @ApiProperty({
    description: 'Data de entrega prevista',
    example: '2024-02-15',
    required: false,
  })
  dataEntregaPrevista?: Date;

  @ApiProperty({
    description: 'Data de entrega realizada',
    example: '2024-02-20',
    required: false,
  })
  dataEntregaRealizada?: Date;

  @ApiProperty({
    description: 'ID da condição de pagamento',
    example: 1,
  })
  condicaoPagamentoId: number;

  @ApiProperty({
    description: 'ID da forma de pagamento',
    example: 1,
    required: false,
  })
  formaPagamentoId?: number;

  @ApiProperty({
    description: 'Status da venda',
    example: 'PEDIDO',
    enum: ['ORCAMENTO', 'PEDIDO', 'PRODUCAO', 'FATURADO', 'ENTREGUE', 'CANCELADO'],
  })
  status: string;

  @ApiProperty({
    description: 'Tipo de venda',
    example: 'VENDA',
    enum: ['VENDA', 'ORCAMENTO', 'CONSIGNACAO', 'BONIFICACAO'],
  })
  tipoVenda: string;

  @ApiProperty({
    description: 'Tipo de frete',
    example: 'CIF',
    enum: ['CIF', 'FOB', 'SEM_FRETE'],
  })
  tipoFrete: string;

  @ApiProperty({
    description: 'ID da transportadora',
    example: 1,
    required: false,
  })
  transportadoraId?: number;

  @ApiProperty({
    description: 'Endereço de entrega',
    example: 'Rua Exemplo, 123',
    required: false,
  })
  enderecoEntrega?: string;

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
    description: 'Valor de desconto aplicado',
    example: 100.00,
  })
  valorDesconto: number;

  @ApiProperty({
    description: 'Percentual de desconto',
    example: 5.00,
  })
  percentualDesconto: number;

  @ApiProperty({
    description: 'Valor de acréscimo',
    example: 10.00,
  })
  valorAcrescimo: number;

  @ApiProperty({
    description: 'Valor dos produtos',
    example: 2000.00,
  })
  valorProdutos: number;

  @ApiProperty({
    description: 'Valor total da venda',
    example: 2500.00,
  })
  valorTotal: number;

  @ApiProperty({
    description: 'Observações sobre a venda',
    example: 'Venda de produtos eletrônicos',
    required: false,
  })
  observacoes?: string;

  @ApiProperty({
    description: 'ID do funcionário que aprovou',
    example: 1,
    required: false,
  })
  aprovadoPor?: number;

  @ApiProperty({
    description: 'Data e hora da aprovação',
    example: '2024-01-15T10:30:00Z',
    required: false,
  })
  dataAprovacao?: Date;

  @ApiProperty({
    description: 'ID da NFe gerada para esta venda',
    example: 1,
    required: false,
  })
  nfeId?: number;
}
