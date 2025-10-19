import { ApiProperty } from '@nestjs/swagger';
import { BaseEntity } from '../../../common/entities/base.entity';

export class Vehicle extends BaseEntity {
  @ApiProperty({
    description: 'Placa do veículo',
    example: 'ABC-1234',
  })
  placa: string;

  @ApiProperty({
    description: 'Modelo do veículo',
    example: 'FH 540',
    required: false,
  })
  modelo?: string;

  @ApiProperty({
    description: 'Marca do veículo',
    example: 'Volvo',
    required: false,
  })
  marca?: string;

  @ApiProperty({
    description: 'Ano de fabricação',
    example: 2020,
    required: false,
  })
  ano?: number;

  @ApiProperty({
    description: 'Capacidade de carga',
    example: 15000.00,
    required: false,
  })
  capacidade?: number;
}
