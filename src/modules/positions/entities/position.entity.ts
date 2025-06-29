import { ApiProperty } from '@nestjs/swagger';
import { BaseEntity } from '../../../common/entities/base.entity';


export class Position extends BaseEntity {
  @ApiProperty({
    description: 'Nome do cargo',
    example: 'Analista de Sistemas',
    maxLength: 100,
  })
  nome: string;

  @ApiProperty({
    description: 'Descrição do cargo',
    example: 'Responsável por desenvolver e manter sistemas',
    required: false,
  })
  descricao?: string;

  @ApiProperty({
    description: 'ID do departamento ao qual o cargo pertence',
    example: 1,
    required: false,
  })
  departamentoId?: number;

  @ApiProperty({
    description: 'Nome do departamento ao qual o cargo pertence',
    example: 'Tecnologia da Informação',
    required: false,
  })
  departamentoNome?: string;
}
