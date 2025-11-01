import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsOptional,
  IsNumber,
  IsEnum,
  IsDate,
  IsString,
  MaxLength,
  Min,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateSaleItemDto {
  @ApiProperty({
    description: 'ID do produto',
    example: 1,
  })
  @IsNotEmpty({ message: 'ID do produto é obrigatório' })
  @IsNumber({}, { message: 'ID do produto deve ser um número' })
  produtoId: number;

  @ApiProperty({
    description: 'Quantidade do produto',
    example: 10,
  })
  @IsNotEmpty({ message: 'Quantidade é obrigatória' })
  @IsNumber(
    { maxDecimalPlaces: 4 },
    { message: 'Quantidade deve ser um número' },
  )
  @Min(0.0001, { message: 'Quantidade deve ser maior que 0' })
  quantidade: number;

  @ApiProperty({
    description: 'Preço unitário do produto',
    example: 100.5,
  })
  @IsNotEmpty({ message: 'Preço unitário é obrigatório' })
  @IsNumber(
    { maxDecimalPlaces: 4 },
    { message: 'Preço unitário deve ser um número' },
  )
  @Min(0, { message: 'Preço unitário deve ser maior ou igual a 0' })
  precoUn: number;

  @ApiProperty({
    description: 'Desconto unitário aplicado ao produto',
    example: 5,
    default: 0,
  })
  @IsOptional()
  @IsNumber(
    { maxDecimalPlaces: 4 },
    { message: 'Desconto unitário deve ser um número' },
  )
  @Min(0, { message: 'Desconto unitário deve ser maior ou igual a 0' })
  descUn?: number;

  @ApiProperty({
    description: 'Valor líquido unitário (preço - desconto)',
    example: 95.5,
    required: false,
  })
  @IsOptional()
  @IsNumber(
    { maxDecimalPlaces: 4 },
    { message: 'Valor líquido unitário deve ser um número' },
  )
  @Min(0, { message: 'Valor líquido unitário deve ser maior ou igual a 0' })
  liquidoUn?: number;

  @ApiProperty({
    description: 'Valor total do item (quantidade * líquido unitário)',
    example: 955,
    required: false,
  })
  @IsOptional()
  @IsNumber(
    { maxDecimalPlaces: 2 },
    { message: 'Valor total deve ser um número' },
  )
  @Min(0, { message: 'Valor total deve ser maior ou igual a 0' })
  total?: number;

  @ApiProperty({
    description: 'Valor de rateio de despesas',
    example: 10,
    default: 0,
  })
  @IsOptional()
  @IsNumber(
    { maxDecimalPlaces: 2 },
    { message: 'Valor de rateio deve ser um número' },
  )
  @Min(0, { message: 'Valor de rateio deve ser maior ou igual a 0' })
  rateio?: number;

  @ApiProperty({
    description: 'Custo final unitário (líquido + rateio / quantidade)',
    example: 96.5,
    required: false,
  })
  @IsOptional()
  @IsNumber(
    { maxDecimalPlaces: 4 },
    { message: 'Custo final unitário deve ser um número' },
  )
  @Min(0, { message: 'Custo final unitário deve ser maior ou igual a 0' })
  custoFinalUn?: number;

  @ApiProperty({
    description: 'Custo final total (custo final unitário * quantidade)',
    example: 965,
    required: false,
  })
  @IsOptional()
  @IsNumber(
    { maxDecimalPlaces: 2 },
    { message: 'Custo final deve ser um número' },
  )
  @Min(0, { message: 'Custo final deve ser maior ou igual a 0' })
  custoFinal?: number;

  @ApiProperty({
    description: 'Quantidade entregue do item',
    example: 0,
    default: 0,
    required: false,
  })
  @IsOptional()
  @IsNumber(
    { maxDecimalPlaces: 3 },
    { message: 'Quantidade entregue deve ser um número' },
  )
  @Min(0, { message: 'Quantidade entregue deve ser maior ou igual a 0' })
  quantidadeEntregue?: number;

  @ApiProperty({
    description: 'Data de entrega do item',
    example: '2024-02-20',
    required: false,
  })
  @IsOptional()
  @Type(() => Date)
  @IsDate({ message: 'Data de entrega do item deve ser uma data válida' })
  dataEntregaItem?: Date;

  @ApiProperty({
    description: 'Observações sobre o item',
    example: 'Produto com garantia estendida',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'Observações devem ser uma string' })
  observacoes?: string;
}

