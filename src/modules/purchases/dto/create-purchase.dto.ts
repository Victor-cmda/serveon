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

export class CreatePurchaseDto {
  @ApiProperty({
    description: 'ID do fornecedor',
    example: 1,
  })
  @IsNotEmpty({ message: 'ID do fornecedor é obrigatório' })
  @IsNumber({}, { message: 'ID do fornecedor deve ser um número' })
  fornecedorId: number;

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
    description: 'Data da compra',
    example: '2024-01-15',
  })
  @IsNotEmpty({ message: 'Data da compra é obrigatória' })
  @Type(() => Date)
  @IsDate({ message: 'Data da compra deve ser uma data válida' })
  dataCompra: Date;

  @ApiProperty({
    description: 'Data de vencimento',
    example: '2024-02-15',
  })
  @IsNotEmpty({ message: 'Data de vencimento é obrigatória' })
  @Type(() => Date)
  @IsDate({ message: 'Data de vencimento deve ser uma data válida' })
  dataVencimento: Date;

  @ApiProperty({
    description: 'Valor total da compra',
    example: 1500.50,
  })
  @IsNotEmpty({ message: 'Valor total é obrigatório' })
  @IsNumber({ maxDecimalPlaces: 2 }, { message: 'Valor total deve ser um número com no máximo 2 casas decimais' })
  @Min(0, { message: 'Valor total deve ser maior ou igual a 0' })
  valorTotal: number;

  @ApiProperty({
    description: 'Valor de desconto aplicado',
    example: 50.00,
    default: 0,
  })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 }, { message: 'Valor de desconto deve ser um número com no máximo 2 casas decimais' })
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
    message: 'Status deve ser PENDENTE, CONFIRMADA, CANCELADA ou ENTREGUE'
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
}
