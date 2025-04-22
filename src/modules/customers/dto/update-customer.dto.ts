import { PartialType } from '@nestjs/mapped-types';
import { CreateCustomerDto } from './create-customer.dto';
import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsArray, IsUUID, IsOptional } from 'class-validator';

export class UpdateCustomerDto extends PartialType(CreateCustomerDto) {
  @ApiProperty({
    description: 'Status ativo/inativo do cliente',
    example: true,
    required: false
  })
  @IsOptional()
  @IsBoolean({ message: 'ativo deve ser um valor booleano' })
  ativo?: boolean;
  
  @ApiProperty({
    description: 'Se o cliente também é um destinatário',
    example: true,
    required: false
  })
  @IsOptional()
  @IsBoolean({ message: 'isDestinatario deve ser um valor booleano' })
  isDestinatario?: boolean;
  
  @ApiProperty({
    description: 'Lista de IDs de destinatários associados (quando o cliente não é o destinatário)',
    example: ['550e8400-e29b-41d4-a716-446655440000'],
    type: [String],
    required: false
  })
  @IsOptional()
  @IsArray({ message: 'destinatariosIds deve ser um array' })
  @IsUUID(4, { each: true, message: 'Cada ID de destinatário deve ser um UUID válido' })
  destinatariosIds?: string[];
}