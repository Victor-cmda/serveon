import { ApiProperty } from '@nestjs/swagger';
import { BaseEntity } from '../../../common/entities/base.entity';

export class Customer extends BaseEntity {
  @ApiProperty({
    description: 'CNPJ, CPF ou documento internacional do cliente',
    example: '12345678901234',
  })
  cnpjCpf: string;

  @ApiProperty({
    description:
      'Tipo de cliente: F para Pessoa Física, J para Pessoa Jurídica',
    example: 'J',
    enum: ['F', 'J'],
  })
  tipo: 'F' | 'J';

  @ApiProperty({
    description: 'Indica se é um cliente estrangeiro',
    example: false,
  })
  isEstrangeiro: boolean;

  @ApiProperty({
    description: 'Tipo de documento para clientes estrangeiros',
    example: 'passport',
    required: false,
  })
  tipoDocumento?: string;

  @ApiProperty({
    description: 'Razão Social ou Nome Completo',
    example: 'Empresa XYZ Ltda',
  })
  razaoSocial: string;

  @ApiProperty({
    description: 'Nome Fantasia',
    example: 'XYZ Tecnologia',
  })
  nomeFantasia?: string;

  @ApiProperty({
    description:
      'Inscrição Estadual ou informações complementares do documento',
    example: '123456789',
  })
  inscricaoEstadual?: string;
  @ApiProperty({
    description: 'ID do país',
    example: 1,
  })
  paisId?: number;

  @ApiProperty({
    description: 'Nome do país',
    example: 'Brasil',
  })
  paisNome?: string;

  @ApiProperty({
    description: 'ID do estado/província',
    example: 1,
  })
  estadoId?: number;

  @ApiProperty({
    description: 'Endereço',
    example: 'Av. Brasil',
  })
  endereco?: string;

  @ApiProperty({
    description: 'Número do endereço',
    example: '123',
  })
  numero?: string;

  @ApiProperty({
    description: 'Complemento do endereço',
    example: 'Sala 101',
  })
  complemento?: string;

  @ApiProperty({
    description: 'Bairro',
    example: 'Centro',
  })
  bairro?: string;
  @ApiProperty({
    description: 'ID da cidade',
    example: 1,
  })
  cidadeId?: number;

  @ApiProperty({
    description: 'CEP ou código postal',
    example: '12345678',
  })
  cep?: string;

  @ApiProperty({
    description: 'Telefone',
    example: '11987654321',
  })
  telefone?: string;

  @ApiProperty({
    description: 'Email',
    example: 'contato@empresa.com',
  })
  email?: string;

  @ApiProperty({
    description: 'Nome da cidade',
    example: 'São Paulo',
  })
  cidadeNome?: string;

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
    description: 'Lista de IDs de destinatários associados ao cliente',
    example: [1, 2, 3],
    type: [Number],
    required: false,
  })
  destinatariosIds?: number[];

  @ApiProperty({
    description: 'Se o cliente é também um destinatário',
    example: true,
  })
  isDestinatario: boolean;
}
