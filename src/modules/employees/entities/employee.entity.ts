import { ApiProperty } from '@nestjs/swagger';
import { BaseEntity } from '../../../common/entities/base.entity';

export class Employee extends BaseEntity {
  @ApiProperty({
    description: 'Nome completo do funcionário',
    example: 'João da Silva',
  })
  nome: string;

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
    description: 'RG do funcionário',
    example: '123456789',
  })
  rg?: string;

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
    description: 'Data de admissão',
    example: '2023-01-15',
  })
  dataAdmissao: Date;

  @ApiProperty({
    description: 'Data de demissão (se aplicável)',
    example: null,
  })
  dataDemissao?: Date;
}
