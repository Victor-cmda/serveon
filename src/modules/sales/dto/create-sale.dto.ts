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

export class CreateSaleDto {
  @ApiProperty({
    description: 'ID do cliente',
    example: 1,
  })
  @IsNotEmpty({ message: 'ID do cliente é obrigatório' })
  @IsNumber({}, { message: 'ID do cliente deve ser um número' })
  clienteId: number;

  @ApiProperty({
    description: 'ID da condição de pagamento',
    example: 1,
  })
  @IsNotEmpty({ message: 'ID da condição de pagamento é obrigatório' })
  @IsNumber({}, { message: 'ID da condição de pagamento deve ser um número' })
  condicaoPagamentoId: number;

  @ApiProperty({
    description: 'ID do funcionário responsável pela venda',
    example: 1,
  })
  @IsNotEmpty({ message: 'ID do funcionário é obrigatório' })
  @IsNumber({}, { message: 'ID do funcionário deve ser um número' })
  funcionarioId: number;

  @ApiProperty({
    description: 'Data da venda',
    example: '2024-01-15',
  })
  @IsNotEmpty({ message: 'Data da venda é obrigatória' })
  @Type(() => Date)
  @IsDate({ message: 'Data da venda deve ser uma data válida' })
  dataVenda: Date;

  @ApiProperty({
    description: 'Data de vencimento',
    example: '2024-02-15',
  })
  @IsNotEmpty({ message: 'Data de vencimento é obrigatória' })
  @Type(() => Date)
  @IsDate({ message: 'Data de vencimento deve ser uma data válida' })
  dataVencimento: Date;

  @ApiProperty({
    description: 'Valor total da venda',
    example: 2500.00,
  })
  @IsNotEmpty({ message: 'Valor total é obrigatório' })
  @IsNumber({ maxDecimalPlaces: 2 }, { message: 'Valor total deve ser um número com no máximo 2 casas decimais' })
  @Min(0, { message: 'Valor total deve ser maior ou igual a 0' })
  valorTotal: number;

  @ApiProperty({
    description: 'Valor de desconto aplicado',
    example: 100.00,
    default: 0,
  })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 }, { message: 'Valor de desconto deve ser um número com no máximo 2 casas decimais' })
  @Min(0, { message: 'Valor de desconto deve ser maior ou igual a 0' })
  valorDesconto?: number;

  @ApiProperty({
    description: 'Status da venda',
    example: 'ORCAMENTO',
    enum: ['ORCAMENTO', 'CONFIRMADA', 'CANCELADA', 'ENTREGUE', 'FATURADA'],
    default: 'ORCAMENTO',
  })
  @IsOptional()
  @IsEnum(['ORCAMENTO', 'CONFIRMADA', 'CANCELADA', 'ENTREGUE', 'FATURADA'], {
    message: 'Status deve ser ORCAMENTO, CONFIRMADA, CANCELADA, ENTREGUE ou FATURADA'
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
    description: 'Observações sobre a venda',
    example: 'Venda de produtos eletrônicos',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'Observações devem ser uma string' })
  @MaxLength(500, { message: 'Observações devem ter no máximo 500 caracteres' })
  observacoes?: string;
}
