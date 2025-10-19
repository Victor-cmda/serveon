import { ApiProperty } from '@nestjs/swagger';
import { BaseEntity } from '../../../common/entities/base.entity';

export class Country extends BaseEntity {
  @ApiProperty({
    description: 'Nome do país',
    example: 'Brasil',
  })
  nome: string;

  @ApiProperty({
    description: 'Código de chamada internacional do país',
    example: '55',
  })
  codigo: string;

  @ApiProperty({
    description: 'Sigla do país',
    example: 'BR',
  })
  sigla: string;

  @ApiProperty({
    description: 'Nacionalidade',
    example: 'BRASILEIRA',
    required: false,
  })
  nacionalidade?: string;
}
