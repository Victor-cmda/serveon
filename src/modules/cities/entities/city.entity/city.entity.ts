import { ApiProperty } from '@nestjs/swagger';

export class City {
  @ApiProperty({
    description: 'ID único da cidade',
    example: 1
  })
  id: number;

  @ApiProperty({
    description: 'Nome da cidade',
    example: 'São Paulo'
  })
  nome: string;

  @ApiProperty({
    description: 'Código IBGE da cidade',
    example: '3550308',
    required: false
  })
  codigoIbge?: string;

  @ApiProperty({
    description: 'ID do estado ao qual a cidade pertence',
    example: 1
  })
  estadoId: number;

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

  @ApiProperty({
    description: 'Nome do estado',
    example: 'São Paulo'
  })
  estadoNome?: string;

  @ApiProperty({
    description: 'UF do estado',
    example: 'SP'
  })
  uf?: string;

  @ApiProperty({
    description: 'Nome do país',
    example: 'Brasil'
  })
  paisNome?: string;
}