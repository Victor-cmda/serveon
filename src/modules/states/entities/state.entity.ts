import { ApiProperty } from '@nestjs/swagger';
import { BaseEntity } from '../../../common/entities/base.entity';

export class State extends BaseEntity {
  @ApiProperty({
    description: 'Nome do estado',
    example: 'São Paulo',
  })
  nome: string;

  @ApiProperty({
    description: 'UF do estado',
    example: 'SP',
  })
  uf: string;

  @ApiProperty({
    description: 'ID do país ao qual o estado pertence',
    example: 1,
  })
  paisId: number;

  @ApiProperty({
    description: 'Nome do país ao qual o estado pertence',
    example: 'Brasil',
  })
  paisNome?: string;
}
