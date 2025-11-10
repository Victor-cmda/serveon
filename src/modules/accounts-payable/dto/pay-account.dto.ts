import { ApiProperty } from '@nestjs/swagger';
import { 
  IsNotEmpty, 
  IsOptional, 
  IsNumber, 
  IsDate,
  IsString,
  MaxLength,
  Min 
} from 'class-validator';
import { Type } from 'class-transformer';

export class PayAccountDto {
  @ApiProperty({
    description: 'Data do pagamento',
    example: '2024-02-10',
  })
  @IsNotEmpty({ message: 'Data de pagamento é obrigatória' })
  @Type(() => Date)
  @IsDate({ message: 'Data de pagamento deve ser uma data válida' })
  dataPagamento: Date;

  @ApiProperty({
    description: 'Valor pago',
    example: 1500.00,
  })
  @IsNotEmpty({ message: 'Valor pago é obrigatório' })
  @IsNumber({ maxDecimalPlaces: 2 }, { message: 'Valor pago deve ser um número com no máximo 2 casas decimais' })
  @Min(0.01, { message: 'Valor pago deve ser maior que 0' })
  valorPago: number;

  @ApiProperty({
    description: 'ID da forma de pagamento',
    example: 1,
  })
  @IsNotEmpty({ message: 'Forma de pagamento é obrigatória' })
  @IsNumber({}, { message: 'ID da forma de pagamento deve ser um número' })
  formaPagamentoId: number;

  @ApiProperty({
    description: 'Valor de desconto aplicado',
    example: 50.00,
    required: false,
  })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 }, { message: 'Valor de desconto deve ser um número com no máximo 2 casas decimais' })
  @Min(0, { message: 'Valor de desconto deve ser maior ou igual a 0' })
  valorDesconto?: number;

  @ApiProperty({
    description: 'Valor de juros aplicado',
    example: 25.00,
    required: false,
  })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 }, { message: 'Valor de juros deve ser um número com no máximo 2 casas decimais' })
  @Min(0, { message: 'Valor de juros deve ser maior ou igual a 0' })
  valorJuros?: number;

  @ApiProperty({
    description: 'Valor de multa aplicado',
    example: 15.00,
    required: false,
  })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 }, { message: 'Valor de multa deve ser um número com no máximo 2 casas decimais' })
  @Min(0, { message: 'Valor de multa deve ser maior ou igual a 0' })
  valorMulta?: number;

  @ApiProperty({
    description: 'ID do funcionário que realizou o pagamento',
    example: 1,
    required: false,
  })
  @IsOptional()
  @IsNumber({}, { message: 'ID do funcionário deve ser um número' })
  pagoPor?: number;

  @ApiProperty({
    description: 'Observações sobre o pagamento',
    example: 'Pagamento via transferência bancária',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'Observações devem ser uma string' })
  @MaxLength(500, { message: 'Observações devem ter no máximo 500 caracteres' })
  observacoes?: string;
}
