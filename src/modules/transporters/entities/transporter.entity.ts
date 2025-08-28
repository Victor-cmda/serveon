import { ApiProperty } from '@nestjs/swagger';
import { BaseEntity } from '../../../common/entities/base.entity';

export class Transporter extends BaseEntity {
  @ApiProperty({
    description: 'CNPJ da transportadora',
    example: '12345678000195',
  })
  cnpj: string;

  @ApiProperty({
    description: 'Nome da transportadora',
    example: 'Transportes Rápidos Ltda',
  })
  nome: string;

  @ApiProperty({
    description: 'Nome fantasia da transportadora',
    example: 'Rápidos Express',
    required: false,
  })
  nomeFantasia?: string;

  @ApiProperty({
    description: 'ID do país',
    example: 1,
    required: false,
  })
  paisId?: number;

  @ApiProperty({
    description: 'ID do estado',
    example: 1,
    required: false,
  })
  estadoId?: number;

  @ApiProperty({
    description: 'ID da cidade',
    example: 1,
    required: false,
  })
  cidadeId?: number;

  @ApiProperty({
    description: 'Endereço da transportadora',
    example: 'Av. das Transportadoras, 123',
    required: false,
  })
  endereco?: string;

  @ApiProperty({
    description: 'Número do endereço',
    example: '123',
    required: false,
  })
  numero?: string;

  @ApiProperty({
    description: 'Complemento do endereço',
    example: 'Galpão 5',
    required: false,
  })
  complemento?: string;

  @ApiProperty({
    description: 'Bairro',
    example: 'Distrito Industrial',
    required: false,
  })
  bairro?: string;

  @ApiProperty({
    description: 'CEP',
    example: '12345-678',
    required: false,
  })
  cep?: string;

  @ApiProperty({
    description: 'Website da transportadora',
    example: 'https://www.rapidosexpress.com.br',
    required: false,
  })
  website?: string;

  @ApiProperty({
    description: 'Observações sobre a transportadora',
    example: 'Especializada em cargas frágeis',
    required: false,
  })
  observacoes?: string;
}
