import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsOptional, IsString, IsDate, Matches, MaxLength, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateEmployeeDto {
  @ApiProperty({
    description: 'Nome completo do funcionário',
    example: 'João da Silva'
  })
  @IsNotEmpty({ message: 'Nome completo é obrigatório' })
  @IsString({ message: 'Nome deve ser uma string' })
  @MaxLength(100, { message: 'Nome deve ter no máximo 100 caracteres' })
  nome: string;

  @ApiProperty({
    description: 'CPF do funcionário (apenas números)',
    example: '12345678901'
  })
  @IsNotEmpty({ message: 'CPF é obrigatório' })
  @Matches(/^[0-9]{11}$/, { message: 'CPF deve conter exatamente 11 dígitos numéricos' })
  cpf: string;

  @ApiProperty({
    description: 'Email profissional do funcionário',
    example: 'joao.silva@empresa.com'
  })
  @IsNotEmpty({ message: 'Email é obrigatório' })
  @IsEmail({}, { message: 'Email inválido' })
  @MaxLength(100, { message: 'Email deve ter no máximo 100 caracteres' })
  email: string;

  @ApiProperty({
    description: 'Telefone de contato',
    example: '11987654321',
    required: false
  })
  @IsOptional()
  @IsString({ message: 'Telefone deve ser uma string' })
  @MaxLength(20, { message: 'Telefone deve ter no máximo 20 caracteres' })
  telefone?: string;

  @ApiProperty({
    description: 'Cargo do funcionário',
    example: 'Vendedor'
  })
  @IsNotEmpty({ message: 'Cargo é obrigatório' })
  @IsString({ message: 'Cargo deve ser uma string' })
  @MaxLength(50, { message: 'Cargo deve ter no máximo 50 caracteres' })
  cargo: string;

  @ApiProperty({
    description: 'Departamento do funcionário',
    example: 'Comercial'
  })
  @IsNotEmpty({ message: 'Departamento é obrigatório' })
  @IsString({ message: 'Departamento deve ser uma string' })
  @MaxLength(50, { message: 'Departamento deve ter no máximo 50 caracteres' })
  departamento: string;

  @ApiProperty({
    description: 'Data de admissão no formato YYYY-MM-DD',
    example: '2023-01-15'
  })
  @IsNotEmpty({ message: 'Data de admissão é obrigatória' })
  @Type(() => Date)
  @IsDate({ message: 'Data de admissão deve ser uma data válida' })
  dataAdmissao: Date;

  @ApiProperty({
    description: 'Status ativo/inativo do funcionário',
    example: true,
    default: true
  })
  @IsOptional()
  @IsBoolean({ message: 'Status ativo deve ser um valor booleano' })
  ativo?: boolean = true;
}