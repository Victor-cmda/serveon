import { ApiProperty } from '@nestjs/swagger';
import { BaseEntity } from '../../../common/entities/base.entity';

export class Employee extends BaseEntity {
  @ApiProperty({
    description: 'Nome completo do funcionário',
    example: 'João da Silva',
  })
  nome: string;

  @ApiProperty({
    description: 'Apelido do funcionário',
    example: 'João',
    required: false,
  })
  apelido?: string;

  @ApiProperty({
    description: 'CPF do funcionário (apenas números)',
    example: '12345678901',
  })
  cpf: string;

  @ApiProperty({
    description: 'Email profissional do funcionário',
    example: 'joao.silva@empresa.com',
  })
  email: string;

  @ApiProperty({
    description: 'Telefone de contato',
    example: '11987654321',
  })
  telefone?: string;

  @ApiProperty({
    description: 'Telefone celular',
    example: '11999887766',
  })
  celular?: string;

  @ApiProperty({
    description: 'RG do funcionário',
    example: '123456789',
  })
  rg?: string;

  @ApiProperty({
    description: 'RG/Inscrição Estadual do funcionário',
    example: '12345678901234',
    required: false,
  })
  rgInscricaoEstadual?: string;

  @ApiProperty({
    description: 'Órgão emissor do RG',
    example: 'SSP/SP',
  })
  orgaoEmissor?: string;

  @ApiProperty({
    description: 'ID da cidade onde o RG foi emitido',
    example: 1,
  })
  rgCidadeId?: number;

  @ApiProperty({
    description: 'CNH do funcionário',
    example: '12345678901',
    required: false,
  })
  cnh?: string;

  @ApiProperty({
    description: 'Data de validade da CNH',
    example: '2026-12-31',
    required: false,
  })
  dataValidadeCnh?: Date;

  @ApiProperty({
    description: 'Data de nascimento',
    example: '1990-05-15',
  })
  dataNascimento?: Date;

  @ApiProperty({
    description: 'Estado civil',
    example: 'Solteiro',
  })
  estadoCivil?: string;

  @ApiProperty({
    description: 'Sexo (1=Masculino, 2=Feminino)',
    example: 1,
    enum: [1, 2],
  })
  sexo?: number;

  @ApiProperty({
    description: 'Nacionalidade',
    example: 'BRASILEIRA',
  })
  nacionalidade?: string;

  @ApiProperty({
    description: 'ID da nacionalidade',
    example: 1,
  })
  nacionalidadeId?: number;

  @ApiProperty({
    description: 'Tipo do funcionário',
    example: 1,
    required: false,
  })
  tipo?: number;

  // Campos de Endereço
  @ApiProperty({
    description: 'CEP',
    example: '01234567',
  })
  cep?: string;

  @ApiProperty({
    description: 'Endereço',
    example: 'Rua das Flores, 123',
  })
  endereco?: string;

  @ApiProperty({
    description: 'Número do endereço',
    example: '123',
  })
  numero?: string;

  @ApiProperty({
    description: 'Complemento do endereço',
    example: 'Apto 45',
  })
  complemento?: string;

  @ApiProperty({
    description: 'Bairro',
    example: 'Centro',
  })
  bairro?: string;

  @ApiProperty({
    description: 'ID da cidade do funcionário',
    example: 1,
  })
  cidadeId?: number;

  @ApiProperty({
    description: 'Nome da cidade do funcionário',
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
    description: 'ID do cargo do funcionário',
    example: 1,
  })
  cargoId?: number;

  @ApiProperty({
    description: 'Nome do cargo do funcionário',
    example: 'Vendedor',
  })
  cargoNome?: string;

  @ApiProperty({
    description: 'ID do departamento do funcionário',
    example: 1,
  })
  departamentoId?: number;

  @ApiProperty({
    description: 'Nome do departamento do funcionário',
    example: 'Comercial',
  })
  departamentoNome?: string;

  @ApiProperty({
    description: 'ID da função do funcionário',
    example: 1,
  })
  funcaoFuncionarioId?: number;

  @ApiProperty({
    description: 'Nome da função do funcionário',
    example: 'VENDEDOR',
  })
  funcaoFuncionarioNome?: string;

  @ApiProperty({
    description: 'Data de admissão',
    example: '2023-01-15',
  })
  dataAdmissao: Date;

  @ApiProperty({
    description: 'Data de demissão (se aplicável)',
    example: null,
  })
  dataDemissao?: Date;

  @ApiProperty({
    description: 'Salário do funcionário',
    example: 5000.00,
  })
  salario?: number;

  @ApiProperty({
    description: 'Observações sobre o funcionário (campo TEXT)',
    example: 'Funcionário exemplar, pontual e dedicado',
    required: false,
  })
  observacoes?: string;

  @ApiProperty({
    description: 'Observação (campo VARCHAR)',
    example: 'Ativo',
    required: false,
  })
  observacao?: string;
}
