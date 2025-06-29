import { ApiProperty } from '@nestjs/swagger';
import { BaseEntity } from '../../../common/entities/base.entity';

export class Product extends BaseEntity {
  @ApiProperty({
    description: 'Nome/descrição do produto',
    example: 'Notebook Dell Inspiron 15',
  })
  produto: string;

  @ApiProperty({
    description: 'ID da unidade de medida',
    example: 1,
    required: false,
  })
  unidadeMedidaId?: number;

  @ApiProperty({
    description: 'Nome da unidade de medida',
    example: 'UN',
    required: false,
  })
  unidadeMedidaNome?: string;

  @ApiProperty({
    description: 'Código de barras do produto',
    example: '7891234567890',
    required: false,
  })
  codigoBarras?: string;

  @ApiProperty({
    description: 'Referência do produto',
    example: 'NB001',
    required: false,
  })
  referencia?: string;

  @ApiProperty({
    description: 'ID da marca',
    example: 1,
    required: false,
  })
  marcaId?: number;

  @ApiProperty({
    description: 'Nome da marca',
    example: 'Dell',
    required: false,
  })
  marcaNome?: string;

  @ApiProperty({
    description: 'ID da categoria',
    example: 1,
    required: false,
  })
  categoriaId?: number;

  @ApiProperty({
    description: 'Nome da categoria',
    example: 'Informática',
    required: false,
  })
  categoriaNome?: string;

  @ApiProperty({
    description: 'Quantidade mínima em estoque',
    example: 5,
    default: 0,
  })
  quantidadeMinima: number;

  @ApiProperty({
    description: 'Valor de compra do produto',
    example: 1500.0,
    required: false,
  })
  valorCompra?: number;

  @ApiProperty({
    description: 'Valor de venda do produto',
    example: 2100.0,
    required: false,
  })
  valorVenda?: number;

  @ApiProperty({
    description: 'Quantidade atual em estoque',
    example: 10,
    default: 0,
  })
  quantidade: number;

  @ApiProperty({
    description: 'Percentual de lucro sobre o produto',
    example: 40.0,
    required: false,
  })
  percentualLucro?: number;

  @ApiProperty({
    description: 'Descrição detalhada do produto',
    example: 'Notebook Dell Inspiron 15 com processador Intel i5',
    required: false,
  })
  descricao?: string;

  @ApiProperty({
    description: 'Observações sobre o produto',
    example: 'Produto em promoção até 31/12',
    required: false,
  })
  observacoes?: string;

  @ApiProperty({
    description: 'Data de situação do produto',
    example: '2025-06-19',
    required: false,
  })
  situacao?: string;

  @ApiProperty({
    description: 'Data de criação do produto',
    example: '2025-06-19',
  })
  dataCriacao: string;

  @ApiProperty({
    description: 'Data da última alteração',
    example: '2025-06-19',
  })
  dataAlteracao: string;

  @ApiProperty({
    description: 'Usuário que criou o produto',
    example: 'admin',
    required: false,
  })
  usuarioCriacao?: string;

  @ApiProperty({
    description: 'Usuário que atualizou o produto',
    example: 'admin',
    required: false,
  })
  usuarioAtualizacao?: string;

  // Campos para compatibilidade com NFe
  @ApiProperty({
    description: 'Código do produto para NFe',
    example: 'PROD001',
    required: false,
  })
  codigo?: string;

  @ApiProperty({
    description: 'NCM do produto',
    example: '8471.30.12',
    required: false,
  })
  ncm?: string;

  @ApiProperty({
    description: 'CEST do produto',
    example: '01.001.00',
    required: false,
  })
  cest?: string;

  @ApiProperty({
    description: 'Unidade para NFe',
    example: 'UN',
    required: false,
  })
  unidade?: string;

  @ApiProperty({
    description: 'Valor unitário para NFe',
    example: 2100.0,
    required: false,
  })
  valorUnitario?: number;

  @ApiProperty({
    description: 'Peso líquido em kg',
    example: 2.5,
    required: false,
  })
  pesoLiquido?: number;

  @ApiProperty({
    description: 'Peso bruto em kg',
    example: 3.0,
    required: false,
  })
  pesoBruto?: number;

  @ApiProperty({
    description: 'GTIN/EAN do produto',
    example: '7891234567890',
    required: false,
  })
  gtin?: string;

  @ApiProperty({
    description: 'GTIN tributável',
    example: '7891234567890',
    required: false,
  })
  gtinTributavel?: string;
}
