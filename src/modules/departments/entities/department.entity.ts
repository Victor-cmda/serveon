import { ApiProperty } from '@nestjs/swagger';

export class Department {
  @ApiProperty({
    description: 'ID único do departamento',
    example: 1
  })
  id: number;

  @ApiProperty({
    description: 'Nome do departamento',
    example: 'Recursos Humanos',
    maxLength: 100
  })
  nome: string;

  @ApiProperty({
    description: 'Descrição do departamento',
    example: 'Departamento responsável pela gestão de pessoas',
    required: false
  })
  descricao?: string;

  @ApiProperty({
    description: 'Indica se o departamento está ativo',
    example: true,
    default: true
  })
  ativo: boolean;

  @ApiProperty({
    description: 'Data de criação do registro',
    example: '2024-06-08T10:30:00.000Z'
  })
  createdAt: string;

  @ApiProperty({
    description: 'Data da última atualização do registro',
    example: '2024-06-08T10:30:00.000Z'
  })
  updatedAt: string;
}
