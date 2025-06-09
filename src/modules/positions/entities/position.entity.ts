import { ApiProperty } from '@nestjs/swagger';

export class Position {
  @ApiProperty({
    description: 'ID único do cargo',
    example: 1
  })
  id: number;

  @ApiProperty({
    description: 'Nome do cargo',
    example: 'Analista de Sistemas',
    maxLength: 100
  })
  nome: string;

  @ApiProperty({
    description: 'Descrição do cargo',
    example: 'Responsável por desenvolver e manter sistemas',
    required: false
  })
  descricao?: string;

  @ApiProperty({
    description: 'ID do departamento ao qual o cargo pertence',
    example: 1,
    required: false
  })
  departamentoId?: number;

  @ApiProperty({
    description: 'Nome do departamento ao qual o cargo pertence',
    example: 'Tecnologia da Informação',
    required: false
  })
  departamentoNome?: string;

  @ApiProperty({
    description: 'Indica se o cargo está ativo',
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
