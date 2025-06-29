import { ApiProperty } from '@nestjs/swagger';
import { BaseEntity } from '../../../common/entities/base.entity';

export class Brand extends BaseEntity {
  @ApiProperty({
    description: 'Nome da marca',
    example: 'Dell',
  })
  nome: string;

  @ApiProperty({
    description: 'Descrição da marca',
    example: 'Marca de equipamentos de informática',
    required: false,
  })
  descricao?: string;
}
