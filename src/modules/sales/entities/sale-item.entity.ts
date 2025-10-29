import { ApiProperty } from '@nestjs/swagger';
import { BaseEntity } from '../../../common/entities/base.entity';

export class SaleItem extends BaseEntity {
  @ApiProperty({
    description: 'ID da venda',
    example: 1,
  })
  vendaId: number;

  @ApiProperty({
    description: 'Código do produto',
    example: 'PROD001',
  })
  codigo: string;

  @ApiProperty({
    description: 'ID do produto',
    example: 1,
  })
  produtoId: number;

  @ApiProperty({
    description: 'Nome do produto',
    example: 'Notebook Dell',
  })
  produto: string;

  @ApiProperty({
    description: 'Unidade de medida',
    example: 'UN',
  })
  unidade: string;

  @ApiProperty({
    description: 'Quantidade',
    example: 10,
  })
  quantidade: number;

  @ApiProperty({
    description: 'Preço unitário',
    example: 2500.00,
  })
  precoUN: number;

  @ApiProperty({
    description: 'Desconto unitário',
    example: 100.00,
  })
  descUN: number;

  @ApiProperty({
    description: 'Valor líquido unitário',
    example: 2400.00,
  })
  liquidoUN: number;

  @ApiProperty({
    description: 'Total do item',
    example: 24000.00,
  })
  total: number;

  @ApiProperty({
    description: 'Rateio',
    example: 50.00,
  })
  rateio: number;

  @ApiProperty({
    description: 'Custo final unitário',
    example: 2405.00,
  })
  custoFinalUN: number;

  @ApiProperty({
    description: 'Custo final total',
    example: 24050.00,
  })
  custoFinal: number;

  @ApiProperty({
    description: 'Valor unitário (compatibilidade NFe)',
    example: 2500.00,
    required: false,
  })
  valorUnitario?: number;

  @ApiProperty({
    description: 'Valor desconto (compatibilidade NFe)',
    example: 1000.00,
    required: false,
  })
  valorDesconto?: number;

  @ApiProperty({
    description: 'Valor total (compatibilidade NFe)',
    example: 24000.00,
    required: false,
  })
  valorTotal?: number;

  @ApiProperty({
    description: 'Quantidade entregue',
    example: 0,
    default: 0,
  })
  quantidadeEntregue: number;

  @ApiProperty({
    description: 'Data de entrega do item',
    example: '2024-02-20',
    required: false,
  })
  dataEntregaItem?: Date;

  @ApiProperty({
    description: 'Observações sobre o item',
    example: 'Produto com garantia estendida',
    required: false,
  })
  observacoes?: string;
}
