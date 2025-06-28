import { ApiProperty } from '@nestjs/swagger';

export class Brand {
  @ApiProperty({
    description: 'ID único da marca',
    example: 1,
  })
  id: number;

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

  @ApiProperty({
    description: 'Status da marca (ativo/inativo)',
    example: true,
  })
  ativo: boolean;

  @ApiProperty({
    description: 'Data de criação do registro',
    example: '2025-06-19T10:00:00Z',
  })
  createdAt: string;

  @ApiProperty({
    description: 'Data da última atualização',
    example: '2025-06-19T10:00:00Z',
  })
  updatedAt: string;
}
