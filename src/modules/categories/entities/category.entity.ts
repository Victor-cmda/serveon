import { ApiProperty } from '@nestjs/swagger';

export class Category {
  @ApiProperty({
    description: 'ID único da categoria',
    example: 1
  })
  id: number;

  @ApiProperty({
    description: 'Nome da categoria',
    example: 'Informática'
  })
  nome: string;

  @ApiProperty({
    description: 'Descrição da categoria',
    example: 'Produtos de informática e tecnologia',
    required: false
  })
  descricao?: string;

  @ApiProperty({
    description: 'Status da categoria (ativo/inativo)',
    example: true
  })
  ativo: boolean;

  @ApiProperty({
    description: 'Data de criação do registro',
    example: '2025-06-19T10:00:00Z'
  })
  createdAt: string;

  @ApiProperty({
    description: 'Data da última atualização',
    example: '2025-06-19T10:00:00Z'
  })
  updatedAt: string;
}
