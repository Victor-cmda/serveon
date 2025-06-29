import { ApiProperty } from '@nestjs/swagger';
import { BaseEntity } from '../../../../common/entities/base.entity';

export class City extends BaseEntity {
  @ApiProperty({
    description: 'Nome da cidade',
    example: 'São Paulo',
  })
  nome: string;

  @ApiProperty({
    description: 'Código IBGE da cidade',
    example: '3550308',
    required: false,
  })
  codigoIbge?: string;

  @ApiProperty({
    description: 'ID do estado ao qual a cidade pertence',
    example: 1,
  })
  estadoId: number;

  @ApiProperty({
    description: 'Nome do estado',
    example: 'São Paulo',
  })
  estadoNome?: string;

  @ApiProperty({
    description: 'UF do estado',
    example: 'SP',
  })
  uf?: string;

  @ApiProperty({
    description: 'Nome do país',
    example: 'Brasil',
  })
  paisNome?: string;
}
