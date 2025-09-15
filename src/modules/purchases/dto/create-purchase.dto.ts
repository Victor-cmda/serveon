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

export class CreatePurchaseItemDto {
  @ApiProperty({
    description: 'Código do produto',
    example: 'PROD001',
  })
  @IsNotEmpty({ message: 'Código do produto é obrigatório' })
  @IsString({ message: 'Código do produto deve ser uma string' })
  codigo: string;

  @ApiProperty({
    description: 'ID do produto',
    example: 1,
  })
  @IsNotEmpty({ message: 'ID do produto é obrigatório' })
  @IsNumber({}, { message: 'ID do produto deve ser um número' })
  produtoId: number;

  @ApiProperty({
    description: 'Nome do produto',
    example: 'Caneta BIC Azul',
  })
  @IsNotEmpty({ message: 'Nome do produto é obrigatório' })
  @IsString({ message: 'Nome do produto deve ser uma string' })
  produto: string;

  @ApiProperty({
    description: 'Unidade de medida',
    example: 'UN',
  })
  @IsNotEmpty({ message: 'Unidade é obrigatória' })
  @IsString({ message: 'Unidade deve ser uma string' })
  unidade: string;

  @ApiProperty({
    description: 'Quantidade',
    example: 100,
  })
  @IsNotEmpty({ message: 'Quantidade é obrigatória' })
  @IsNumber(
    { maxDecimalPlaces: 3 },
    { message: 'Quantidade deve ser um número' },
  )
  @Min(0.001, { message: 'Quantidade deve ser maior que 0' })
  quantidade: number;

  @ApiProperty({
    description: 'Preço unitário',
    example: 1.5,
  })
  @IsNotEmpty({ message: 'Preço unitário é obrigatório' })
  @IsNumber(
    { maxDecimalPlaces: 4 },
    { message: 'Preço unitário deve ser um número' },
  )
  @Min(0, { message: 'Preço unitário deve ser maior ou igual a 0' })
  precoUN: number;

  @ApiProperty({
    description: 'Desconto unitário',
    example: 0.1,
    default: 0,
  })
  @IsOptional()
  @IsNumber(
    { maxDecimalPlaces: 4 },
    { message: 'Desconto unitário deve ser um número' },
  )
  @Min(0, { message: 'Desconto unitário deve ser maior ou igual a 0' })
  descUN?: number;

  @ApiProperty({
    description: 'Rateio',
    example: 5,
    default: 0,
  })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 }, { message: 'Rateio deve ser um número' })
  @Min(0, { message: 'Rateio deve ser maior ou igual a 0' })
  rateio?: number;
}

export class CreatePurchaseInstallmentDto {
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
  })
  @IsNotEmpty({ message: 'Código da forma de pagamento é obrigatório' })
  @IsString({ message: 'Código da forma de pagamento deve ser uma string' })
  codigoFormaPagto: string;

  @ApiProperty({
    description: 'ID da forma de pagamento',
    example: 1,
  })
  @IsNotEmpty({ message: 'ID da forma de pagamento é obrigatório' })
  @IsNumber({}, { message: 'ID da forma de pagamento deve ser um número' })
  formaPagamentoId: number;

  @ApiProperty({
    description: 'Nome da forma de pagamento',
    example: 'Dinheiro',
  })
  @IsNotEmpty({ message: 'Nome da forma de pagamento é obrigatório' })
  @IsString({ message: 'Nome da forma de pagamento deve ser uma string' })
  formaPagamento: string;

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

export class CreatePurchaseDto {
  @ApiProperty({
    description: 'Modelo da nota fiscal',
    example: '55',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'Modelo deve ser uma string' })
  modelo?: string;

  @ApiProperty({
    description: 'Série da nota fiscal',
    example: '1',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'Série deve ser uma string' })
  serie?: string;

  @ApiProperty({
    description: 'Código do fornecedor',
    example: 'FORN001',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'Código do fornecedor deve ser uma string' })
  codigoFornecedor?: string;

  @ApiProperty({
    description: 'ID do fornecedor',
    example: 1,
  })
  @IsNotEmpty({ message: 'ID do fornecedor é obrigatório' })
  @IsNumber({}, { message: 'ID do fornecedor deve ser um número' })
  fornecedorId: number;

  @ApiProperty({
    description: 'Data de emissão da compra',
    example: '2024-01-15',
  })
  @IsNotEmpty({ message: 'Data de emissão é obrigatória' })
  @Type(() => Date)
  @IsDate({ message: 'Data de emissão deve ser uma data válida' })
  dataEmissao: Date;

  @ApiProperty({
    description: 'Data de chegada prevista',
    example: '2024-02-15',
  })
  @IsNotEmpty({ message: 'Data de chegada é obrigatória' })
  @Type(() => Date)
  @IsDate({ message: 'Data de chegada deve ser uma data válida' })
  dataChegada: Date;

  @ApiProperty({
    description: 'ID da condição de pagamento',
    example: 1,
  })
  @IsNotEmpty({ message: 'ID da condição de pagamento é obrigatório' })
  @IsNumber({}, { message: 'ID da condição de pagamento deve ser um número' })
  condicaoPagamentoId: number;

  @ApiProperty({
    description: 'ID do funcionário responsável pela compra',
    example: 1,
  })
  @IsNotEmpty({ message: 'ID do funcionário é obrigatório' })
  @IsNumber({}, { message: 'ID do funcionário deve ser um número' })
  funcionarioId: number;

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
    { message: 'Outras despesas deve ser um número' },
  )
  @Min(0, { message: 'Outras despesas deve ser maior ou igual a 0' })
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
    description: 'Status da compra',
    example: 'PENDENTE',
    enum: ['PENDENTE', 'CONFIRMADA', 'CANCELADA', 'ENTREGUE'],
    default: 'PENDENTE',
  })
  @IsOptional()
  @IsEnum(['PENDENTE', 'CONFIRMADA', 'CANCELADA', 'ENTREGUE'], {
    message: 'Status deve ser PENDENTE, CONFIRMADA, CANCELADA ou ENTREGUE',
  })
  status?: string;

  @ApiProperty({
    description: 'ID da transportadora',
    example: 1,
    required: false,
  })
  @IsOptional()
  @IsNumber({}, { message: 'ID da transportadora deve ser um número' })
  transportadoraId?: number;

  @ApiProperty({
    description: 'Observações sobre a compra',
    example: 'Compra de materiais de escritório',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'Observações devem ser uma string' })
  @MaxLength(500, { message: 'Observações devem ter no máximo 500 caracteres' })
  observacoes?: string;

  @ApiProperty({
    description: 'Itens da compra',
    type: [CreatePurchaseItemDto],
    required: false,
  })
  @IsOptional()
  @IsArray({ message: 'Itens deve ser um array' })
  @ValidateNested({ each: true })
  @Type(() => CreatePurchaseItemDto)
  itens?: CreatePurchaseItemDto[];

  @ApiProperty({
    description: 'Parcelas da compra',
    type: [CreatePurchaseInstallmentDto],
    required: false,
  })
  @IsOptional()
  @IsArray({ message: 'Parcelas deve ser um array' })
  @ValidateNested({ each: true })
  @Type(() => CreatePurchaseInstallmentDto)
  parcelas?: CreatePurchaseInstallmentDto[];
}
