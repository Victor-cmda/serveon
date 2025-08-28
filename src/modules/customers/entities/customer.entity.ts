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
    description: 'Nome Fantasia (opcional)',
    example: 'XYZ Tecnologia',
    required: false,
  })
  nomeFantasia?: string;

  @ApiProperty({
    description:
      'Inscrição Estadual ou dados adicionais do documento estrangeiro',
    example: '123456789',
    required: false,
  })
  inscricaoEstadual?: string;

  @ApiProperty({
    description: 'ID do país',
    example: 1,
  })
  paisId?: number;

  @ApiProperty({
    description: 'ID da nacionalidade',
    example: 1,
  })
  nacionalidadeId?: number;

  @ApiProperty({
    description: 'ID do estado/província',
    example: 1,
  })
  estadoId?: number;

  @ApiProperty({
    description: 'ID da cidade no sistema',
    example: 1,
    required: false,
  })
  cidadeId?: number;

  @ApiProperty({
    description: 'Endereço',
    example: 'Av. Brasil',
    required: false,
  })
  endereco?: string;

  @ApiProperty({
    description: 'Número do endereço (opcional)',
    example: '123',
    required: false,
  })
  numero?: string;

  @ApiProperty({
    description: 'Complemento do endereço (opcional)',
    example: 'Sala 101',
    required: false,
  })
  complemento?: string;

  @ApiProperty({
    description: 'Bairro (opcional)',
    example: 'Centro',
    required: false,
  })
  bairro?: string;

  @ApiProperty({
    description: 'CEP ou Código Postal',
    example: '12345678',
    required: false,
  })
  cep?: string;

  @ApiProperty({
    description: 'Telefone (opcional)',
    example: '11987654321',
    required: false,
  })
  telefone?: string;

  @ApiProperty({
    description: 'Email (opcional)',
    example: 'contato@empresa.com',
    required: false,
  })
  email?: string;

  @ApiProperty({
    description: 'Se o cliente também é um destinatário',
    example: true,
    default: true,
  })
  isDestinatario?: boolean;

  @ApiProperty({
    description: 'Limite de crédito do cliente',
    example: 50000.00,
  })
  limiteCredito: number;

  @ApiProperty({
    description: 'ID da condição de pagamento',
    example: 1,
    required: false,
  })
  condicaoPagamentoId?: number;
}
