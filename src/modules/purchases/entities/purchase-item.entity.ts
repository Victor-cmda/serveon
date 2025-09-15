import { ApiProperty } from '@nestjs/swagger';
import { BaseEntity } from '../../../common/entities/base.entity';

export class PurchaseItem extends BaseEntity {
  @ApiProperty({
    description: 'ID da compra',
    example: 1,
  })
  compraId: number;

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
    example: 'Caneta BIC Azul',
  })
  produto: string;

  @ApiProperty({
    description: 'Unidade de medida',
    example: 'UN',
  })
  unidade: string;

  @ApiProperty({
    description: 'Quantidade',
    example: 100,
  })
  quantidade: number;

  @ApiProperty({
    description: 'Preço unitário',
    example: 1.5,
  })
  precoUN: number;

  @ApiProperty({
    description: 'Desconto unitário',
    example: 0.1,
  })
  descUN: number;

  @ApiProperty({
    description: 'Valor líquido unitário',
    example: 1.4,
  })
  liquidoUN: number;

  @ApiProperty({
    description: 'Total do item',
    example: 140,
  })
  total: number;

  @ApiProperty({
    description: 'Rateio',
    example: 5,
  })
  rateio: number;

  @ApiProperty({
    description: 'Custo final unitário',
    example: 1.45,
  })
  custoFinalUN: number;

  @ApiProperty({
    description: 'Custo final total',
    example: 145,
  })
  custoFinal: number;
}