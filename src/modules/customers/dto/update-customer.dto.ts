import { PartialType } from '@nestjs/mapped-types';
import { CreateCustomerDto } from './create-customer.dto';
import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsArray, IsNumber, IsOptional } from 'class-validator';

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
    example: [1, 2, 3],
    type: [Number],
    required: false
  })
  @IsOptional()
  @IsArray({ message: 'destinatariosIds deve ser um array' })
  @IsNumber({}, { each: true, message: 'Cada ID de destinatário deve ser um número válido' })
  destinatariosIds?: number[];
}