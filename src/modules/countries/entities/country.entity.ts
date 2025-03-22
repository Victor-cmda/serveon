import { ApiProperty } from '@nestjs/swagger';

export class Country {
  @ApiProperty({
    description: 'ID único do país (UUID)',
    example: '550e8400-e29b-41d4-a716-446655440000'
  })
  id: string;

  @ApiProperty({
    description: 'Nome do país',
    example: 'Brasil'
  })
  nome: string;

  @ApiProperty({
    description: 'Código de chamada internacional do país',
    example: '55'
  })
  codigo: string;

  @ApiProperty({
    description: 'Sigla do país',
    example: 'BR'
  })
  sigla: string;

  @ApiProperty({
    description: 'Data de criação do registro',
    example: '2023-01-15T12:00:00.000Z'
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Data da última atualização do registro',
    example: '2023-01-15T12:00:00.000Z'
  })
  updatedAt: Date;
}