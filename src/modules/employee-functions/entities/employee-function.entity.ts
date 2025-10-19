import { ApiProperty } from '@nestjs/swagger';
import { BaseEntity } from '../../../common/entities/base.entity';

export class EmployeeFunction extends BaseEntity {
  @ApiProperty({
    description: 'Código da função do funcionário',
    example: 'VENDEDOR',
  })
  funcaoFuncionario: string;

  @ApiProperty({
    description: 'Nome/descrição da função',
    example: 'Responsável por vendas e atendimento ao cliente',
    required: false,
  })
  descricao?: string;

  @ApiProperty({
    description: 'Salário base para a função',
    example: 2500.00,
  })
  salarioBase: number;

  @ApiProperty({
    description: 'Indica se a função requer CNH',
    example: false,
  })
  requerCnh: boolean;

  @ApiProperty({
    description: 'Carga horária semanal',
    example: 44.00,
  })
  cargaHoraria: number;

  @ApiProperty({
    description: 'Observações sobre a função',
    example: 'Horário comercial',
    required: false,
  })
  observacao?: string;
}
