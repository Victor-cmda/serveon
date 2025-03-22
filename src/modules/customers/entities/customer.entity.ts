import { ApiProperty } from '@nestjs/swagger';

export class Customer {
  @ApiProperty({
    description: 'CNPJ ou CPF do cliente',
    example: '12345678901234'
  })
  cnpjCpf: string;

  @ApiProperty({
    description: 'Tipo de cliente: F para Pessoa Física, J para Pessoa Jurídica',
    example: 'J',
    enum: ['F', 'J']
  })
  tipo: 'F' | 'J';

  @ApiProperty({
    description: 'Razão Social ou Nome Completo',
    example: 'Empresa XYZ Ltda'
  })
  razaoSocial: string;

  @ApiProperty({
    description: 'Nome Fantasia',
    example: 'XYZ Tecnologia'
  })
  nomeFantasia?: string;

  @ApiProperty({
    description: 'Inscrição Estadual',
    example: '123456789'
  })
  inscricaoEstadual?: string;

  @ApiProperty({
    description: 'Inscrição Municipal',
    example: '123456'
  })
  inscricaoMunicipal?: string;

  @ApiProperty({
    description: 'Endereço',
    example: 'Av. Brasil'
  })
  endereco?: string;

  @ApiProperty({
    description: 'Número do endereço',
    example: '123'
  })
  numero?: string;

  @ApiProperty({
    description: 'Complemento do endereço',
    example: 'Sala 101'
  })
  complemento?: string;

  @ApiProperty({
    description: 'Bairro',
    example: 'Centro'
  })
  bairro?: string;

  @ApiProperty({
    description: 'ID da cidade (UUID)',
    example: '550e8400-e29b-41d4-a716-446655440000'
  })
  cidadeId: string;

  @ApiProperty({
    description: 'CEP',
    example: '12345678'
  })
  cep?: string;

  @ApiProperty({
    description: 'Telefone',
    example: '11987654321'
  })
  telefone?: string;

  @ApiProperty({
    description: 'Email',
    example: 'contato@empresa.com'
  })
  email?: string;

  @ApiProperty({
    description: 'Status ativo/inativo do cliente',
    example: true
  })
  ativo: boolean;

  @ApiProperty({
    description: 'Data de criação',
    example: '2023-01-01T00:00:00.000Z'
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Data da última atualização',
    example: '2023-01-01T00:00:00.000Z'
  })
  updatedAt: Date;
  
  @ApiProperty({
    description: 'Nome da cidade',
    example: 'São Paulo'
  })
  cidadeNome?: string;

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
}