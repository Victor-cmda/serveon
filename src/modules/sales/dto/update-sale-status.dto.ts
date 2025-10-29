import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsEnum, IsOptional } from 'class-validator';

export class UpdateSaleStatusDto {
  @ApiProperty({
    description: 'Novo status da venda',
    example: 'APROVADO',
    enum: ['PENDENTE', 'APROVADO', 'ENVIADO', 'ENTREGUE', 'CANCELADO'],
  })
  @IsNotEmpty({ message: 'Status é obrigatório' })
  @IsEnum(['PENDENTE', 'APROVADO', 'ENVIADO', 'ENTREGUE', 'CANCELADO'], {
    message: 'Status deve ser PENDENTE, APROVADO, ENVIADO, ENTREGUE ou CANCELADO',
  })
  status: string;

  @ApiProperty({
    description: 'Motivo da alteração de status',
    example: 'Venda aprovada pelo gerente',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'Motivo deve ser uma string' })
  motivo?: string;
}
