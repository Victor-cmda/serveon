import { ApiProperty } from '@nestjs/swagger';
import { BaseEntity } from '../../../common/entities/base.entity';

export class Vehicle extends BaseEntity {
  @ApiProperty({
    description: 'Placa do veículo',
    example: 'ABC-1234',
  })
  placa: string;

  @ApiProperty({
    description: 'Marca do veículo',
    example: 'Volvo',
  })
  marca: string;

  @ApiProperty({
    description: 'Modelo do veículo',
    example: 'FH 540',
  })
  modelo: string;

  @ApiProperty({
    description: 'Ano de fabricação',
    example: 2020,
  })
  ano: number;

  @ApiProperty({
    description: 'Cor do veículo',
    example: 'Branco',
    required: false,
  })
  cor?: string;

  @ApiProperty({
    description: 'Tipo do veículo',
    example: 'CAMINHAO',
    enum: ['CAMINHAO', 'VAN', 'CARRETA', 'UTILITARIO', 'OUTROS'],
  })
  tipo: string;

  @ApiProperty({
    description: 'Capacidade de carga em kg',
    example: 15000.00,
    required: false,
  })
  capacidadeCarga?: number;

  @ApiProperty({
    description: 'Observações sobre o veículo',
    example: 'Veículo com baú refrigerado',
    required: false,
  })
  observacoes?: string;
}
