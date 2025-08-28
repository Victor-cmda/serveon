import { ApiProperty } from '@nestjs/swagger';
import { BaseEntity } from '../../../common/entities/base.entity';

export class Supplier extends BaseEntity {
  @ApiProperty({
    description: 'CNPJ, CPF ou documento internacional do fornecedor',
    example: '12345678901234',
  })
  cnpjCpf: string;

  @ApiProperty({
    description:
      'Tipo de fornecedor: F para Pessoa Física, J para Pessoa Jurídica',
    example: 'J',
    enum: ['F', 'J'],
  })
  tipo: 'F' | 'J';

  @ApiProperty({
    description: 'Indica se é um fornecedor estrangeiro',
    example: false,
  })
  isEstrangeiro: boolean;

  @ApiProperty({
    description: 'Tipo de documento para fornecedores estrangeiros',
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
    description: 'CEP',
    example: '12345-678',
  })
  cep?: string;

  @ApiProperty({
    description: 'Telefone',
    example: '(11) 1234-5678',
  })
  telefone?: string;

  @ApiProperty({
    description: 'Email',
    example: 'contato@empresa.com',
  })
  email?: string;

  @ApiProperty({
    description: 'Limite de crédito',
    example: 10000.00,
  })
  limiteCredito: number;

  @ApiProperty({
    description: 'ID da condição de pagamento',
    example: 1,
  })
  condicaoPagamentoId?: number;

  // Campos específicos para fornecedores
  @ApiProperty({
    description: 'Website do fornecedor',
    example: 'https://www.empresa.com',
  })
  website?: string;

  @ApiProperty({
    description: 'Observações sobre o fornecedor',
    example: 'Fornecedor preferencial para materiais de escritório',
  })
  observacoes?: string;

  @ApiProperty({
    description: 'Nome do responsável pelo contato',
    example: 'João Silva',
  })
  responsavel?: string;

  @ApiProperty({
    description: 'Celular do responsável',
    example: '(11) 98765-4321',
  })
  celularResponsavel?: string;
}
