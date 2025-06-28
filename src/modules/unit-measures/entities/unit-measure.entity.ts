import { ApiProperty } from '@nestjs/swagger';

export class UnitMeasure {
  @ApiProperty({
    description: 'ID único da unidade de medida',
    example: 1,
  })
  id: number;

  @ApiProperty({
    description: 'Sigla da unidade de medida',
    example: 'UN',
  })
  sigla: string;

  @ApiProperty({
    description: 'Descrição da unidade de medida',
    example: 'Unidade',
    required: false,
  })
  descricao?: string;

  @ApiProperty({
    description: 'Status da unidade de medida (ativo/inativo)',
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
