import { ApiProperty } from '@nestjs/swagger';
import { BaseEntity } from '../../../common/entities/base.entity';

export class EmployeeFunction extends BaseEntity {
  @ApiProperty({
    description: 'Nome da função do funcionário',
    example: 'Vendedor',
  })
  nome: string;

  @ApiProperty({
    description: 'Descrição da função',
    example: 'Responsável por vendas e atendimento ao cliente',
    required: false,
  })
  descricao?: string;
}
