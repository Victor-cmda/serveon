import { ApiProperty } from '@nestjs/swagger';
import { BaseEntity } from '../../../common/entities/base.entity';

export class Category extends BaseEntity {
  @ApiProperty({
    description: 'Nome da categoria',
    example: 'Informática',
  })
  nome: string;

  @ApiProperty({
    description: 'Descrição da categoria',
    example: 'Produtos de informática e tecnologia',
    required: false,
  })
  descricao?: string;
}
