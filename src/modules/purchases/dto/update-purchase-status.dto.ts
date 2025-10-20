import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsEnum, IsOptional } from 'class-validator';

export class UpdatePurchaseStatusDto {
  @ApiProperty({
    description: 'Novo status da compra',
    example: 'APROVADO',
    enum: ['PENDENTE', 'APROVADO', 'ENVIADO', 'RECEBIDO', 'CANCELADO'],
  })
  @IsNotEmpty({ message: 'Status é obrigatório' })
  @IsEnum(['PENDENTE', 'APROVADO', 'ENVIADO', 'RECEBIDO', 'CANCELADO'], {
    message: 'Status deve ser PENDENTE, APROVADO, ENVIADO, RECEBIDO ou CANCELADO',
  })
  status: string;

  @ApiProperty({
    description: 'Motivo da alteração de status',
    example: 'Compra aprovada pelo gerente',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'Motivo deve ser uma string' })
  motivo?: string;
}
