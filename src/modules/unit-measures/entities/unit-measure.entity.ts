import { ApiProperty } from '@nestjs/swagger';
import { BaseEntity } from '../../../common/entities/base.entity';

export class UnitMeasure extends BaseEntity {
  @ApiProperty({
    description: 'Sigla da unidade de medida',
    example: 'UN',
  })
  sigla: string;

  @ApiProperty({
    description: 'Descrição da unidade de medida',
    example: 'Unidade',
    required: false,
  })
  descricao?: string;
}
