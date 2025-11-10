import { ApiProperty } from '@nestjs/swagger';
import { 
  IsNotEmpty, 
  IsOptional, 
  IsNumber, 
  IsEnum,
  IsDate,
  IsString,
  MaxLength,
  Min 
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateAccountPayableDto {
  @ApiProperty({
    description: 'Número do pedido de compra',
    example: 'PC-0001',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'Número do pedido deve ser uma string' })
  @MaxLength(20, { message: 'Número do pedido deve ter no máximo 20 caracteres' })
  compraNumeroPedido?: string;

  @ApiProperty({
    description: 'Modelo da nota fiscal',
    example: '55',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'Modelo deve ser uma string' })
  @MaxLength(10, { message: 'Modelo deve ter no máximo 10 caracteres' })
  compraModelo?: string;

  @ApiProperty({
    description: 'Série da nota fiscal',
    example: '001',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'Série deve ser uma string' })
  @MaxLength(10, { message: 'Série deve ter no máximo 10 caracteres' })
  compraSerie?: string;

  @ApiProperty({
    description: 'ID do fornecedor na compra',
    example: 1,
    required: false,
  })
  @IsOptional()
  @IsNumber({}, { message: 'ID do fornecedor na compra deve ser um número' })
  compraFornecedorId?: number;

  @ApiProperty({
    description: 'Número da parcela da compra',
    example: 1,
    required: false,
  })
  @IsOptional()
  @IsNumber({}, { message: 'Número da parcela deve ser um número' })
  @Min(1, { message: 'Número da parcela deve ser maior ou igual a 1' })
  parcela?: number;

  @ApiProperty({
    description: 'ID do fornecedor',
    example: 1,
  })
  @IsNotEmpty({ message: 'ID do fornecedor é obrigatório' })
  @IsNumber({}, { message: 'ID do fornecedor deve ser um número' })
  fornecedorId: number;

  @ApiProperty({
    description: 'Número do documento',
    example: 'FAT-001',
  })
  @IsNotEmpty({ message: 'Número do documento é obrigatório' })
  @IsString({ message: 'Número do documento deve ser uma string' })
  @MaxLength(50, { message: 'Número do documento deve ter no máximo 50 caracteres' })
  numeroDocumento: string;

  @ApiProperty({
    description: 'Tipo do documento',
    example: 'FATURA',
    enum: ['FATURA', 'DUPLICATA', 'BOLETO', 'NOTA_FISCAL'],
    default: 'FATURA',
  })
  @IsOptional()
  @IsEnum(['FATURA', 'DUPLICATA', 'BOLETO', 'NOTA_FISCAL'], {
    message: 'Tipo de documento deve ser FATURA, DUPLICATA, BOLETO ou NOTA_FISCAL'
  })
  tipoDocumento?: string;

  @ApiProperty({
    description: 'Data de emissão',
    example: '2024-01-15',
  })
  @IsNotEmpty({ message: 'Data de emissão é obrigatória' })
  @Type(() => Date)
  @IsDate({ message: 'Data de emissão deve ser uma data válida' })
  dataEmissao: Date;

  @ApiProperty({
    description: 'Data de vencimento',
    example: '2024-02-15',
  })
  @IsNotEmpty({ message: 'Data de vencimento é obrigatória' })
  @Type(() => Date)
  @IsDate({ message: 'Data de vencimento deve ser uma data válida' })
  dataVencimento: Date;

  @ApiProperty({
    description: 'Valor original',
    example: 1500.00,
  })
  @IsNotEmpty({ message: 'Valor original é obrigatório' })
  @IsNumber({ maxDecimalPlaces: 2 }, { message: 'Valor original deve ser um número com no máximo 2 casas decimais' })
  @Min(0.01, { message: 'Valor original deve ser maior que 0' })
  valorOriginal: number;

  @ApiProperty({
    description: 'Valor de desconto',
    example: 0.00,
    required: false,
  })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 }, { message: 'Valor de desconto deve ser um número com no máximo 2 casas decimais' })
  @Min(0, { message: 'Valor de desconto deve ser maior ou igual a 0' })
  valorDesconto?: number;

  @ApiProperty({
    description: 'Valor de juros',
    example: 0.00,
    required: false,
  })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 }, { message: 'Valor de juros deve ser um número com no máximo 2 casas decimais' })
  @Min(0, { message: 'Valor de juros deve ser maior ou igual a 0' })
  valorJuros?: number;

  @ApiProperty({
    description: 'Valor de multa',
    example: 0.00,
    required: false,
  })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 }, { message: 'Valor de multa deve ser um número com no máximo 2 casas decimais' })
  @Min(0, { message: 'Valor de multa deve ser maior ou igual a 0' })
  valorMulta?: number;

  @ApiProperty({
    description: 'ID da forma de pagamento',
    example: 1,
    required: false,
  })
  @IsOptional()
  @IsNumber({}, { message: 'ID da forma de pagamento deve ser um número' })
  formaPagamentoId?: number;

  @ApiProperty({
    description: 'Observações',
    example: 'Conta referente à compra de materiais',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'Observações devem ser uma string' })
  @MaxLength(500, { message: 'Observações devem ter no máximo 500 caracteres' })
  observacoes?: string;
}
