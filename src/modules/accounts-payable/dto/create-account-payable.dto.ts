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
    description: 'ID da compra relacionada',
    example: 1,
  })
  @IsNotEmpty({ message: 'ID da compra é obrigatório' })
  @IsNumber({}, { message: 'ID da compra deve ser um número' })
  compraId: number;

  @ApiProperty({
    description: 'ID do fornecedor',
    example: 1,
  })
  @IsNotEmpty({ message: 'ID do fornecedor é obrigatório' })
  @IsNumber({}, { message: 'ID do fornecedor deve ser um número' })
  fornecedorId: number;

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
    example: 500.00,
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
    enum: ['PENDENTE', 'PAGO', 'VENCIDO', 'CANCELADO'],
    default: 'PENDENTE',
  })
  @IsOptional()
  @IsEnum(['PENDENTE', 'PAGO', 'VENCIDO', 'CANCELADO'], {
    message: 'Status deve ser PENDENTE, PAGO, VENCIDO ou CANCELADO'
  })
  status?: string;

  @ApiProperty({
    description: 'Observações sobre o pagamento',
    example: 'Pagamento antecipado com desconto',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'Observações devem ser uma string' })
  @MaxLength(500, { message: 'Observações devem ter no máximo 500 caracteres' })
  observacoes?: string;
}
