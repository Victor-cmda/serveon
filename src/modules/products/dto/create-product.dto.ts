import {
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  IsDateString,
  IsDecimal,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateProductDto {
  @ApiProperty({
    description: 'Nome/descrição do produto',
    example: 'Notebook Dell Inspiron 15',
  })
  @IsNotEmpty({ message: 'Nome do produto é obrigatório' })
  @IsString({ message: 'Nome do produto deve ser uma string' })
  @MaxLength(255, {
    message: 'Nome do produto deve ter no máximo 255 caracteres',
  })
  produto: string;

  @ApiProperty({
    description: 'ID da unidade de medida',
    example: 1,
    required: false,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber(
    {},
    { message: 'ID da unidade de medida deve ser um número válido' },
  )
  unidadeMedidaId?: number;

  @ApiProperty({
    description: 'Código de barras do produto',
    example: '7891234567890',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'Código de barras deve ser uma string' })
  @MaxLength(255, {
    message: 'Código de barras deve ter no máximo 255 caracteres',
  })
  codigoBarras?: string;

  @ApiProperty({
    description: 'Referência do produto',
    example: 'NB001',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'Referência deve ser uma string' })
  @MaxLength(10, { message: 'Referência deve ter no máximo 10 caracteres' })
  referencia?: string;

  @ApiProperty({
    description: 'ID da marca',
    example: 1,
    required: false,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'ID da marca deve ser um número válido' })
  marcaId?: number;

  @ApiProperty({
    description: 'ID da categoria',
    example: 1,
    required: false,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'ID da categoria deve ser um número válido' })
  categoriaId?: number;

  @ApiProperty({
    description: 'Quantidade mínima em estoque',
    example: 5,
    default: 0,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'Quantidade mínima deve ser um número válido' })
  @Min(0, { message: 'Quantidade mínima deve ser maior ou igual a 0' })
  quantidadeMinima?: number = 0;

  @ApiProperty({
    description: 'Valor de compra do produto',
    example: 1500.0,
    required: false,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber(
    { maxDecimalPlaces: 2 },
    {
      message:
        'Valor de compra deve ser um número válido com até 2 casas decimais',
    },
  )
  @Min(0, { message: 'Valor de compra deve ser maior ou igual a 0' })
  valorCompra?: number;

  @ApiProperty({
    description: 'Valor de venda do produto',
    example: 2100.0,
    required: false,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber(
    { maxDecimalPlaces: 2 },
    {
      message:
        'Valor de venda deve ser um número válido com até 2 casas decimais',
    },
  )
  @Min(0, { message: 'Valor de venda deve ser maior ou igual a 0' })
  valorVenda?: number;

  @ApiProperty({
    description: 'Quantidade atual em estoque',
    example: 10,
    default: 0,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'Quantidade deve ser um número válido' })
  @Min(0, { message: 'Quantidade deve ser maior ou igual a 0' })
  quantidade?: number = 0;

  @ApiProperty({
    description: 'Percentual de lucro sobre o produto',
    example: 40.0,
    required: false,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber(
    { maxDecimalPlaces: 2 },
    {
      message:
        'Percentual de lucro deve ser um número válido com até 2 casas decimais',
    },
  )
  @Min(0, { message: 'Percentual de lucro deve ser maior ou igual a 0' })
  percentualLucro?: number;

  @ApiProperty({
    description: 'Descrição detalhada do produto',
    example: 'Notebook Dell Inspiron 15 com processador Intel i5',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'Descrição deve ser uma string' })
  @MaxLength(255, { message: 'Descrição deve ter no máximo 255 caracteres' })
  descricao?: string;

  @ApiProperty({
    description: 'Observações sobre o produto',
    example: 'Produto em promoção até 31/12',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'Observações devem ser uma string' })
  @MaxLength(255, { message: 'Observações devem ter no máximo 255 caracteres' })
  observacoes?: string;

  @ApiProperty({
    description: 'Data de situação do produto (formato YYYY-MM-DD)',
    example: '2025-06-19',
    required: false,
  })
  @IsOptional()
  @IsDateString(
    {},
    { message: 'Situação deve ser uma data válida no formato YYYY-MM-DD' },
  )
  situacao?: string;

  @ApiProperty({
    description: 'Usuário que está criando o produto',
    example: 'admin',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'Usuário de criação deve ser uma string' })
  usuarioCriacao?: string;

  // Campos para compatibilidade com NFe
  @ApiProperty({
    description: 'Código do produto para NFe',
    example: 'PROD001',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'Código deve ser uma string' })
  @MaxLength(30, { message: 'Código deve ter no máximo 30 caracteres' })
  codigo?: string;

  @ApiProperty({
    description: 'NCM do produto',
    example: '8471.30.12',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'NCM deve ser uma string' })
  @MaxLength(10, { message: 'NCM deve ter no máximo 10 caracteres' })
  ncm?: string;

  @ApiProperty({
    description: 'CEST do produto',
    example: '01.001.00',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'CEST deve ser uma string' })
  @MaxLength(10, { message: 'CEST deve ter no máximo 10 caracteres' })
  cest?: string;

  @ApiProperty({
    description: 'Unidade para NFe',
    example: 'UN',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'Unidade deve ser uma string' })
  @MaxLength(6, { message: 'Unidade deve ter no máximo 6 caracteres' })
  unidade?: string;

  @ApiProperty({
    description: 'Valor unitário para NFe',
    example: 2100.0,
    required: false,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber(
    { maxDecimalPlaces: 4 },
    {
      message:
        'Valor unitário deve ser um número válido com até 4 casas decimais',
    },
  )
  @Min(0, { message: 'Valor unitário deve ser maior ou igual a 0' })
  valorUnitario?: number;

  @ApiProperty({
    description: 'Peso líquido em kg',
    example: 2.5,
    required: false,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber(
    { maxDecimalPlaces: 3 },
    {
      message:
        'Peso líquido deve ser um número válido com até 3 casas decimais',
    },
  )
  @Min(0, { message: 'Peso líquido deve ser maior ou igual a 0' })
  pesoLiquido?: number;

  @ApiProperty({
    description: 'Peso bruto em kg',
    example: 3.0,
    required: false,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber(
    { maxDecimalPlaces: 3 },
    {
      message: 'Peso bruto deve ser um número válido com até 3 casas decimais',
    },
  )
  @Min(0, { message: 'Peso bruto deve ser maior ou igual a 0' })
  pesoBruto?: number;

  @ApiProperty({
    description: 'GTIN/EAN do produto',
    example: '7891234567890',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'GTIN deve ser uma string' })
  @MaxLength(14, { message: 'GTIN deve ter no máximo 14 caracteres' })
  gtin?: string;

  @ApiProperty({
    description: 'GTIN tributável',
    example: '7891234567890',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'GTIN tributável deve ser uma string' })
  @MaxLength(14, {
    message: 'GTIN tributável deve ter no máximo 14 caracteres',
  })
  gtinTributavel?: string;

  @ApiProperty({
    description: 'Status do produto (ativo/inativo)',
    example: true,
    default: true,
  })
  @IsOptional()
  @IsBoolean({ message: 'Status ativo deve ser um valor booleano' })
  ativo?: boolean = true;
}
