import { ApiProperty } from '@nestjs/swagger';

export class Employee {
  @ApiProperty({
    description: 'ID único do funcionário',
    example: 1
  })
  id: number;

  @ApiProperty({
    description: 'Nome completo do funcionário',
    example: 'João da Silva'
  })
  nome: string;

  @ApiProperty({
    description: 'CPF do funcionário (apenas números)',
    example: '12345678901'
  })
  cpf: string;

  @ApiProperty({
    description: 'Email profissional do funcionário',
    example: 'joao.silva@empresa.com'
  })
  email: string;

  @ApiProperty({
    description: 'Telefone de contato',
    example: '11987654321'
  })
  telefone?: string;
  @ApiProperty({
    description: 'ID do cargo do funcionário',
    example: 1
  })
  cargoId?: number;

  @ApiProperty({
    description: 'Nome do cargo do funcionário',
    example: 'Vendedor'
  })
  cargoNome?: string;

  @ApiProperty({
    description: 'ID do departamento do funcionário',
    example: 1
  })
  departamentoId?: number;

  @ApiProperty({
    description: 'Nome do departamento do funcionário',
    example: 'Comercial'
  })
  departamentoNome?: string;

  @ApiProperty({
    description: 'Data de admissão',
    example: '2023-01-15'
  })
  dataAdmissao: Date;

  @ApiProperty({
    description: 'Data de demissão (se aplicável)',
    example: null
  })
  dataDemissao?: Date;

  @ApiProperty({
    description: 'Status ativo/inativo do funcionário',
    example: true
  })
  ativo: boolean;

  @ApiProperty({
    description: 'Data de criação do registro',
    example: '2023-01-15T12:00:00.000Z'
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Data da última atualização do registro',
    example: '2023-01-15T12:00:00.000Z'
  })
  updatedAt: Date;
}