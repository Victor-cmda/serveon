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

export class CreateAccountReceivableDto {
  @ApiProperty({
    description: 'ID da venda relacionada',
    example: 1,
  })
  @IsNotEmpty({ message: 'ID da venda é obrigatório' })
  @IsNumber({}, { message: 'ID da venda deve ser um número' })
  vendaId: number;

  @ApiProperty({
    description: 'ID do cliente',
    example: 1,
  })
  @IsNotEmpty({ message: 'ID do cliente é obrigatório' })
  @IsNumber({}, { message: 'ID do cliente deve ser um número' })
  clienteId: number;

  @ApiProperty({
    description: 'Número da parcela',
    example: 1,
  })
  @IsNotEmpty({ message: 'Número da parcela é obrigatório' })
  @IsNumber({}, { message: 'Número da parcela deve ser um número' })
  @Min(1, { message: 'Número da parcela deve ser maior que 0' })
  numeroParcela: number;

  @ApiProperty({
    description: 'Total de parcelas',
    example: 3,
  })
  @IsNotEmpty({ message: 'Total de parcelas é obrigatório' })
  @IsNumber({}, { message: 'Total de parcelas deve ser um número' })
  @Min(1, { message: 'Total de parcelas deve ser maior que 0' })
  totalParcelas: number;

  @ApiProperty({
    description: 'Valor da parcela',
    example: 800.00,
  })
  @IsNotEmpty({ message: 'Valor da parcela é obrigatório' })
  @IsNumber({ maxDecimalPlaces: 2 }, { message: 'Valor da parcela deve ser um número com no máximo 2 casas decimais' })
  @Min(0, { message: 'Valor da parcela deve ser maior ou igual a 0' })
  valorParcela: number;

  @ApiProperty({
    description: 'Data de vencimento',
    example: '2024-02-15',
  })
  @IsNotEmpty({ message: 'Data de vencimento é obrigatória' })
  @Type(() => Date)
  @IsDate({ message: 'Data de vencimento deve ser uma data válida' })
  dataVencimento: Date;

  @ApiProperty({
    description: 'Status da conta',
    example: 'PENDENTE',
    enum: ['PENDENTE', 'RECEBIDO', 'VENCIDO', 'CANCELADO'],
    default: 'PENDENTE',
  })
  @IsOptional()
  @IsEnum(['PENDENTE', 'RECEBIDO', 'VENCIDO', 'CANCELADO'], {
    message: 'Status deve ser PENDENTE, RECEBIDO, VENCIDO ou CANCELADO'
  })
  status?: string;

  @ApiProperty({
    description: 'Observações sobre o recebimento',
    example: 'Pagamento via PIX',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'Observações devem ser uma string' })
  @MaxLength(500, { message: 'Observações devem ter no máximo 500 caracteres' })
  observacoes?: string;
}