export class CreateSaleInstallmentDto {
  @ApiProperty({
    description: 'Número da parcela',
    example: 1,
  })
  @IsNotEmpty({ message: 'Número da parcela é obrigatório' })
  @IsNumber({}, { message: 'Número da parcela deve ser um número' })
  @Min(1, { message: 'Número da parcela deve ser maior que 0' })
  parcela: number;

  @ApiProperty({
    description: 'Código da forma de pagamento',
    example: 'DIN',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'Código da forma de pagamento deve ser uma string' })
  @MaxLength(20, { message: 'Código da forma de pagamento deve ter no máximo 20 caracteres' })
  codigoFormaPagto?: string;

  @ApiProperty({
    description: 'ID da forma de pagamento',
    example: 1,
  })
  @IsNotEmpty({ message: 'ID da forma de pagamento é obrigatório' })
  @IsNumber({}, { message: 'ID da forma de pagamento deve ser um número' })
  formaPagamentoId: number;

  @ApiProperty({
    description: 'Data de vencimento da parcela',
    example: '2024-02-15',
  })
  @IsNotEmpty({ message: 'Data de vencimento é obrigatória' })
  @Type(() => Date)
  @IsDate({ message: 'Data de vencimento deve ser uma data válida' })
  dataVencimento: Date;

  @ApiProperty({
    description: 'Valor da parcela',
    example: 720,
  })
  @IsNotEmpty({ message: 'Valor da parcela é obrigatório' })
  @IsNumber(
    { maxDecimalPlaces: 2 },
    { message: 'Valor da parcela deve ser um número' },
  )
  @Min(0.01, { message: 'Valor da parcela deve ser maior que 0' })
  valorParcela: number;
}

export class CreateSaleDto {
  @ApiProperty({
    description: 'Número do pedido/nota fiscal',
    example: '1',
  })
  @IsNotEmpty({ message: 'Número do pedido é obrigatório' })
  @IsString({ message: 'Número do pedido deve ser uma string' })
  @MaxLength(20, { message: 'Número do pedido deve ter no máximo 20 caracteres' })
  numeroPedido: string;

  @ApiProperty({
    description: 'Modelo da nota fiscal',
    example: '55',
  })
  @IsNotEmpty({ message: 'Modelo é obrigatório' })
  @IsString({ message: 'Modelo deve ser uma string' })
  @MaxLength(10, { message: 'Modelo deve ter no máximo 10 caracteres' })
  modelo: string;

  @ApiProperty({
    description: 'Série da nota fiscal',
    example: '1',
  })
  @IsNotEmpty({ message: 'Série é obrigatória' })
  @IsString({ message: 'Série deve ser uma string' })
  @MaxLength(10, { message: 'Série deve ter no máximo 10 caracteres' })
  serie: string;

  @ApiProperty({
    description: 'ID do cliente',
    example: 1,
  })
  @IsNotEmpty({ message: 'ID do cliente é obrigatório' })
  @IsNumber({}, { message: 'ID do cliente deve ser um número' })
  clienteId: number;

  @ApiProperty({
    description: 'Número da nota fiscal',
    example: '12345',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'Número da nota deve ser uma string' })
  @MaxLength(50, { message: 'Número da nota deve ter no máximo 50 caracteres' })
  numeroNota?: string;

  @ApiProperty({
    description: 'Data de emissão da venda',
    example: '2024-01-15',
  })
  @IsNotEmpty({ message: 'Data de emissão é obrigatória' })
  @Type(() => Date)
  @IsDate({ message: 'Data de emissão deve ser uma data válida' })
  dataEmissao: Date;

  @ApiProperty({
    description: 'Data de entrega prevista',
    example: '2024-02-15',
    required: false,
  })
  @IsOptional()
  @Type(() => Date)
  @IsDate({ message: 'Data de entrega deve ser uma data válida' })
  dataEntrega?: Date;

  @ApiProperty({
    description: 'Data de entrega realizada',
    example: '2024-02-15',
    required: false,
  })
  @IsOptional()
  @Type(() => Date)
  @IsDate({ message: 'Data de entrega realizada deve ser uma data válida' })
  dataEntregaRealizada?: Date;

  @ApiProperty({
    description: 'ID da condição de pagamento',
    example: 1,
  })
  @IsNotEmpty({ message: 'ID da condição de pagamento é obrigatório' })
  @IsNumber({}, { message: 'ID da condição de pagamento deve ser um número' })
  condicaoPagamentoId: number;

  @ApiProperty({
    description: 'ID da forma de pagamento',
    example: 1,
    required: false,
  })
  @IsOptional()
  @IsNumber({}, { message: 'ID da forma de pagamento deve ser um número' })
  formaPagamentoId?: number;

