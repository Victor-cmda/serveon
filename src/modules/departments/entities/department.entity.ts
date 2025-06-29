import { ApiProperty } from '@nestjs/swagger';
import { BaseEntity } from '../../../common/entities/base.entity';

export class Department extends BaseEntity {
  @ApiProperty({
    description: 'Nome do departamento',
    example: 'Recursos Humanos',
    maxLength: 100,
  })
  nome: string;

  @ApiProperty({
    description: 'Descrição do departamento',
    example: 'Departamento responsável pela gestão de pessoas',
    required: false,
  })
  descricao?: string;
}
