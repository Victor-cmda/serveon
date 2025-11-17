import { ApiProperty } from '@nestjs/swagger';
import { 
  IsOptional, 
  IsNumber, 
  IsEnum,
  IsDate,
  IsString,
  MaxLength,
  Min 
} from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateAccountReceivableDto {
  @ApiProperty({
    description: 'Número do documento',
    example: 'FAT-001',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'Número do documento deve ser uma string' })
  @MaxLength(50, { message: 'Número do documento deve ter no máximo 50 caracteres' })
  numeroDocumento?: string;

  @ApiProperty({
    description: 'Tipo do documento',
    example: 'FATURA',
    enum: ['FATURA', 'DUPLICATA', 'BOLETO', 'NOTA_FISCAL'],
    required: false,
  })
  @IsOptional()
  @IsEnum(['FATURA', 'DUPLICATA', 'BOLETO', 'NOTA_FISCAL'], {
    message: 'Tipo de documento deve ser FATURA, DUPLICATA, BOLETO ou NOTA_FISCAL'
  })
  tipoDocumento?: string;

  @ApiProperty({
    description: 'Data de emissão',
    example: '2024-01-15',
    required: false,
  })
  @IsOptional()
  @Type(() => Date)
  @IsDate({ message: 'Data de emissão deve ser uma data válida' })
  dataEmissao?: Date;

  @ApiProperty({
    description: 'Data de vencimento',
    example: '2024-02-15',
    required: false,
  })
  @IsOptional()
  @Type(() => Date)
  @IsDate({ message: 'Data de vencimento deve ser uma data válida' })
  dataVencimento?: Date;

  @ApiProperty({
    description: 'Data de recebimento',
    example: '2024-02-10',
    required: false,
  })
  @IsOptional()
  @Type(() => Date)
  @IsDate({ message: 'Data de recebimento deve ser uma data válida' })
  dataRecebimento?: Date;

  @ApiProperty({
    description: 'Valor original',
    example: 1500.00,
    required: false,
  })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 }, { message: 'Valor original deve ser um número com no máximo 2 casas decimais' })
  @Min(0, { message: 'Valor original deve ser maior ou igual a 0' })
  valorOriginal?: number;

  @ApiProperty({
    description: 'Valor de desconto',
    example: 50.00,
    required: false,
  })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 }, { message: 'Valor de desconto deve ser um número com no máximo 2 casas decimais' })
  @Min(0, { message: 'Valor de desconto deve ser maior ou igual a 0' })
  valorDesconto?: number;

  @ApiProperty({
    description: 'Valor de juros',
    example: 25.00,
    required: false,
  })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 }, { message: 'Valor de juros deve ser um número com no máximo 2 casas decimais' })
  @Min(0, { message: 'Valor de juros deve ser maior ou igual a 0' })
  valorJuros?: number;

  @ApiProperty({
    description: 'Valor de multa',
    example: 15.00,
    required: false,
  })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 }, { message: 'Valor de multa deve ser um número com no máximo 2 casas decimais' })
  @Min(0, { message: 'Valor de multa deve ser maior ou igual a 0' })
  valorMulta?: number;

  @ApiProperty({
    description: 'Valor recebido',
    example: 1490.00,
    required: false,
  })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 }, { message: 'Valor recebido deve ser um número com no máximo 2 casas decimais' })
  @Min(0, { message: 'Valor recebido deve ser maior ou igual a 0' })
  valorRecebido?: number;

  @ApiProperty({
    description: 'ID da forma de pagamento',
    example: 1,
    required: false,
  })
  @IsOptional()
  @IsNumber({}, { message: 'ID da forma de pagamento deve ser um número' })
  formaPagamentoId?: number;

  @ApiProperty({
    description: 'Status da conta',
    example: 'ABERTO',
    enum: ['ABERTO', 'RECEBIDO', 'VENCIDO', 'CANCELADO'],
    required: false,
  })
  @IsOptional()
  @IsEnum(['ABERTO', 'RECEBIDO', 'VENCIDO', 'CANCELADO'], {
    message: 'Status deve ser ABERTO, RECEBIDO, VENCIDO ou CANCELADO'
  })
  status?: string;

  @ApiProperty({
    description: 'ID do funcionário que realizou o recebimento',
    example: 1,
    required: false,
  })
  @IsOptional()
  @IsNumber({}, { message: 'ID do funcionário deve ser um número' })
  recebidoPor?: number;

  @ApiProperty({
    description: 'Observações',
    example: 'Recebimento com desconto negociado',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'Observações devem ser uma string' })
  @MaxLength(500, { message: 'Observações devem ter no máximo 500 caracteres' })
  observacoes?: string;
}