  @ApiProperty({
    description: 'ID do funcionário responsável pela venda',
    example: 1,
    required: false,
  })
  @IsOptional()
  @IsNumber({}, { message: 'ID do funcionário deve ser um número' })
  funcionarioId?: number;

  @ApiProperty({
    description: 'Status da venda',
    example: 'PENDENTE',
    enum: ['PENDENTE', 'APROVADO', 'ENVIADO', 'ENTREGUE', 'CANCELADO'],
    default: 'PENDENTE',
  })
  @IsOptional()
  @IsEnum(['PENDENTE', 'APROVADO', 'ENVIADO', 'ENTREGUE', 'CANCELADO'], {
    message: 'Status deve ser PENDENTE, APROVADO, ENVIADO, ENTREGUE ou CANCELADO',
  })
  status?: string;

  @ApiProperty({
    description: 'Tipo de frete',
    example: 'CIF',
    enum: ['CIF', 'FOB'],
    default: 'CIF',
  })
  @IsOptional()
  @IsEnum(['CIF', 'FOB'], { message: 'Tipo de frete deve ser CIF ou FOB' })
  tipoFrete?: string;

  @ApiProperty({
    description: 'ID da transportadora',
    example: 1,
    required: false,
  })
  @IsOptional()
  @IsNumber({}, { message: 'ID da transportadora deve ser um número' })
  transportadoraId?: number;

  @ApiProperty({
    description: 'Valor do frete',
    example: 50,
    default: 0,
  })
  @IsOptional()
  @IsNumber(
    { maxDecimalPlaces: 2 },
    { message: 'Valor do frete deve ser um número' },
  )
  @Min(0, { message: 'Valor do frete deve ser maior ou igual a 0' })
  valorFrete?: number;

  @ApiProperty({
    description: 'Valor do seguro',
    example: 25,
    default: 0,
  })
  @IsOptional()
  @IsNumber(
    { maxDecimalPlaces: 2 },
    { message: 'Valor do seguro deve ser um número' },
  )
  @Min(0, { message: 'Valor do seguro deve ser maior ou igual a 0' })
  valorSeguro?: number;

  @ApiProperty({
    description: 'Outras despesas',
    example: 15,
    default: 0,
  })
  @IsOptional()
  @IsNumber(
    { maxDecimalPlaces: 2 },
    { message: 'Outras despesas devem ser um número' },
  )
  @Min(0, { message: 'Outras despesas devem ser maior ou igual a 0' })
  outrasDespesas?: number;

  @ApiProperty({
    description: 'Valor de desconto aplicado',
    example: 50,
    default: 0,
  })
  @IsOptional()
  @IsNumber(
    { maxDecimalPlaces: 2 },
    { message: 'Valor de desconto deve ser um número' },
  )
  @Min(0, { message: 'Valor de desconto deve ser maior ou igual a 0' })
  valorDesconto?: number;

  @ApiProperty({
    description: 'Valor de acréscimo aplicado',
    example: 10,
    default: 0,
  })
  @IsOptional()
  @IsNumber(
    { maxDecimalPlaces: 2 },
    { message: 'Valor de acréscimo deve ser um número' },
  )
  @Min(0, { message: 'Valor de acréscimo deve ser maior ou igual a 0' })
  valorAcrescimo?: number;

  @ApiProperty({
    description: 'Observações sobre a venda',
    example: 'Venda de produtos eletrônicos',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'Observações devem ser uma string' })
  observacoes?: string;

  @ApiProperty({
    description: 'ID do funcionário que aprovou a venda',
    example: 1,
    required: false,
  })
  @IsOptional()
  @IsNumber({}, { message: 'ID do aprovador deve ser um número' })
  aprovadoPor?: number;

  @ApiProperty({
    description: 'Data de aprovação da venda',
    example: '2024-01-16',
    required: false,
  })
  @IsOptional()
  @Type(() => Date)
  @IsDate({ message: 'Data de aprovação deve ser uma data válida' })
  dataAprovacao?: Date;

  @ApiProperty({
    description: 'Itens da venda',
    type: [CreateSaleItemDto],
    required: false,
  })
  @IsOptional()
  @IsArray({ message: 'Itens deve ser um array' })
  @ValidateNested({ each: true })
  @Type(() => CreateSaleItemDto)
  itens?: CreateSaleItemDto[];

  @ApiProperty({
    description: 'Parcelas da venda',
    type: [CreateSaleInstallmentDto],
    required: false,
  })
  @IsOptional()
  @IsArray({ message: 'Parcelas deve ser um array' })
  @ValidateNested({ each: true })
  @Type(() => CreateSaleInstallmentDto)
  parcelas?: CreateSaleInstallmentDto[];
}
