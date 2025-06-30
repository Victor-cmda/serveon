import { ApiProperty } from '@nestjs/swagger';
import { BaseEntity } from '../../../common/entities/base.entity';

export class UnitMeasure extends BaseEntity {
  @ApiProperty({
    description: 'Nome da unidade de medida',
    example: 'Unidade',
  })
  nome: string;

  @ApiProperty({
    description: 'Sigla da unidade de medida',
    example: 'UN',
  })
  sigla: string;
}
